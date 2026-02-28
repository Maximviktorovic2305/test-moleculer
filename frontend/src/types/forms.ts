import type { AuthFormState, NoteFormState } from "@/types";

export type AuthFormErrors = Partial<Record<keyof AuthFormState, string>>;

export type NoteFormErrors = Partial<Record<keyof NoteFormState, string>>;

export type CategoryFormErrors = {
  draft?: string;
};
