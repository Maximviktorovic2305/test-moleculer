<script setup lang="ts">
import { useRouter } from "vue-router";

import AuthCard from "@/components/app/AuthCard/AuthCard.vue";
import { useNotesApp } from "@/composables/useNotesApp";

import "@/pages/AuthPage/AuthPage.css";

const router = useRouter();
const { authMode, authForm, busy, isAuthenticated, submitAuth } = useNotesApp();

const handleSubmit = async () => {
  await submitAuth();

  if (isAuthenticated.value) {
    await router.replace({ name: "workspace" });
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-page__container">
      <section class="auth-page__content">
        <AuthCard
          :mode="authMode"
          :form="authForm"
          :busy="busy.auth"
          @update:mode="authMode = $event"
          @submit="handleSubmit"
        />
      </section>
    </div>
  </div>
</template>
