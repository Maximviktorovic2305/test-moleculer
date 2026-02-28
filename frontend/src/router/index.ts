import { createRouter, createWebHistory } from "vue-router";

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

export default router;
