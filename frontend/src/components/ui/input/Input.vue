<script setup lang="ts">
import { toRefs } from "vue";

import { cn } from "@/lib/utils";
import "@/components/ui/input/input.css";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
  }>(),
  {
    modelValue: "",
    type: "text",
    placeholder: "",
    disabled: false,
    class: "",
  },
);

const { modelValue, type, placeholder, disabled, class: className } = toRefs(props);

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

const onInput = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
};
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="cn('ui-input', className)"
    @input="onInput"
  />
</template>
