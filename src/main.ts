import { createApp } from "vue";
import "./style.css";
import router from "./router";
import App from "@/App.vue";
import vuetify from "@/plugins/vuetify-plugin";
// Imported after the Vuetify plugin so its table overrides win the cascade.
import "@/assets/app-table.css";
import "@/assets/settings-form.css";
import { createPinia } from "pinia";
import VueApexCharts from "vue3-apexcharts";

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(vuetify);
app.use(pinia);
app.use(VueApexCharts);
app.mount("#app");
