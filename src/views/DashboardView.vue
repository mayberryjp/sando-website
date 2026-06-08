<template>
  <div>
    <v-row class="quickstats-background ma-0 rounded-lg">
      <!-- Status Cards -->
      <v-col
        cols="6"
        sm="6"
        md="3"
        v-for="(stat, index) in statusStats"
        :key="index"
        class="bg-transparent"
      >
        <v-card
          variant="plain"
          class="text-center pa-2 pa-sm-4 bg-transparent border-none"
        >
          <div class="text-subtitle-1 text-sm-h6 text-md-h5 font-weight-medium stat-label mb-1">
            {{ stat.label }}
          </div>
          <div class="stat-description mb-1">{{ stat.description || "" }}</div>
          <div :class="['text-h6 text-sm-h5 text-md-h4 font-weight-bold', stat.color]">
            {{ stat.value }}
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <TrafficStats
          :traffic-stats="trafficStats"
          :loading="trafficStatsLoading"
          :error="trafficStatsError"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <RecentAlerts
          :alerts="recentAlerts"
          :loading="alertsLoading"
          :show-refresh-button="true"
          :show-time-filter="true"
          @refresh="refreshAlerts"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue"; // Add onUnmounted
import {
  getQuickStats,
  getTrafficStats,
  type TrafficStat,
} from "@/services/stats";
import RecentAlerts from "@/components/dashboard/RecentAlerts.vue";
import TrafficStats from "@/components/dashboard/TrafficStats.vue";
import { useHostsStore } from "@/stores/hosts";
import { useNotificationStore } from "@/stores/notification";

// Stats data from API
const quickStats = ref({
  acknowledged_alerts: 0,
  unacknowledged_alerts: 0,
  total_alerts: 0,
  unacknowledged_localhosts_count: 0,
  acknowledged_localhosts_count: 0,
  total_localhosts_count: 0,
  ignorelist_count: 0,
  average_threat_score: 0,
  total_packets: 0,
  total_flows: 0,
  total_bytes: 0,
  last_packets: 0,
  last_flows: 0,
  last_bytes: 0,
  last_flow_seen: null,
  is_healthy: "Down"
});

// Initialize stores
const hosts = useHostsStore();
const notificationStore = useNotificationStore();
const alertsLoading = ref(false);
const trafficStats = ref<TrafficStat[]>([]);
const trafficStatsLoading = ref(true);
const trafficStatsError = ref(false);

// Status stats computed from quickStats
const statusStats = computed(() => [
  {
    label: "Hosts",
    description: "Acknowledged",
    value: quickStats.value.acknowledged_localhosts_count || 0,
    color: "text-green-accent-3",
  },
  {
    label: "Hosts",
    description: "Unacknowledged",
    value: quickStats.value.unacknowledged_localhosts_count || 0,
    color: "text-red",
  },
  {
    label: "Flows",
    description: "Processing",
    value: quickStats.value.last_flows || 0,
    color: "text-blue-accent-3",
  },
  {
    label: "Alerts",
    description: "Unacknowledged",
    value: quickStats.value.unacknowledged_alerts || 0,
    color: "text-red",
  },
]);

// Computed property to get recent alerts, sort and limit them
const recentAlerts = computed(() => {
  return [...hosts.alertsRecent]
    .sort(
      (a, b) =>
        new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
    )
    .slice(0, 50);
});

// Function to refresh the alerts data
const refreshAlerts = async () => {
  alertsLoading.value = true;
  try {
    await hosts.fetchRecentAlerts();
    // Show success notification
  } catch (error) {
    console.error("Error refreshing alerts:", error);
    // Show error notification
    notificationStore.showError("Error refreshing alerts.");
  } finally {
    alertsLoading.value = false;
  }
};

// Fetch stats data from the API
const fetchStats = async () => {
  try {
    const response = await getQuickStats();
    console.log("Fetched stats:", response.data);
    quickStats.value = response.data;
    // No success notification for initial load
  } catch (error) {
    console.error("Error fetching stats:", error);
    notificationStore.showError("Error fetching dashboard stats.");
  }
};

const fetchTrafficStats = async () => {
  trafficStatsLoading.value = true;
  trafficStatsError.value = false;
  try {
    const { data } = await getTrafficStats();
    trafficStats.value = data;
  } catch (error) {
    console.error("Error fetching traffic stats:", error);
    trafficStats.value = [];
    trafficStatsError.value = true;
  } finally {
    trafficStatsLoading.value = false;
  }
};

// Store the interval ID to clear it later
let statsRefreshInterval: number | null = null;

// Initialize data on mount
onMounted(async () => {
  // Load initial data
  fetchStats();
  fetchTrafficStats();

  // If alerts haven't been loaded yet, load them
  if (!hosts.alertsRecent.length) {
    refreshAlerts();
  }
  
  // Set up automatic refresh every 60 seconds
  statsRefreshInterval = window.setInterval(() => {
    console.log("Auto-refreshing dashboard stats...");
    fetchStats();
    fetchTrafficStats();
  }, 60000);
});

// Clean up interval when component unmounts
onUnmounted(() => {
  if (statsRefreshInterval !== null) {
    window.clearInterval(statsRefreshInterval);
    statsRefreshInterval = null;
  }
});
</script>

<style scoped>
.dashboard {
  background-color: transparent;
  height: 100%;
}

/* Custom stat value colours (size/weight come from Vuetify text utilities) */
.text-red,
.text-green-accent-3 {
  font-family: var(--app-font-family);
}

.text-red {
  color: #dc3545 !important;
}

.text-green-accent-3 {
  color: #5cdd8b !important;
}

/* Stat label colour & font (size/weight come from Vuetify text utilities) */
.stat-label {
  color: rgb(177, 184, 192);
  font-family: var(--app-font-family);
}

.quickstats-background {
  background-color: #0d1117 !important;
  color: rgba(255, 255, 255, 0.87);
  padding: 5px;
}

.stat-description {
  font-size: 14px;
  color: #8b949e;
  font-weight: 400;
  line-height: 1.2;
  font-family: var(--app-font-family);
}

@media (max-width: 599px) {
  .stat-description {
    font-size: 12px;
  }
}
</style>
