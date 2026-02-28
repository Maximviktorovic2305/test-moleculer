import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен быть не короче 6 символов"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Имя слишком короткое"),
});

export const validateLoginForm = (payload: { email: string; password: string }) =>
  loginSchema.safeParse(payload);

export const validateRegisterForm = (payload: { name: string; email: string; password: string }) =>
  registerSchema.safeParse(payload);
