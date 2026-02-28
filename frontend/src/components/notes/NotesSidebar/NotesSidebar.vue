<script setup lang="ts">
import { computed, toRefs } from "vue";

import { NOTES_SIDEBAR_COPY } from "@/data/notes-sidebar";
import type { Category, Note } from "@/types";
import { Button, Card, CardContent, CardHeader, CardTitle, Typography } from "@/components/ui";
import NotesSidebarFilters from "@/components/notes/NotesSidebar/parts/NotesSidebarFilters.vue";
import NotesSidebarList from "@/components/notes/NotesSidebar/parts/NotesSidebarList.vue";

import "@/components/notes/NotesSidebar/NotesSidebar.css";

const props = defineProps<{
  notes: Note[];
  categories: Category[];
  loading: boolean;
  selectedNoteId: number | null;
  search: string;
  filterCategoryId: number | null;
}>();
const { notes, categories, loading, selectedNoteId, search, filterCategoryId } = toRefs(props);

const emit = defineEmits<{
  (event: "create"): void;
  (event: "select", noteId: number): void;
  (event: "update:search", value: string): void;
  (event: "update:filterCategoryId", value: number | null): void;
}>();

const categoryModel = computed({
  get: () => (filterCategoryId.value ? String(filterCategoryId.value) : "all"),
  set: (value: string) => emit("update:filterCategoryId", value === "all" ? null : Number(value)),
});

const updateCategory = (value: string) => {
  categoryModel.value = value;
};
</script>

<template>
  <Card>
    <CardHeader class="notes-sidebar__header">
      <CardTitle class="notes-sidebar__title">
        <Typography variant="h3">{{ NOTES_SIDEBAR_COPY.title }}</Typography>
      </CardTitle>
      <Button size="sm" @click="emit('create')">
        <Typography>{{ NOTES_SIDEBAR_COPY.createLabel }}</Typography>
      </Button>
    </CardHeader>

    <CardContent class="notes-sidebar__content">
      <NotesSidebarFilters
        :search="search"
        :category-value="categoryModel"
        :categories="categories"
        @update:search="emit('update:search', $event)"
        @update:category-value="updateCategory"
      />

      <NotesSidebarList
        :notes="notes"
        :loading="loading"
        :selected-note-id="selectedNoteId"
        @select="emit('select', $event)"
      />
    </CardContent>
  </Card>
</template>
