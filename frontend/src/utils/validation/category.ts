import { z } from "zod";

export const categorySchema = z.string().trim().min(2, "Название категории слишком короткое");
