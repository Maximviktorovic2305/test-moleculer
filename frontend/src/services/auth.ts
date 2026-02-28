import type { AuthResponse, LogoutResponse, TokenValidationResponse, User } from "@/types";

import { request } from "@/services/base";

export const authService = {
  login(data: { email: string; password: string }) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  register(data: { name: string; email: string; password: string }) {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  me(token: string) {
    return request<User>("/auth/me", { method: "GET" }, token);
  },

  refresh(data: { refreshToken: string }) {
    return request<AuthResponse>(
      "/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      data.refreshToken,
    );
  },

  logout(data: { refreshToken: string }) {
    return request<LogoutResponse>(
      "/auth/logout",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      data.refreshToken,
    );
  },

  validate(data: { accessToken?: string; refreshToken?: string }) {
    return request<TokenValidationResponse>(
      "/auth/validate",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      data.refreshToken ?? data.accessToken ?? null,
    );
  },
};
