<script setup lang="ts">
import { toRefs } from "vue";

import { CATEGORY_MANAGER_COPY } from "@/data/category-manager";
import { Button, Input, Typography } from "@/components/ui";

const props = defineProps<{
  draftValue: string;
  busy: boolean;
  canSubmit: boolean;
  error?: string;
}>();
const { draftValue, busy, canSubmit, error } = toRefs(props);

const emit = defineEmits<{
  (event: "update:draftValue", value: string): void;
  (event: "submit"): void;
}>();
</script>

<template>
  <form class="category-manager__form" @submit.prevent="emit('submit')">
    <div class="category-manager__input-wrap">
      <Input
        :model-value="draftValue"
        class="category-manager__input"
        :placeholder="CATEGORY_MANAGER_COPY.inputPlaceholder"
        :class="error ? 'category-manager__control--invalid' : ''"
        @update:model-value="emit('update:draftValue', $event)"
      />
      <Typography v-if="error" variant="small" class="category-manager__error">{{
        error
      }}</Typography>
    </div>
    <Button
      type="submit"
      variant="outline"
      class="category-manager__submit"
      :loading="busy"
      :disabled="busy || !canSubmit"
    >
      <Typography>{{ CATEGORY_MANAGER_COPY.addLabel }}</Typography>
    </Button>
  </form>
</template>
