<script setup lang="ts">
import { computed, toRefs } from "vue";

import { AUTH_CARD_COPY } from "@/data/auth-card";
import { DEMO_CREDENTIALS } from "@/data/constants";
import { useAuthCardForm } from "@/composables/forms/useAuthCardForm";
import type { AuthFormState, AuthMode } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@/components/ui";
import AuthCardFormFields from "@/components/app/AuthCard/parts/AuthFormFields.vue";
import AuthModeSwitch from "@/components/app/AuthCard/parts/AuthModeSwitch.vue";

import "@/components/app/AuthCard/AuthCard.css";

const props = defineProps<{
  mode: AuthMode;
  form: AuthFormState;
  busy: boolean;
}>();
const { mode, form, busy } = toRefs(props);

const emit = defineEmits<{
  (event: "update:mode", value: AuthMode): void;
  (event: "submit"): void;
}>();

const { nameField, emailField, passwordField, errors, canSubmit, onSubmit } = useAuthCardForm({
  form: form.value,
  mode,
  onSubmit: () => emit("submit"),
});

const updateName = (value: string) => {
  nameField.value = value;
};

const updateEmail = (value: string) => {
  emailField.value = value;
};

const updatePassword = (value: string) => {
  passwordField.value = value;
};

const hintText = computed(
  () => `${AUTH_CARD_COPY.demoPrefix} ${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password}`,
);
</script>

<template>
  <Card class="auth-card">
    <CardHeader>
      <CardTitle>
        <Typography variant="h2">{{ AUTH_CARD_COPY.title }}</Typography>
      </CardTitle>
      <CardDescription>
        <Typography variant="lead">{{ AUTH_CARD_COPY.subtitle }}</Typography>
      </CardDescription>
    </CardHeader>

    <CardContent>
      <AuthModeSwitch :mode="mode" @update:mode="emit('update:mode', $event)" />

      <AuthCardFormFields
        :mode="mode"
        :busy="busy"
        :can-submit="canSubmit"
        :name-value="nameField ?? ''"
        :email-value="emailField ?? ''"
        :password-value="passwordField ?? ''"
        :errors="errors"
        @update:name-value="updateName"
        @update:email-value="updateEmail"
        @update:password-value="updatePassword"
        @submit="onSubmit"
      />

      <Typography variant="small" class="auth-card__hint">{{ hintText }}</Typography>
    </CardContent>
  </Card>
</template>
