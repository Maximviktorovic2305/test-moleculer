import { z } from "zod";

export const rateLimitConsumeSchema = z.object({
	method: z.string().min(1).max(16).optional(),
	path: z.string().min(1).max(1024).optional(),
	ip: z.string().min(1).max(256).optional(),
	userId: z.number().int().positive().optional(),
	limit: z.number().int().positive().max(1_000_000).optional(),
	windowMs: z.number().int().positive().max(86_400_000).optional(),
});
