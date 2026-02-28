<script setup lang="ts">
import { toRefs } from "vue";

import { AUTH_CARD_COPY } from "@/data/auth-card";
import type { AuthFormErrors } from "@/types/forms";
import type { AuthMode } from "@/types";
import { Button, Input, Label, Typography } from "@/components/ui";

const props = defineProps<{
  mode: AuthMode;
  busy: boolean;
  canSubmit: boolean;
  nameValue: string;
  emailValue: string;
  passwordValue: string;
  errors: AuthFormErrors;
}>();
const { mode, busy, canSubmit, nameValue, emailValue, passwordValue, errors } = toRefs(props);

const emit = defineEmits<{
  (event: "update:nameValue", value: string): void;
  (event: "update:emailValue", value: string): void;
  (event: "update:passwordValue", value: string): void;
  (event: "submit"): void;
}>();
</script>

<template>
  <form class="auth-card__form" @submit.prevent="emit('submit')">
    <div v-if="mode === 'register'" class="auth-card__field">
      <Label
        ><Typography>{{ AUTH_CARD_COPY.nameLabel }}</Typography></Label
      >
      <Input
        :model-value="nameValue"
        :placeholder="AUTH_CARD_COPY.namePlaceholder"
        :class="errors.name ? 'auth-card__input--invalid' : ''"
        @update:model-value="emit('update:nameValue', $event)"
      />
      <Typography v-if="errors.name" variant="small" class="auth-card__error">{{
        errors.name
      }}</Typography>
    </div>

    <div class="auth-card__field">
      <Label
        ><Typography>{{ AUTH_CARD_COPY.emailLabel }}</Typography></Label
      >
      <Input
        :model-value="emailValue"
        type="email"
        :placeholder="AUTH_CARD_COPY.emailPlaceholder"
        :class="errors.email ? 'auth-card__input--invalid' : ''"
        @update:model-value="emit('update:emailValue', $event)"
      />
      <Typography v-if="errors.email" variant="small" class="auth-card__error">{{
        errors.email
      }}</Typography>
    </div>

    <div class="auth-card__field">
      <Label
        ><Typography>{{ AUTH_CARD_COPY.passwordLabel }}</Typography></Label
      >
      <Input
        :model-value="passwordValue"
        type="password"
        :placeholder="AUTH_CARD_COPY.passwordPlaceholder"
        :class="errors.password ? 'auth-card__input--invalid' : ''"
        @update:model-value="emit('update:passwordValue', $event)"
      />
      <Typography v-if="errors.password" variant="small" class="auth-card__error">{{
        errors.password
      }}</Typography>
    </div>

    <Button type="submit" class="auth-card__submit" :loading="busy" :disabled="busy || !canSubmit">
      <Typography>{{
        mode === "register" ? AUTH_CARD_COPY.registerSubmit : AUTH_CARD_COPY.loginSubmit
      }}</Typography>
    </Button>
  </form>
</template>
