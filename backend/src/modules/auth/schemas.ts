import { z } from "zod";

export const registerSchema = z.object({
	name: z.string().trim().min(2).max(120),
	email: z.string().trim().email().max(180),
	password: z.string().min(6).max(128),
});

export const loginSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(6).max(128),
});

export const refreshSchema = z.object({
	refreshToken: z.string().trim().min(16).max(4096),
});

export const validateTokensSchema = z.object({
	accessToken: z.string().trim().min(16).max(4096).optional(),
	refreshToken: z.string().trim().min(16).max(4096).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ValidateTokensInput = z.infer<typeof validateTokensSchema>;
