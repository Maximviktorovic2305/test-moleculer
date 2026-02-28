<script setup lang="ts">
import { toRefs } from "vue";

import { cn } from "@/lib/utils";
import "@/components/ui/card/card.css";

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
  <p :class="cn('ui-card-description', className)">
    <slot />
  </p>
</template>
