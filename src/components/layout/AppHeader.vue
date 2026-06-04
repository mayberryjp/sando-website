<template>
  <v-app-bar color="background-100" dark app elevation="1">

    <!-- Product logo + name (left); the whole block links to the dashboard -->
    <router-link
      :to="{ name: 'dashboard' }"
      class="product-branding d-flex align-center text-decoration-none ms-2 ms-lg-8"
    >
      <img src="/logo.png" alt="Product Logo" width="32" height="32" class="mr-3" />
      <span class="product-name text-subtitle-1 text-lg-h5">Sando
        <!-- Tagline shown only >= 1500px (see `.tagline`), else hidden -->
        <span class="product-bar tagline">|</span>
        <span class="know-your-network tagline">Know Your Network</span>
      </span>
    </router-link>

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
  height: 48px;
}

.mx-2 {
  text-transform: capitalize;
  color: #b1b8c0;
  font-size: 16px !important;
  font-weight: 400;
  letter-spacing: 0em !important;
}

/* Branding colour/weight only — size comes from Vuetify text utilities */
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
  white-space: nowrap; /* never wrap the branding onto a second line */
}

/* Tagline hidden by default; shown only >= 1500px where nav + branding both fit.
   (Custom threshold — Vuetify's lg=1280 is too tight once the nav appears.) */
.tagline {
  display: none;
}

@media (min-width: 1500px) {
  .tagline {
    display: inline;
  }
}

</style>
