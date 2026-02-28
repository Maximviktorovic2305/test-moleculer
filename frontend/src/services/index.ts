import { authService } from "@/services/auth";
import { categoriesService } from "@/services/categories";
import { notesService } from "@/services/notes";

export { ApiError } from "@/services/base";
export { authService } from "@/services/auth";
export { notesService } from "@/services/notes";
export { categoriesService } from "@/services/categories";

export const apiClient = {
  login: authService.login,
  register: authService.register,
  me: authService.me,
  refresh: authService.refresh,
  logout: authService.logout,
  validate: authService.validate,
  listNotes: notesService.list,
  getNote: notesService.get,
  createNote: notesService.create,
  updateNote: notesService.update,
  deleteNote: notesService.remove,
  listCategories: categoriesService.list,
  createCategory: categoriesService.create,
  deleteCategory: categoriesService.remove,
};
