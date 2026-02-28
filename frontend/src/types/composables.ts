import type { Ref } from "vue";

import type { AuthFormState, AuthMode, NoteFormState } from "@/types";

export type UseAuthCardFormOptions = {
  form: AuthFormState;
  mode: Ref<AuthMode>;
  onSubmit: () => void;
};

export type UseNoteEditorFormOptions = {
  form: NoteFormState;
  onSubmit: () => void;
};

export type UseCategoryDraftFormOptions = {
  initialDraft: () => string;
  setDraft: (value: string) => void;
  onSubmit: () => void;
};
