export type NoteCategory = {
  id: number;
  name: string;
};

export type Note = {
  id: number;
  title: string;
  content: string;
  categoryId: number | null;
  category: NoteCategory | null;
  createdAt: string;
  updatedAt: string;
};

export type NoteFormState = {
  title: string;
  content: string;
  categoryId: number | null;
};
