<script setup lang="ts">
import { computed, ref, toRefs } from "vue";

import { NOTE_EDITOR_COPY } from "@/data/note-editor";
import { useNoteEditorForm } from "@/composables/forms/useNoteEditorForm";
import type { Category, NoteFormState } from "@/types";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Typography,
} from "@/components/ui";
import CategoryManager from "@/components/notes/CategoryManager/CategoryManager.vue";
import NoteEditorForm from "@/components/notes/NoteEditor/parts/NoteEditorForm.vue";

import "@/components/notes/NoteEditor/NoteEditor.css";

const props = defineProps<{
  noteForm: NoteFormState;
  categories: Category[];
  selectedNoteId: number | null;
  saving: boolean;
  categoryDraft: string;
  categoryBusy: boolean;
}>();
const { noteForm, categories, selectedNoteId, saving, categoryDraft, categoryBusy } = toRefs(props);

const emit = defineEmits<{
  (event: "save"): void;
  (event: "delete"): void;
  (event: "update:categoryDraft", value: string): void;
  (event: "addCategory"): void;
  (event: "removeCategory", category: Category): void;
}>();

const { titleField, contentField, categoryModel, errors, canSubmit, onSubmit } = useNoteEditorForm({
  form: noteForm.value,
  onSubmit: () => emit("save"),
});

const titleText = computed(() =>
  selectedNoteId.value ? NOTE_EDITOR_COPY.editTitle : NOTE_EDITOR_COPY.createTitle,
);

const submitText = computed(() =>
  selectedNoteId.value ? NOTE_EDITOR_COPY.updateSubmit : NOTE_EDITOR_COPY.createSubmit,
);

const updateTitle = (value: string) => {
  titleField.value = value;
};

const updateContent = (value: string) => {
  contentField.value = value;
};

const updateCategory = (value: string) => {
  categoryModel.value = value;
};

const isDeleteDialogOpen = ref(false);
</script>

<template>
  <Card>
    <CardHeader class="note-editor__header">
      <div>
        <CardTitle>
          <Typography variant="h2">{{ titleText }}</Typography>
        </CardTitle>
        <CardDescription>
          <Typography variant="lead">{{ NOTE_EDITOR_COPY.subtitle }}</Typography>
        </CardDescription>
      </div>

      <Button v-if="selectedNoteId" variant="destructive" @click="isDeleteDialogOpen = true">
        <Typography>{{ NOTE_EDITOR_COPY.deleteLabel }}</Typography>
      </Button>
    </CardHeader>

    <CardContent>
      <NoteEditorForm
        :categories="categories"
        :saving="saving"
        :can-submit="canSubmit"
        :submit-label="submitText"
        :title-value="titleField ?? ''"
        :content-value="contentField ?? ''"
        :category-value="categoryModel"
        :errors="errors"
        @update:title-value="updateTitle"
        @update:content-value="updateContent"
        @update:category-value="updateCategory"
        @submit="onSubmit"
      />

      <CategoryManager
        :categories="categories"
        :draft="categoryDraft"
        :busy="categoryBusy"
        @update:draft="emit('update:categoryDraft', $event)"
        @add="emit('addCategory')"
        @remove="emit('removeCategory', $event)"
      />
    </CardContent>
  </Card>

  <ConfirmDialog
    v-model:open="isDeleteDialogOpen"
    :title="NOTE_EDITOR_COPY.confirmDeleteTitle"
    :description="NOTE_EDITOR_COPY.confirmDeleteDescription"
    :confirm-text="NOTE_EDITOR_COPY.confirmDeleteAction"
    confirm-variant="destructive"
    @confirm="emit('delete')"
  />
</template>
