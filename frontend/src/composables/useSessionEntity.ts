import { computed, reactive, ref } from "vue";
import { storeToRefs } from "pinia";

import { NOTES_APP_MESSAGES, createDefaultAuthForm } from "@/data/notes-app";
import { clearStoredTokens, readStoredTokens, writeStoredTokens } from "@/lib/storage";
import { notifyError, notifyInfo, notifySuccess } from "@/composables/useNotifications";
import { ApiError, apiClient } from "@/services";
import { useUserStore } from "@/stores/user.store";
import type { AuthMode, AuthResponse, User } from "@/types";
import type {
  SessionInitializeOptions,
  SessionLogoutOptions,
  SessionSubmitOptions,
} from "@/types/composables/session-entity";
import { normalizeErrorMessage } from "@/utils/error";
import { validateLoginForm, validateRegisterForm } from "@/utils/validation/auth";

export const useSessionEntity = () => {
  const authMode = ref<AuthMode>("login");
  const authForm = reactive(createDefaultAuthForm());

  const storedTokens = readStoredTokens();
  const accessToken = ref<string | null>(storedTokens.accessToken);
  const refreshToken = ref<string | null>(storedTokens.refreshToken);

  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);

  const sessionReady = ref(false);
  const isAuthLoading = ref(false);

  const isAuthenticated = computed(() => {
    return Boolean(user.value && accessToken.value && refreshToken.value);
  });

  let refreshPromise: Promise<void> | null = null;
  let sessionBootstrapPromise: Promise<void> | null = null;

  const syncTokensFromStorage = () => {
    const stored = readStoredTokens();
    const accessChanged = stored.accessToken !== accessToken.value;
    const refreshChanged = stored.refreshToken !== refreshToken.value;

    if (!accessChanged && !refreshChanged) {
      return;
    }

    accessToken.value = stored.accessToken;
    refreshToken.value = stored.refreshToken;

    if (!stored.accessToken || !stored.refreshToken) {
      userStore.clearUser();
    }
  };

  const setTokens = (tokens: { accessToken: string; refreshToken: string }) => {
    accessToken.value = tokens.accessToken;
    refreshToken.value = tokens.refreshToken;

    writeStoredTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  };

  const setUser = (value: User | null) => {
    userStore.setUser(value);
  };

  const clearSessionData = () => {
    accessToken.value = null;
    refreshToken.value = null;
    userStore.clearUser();
    clearStoredTokens();
  };

  const clearSession = (resetWorkspace: () => void) => {
    clearSessionData();
    resetWorkspace();
  };

  const redirectToAuth = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.location.pathname !== "/auth") {
      window.location.replace("/auth");
    }
  };

  const resetSessionAndRedirectToAuth = () => {
    clearSessionData();
    redirectToAuth();
  };

  const isUnauthorizedError = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      return false;
    }

    if (error.status === 401) {
      return true;
    }

    return ["INVALID_TOKEN", "UNAUTHORIZED", "INVALID_REFRESH_TOKEN"].includes(error.code ?? "");
  };

  const applyAuthResponse = (response: AuthResponse) => {
    setTokens(response);
    userStore.setUser(response.user);
    authForm.password = "";
  };

  const refreshSession = async () => {
    if (!refreshToken.value) {
      throw new ApiError("Refresh token missing", 401, "UNAUTHORIZED");
    }

    if (!refreshPromise) {
      refreshPromise = (async () => {
        const response = await apiClient.refresh({ refreshToken: refreshToken.value as string });
        applyAuthResponse(response);
      })();
    }

    try {
      await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  };

  const validateStoredSession = async () => {
    if (!accessToken.value || !refreshToken.value) {
      return {
        accessTokenValid: false,
        refreshTokenValid: false,
      };
    }

    return apiClient.validate({
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
    });
  };

  const withAuthorizedRequest = async <T>(operation: (token: string) => Promise<T>): Promise<T> => {
    syncTokensFromStorage();

    if (!accessToken.value) {
      resetSessionAndRedirectToAuth();
      throw new ApiError("Access token missing", 401, "UNAUTHORIZED");
    }

    try {
      return await operation(accessToken.value);
    } catch (error) {
      if (!isUnauthorizedError(error) || !refreshToken.value) {
        if (isUnauthorizedError(error)) {
          resetSessionAndRedirectToAuth();
        }

        throw error;
      }

      try {
        await refreshSession();
      } catch (refreshError) {
        if (isUnauthorizedError(refreshError)) {
          resetSessionAndRedirectToAuth();
        }

        throw refreshError;
      }

      if (!accessToken.value) {
        resetSessionAndRedirectToAuth();
        throw error;
      }

      try {
        return await operation(accessToken.value);
      } catch (retryError) {
        if (isUnauthorizedError(retryError)) {
          resetSessionAndRedirectToAuth();
        }

        throw retryError;
      }
    }
  };

  const initializeSession = async (options: SessionInitializeOptions) => {
    syncTokensFromStorage();

    if (sessionReady.value) {
      return;
    }

    if (!sessionBootstrapPromise) {
      sessionBootstrapPromise = (async () => {
        if (!accessToken.value && !refreshToken.value) {
          sessionReady.value = true;
          redirectToAuth();
          return;
        }

        if (!accessToken.value || !refreshToken.value) {
          clearSession(options.resetWorkspace);
          sessionReady.value = true;
          redirectToAuth();
          return;
        }

        try {
          const validation = await validateStoredSession();
          if (!validation.refreshTokenValid) {
            clearSession(options.resetWorkspace);
            sessionReady.value = true;
            redirectToAuth();
            return;
          }

          if (!validation.accessTokenValid) {
            await refreshSession();
          }

          await options.bootstrap();
        } catch (error) {
          console.error("Session bootstrap error", error);
          if (isUnauthorizedError(error)) {
            clearSession(options.resetWorkspace);
            redirectToAuth();
          }
        } finally {
          sessionReady.value = true;
        }
      })();
    }

    await sessionBootstrapPromise;
    sessionBootstrapPromise = null;
  };

  const submitAuth = async (options: SessionSubmitOptions) => {
    isAuthLoading.value = true;

    try {
      let response: AuthResponse;

      if (authMode.value === "register") {
        const parsed = validateRegisterForm({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
        });

        if (!parsed.success) {
          notifyError(parsed.error.issues[0]?.message ?? NOTES_APP_MESSAGES.formInvalid);
          return;
        }

        response = await apiClient.register(parsed.data);
      } else {
        const parsed = validateLoginForm({
          email: authForm.email,
          password: authForm.password,
        });

        if (!parsed.success) {
          notifyError(parsed.error.issues[0]?.message ?? NOTES_APP_MESSAGES.formInvalid);
          return;
        }

        response = await apiClient.login(parsed.data);
      }

      applyAuthResponse(response);
      await options.loadWorkspace();
      sessionReady.value = true;

      notifySuccess(
        authMode.value === "register"
          ? NOTES_APP_MESSAGES.authSuccessRegister
          : NOTES_APP_MESSAGES.authSuccessLogin,
      );
    } catch (error) {
      console.error("Auth error", error);
      notifyError(normalizeErrorMessage(error, NOTES_APP_MESSAGES.authFailed));
    } finally {
      isAuthLoading.value = false;
    }
  };

  const logout = async (options: SessionLogoutOptions) => {
    const currentRefreshToken = refreshToken.value;

    if (currentRefreshToken) {
      try {
        await apiClient.logout({ refreshToken: currentRefreshToken });
      } catch (error) {
        console.error("Logout revoke error", error);
      }
    }

    clearSession(options.resetWorkspace);
    notifyInfo(NOTES_APP_MESSAGES.sessionEnded);
  };

  const forceLogout = (resetWorkspace: () => void) => {
    clearSession(resetWorkspace);
  };

  return {
    authMode,
    authForm,
    accessToken,
    refreshToken,
    user,
    sessionReady,
    isAuthLoading,
    isAuthenticated,
    setUser,
    clearSession,
    isUnauthorizedError,
    withAuthorizedRequest,
    initializeSession,
    submitAuth,
    logout,
    forceLogout,
  };
};
