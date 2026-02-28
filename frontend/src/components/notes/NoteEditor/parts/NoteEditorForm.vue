<script setup lang="ts">
import { toRefs } from "vue";

import { NOTE_EDITOR_COPY } from "@/data/note-editor";
import type { Category } from "@/types";
import type { NoteFormErrors } from "@/types/forms";
import { Button, Input, Label, Textarea, Typography } from "@/components/ui";
import NoteCategoryField from "@/components/notes/NoteEditor/parts/NoteCategoryField.vue";

const props = defineProps<{
  categories: Category[];
  saving: boolean;
  canSubmit: boolean;
  submitLabel: string;
  titleValue: string;
  contentValue: string;
  categoryValue: string;
  errors: NoteFormErrors;
}>();
const {
  categories,
  saving,
  canSubmit,
  submitLabel,
  titleValue,
  contentValue,
  categoryValue,
  errors,
} = toRefs(props);

const emit = defineEmits<{
  (event: "update:titleValue", value: string): void;
  (event: "update:contentValue", value: string): void;
  (event: "update:categoryValue", value: string): void;
  (event: "submit"): void;
}>();
</script>

<template>
  <form class="note-editor__form" @submit.prevent="emit('submit')">
    <div class="note-editor__field">
      <Label
        ><Typography>{{ NOTE_EDITOR_COPY.titleLabel }}</Typography></Label
      >
      <Input
        :model-value="titleValue"
        :placeholder="NOTE_EDITOR_COPY.titlePlaceholder"
        :class="errors.title ? 'note-editor__control--invalid' : ''"
        @update:model-value="emit('update:titleValue', $event)"
      />
      <Typography v-if="errors.title" variant="small" class="note-editor__error">{{
        errors.title
      }}</Typography>
    </div>

    <NoteCategoryField
      :categories="categories"
      :category-value="categoryValue"
      :error="errors.categoryId"
      @update:category-value="emit('update:categoryValue', $event)"
    />

    <div class="note-editor__field">
      <Label
        ><Typography>{{ NOTE_EDITOR_COPY.contentLabel }}</Typography></Label
      >
      <Textarea
        :model-value="contentValue"
        class="note-editor__textarea"
        :placeholder="NOTE_EDITOR_COPY.contentPlaceholder"
        :class="errors.content ? 'note-editor__control--invalid' : ''"
        @update:model-value="emit('update:contentValue', $event)"
      />
      <Typography v-if="errors.content" variant="small" class="note-editor__error">{{
        errors.content
      }}</Typography>
    </div>

    <Button type="submit" class="note-editor__submit" :loading="saving" :disabled="saving || !canSubmit">
      <Typography>{{ submitLabel }}</Typography>
    </Button>
  </form>
</template>
