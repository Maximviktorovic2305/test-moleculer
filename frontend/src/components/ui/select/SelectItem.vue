<script setup lang="ts">
import { Check } from "lucide-vue-next";
import { computed, toRefs } from "vue";
import type { SelectItemProps } from "reka-ui";
import { SelectItem, SelectItemIndicator, SelectItemText, useForwardProps } from "reka-ui";

import { cn } from "@/lib/utils";

import "@/components/ui/select/select.css";

const props = defineProps<SelectItemProps & { class?: string }>();
const { class: className } = toRefs(props);

const delegatedProps = computed(() => {
  const { class: _class, ...delegated } = props;
  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <SelectItem v-bind="forwardedProps" :class="cn('ui-select-item', className)">
    <span class="ui-select-item-indicator-wrap">
      <SelectItemIndicator>
        <Check class="ui-select-item-indicator" />
      </SelectItemIndicator>
    </span>
    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
