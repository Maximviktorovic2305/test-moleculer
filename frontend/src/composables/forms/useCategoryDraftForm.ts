import { computed, watch } from "vue";
import { useForm } from "vee-validate";

import { categoryFormVeeSchema } from "@/utils/validation/vee-schemas";
import type { CategoryFormErrors } from "@/types/forms";
import type { UseCategoryDraftFormOptions } from "@/types/composables";

export const useCategoryDraftForm = (options: UseCategoryDraftFormOptions) => {
  const { defineField, errors, handleSubmit } = useForm<{ draft: string }>({
    validationSchema: categoryFormVeeSchema,
    initialValues: {
      draft: options.initialDraft(),
    },
    validateOnMount: false,
  });

  const [draftField] = defineField("draft", {
    validateOnModelUpdate: false,
  });

  watch(
    () => options.initialDraft(),
    (nextDraft) => {
      if (draftField.value !== nextDraft) {
        draftField.value = nextDraft;
      }
    },
  );

  watch(draftField, (nextDraft) => {
    options.setDraft(nextDraft ?? "");
  });

  const canSubmit = computed(() => String(draftField.value ?? "").trim().length > 0);

  const onSubmit = handleSubmit(() => {
    options.onSubmit();
  });

  return {
    draftField,
    errors: errors as typeof errors & { value: CategoryFormErrors },
    canSubmit,
    onSubmit,
  };
};
