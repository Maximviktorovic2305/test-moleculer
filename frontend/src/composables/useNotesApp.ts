import { computed, ref } from "vue";

import { NOTES_APP_MESSAGES, NOTES_APP_SETTINGS } from "@/data/notes-app";
import { useCategoriesEntity } from "@/composables/useCategoriesEntity";
import { useNotesEntity } from "@/composables/useNotesEntity";
import { useSessionEntity } from "@/composables/useSessionEntity";
import { notifyError } from "@/composables/useNotifications";
import { apiClient } from "@/services";
import type { BusyState, Category } from "@/types";
import { normalizeErrorMessage } from "@/utils/error";

const createNotesAppStore = () => {
  const sessionEntity = useSessionEntity();
  const notesEntity = useNotesEntity();
  const categoriesEntity = useCategoriesEntity();

  const isBootstrapLoading = ref(false);

  const busy = computed<BusyState>(() => ({
    auth: sessionEntity.isAuthLoading.value,
    bootstrap: isBootstrapLoading.value,
    notes: notesEntity.isNotesLoading.value,
    saveNote: notesEntity.isNoteSaving.value,
    saveCategory: categoriesEntity.isCategorySaving.value,
  }));

  const resetWorkspace = () => {
    notesEntity.resetNotesState();
    categoriesEntity.resetCategoriesState();
  };

  const handleRequestError = (error: unknown, fallbackMessage: string) => {
    notifyError(normalizeErrorMessage(error, fallbackMessage));
  };

  const loadWorkspaceData = async () => {
    await Promise.all([
      categoriesEntity.loadCategories(sessionEntity.withAuthorizedRequest),
      notesEntity.loadNotes(sessionEntity.withAuthorizedRequest),
    ]);
  };

  const bootstrapData = async () => {
    isBootstrapLoading.value = true;

    try {
      const profile = await sessionEntity.withAuthorizedRequest((token) => apiClient.me(token));
      sessionEntity.setUser(profile);

      await loadWorkspaceData();
      notesEntity.ensureSelectedNoteExists();
    } finally {
      isBootstrapLoading.value = false;
    }
  };

  const initializeSession = async () => {
    await sessionEntity.initializeSession({
      bootstrap: bootstrapData,
      resetWorkspace,
    });
  };

  const submitAuth = async () => {
    await sessionEntity.submitAuth({
      loadWorkspace: loadWorkspaceData,
    });
  };

  const logout = async () => {
    await sessionEntity.logout({
      resetWorkspace,
    });
  };

  const forceLogout = () => {
    sessionEntity.forceLogout(resetWorkspace);
  };

  const clearSession = () => {
    sessionEntity.clearSession(resetWorkspace);
  };

  const openNote = async (noteId: number) => {
    await notesEntity.openNote({
      noteId,
      withAuthorizedRequest: sessionEntity.withAuthorizedRequest,
      onError: handleRequestError,
    });
  };

  const applyCategoryFilter = async (categoryId: number | null) => {
    notesEntity.filterCategoryId.value = categoryId;

    try {
      await notesEntity.loadNotes(sessionEntity.withAuthorizedRequest);
      notesEntity.ensureSelectedNoteExists();
    } catch (error) {
      console.error("Filter notes error", error);
      handleRequestError(error, NOTES_APP_MESSAGES.reloadNotesFailed);
    }
  };

  const saveNote = async () => {
    await notesEntity.saveNote({
      withAuthorizedRequest: sessionEntity.withAuthorizedRequest,
      reloadNotes: () => notesEntity.loadNotes(sessionEntity.withAuthorizedRequest),
      reopenNote: async (noteId: number) => {
        await openNote(noteId);
      },
      onError: handleRequestError,
    });
  };

  const removeNote = async () => {
    await notesEntity.removeNote({
      withAuthorizedRequest: sessionEntity.withAuthorizedRequest,
      reloadNotes: () => notesEntity.loadNotes(sessionEntity.withAuthorizedRequest),
      onError: handleRequestError,
    });
  };

  const addCategory = async () => {
    await categoriesEntity.addCategory({
      withAuthorizedRequest: sessionEntity.withAuthorizedRequest,
      onError: handleRequestError,
    });
  };

  const removeCategory = async (category: Category) => {
    await categoriesEntity.removeCategory({
      category,
      withAuthorizedRequest: sessionEntity.withAuthorizedRequest,
      onError: handleRequestError,
      onAfterRemove: async (removedCategory) => {
        if (notesEntity.filterCategoryId.value === removedCategory.id) {
          notesEntity.filterCategoryId.value = null;
        }

        if (notesEntity.noteForm.categoryId === removedCategory.id) {
          notesEntity.noteForm.categoryId = null;
        }

        await notesEntity.loadNotes(sessionEntity.withAuthorizedRequest);
      },
    });
  };

  notesEntity.bindAutoReload({
    isAuthenticated: computed(() => true),
    reloadNotes: () => notesEntity.loadNotes(sessionEntity.withAuthorizedRequest),
    onError: handleRequestError,
    debounceMs: NOTES_APP_SETTINGS.notesReloadDebounceMs,
    fallbackMessage: NOTES_APP_MESSAGES.reloadNotesFailed,
  });

  return {
    authMode: sessionEntity.authMode,
    authForm: sessionEntity.authForm,
    accessToken: sessionEntity.accessToken,
    refreshToken: sessionEntity.refreshToken,
    user: sessionEntity.user,
    notes: notesEntity.notes,
    categories: categoriesEntity.categories,
    search: notesEntity.search,
    filterCategoryId: notesEntity.filterCategoryId,
    selectedNoteId: notesEntity.selectedNoteId,
    noteForm: notesEntity.noteForm,
    categoryDraft: categoriesEntity.categoryDraft,
    busy,
    selectedNote: notesEntity.selectedNote,
    isAuthenticated: sessionEntity.isAuthenticated,
    sessionReady: sessionEntity.sessionReady,
    initializeSession,
    bootstrapData,
    submitAuth,
    logout,
    forceLogout,
    clearSession,
    createNewNote: notesEntity.createNewNote,
    openNote,
    applyCategoryFilter,
    saveNote,
    removeNote,
    addCategory,
    removeCategory,
  };
};

let notesAppStore: ReturnType<typeof createNotesAppStore> | null = null;

export const useNotesApp = () => {
  if (!notesAppStore) {
    notesAppStore = createNotesAppStore();
  }

  return notesAppStore;
};
