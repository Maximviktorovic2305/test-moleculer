import { createRouter, createWebHistory } from "vue-router";

import { readStoredTokens } from "@/lib/storage";
import AuthPage from "@/pages/AuthPage/AuthPage.vue";
import WorkspacePage from "@/pages/WorkspacePage/WorkspacePage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/auth",
    },
    {
      path: "/auth",
      name: "auth",
      component: AuthPage,
    },
    {
      path: "/workspace",
      name: "workspace",
      component: WorkspacePage,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/workspace",
    },
  ],
});

router.beforeEach((to) => {
  const { accessToken, refreshToken } = readStoredTokens();
  const hasSession = Boolean(accessToken && refreshToken);

  if (to.name === "workspace" && !hasSession) {
    return { name: "auth" };
  }

  if (to.name === "auth" && hasSession) {
    return { name: "workspace" };
  }

  return true;
});

export default router;
