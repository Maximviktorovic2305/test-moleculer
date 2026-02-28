import type { App as VueApp } from "vue";

import { notifyError } from "@/composables/useNotifications";

const FRONTEND_FATAL_MESSAGE = "Произошла ошибка интерфейса. Подробности в консоли.";
const NOTIFY_DEBOUNCE_MS = 1200;

let lastFatalNotifyAt = 0;

const notifyFatalError = () => {
  const now = Date.now();

  if (now - lastFatalNotifyAt < NOTIFY_DEBOUNCE_MS) {
    return;
  }

  lastFatalNotifyAt = now;
  notifyError(FRONTEND_FATAL_MESSAGE);
};

export const registerGlobalErrorHandlers = (app: VueApp) => {
  app.config.errorHandler = (error, instance, info) => {
    console.error("Vue fatal error", {
      error,
      info,
      component: instance,
    });
    notifyFatalError();
  };

  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("error", (event) => {
    console.error("Global runtime error", {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      error: event.error,
    });
    notifyFatalError();
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection", event.reason);
    notifyFatalError();
  });
};
