<script setup lang="ts">
import { toRefs } from "vue";

import { AUTH_CARD_COPY } from "@/data/auth-card";
import type { AuthMode } from "@/types";
import { Button, Typography } from "@/components/ui";

const props = defineProps<{
  mode: AuthMode;
}>();
const { mode } = toRefs(props);

const emit = defineEmits<{
  (event: "update:mode", value: AuthMode): void;
}>();
</script>

<template>
  <div class="auth-card__mode-switch">
    <Button
      :variant="mode === 'login' ? 'default' : 'ghost'"
      class="auth-card__mode-button"
      @click="emit('update:mode', 'login')"
    >
      <Typography>{{ AUTH_CARD_COPY.loginLabel }}</Typography>
    </Button>
    <Button
      :variant="mode === 'register' ? 'default' : 'ghost'"
      class="auth-card__mode-button"
      @click="emit('update:mode', 'register')"
    >
      <Typography>{{ AUTH_CARD_COPY.registerLabel }}</Typography>
    </Button>
  </div>
</template>
