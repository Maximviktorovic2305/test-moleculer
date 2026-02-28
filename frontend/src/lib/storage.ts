import {
  ACCESS_TOKEN_STORAGE_KEY,
  LEGACY_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "@/data/constants";
import type { SessionTokens } from "@/types";

export const readStoredTokens = (): SessionTokens => {
  const accessToken =
    localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ??
    localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

  return {
    accessToken,
    refreshToken,
  };
};

export const writeStoredTokens = (tokens: SessionTokens) => {
  if (tokens.accessToken) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  }

  if (tokens.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
    return;
  }

  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
};

export const clearStoredTokens = () => {
  writeStoredTokens({
    accessToken: null,
    refreshToken: null,
  });
};
