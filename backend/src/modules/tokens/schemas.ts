import { z } from "zod";

export const pairInputSchema = z.object({
	userId: z.number().int().positive(),
	email: z.string().trim().email(),
});

export const tokenInputSchema = z.object({
	accessToken: z.string().trim().min(16).max(4096),
});

export const refreshInputSchema = z.object({
	refreshToken: z.string().trim().min(16).max(4096),
});

export type PairInput = z.infer<typeof pairInputSchema>;
export type TokenInput = z.infer<typeof tokenInputSchema>;
export type RefreshInput = z.infer<typeof refreshInputSchema>;
