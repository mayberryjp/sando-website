<template>
  <v-app>
    <!-- Header -->
    <AppHeader />

    <!-- Mobile / tablet slide-out navigation (toggled from AppHeader's hamburger).
         Rendered here at the v-app root so Vuetify positions it within the layout. -->
    <v-navigation-drawer
      v-model="ui.navDrawer"
      temporary
      location="right"
      color="background-100"
    >
      <v-list density="comfortable" nav>
        <v-list-item
          v-for="(item, index) in navItems"
          :key="index"
          :to="{ name: item.routeName }"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="$route.name === item.routeName"
          color="rose"
          @click="ui.closeNavDrawer()"
        ></v-list-item>

        <v-divider class="my-2"></v-divider>

        <!-- GitHub Issues Link -->
        <v-list-item
          :href="githubLink.href"
          target="_blank"
          rel="noopener noreferrer"
          :prepend-icon="githubLink.icon"
          :title="githubLink.title"
          @click="ui.closeNavDrawer()"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <v-row>
          <!-- Only show HostList if not on explore route -->
          <v-col cols="12" lg="3" class="host-list-panel" v-if="$route.name !== 'explore'">
            <HostList />
          </v-col>
          <!-- Full width on mobile/tablet; narrows to 9 cols beside the sidebar on lg+ -->
          <v-col cols="12" :lg="$route.name === 'explore' ? 12 : 9">
            <router-view></router-view>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
import HostList from "@/components/dashboard/HostList.vue";
import { navItems, githubLink } from "@/constants/navigation";
import { useUiStore } from "@/stores/ui";

const ui = useUiStore();
</script>

<style scoped>
.v-container {
  height: 100%;
}

.v-main {
  background-color: #0a0c10;
  color: rgba(255, 255, 255, 0.87);
}

@media (min-width: 1280px) {
  .host-list-panel {
    position: sticky;
    top: 68px;
    align-self: flex-start;
    max-height: calc(100vh - 60px);
    overflow-y: auto;
    height: calc(100vh - 80px);
  }
}

@media (max-width: 1279px) {
  .host-list-panel {
    position: relative;
  }
}
</style>
