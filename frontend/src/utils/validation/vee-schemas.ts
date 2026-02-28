import type { ZodType } from "zod";

import type { FieldValidator } from "@/types/validation";
import { categorySchema } from "@/utils/validation/category";
import { loginSchema, registerSchema } from "@/utils/validation/auth";
import { noteSchema } from "@/utils/validation/note";

const createFieldValidator = <T>(schema: ZodType<T>): FieldValidator<T> => {
  return (value) => {
    const result = schema.safeParse(value);
    if (result.success) {
      return true;
    }

    return result.error.issues[0]?.message ?? "Некорректное значение";
  };
};

export const loginFormVeeSchema = {
  email: createFieldValidator(loginSchema.shape.email),
  password: createFieldValidator(loginSchema.shape.password),
};

export const registerFormVeeSchema = {
  name: createFieldValidator(registerSchema.shape.name),
  email: createFieldValidator(registerSchema.shape.email),
  password: createFieldValidator(registerSchema.shape.password),
};

export const noteFormVeeSchema = {
  title: createFieldValidator(noteSchema.shape.title),
  content: createFieldValidator(noteSchema.shape.content),
  categoryId: createFieldValidator(noteSchema.shape.categoryId),
};

export const categoryFormVeeSchema = {
  draft: createFieldValidator(categorySchema),
};
