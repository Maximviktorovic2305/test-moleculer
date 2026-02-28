import { computed, reactive, ref, watch } from "vue";

import { NOTES_APP_MESSAGES } from "@/data/notes-app";
import { createDefaultNoteForm } from "@/data/notes-app";
import { notifyError, notifySuccess } from "@/composables/useNotifications";
import { useDebounce } from "@/composables/useDebounce";
import { apiClient } from "@/services";
import type { Note } from "@/types";
import type {
  BindAutoReloadOptions,
  OpenNoteOptions,
  RemoveNoteOptions,
  SaveNoteOptions,
} from "@/types/composables/notes-entity";
import { noteSchema } from "@/utils/validation/note";

export const useNotesEntity = () => {
  const notes = ref<Note[]>([]);
  const search = ref("");
  const filterCategoryId = ref<number | null>(null);
  const selectedNoteId = ref<number | null>(null);
  const noteForm = reactive(createDefaultNoteForm());

  const isNotesLoading = ref(false);
  const isNoteSaving = ref(false);

  const selectedNote = computed(() => {
    if (!selectedNoteId.value) {
      return null;
    }

    return notes.value.find((note) => note.id === selectedNoteId.value) ?? null;
  });

  const resetNoteEditor = () => {
    selectedNoteId.value = null;
    noteForm.title = "";
    noteForm.content = "";
    noteForm.categoryId = null;
  };

  const resetNotesState = () => {
    notes.value = [];
    search.value = "";
    filterCategoryId.value = null;
    resetNoteEditor();
  };

  const fillNoteEditor = (note: Note) => {
    selectedNoteId.value = note.id;
    noteForm.title = note.title;
    noteForm.content = note.content;
    noteForm.categoryId = note.categoryId;
  };

  const ensureSelectedNoteExists = () => {
    if (!selectedNoteId.value) {
      return;
    }

    const exists = notes.value.some((item) => item.id === selectedNoteId.value);
    if (!exists) {
      resetNoteEditor();
    }
  };

  const loadNotes = async (withAuthorizedRequest: OpenNoteOptions["withAuthorizedRequest"]) => {
    isNotesLoading.value = true;

    try {
      notes.value = await withAuthorizedRequest((token) =>
        apiClient.listNotes(token, {
          search: search.value,
          categoryId: filterCategoryId.value,
        }),
      );
    } finally {
      isNotesLoading.value = false;
    }
  };

  const createNewNote = () => {
    resetNoteEditor();
  };

  const openNote = async (options: OpenNoteOptions) => {
    try {
      const note = await options.withAuthorizedRequest((token) =>
        apiClient.getNote(token, options.noteId),
      );
      fillNoteEditor(note);
    } catch (error) {
      console.error("Load note error", error);
      options.onError(error, NOTES_APP_MESSAGES.openNoteFailed);
    }
  };

  const saveNote = async (options: SaveNoteOptions) => {
    const parsed = noteSchema.safeParse({
      title: noteForm.title,
      content: noteForm.content,
      categoryId: noteForm.categoryId,
    });

    if (!parsed.success) {
      notifyError(parsed.error.issues[0]?.message ?? NOTES_APP_MESSAGES.noteInvalid);
      return;
    }

    isNoteSaving.value = true;
    const isUpdate = Boolean(selectedNoteId.value);

    try {
      const saved = selectedNoteId.value
        ? await options.withAuthorizedRequest((token) =>
            apiClient.updateNote(token, selectedNoteId.value as number, parsed.data),
          )
        : await options.withAuthorizedRequest((token) => apiClient.createNote(token, parsed.data));

      await options.reloadNotes();
      await options.reopenNote(saved.id);
      notifySuccess(isUpdate ? NOTES_APP_MESSAGES.noteUpdated : NOTES_APP_MESSAGES.noteCreated);
    } catch (error) {
      console.error("Save note error", error);
      options.onError(error, NOTES_APP_MESSAGES.saveNoteFailed);
    } finally {
      isNoteSaving.value = false;
    }
  };

  const removeNote = async (options: RemoveNoteOptions) => {
    if (!selectedNoteId.value) {
      return;
    }

    try {
      await options.withAuthorizedRequest((token) =>
        apiClient.deleteNote(token, selectedNoteId.value as number),
      );
      await options.reloadNotes();
      resetNoteEditor();
      notifySuccess(NOTES_APP_MESSAGES.noteRemoved);
    } catch (error) {
      console.error("Delete note error", error);
      options.onError(error, NOTES_APP_MESSAGES.removeNoteFailed);
    }
  };

  const bindAutoReload = (options: BindAutoReloadOptions) => {
    const debouncedSearch = useDebounce(search, options.debounceMs);

    watch(debouncedSearch, () => {
      if (!options.isAuthenticated.value) {
        return;
      }

      options.reloadNotes().catch((error) => {
        console.error("Search reload error", error);
        options.onError(error, options.fallbackMessage);
      });
    });
  };

  return {
    notes,
    search,
    filterCategoryId,
    selectedNoteId,
    noteForm,
    isNotesLoading,
    isNoteSaving,
    selectedNote,
    resetNoteEditor,
    resetNotesState,
    ensureSelectedNoteExists,
    loadNotes,
    createNewNote,
    openNote,
    saveNote,
    removeNote,
    bindAutoReload,
  };
};
