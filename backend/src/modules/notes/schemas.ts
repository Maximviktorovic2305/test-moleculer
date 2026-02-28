import { z } from "zod";

export const createNoteSchema = z.object({
	title: z.string().trim().min(1).max(255),
	content: z.string().trim().min(1).max(10000),
	categoryId: z.number().int().positive().nullable().optional(),
});

export const updateNoteSchema = z.object({
	title: z.string().trim().min(1).max(255).optional(),
	content: z.string().trim().min(1).max(10000).optional(),
	categoryId: z.number().int().positive().nullable().optional(),
});

export const listNotesSchema = z.object({
	search: z.string().trim().min(1).max(200).optional(),
	categoryId: z
		.union([
			z.number().int().positive(),
			z
				.string()
				.regex(/^[0-9]+$/)
				.transform(Number),
		])
		.optional(),
});
