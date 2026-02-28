<script setup lang="ts">
import { toRefs } from "vue";

import { NOTE_EDITOR_COPY } from "@/data/note-editor";
import type { Category } from "@/types";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Typography,
} from "@/components/ui";

const props = defineProps<{
  categories: Category[];
  categoryValue: string;
  error?: string;
}>();
const { categories, categoryValue, error } = toRefs(props);

const emit = defineEmits<{
  (event: "update:categoryValue", value: string): void;
}>();
</script>

<template>
  <div class="note-editor__field">
    <Label
      ><Typography>{{ NOTE_EDITOR_COPY.categoryLabel }}</Typography></Label
    >
    <Select
      :model-value="categoryValue"
      @update:model-value="emit('update:categoryValue', String($event))"
    >
      <SelectTrigger :class="error ? 'note-editor__control--invalid' : ''">
        <SelectValue :placeholder="NOTE_EDITOR_COPY.categoryPlaceholder" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <Typography>{{ NOTE_EDITOR_COPY.noCategory }}</Typography>
        </SelectItem>
        <SelectItem v-for="category in categories" :key="category.id" :value="String(category.id)">
          <Typography>{{ category.name }}</Typography>
        </SelectItem>
      </SelectContent>
    </Select>
    <Typography v-if="error" variant="small" class="note-editor__error">{{ error }}</Typography>
  </div>
</template>
