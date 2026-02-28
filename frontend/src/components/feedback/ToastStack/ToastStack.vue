<script setup lang="ts">
import { Sonner, Typography } from "@/components/ui";

import "@/components/feedback/ToastStack/ToastStack.css";
</script>

<template>
  <div class="toast-stack">
    <Typography class="sr-only">Уведомления</Typography>
    <Sonner />
  </div>
</template>
