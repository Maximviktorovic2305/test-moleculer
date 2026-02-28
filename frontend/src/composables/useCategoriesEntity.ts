import { ref } from "vue";

import { NOTES_APP_MESSAGES } from "@/data/notes-app";
import { notifyError, notifySuccess } from "@/composables/useNotifications";
import { apiClient } from "@/services";
import type { Category } from "@/types";
import type {
  AddCategoryOptions,
  RemoveCategoryOptions,
} from "@/types/composables/categories-entity";
import { categorySchema } from "@/utils/validation/category";

export const useCategoriesEntity = () => {
  const categories = ref<Category[]>([]);
  const categoryDraft = ref("");
  const isCategorySaving = ref(false);

  const resetCategoriesState = () => {
    categories.value = [];
    categoryDraft.value = "";
  };

  const loadCategories = async (
    withAuthorizedRequest: AddCategoryOptions["withAuthorizedRequest"],
  ) => {
    categories.value = await withAuthorizedRequest((token) => apiClient.listCategories(token));
  };

  const addCategory = async (options: AddCategoryOptions) => {
    const parsed = categorySchema.safeParse(categoryDraft.value);
    if (!parsed.success) {
      notifyError(parsed.error.issues[0]?.message ?? NOTES_APP_MESSAGES.categoryInvalid);
      return;
    }

    isCategorySaving.value = true;

    try {
      const created = await options.withAuthorizedRequest((token) =>
        apiClient.createCategory(token, {
          name: parsed.data,
        }),
      );

      categories.value = [...categories.value, created].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      categoryDraft.value = "";
      notifySuccess(NOTES_APP_MESSAGES.categoryAdded);
    } catch (error) {
      console.error("Create category error", error);
      options.onError(error, NOTES_APP_MESSAGES.addCategoryFailed);
    } finally {
      isCategorySaving.value = false;
    }
  };

  const removeCategory = async (options: RemoveCategoryOptions) => {
    try {
      await options.withAuthorizedRequest((token) =>
        apiClient.deleteCategory(token, options.category.id),
      );
      categories.value = categories.value.filter((item) => item.id !== options.category.id);

      if (options.onAfterRemove) {
        await options.onAfterRemove(options.category);
      }

      notifySuccess(NOTES_APP_MESSAGES.categoryRemoved);
    } catch (error) {
      console.error("Delete category error", error);
      options.onError(error, NOTES_APP_MESSAGES.removeCategoryFailed);
    }
  };

  return {
    categories,
    categoryDraft,
    isCategorySaving,
    resetCategoriesState,
    loadCategories,
    addCategory,
    removeCategory,
  };
};
