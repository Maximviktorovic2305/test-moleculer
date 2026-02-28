export type ApiErrorPayload = {
  message: string;
  code?: string;
  details?: unknown;
};

export type LogoutResponse = {
  success: boolean;
};
