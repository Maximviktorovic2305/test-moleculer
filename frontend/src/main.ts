import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "@/App.vue";
import router from "@/router";
import { registerGlobalErrorHandlers } from "@/utils/global-error-handler";
import "@/style.css";

const app = createApp(App);
const pinia = createPinia();

registerGlobalErrorHandlers(app);

app.use(pinia);
app.use(router);
app.mount("#app");
