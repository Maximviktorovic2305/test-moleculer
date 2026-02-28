<script setup lang="ts">
import { toRefs } from "vue";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import "@/components/ui/badge/badge.css";

const badgeVariants = cva("ui-badge", {
  variants: {
    variant: {
      default: "ui-badge--default",
      secondary: "ui-badge--secondary",
      outline: "ui-badge--outline",
      destructive: "ui-badge--destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type BadgeVariants = VariantProps<typeof badgeVariants>;

const props = withDefaults(
  defineProps<{
    variant?: BadgeVariants["variant"];
    class?: string;
  }>(),
  {
    variant: "default",
    class: "",
  },
);

const { variant, class: className } = toRefs(props);
</script>

<template>
  <span :class="cn(badgeVariants({ variant }), className)">
    <slot />
  </span>
</template>
