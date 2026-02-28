export type SessionTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

export type TokenValidationResponse = {
  accessTokenValid: boolean | null;
  refreshTokenValid: boolean | null;
};
