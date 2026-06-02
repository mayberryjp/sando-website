<template>
  <v-app-bar color="background-100" dark app elevation="1">

      <!-- Product Logo and Name (Left Justified) -->
    <div class="product-branding d-flex align-center ms-2 ms-lg-8">
      <div style="display: flex; flex-direction: row; align-items: center;">
        <router-link to="/" class="router-link" style="display: flex; align-items: center; height: 48px; margin-right: 12px;">
          <img src="/logo.png" alt="Product Logo" width="32px" height="32px" style="margin: 0; align-self: center;" />
        </router-link>
        <div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; height: 48px;">
          <span class="product-name text-subtitle-1 text-lg-h5">Sando
            <!-- "| Know Your Network" hidden on phones (xs), shown from sm up -->
            <span class="product-bar d-none d-sm-inline">|</span>
            <span class="know-your-network d-none d-sm-inline">Know Your Network</span>
          </span>

        </div>
      </div>
    </div>

    <v-spacer></v-spacer>

    <!-- Desktop navigation (full inline button row) -->
    <div v-if="lgAndUp" class="d-flex align-center">
      <v-btn
        v-for="(item, index) in navItems"
        :key="index"
        :to="{ name: item.routeName }"
        variant="text"
        class="mx-2"
        rounded
        :color="$route.name === item.routeName ? 'rose' : ''"
      >
        <v-icon start>{{ item.icon }}</v-icon>
        {{ item.title }}
      </v-btn>

      <!-- GitHub Issues Link -->
      <v-btn
        :href="githubLink.href"
        target="_blank"
        rel="noopener noreferrer"
        variant="text"
        class="mx-2"
        rounded
      >
        <v-icon start>{{ githubLink.icon }}</v-icon>
        {{ githubLink.title }}
      </v-btn>

      <!-- Notification Bell Component -->
      <AppNotifications />

      <!-- Profile Dropdown Component -->
      <AppProfileMenu />
    </div>

    <!-- Mobile / tablet navigation (bell + profile + hamburger) -->
    <div v-else class="d-flex align-center">
      <!-- Notification Bell Component -->
      <AppNotifications />

      <!-- Profile Dropdown Component -->
      <AppProfileMenu />

      <!-- Hamburger toggle (drawer is rendered in AppLayout) -->
      <v-app-bar-nav-icon
        aria-label="Open navigation menu"
        @click="ui.toggleNavDrawer()"
      ></v-app-bar-nav-icon>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";
import AppNotifications from '@/components/layout/AppNotifications.vue';
import AppProfileMenu from '@/components/layout/AppProfileMenu.vue';
import { navItems, githubLink } from "@/constants/navigation";
import { useUiStore } from "@/stores/ui";

// Collapse to a hamburger drawer below 1280px (lg breakpoint).
const { lgAndUp } = useDisplay();

// Drawer open state lives in the UI store; the drawer itself renders in AppLayout.
const ui = useUiStore();
</script>

<style scoped>
.v-app-bar {
  border-bottom: 0px !important;
  box-shadow: none !important;
}

.product-branding {
  margin-top: 5px;
}

.mx-2 {
  text-transform: capitalize;
  color: #b1b8c0;
  font-size: 16px !important;
  font-weight: 400;
  letter-spacing: 0em !important;
}

.router-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

/* Branding colours/weight only — size is responsive via Vuetify
   (text-subtitle-1 on xs–md, text-lg-h5 = 24px on desktop) and inherited by the spans. */
.know-your-network {
  color: #9E394F;
  font-weight: 700;
  text-align: start;
  line-height: 1.4;
  letter-spacing: 0.05em !important;
}

.product-bar {
  color: #9E394F;
  font-weight: 700;
  text-align: start;
  line-height: 1.4;
  margin-right: 8px;
  letter-spacing: 0.05em !important;
}

.product-name {
  color: #cf8e13;
  font-weight: 700;
  text-align: start;
  line-height: 1.4;
  letter-spacing: 0.05em !important;
}

</style>
