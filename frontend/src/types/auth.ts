import type { User } from "@/types/user";

export type AuthMode = "login" | "register";

export type AuthFormState = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};
