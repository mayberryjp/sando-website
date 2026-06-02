import { defineStore } from "pinia";
import { ref } from "vue";

// Shared UI state. Currently holds the mobile/tablet navigation drawer, which is
// toggled from AppHeader's hamburger but rendered in AppLayout (the v-app root) so
// Vuetify positions it correctly within the layout.
export const useUiStore = defineStore("ui", () => {
  const navDrawer = ref(false);

  const toggleNavDrawer = () => {
    navDrawer.value = !navDrawer.value;
  };

  const closeNavDrawer = () => {
    navDrawer.value = false;
  };

  return {
    navDrawer,
    toggleNavDrawer,
    closeNavDrawer,
  };
});
