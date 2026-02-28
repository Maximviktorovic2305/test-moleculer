<script setup lang="ts">
import { RouterView } from "vue-router";

import ToastStack from "@/components/feedback/ToastStack/ToastStack.vue";
</script>

<template>
  <RouterView />
  <ToastStack />
</template>
