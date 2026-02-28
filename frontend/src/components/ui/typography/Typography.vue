<script setup lang="ts">
import { computed, toRefs } from "vue";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import "@/components/ui/typography/typography.css";

const typographyVariants = cva("ui-typography", {
  variants: {
    variant: {
      h1: "ui-typography--h1",
      h2: "ui-typography--h2",
      h3: "ui-typography--h3",
      body: "ui-typography--body",
      lead: "ui-typography--lead",
      muted: "ui-typography--muted",
      small: "ui-typography--small",
      eyebrow: "ui-typography--eyebrow",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

type TypographyVariants = VariantProps<typeof typographyVariants>;
type TypographyVariant = NonNullable<TypographyVariants["variant"]>;

const variantTagMap: Record<TypographyVariant, string> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  body: "p",
  lead: "p",
  muted: "p",
  small: "p",
  eyebrow: "p",
};

const props = withDefaults(
  defineProps<{
    as?: string;
    variant?: TypographyVariants["variant"];
    class?: string;
  }>(),
  {
    variant: "body",
    class: "",
  },
);

const { as, variant, class: className } = toRefs(props);

const tag = computed(() => {
  if (as.value) {
    return as.value;
  }

  const currentVariant = (variant.value ?? "body") as TypographyVariant;
  return variantTagMap[currentVariant];
});
</script>

<template>
  <component :is="tag" :class="cn(typographyVariants({ variant }), className)">
    <slot />
  </component>
</template>
