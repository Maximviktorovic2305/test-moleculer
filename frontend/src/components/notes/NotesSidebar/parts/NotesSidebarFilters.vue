<script setup lang="ts">
import { toRefs } from "vue";

import { NOTES_SIDEBAR_COPY } from "@/data/notes-sidebar";
import type { Category } from "@/types";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Typography,
} from "@/components/ui";

const props = defineProps<{
  search: string;
  categoryValue: string;
  categories: Category[];
}>();
const { search, categoryValue, categories } = toRefs(props);

const emit = defineEmits<{
  (event: "update:search", value: string): void;
  (event: "update:categoryValue", value: string): void;
}>();
</script>

<template>
  <div class="notes-sidebar__filters">
    <Input
      :model-value="search"
      :placeholder="NOTES_SIDEBAR_COPY.searchPlaceholder"
      @update:model-value="emit('update:search', $event)"
    />

    <Select
      :model-value="categoryValue"
      @update:model-value="emit('update:categoryValue', String($event))"
    >
      <SelectTrigger>
        <SelectValue :placeholder="NOTES_SIDEBAR_COPY.categoriesPlaceholder" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <Typography>{{ NOTES_SIDEBAR_COPY.allCategories }}</Typography>
        </SelectItem>
        <SelectItem v-for="category in categories" :key="category.id" :value="String(category.id)">
          <Typography>{{ category.name }}</Typography>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
