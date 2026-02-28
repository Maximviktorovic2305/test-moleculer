import { z } from "zod";

export const createUserSchema = z.object({
	name: z.string().trim().min(2).max(120),
	email: z.string().trim().email().max(180),
	password: z.string().min(6).max(128),
});

export type CreateUserParams = z.infer<typeof createUserSchema>;
