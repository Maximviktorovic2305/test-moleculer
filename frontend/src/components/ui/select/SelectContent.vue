<script setup lang="ts">
import { ChevronDown, ChevronUp } from "lucide-vue-next";
import { computed, toRefs } from "vue";
import type { SelectContentProps } from "reka-ui";
import {
  SelectContent,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectViewport,
  useForwardProps,
} from "reka-ui";

import { cn } from "@/lib/utils";

import "@/components/ui/select/select.css";

const props = withDefaults(
  defineProps<SelectContentProps & { class?: string; position?: "popper" | "item-aligned" }>(),
  {
    position: "popper",
  },
);

const { class: className, position } = toRefs(props);

const delegatedProps = computed(() => {
  const { class: _class, ...delegated } = props;
  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <SelectPortal>
    <SelectContent
      v-bind="forwardedProps"
      :class="
        cn('ui-select-content', position === 'popper' && 'ui-select-content--popper', className)
      "
    >
      <SelectScrollUpButton class="ui-select-scroll-button">
        <ChevronUp class="ui-select-scroll-icon" />
      </SelectScrollUpButton>

      <SelectViewport
        :class="cn('ui-select-viewport', position === 'popper' && 'ui-select-viewport--popper')"
      >
        <slot />
      </SelectViewport>

      <SelectScrollDownButton class="ui-select-scroll-button">
        <ChevronDown class="ui-select-scroll-icon" />
      </SelectScrollDownButton>
    </SelectContent>
  </SelectPortal>
</template>
