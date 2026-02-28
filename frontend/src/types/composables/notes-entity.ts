import type { Ref } from "vue";

import type { Note } from "@/types";
import type { AuthorizedRequest, RequestErrorHandler } from "@/types/composables/request";

export type OpenNoteOptions = {
  noteId: number;
  withAuthorizedRequest: AuthorizedRequest;
  onError: RequestErrorHandler;
};

export type SaveNoteOptions = {
  withAuthorizedRequest: AuthorizedRequest;
  reloadNotes: () => Promise<void>;
  reopenNote: (noteId: number) => Promise<void>;
  onError: RequestErrorHandler;
};

export type RemoveNoteOptions = {
  withAuthorizedRequest: AuthorizedRequest;
  reloadNotes: () => Promise<void>;
  onError: RequestErrorHandler;
};

export type BindAutoReloadOptions = {
  isAuthenticated: Ref<boolean>;
  reloadNotes: () => Promise<void>;
  onError: RequestErrorHandler;
  debounceMs: number;
  fallbackMessage: string;
};

export type UpdateNoteEditorPayload = {
  note: Note;
};
