<script setup lang="ts">
import { computed, toRefs } from "vue";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import "@/components/ui/button/button.css";

const buttonVariants = cva("ui-button", {
  variants: {
    variant: {
      default: "ui-button--default",
      secondary: "ui-button--secondary",
      outline: "ui-button--outline",
      ghost: "ui-button--ghost",
      destructive: "ui-button--destructive",
    },
    size: {
      default: "ui-button--size-default",
      sm: "ui-button--size-sm",
      lg: "ui-button--size-lg",
      icon: "ui-button--size-icon",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ButtonVariants = VariantProps<typeof buttonVariants>;

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariants["variant"];
    size?: ButtonVariants["size"];
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    class?: string;
  }>(),
  {
    variant: "default",
    size: "default",
    type: "button",
    disabled: false,
    loading: false,
    class: "",
  },
);

const { variant, size, type, disabled, loading, class: className } = toRefs(props);

const isDisabled = computed(() => disabled.value || loading.value);
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :aria-busy="loading ? 'true' : undefined"
    :class="cn(buttonVariants({ variant, size }), className)"
  >
    <span class="ui-button__content" :class="{ 'ui-button__content--hidden': loading }">
      <slot />
    </span>

    <span v-if="loading" class="ui-button__spinner-wrap" aria-hidden="true">
      <span class="ui-button__spinner" />
    </span>
  </button>
</template>
