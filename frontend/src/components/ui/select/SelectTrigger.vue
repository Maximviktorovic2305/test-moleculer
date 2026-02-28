<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";
import { computed, toRefs } from "vue";
import type { SelectTriggerProps } from "reka-ui";
import { SelectIcon, SelectTrigger, useForwardProps } from "reka-ui";

import { cn } from "@/lib/utils";

import "@/components/ui/select/select.css";

const props = defineProps<SelectTriggerProps & { class?: string }>();
const { class: className } = toRefs(props);

const delegatedProps = computed(() => {
  const { class: _class, ...delegated } = props;
  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <SelectTrigger v-bind="forwardedProps" :class="cn('ui-select-trigger', className)">
    <slot />
    <SelectIcon as-child>
      <ChevronDown class="ui-select-icon" />
    </SelectIcon>
  </SelectTrigger>
</template>
