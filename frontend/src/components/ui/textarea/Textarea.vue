<script setup lang="ts">
import { toRefs } from "vue";

import { cn } from "@/lib/utils";
import "@/components/ui/textarea/textarea.css";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
  }>(),
  {
    modelValue: "",
    placeholder: "",
    disabled: false,
    class: "",
  },
);

const { modelValue, placeholder, disabled, class: className } = toRefs(props);

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

const onInput = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLTextAreaElement).value);
};
</script>

<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="cn('ui-textarea', className)"
    @input="onInput"
  />
</template>
