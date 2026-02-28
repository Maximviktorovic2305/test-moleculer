<script setup lang="ts">
import { computed, ref, toRefs } from "vue";

import { CATEGORY_MANAGER_COPY } from "@/data/category-manager";
import { useCategoryDraftForm } from "@/composables/forms/useCategoryDraftForm";
import type { Category } from "@/types";
import { Badge, ConfirmDialog, Typography } from "@/components/ui";
import CategoryDraftForm from "@/components/notes/CategoryManager/parts/CategoryDraftForm.vue";

import "@/components/notes/CategoryManager/CategoryManager.css";

const props = defineProps<{
  categories: Category[];
  draft: string;
  busy: boolean;
}>();
const { categories, draft, busy } = toRefs(props);

const emit = defineEmits<{
  (event: "update:draft", value: string): void;
  (event: "add"): void;
  (event: "remove", category: Category): void;
}>();

const { draftField, errors, canSubmit, onSubmit } = useCategoryDraftForm({
  initialDraft: () => draft.value,
  setDraft: (value) => emit("update:draft", value),
  onSubmit: () => emit("add"),
});

const updateDraft = (value: string) => {
  draftField.value = value;
};

const isRemoveDialogOpen = ref(false);
const categoryToRemove = ref<Category | null>(null);

const removeTitle = computed(() => {
  if (!categoryToRemove.value) {
    return CATEGORY_MANAGER_COPY.removeTitleDefault;
  }

  return `Удалить категорию \"${categoryToRemove.value.name}\"?`;
});

const requestRemove = (category: Category) => {
  categoryToRemove.value = category;
  isRemoveDialogOpen.value = true;
};

const confirmRemove = () => {
  if (!categoryToRemove.value) {
    return;
  }

  emit("remove", categoryToRemove.value);
  isRemoveDialogOpen.value = false;
  categoryToRemove.value = null;
};
</script>

<template>
  <section class="category-manager">
    <Typography variant="small" class="category-manager__title">{{
      CATEGORY_MANAGER_COPY.title
    }}</Typography>

    <CategoryDraftForm
      :draft-value="draftField ?? ''"
      :busy="busy"
      :can-submit="canSubmit"
      :error="errors.draft"
      @update:draft-value="updateDraft"
      @submit="onSubmit"
    />

    <div class="category-manager__list">
      <Badge
        v-for="category in categories"
        :key="category.id"
        variant="secondary"
        class="category-manager__badge"
      >
        <Typography variant="small">{{ category.name }}</Typography>
        <button type="button" class="category-manager__remove" @click="requestRemove(category)">
          <Typography variant="small">{{ CATEGORY_MANAGER_COPY.removeBadgeLabel }}</Typography>
        </button>
      </Badge>
    </div>
  </section>

  <ConfirmDialog
    v-model:open="isRemoveDialogOpen"
    :title="removeTitle"
    :description="CATEGORY_MANAGER_COPY.removeDescription"
    :confirm-text="CATEGORY_MANAGER_COPY.removeAction"
    confirm-variant="destructive"
    @confirm="confirmRemove"
  />
</template>
