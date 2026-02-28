<script setup lang="ts">
import { toRefs } from "vue";

import { cn } from "@/lib/utils";
import "@/components/ui/label/label.css";

const props = withDefaults(
  defineProps<{
    class?: string;
  }>(),
  {
    class: "",
  },
);

const { class: className } = toRefs(props);
</script>

<template>
  <label :class="cn('ui-label', className)">
    <slot />
  </label>
</template>
