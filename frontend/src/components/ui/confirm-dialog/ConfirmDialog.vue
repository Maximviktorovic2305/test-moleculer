<script setup lang="ts">
import { toRefs } from "vue";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
} from "reka-ui";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

import "@/components/ui/confirm-dialog/confirm-dialog.css";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: "default" | "destructive";
    confirmLoading?: boolean;
  }>(),
  {
    description: "",
    confirmText: "Подтвердить",
    cancelText: "Отмена",
    confirmVariant: "default",
    confirmLoading: false,
  },
);

const { open, title, description, confirmText, cancelText, confirmVariant, confirmLoading } =
  toRefs(props);

const emit = defineEmits<{
  (event: "update:open", value: boolean): void;
  (event: "confirm"): void;
}>();
</script>

<template>
  <AlertDialogRoot :open="open" @update:open="emit('update:open', $event)">
    <AlertDialogPortal>
      <AlertDialogOverlay class="ui-confirm-dialog-overlay" />
      <AlertDialogContent class="ui-confirm-dialog-content">
        <div class="ui-confirm-dialog-header">
          <AlertDialogTitle class="ui-confirm-dialog-title">
            <Typography variant="h3">{{ title }}</Typography>
          </AlertDialogTitle>
          <AlertDialogDescription v-if="description" class="ui-confirm-dialog-description">
            <Typography variant="muted">{{ description }}</Typography>
          </AlertDialogDescription>
        </div>

        <div class="ui-confirm-dialog-footer">
          <AlertDialogCancel as-child>
            <Button variant="outline" class="ui-confirm-dialog-button" :disabled="confirmLoading">
              <Typography>{{ cancelText }}</Typography>
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction as-child>
            <Button
              :variant="confirmVariant"
              class="ui-confirm-dialog-button"
              :loading="confirmLoading"
              @click="emit('confirm')"
            >
              <Typography>{{ confirmText }}</Typography>
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
