<script setup lang="ts">
import { toRefs } from "vue";

import { NOTES_SIDEBAR_COPY } from "@/data/notes-sidebar";
import { formatDateTime } from "@/utils/date";
import type { Note } from "@/types";
import { Typography } from "@/components/ui";

const props = defineProps<{
  notes: Note[];
  loading: boolean;
  selectedNoteId: number | null;
}>();
const { notes, loading, selectedNoteId } = toRefs(props);

const emit = defineEmits<{
  (event: "select", noteId: number): void;
}>();
</script>

<template>
  <Typography v-if="loading && notes.length === 0" as="p" variant="muted" class="notes-sidebar__state">
    {{ NOTES_SIDEBAR_COPY.loadingState }}
  </Typography>

  <div v-else-if="notes.length > 0" class="notes-sidebar__list" :class="{ 'notes-sidebar__list--loading': loading }">
    <button
      v-for="note in notes"
      :key="note.id"
      class="notes-sidebar__item"
      :class="{ 'notes-sidebar__item--active': selectedNoteId === note.id }"
      @click="emit('select', note.id)"
    >
      <Typography class="notes-sidebar__item-title">{{ note.title }}</Typography>
      <Typography variant="small" class="notes-sidebar__item-content">{{
        note.content
      }}</Typography>
      <Typography variant="small" class="notes-sidebar__item-date">{{
        formatDateTime(note.updatedAt)
      }}</Typography>
    </button>
  </div>

  <Typography v-else as="p" variant="muted" class="notes-sidebar__state">
    {{ NOTES_SIDEBAR_COPY.emptyState }}
  </Typography>
</template>
