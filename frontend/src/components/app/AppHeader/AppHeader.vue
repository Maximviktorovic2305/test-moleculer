<script setup lang="ts">
import { toRefs } from "vue";

import type { User } from "@/types";
import { Badge, Button, Typography } from "@/components/ui";
import "@/components/app/AppHeader/AppHeader.css";

const props = defineProps<{
  user: User | null;
}>();
const { user } = toRefs(props);

const emit = defineEmits<{
  (event: "logout"): void;
}>();
</script>

<template>
  <header class="app-header">
    <div>
      <Typography variant="eyebrow" class="app-header__eyebrow">Notes Service</Typography>
      <Typography variant="h1" class="app-header__title">Управление заметками</Typography>
    </div>

    <div v-if="user" class="app-header__actions">
      <Badge variant="secondary" class="app-header__badge">
        <Typography variant="small">{{ user.email }}</Typography>
      </Badge>
      <Button variant="outline" @click="emit('logout')">
        <Typography variant="small">Выйти</Typography>
      </Button>
    </div>
  </header>
</template>
