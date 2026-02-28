import { computed, ref } from "vue";
import { defineStore } from "pinia";

import type { User } from "@/types";

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null);

  const isAuthorized = computed(() => Boolean(user.value));

  const setUser = (value: User | null) => {
    user.value = value;
  };

  const clearUser = () => {
    user.value = null;
  };

  return {
    user,
    isAuthorized,
    setUser,
    clearUser,
  };
});
