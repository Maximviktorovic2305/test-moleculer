import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().trim().min(1, "Введите заголовок").max(255),
  content: z.string().trim().min(1, "Введите текст заметки").max(10000),
  categoryId: z.number().int().positive().nullable(),
});
