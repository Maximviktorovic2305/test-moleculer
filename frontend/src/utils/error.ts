import { ApiError } from "@/services";

export const normalizeErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
