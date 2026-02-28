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

export const request = async <T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> => {
  const normalizedToken = typeof token === "string" ? token.trim() : token;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
      ...(normalizedToken ? { Authorization: `Bearer ${normalizedToken}` } : {}),
    },
  });

  const rawText = await response.text();
  let payload: unknown = null;
  if (rawText) {
    try {
      payload = JSON.parse(rawText) as unknown;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const errorPayload = (payload as ApiErrorPayload | null) ?? { message: "Request failed" };
    throw new ApiError(
      errorPayload.message || "Request failed",
      response.status,
      errorPayload.code,
      errorPayload.details,
    );
  }

  return payload as T;
};
