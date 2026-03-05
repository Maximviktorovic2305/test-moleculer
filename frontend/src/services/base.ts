import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

import { readStoredTokens } from "@/lib/storage";
import type { ApiErrorPayload } from "@/types";

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const resolveApiUrl = () => {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

  if (!configuredApiUrl) {
    return typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  }

  if (typeof window !== "undefined") {
    const configuredLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
      configuredApiUrl,
    );
    const currentHostLocalhost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (configuredLocalhost && !currentHostLocalhost) {
      return window.location.origin;
    }
  }

  return configuredApiUrl;
};

const API_URL = resolveApiUrl().replace(/\/$/, "");

type RequestConfigWithAuthToken = InternalAxiosRequestConfig & {
  authToken?: string | null;
};

const normalizeToken = (token: string | null | undefined) => {
  if (typeof token !== "string") {
    return null;
  }

  const normalized = token.trim();
  return normalized.length > 0 ? normalized : null;
};

const resolveHeaders = (headers?: HeadersInit) => {
  if (!headers) {
    return {};
  }

  return Object.fromEntries(new Headers(headers).entries());
};

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorPayload | null | undefined;

    return new ApiError(
      payload?.message || error.message || "Request failed",
      error.response?.status ?? 500,
      payload?.code,
      payload?.details,
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500, "INTERNAL_ERROR");
  }

  return new ApiError("Request failed", 500, "INTERNAL_ERROR");
};

const http = axios.create({
  baseURL: API_URL,
});

http.interceptors.request.use((config) => {
  const requestConfig = config as RequestConfigWithAuthToken;

  const explicitToken = normalizeToken(requestConfig.authToken);
  const storedAccessToken = normalizeToken(readStoredTokens().accessToken);
  const token = explicitToken ?? storedAccessToken;

  const headers = AxiosHeaders.from(config.headers);
  if (!headers.get("Content-Type") && !(config.data instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.get("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  config.headers = headers;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
);

export const request = async <T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> => {
  const normalizedToken = normalizeToken(token);
  const response = await http.request<T>({
    url: path,
    method: options.method,
    data: options.body,
    headers: resolveHeaders(options.headers),
    authToken: normalizedToken,
  } as RequestConfigWithAuthToken);

  return response.data;
};
