import { computed, watch } from "vue";
import { useForm } from "vee-validate";

import { noteFormVeeSchema } from "@/utils/validation/vee-schemas";
import type { NoteFormErrors } from "@/types/forms";
import type { NoteFormState } from "@/types";
import type { UseNoteEditorFormOptions } from "@/types/composables";

export const useNoteEditorForm = (options: UseNoteEditorFormOptions) => {
  const { defineField, errors, handleSubmit } = useForm<NoteFormState>({
    validationSchema: noteFormVeeSchema,
    initialValues: {
      title: options.form.title,
      content: options.form.content,
      categoryId: options.form.categoryId,
    },
    validateOnMount: false,
  });

  const [titleField] = defineField("title", {
    validateOnModelUpdate: false,
  });
  const [contentField] = defineField("content", {
    validateOnModelUpdate: false,
  });
  const [categoryIdField] = defineField("categoryId", {
    validateOnModelUpdate: false,
  });

  watch(
    () => options.form.title,
    (nextTitle) => {
      if (titleField.value !== nextTitle) {
        titleField.value = nextTitle;
      }
    },
  );

  watch(
    () => options.form.content,
    (nextContent) => {
      if (contentField.value !== nextContent) {
        contentField.value = nextContent;
      }
    },
  );

  watch(
    () => options.form.categoryId,
    (nextCategoryId) => {
      if (categoryIdField.value !== nextCategoryId) {
        categoryIdField.value = nextCategoryId;
      }
    },
  );

  watch(titleField, (nextTitle) => {
    options.form.title = nextTitle ?? "";
  });

  watch(contentField, (nextContent) => {
    options.form.content = nextContent ?? "";
  });

  watch(categoryIdField, (nextCategoryId) => {
    options.form.categoryId = typeof nextCategoryId === "number" ? nextCategoryId : null;
  });

  const categoryModel = computed({
    get: () => (categoryIdField.value != null ? String(categoryIdField.value) : "none"),
    set: (value: string) => {
      const nextCategoryId = value === "none" ? null : Number(value);
      categoryIdField.value = nextCategoryId;
      options.form.categoryId = nextCategoryId;
    },
  });

  const canSubmit = computed(() => {
    const hasTitle = String(titleField.value ?? "").trim().length > 0;
    const hasContent = String(contentField.value ?? "").trim().length > 0;
    return hasTitle && hasContent;
  });

  const onSubmit = handleSubmit(() => {
    options.onSubmit();
  });

  return {
    titleField,
    contentField,
    categoryModel,
    errors: errors as typeof errors & { value: NoteFormErrors },
    canSubmit,
    onSubmit,
  };
};
