import { DEMO_CREDENTIALS } from "@/data/constants";
import type { AuthFormState, NoteFormState } from "@/types";

export const createDefaultAuthForm = (): AuthFormState => ({
  name: "",
  email: DEMO_CREDENTIALS.email,
  password: DEMO_CREDENTIALS.password,
});

export const createDefaultNoteForm = (): NoteFormState => ({
  title: "",
  content: "",
  categoryId: null,
});

export const NOTES_APP_SETTINGS = {
  notesReloadDebounceMs: 250,
};

export const NOTES_APP_MESSAGES = {
  formInvalid: "Проверьте поля формы",
  noteInvalid: "Проверьте данные заметки",
  categoryInvalid: "Введите название категории",
  authSuccessLogin: "Вы вошли в систему",
  authSuccessRegister: "Регистрация завершена",
  authFailed: "Не удалось выполнить вход",
  sessionExpired: "Сессия истекла. Войдите снова.",
  sessionEnded: "Сессия завершена",
  openNoteFailed: "Не удалось открыть заметку",
  saveNoteFailed: "Не удалось сохранить заметку",
  removeNoteFailed: "Не удалось удалить заметку",
  addCategoryFailed: "Не удалось добавить категорию",
  removeCategoryFailed: "Не удалось удалить категорию",
  reloadNotesFailed: "Не удалось обновить список заметок",
  noteCreated: "Заметка создана",
  noteUpdated: "Заметка обновлена",
  noteRemoved: "Заметка удалена",
  categoryAdded: "Категория добавлена",
  categoryRemoved: "Категория удалена",
};
