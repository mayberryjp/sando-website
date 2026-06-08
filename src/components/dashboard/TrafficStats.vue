<template>
  <v-card color="#0d1117" class="traffic-stats-card">
    <v-card-title class="traffic-stats-header d-flex align-center px-4 py-3">
      <span class="text-h6 text-sm-h5 text-md-h4 traffic-stats-title">
        Site Traffic
      </span>
      <v-spacer></v-spacer>
      <span class="text-caption text-grey">Last 100 hours</span>
    </v-card-title>
    <v-divider></v-divider>

    <AppSkeleton v-if="loading" type="image" color="#0d1117" />

    <v-card-text v-else-if="error" class="traffic-state text-center">
      <v-icon color="warning" size="28" class="mb-2">mdi-alert-circle-outline</v-icon>
      <div class="text-grey">Traffic stats could not be loaded.</div>
    </v-card-text>

    <v-card-text v-else-if="!hasTrafficStats" class="traffic-state text-center">
      <v-icon color="grey" size="28" class="mb-2">mdi-chart-line</v-icon>
      <div class="text-grey">No traffic data available.</div>
    </v-card-text>

    <div v-else class="traffic-chart-wrap">
      <apexchart
        type="line"
        height="320"
        :options="chartOptions"
        :series="series"
      ></apexchart>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import AppSkeleton from "@/components/base/AppSkeleton.vue";
import type { TrafficStat } from "@/services/stats";
import { formatBytes } from "@/utils/filesize";

const props = defineProps<{
  trafficStats: TrafficStat[];
  loading: boolean;
  error: boolean;
}>();

const recentTrafficStats = computed(() =>
  [...props.trafficStats]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(-100)
);

const hasTrafficStats = computed(() => recentTrafficStats.value.length > 0);

const formatTimestamp = (timestamp: string) => {
  const [datePart, hourPart] = timestamp.split(":");

  if (!datePart || !hourPart) {
    return timestamp;
  }

  const date = new Date(`${datePart}T${hourPart.padStart(2, "0")}:00:00`);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const categories = computed(() =>
  recentTrafficStats.value.map((stat) => formatTimestamp(stat.timestamp))
);

const series = computed(() => [
  {
    name: "Total Bytes",
    type: "line",
    data: recentTrafficStats.value.map((stat) => stat.total_bytes),
  },
  {
    name: "Total Packets",
    type: "line",
    data: recentTrafficStats.value.map((stat) => stat.total_packets),
  },
  {
    name: "Alerts",
    type: "bar",
    data: recentTrafficStats.value.map((stat) => stat.alerts),
  },
]);

const chartOptions = computed(() => ({
  chart: {
    id: "dashboard-traffic-stats-chart",
    background: "#0d1117",
    toolbar: {
      show: false,
    },
    animations: {
      enabled: true,
      easing: "easeinout",
      speed: 800,
    },
    zoom: {
      enabled: false,
    },
  },
  colors: ["#5CDD8B", "#3498db", "#B71C1C"],
  fill: {
    opacity: [1, 1, 0.3],
  },
  stroke: {
    curve: "smooth",
    width: [3, 2, 0],
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    theme: "dark",
    shared: true,
    y: [
      {
        formatter: (val: number) => formatBytes(val),
      },
      {
        formatter: (val: number) => `${Math.round(val).toLocaleString()} packets`,
      },
      {
        formatter: (val: number) => `${Math.round(val).toLocaleString()} alerts`,
      },
    ],
  },
  grid: {
    borderColor: "#333",
    row: {
      colors: ["transparent", "transparent"],
      opacity: 0.1,
    },
  },
  xaxis: {
    categories: categories.value,
    labels: {
      rotate: -45,
      style: {
        colors: "#b1b8c0",
      },
    },
    axisBorder: {
      color: "#333",
    },
    axisTicks: {
      color: "#333",
    },
  },
  yaxis: [
    {
      title: {
        text: "Total Bytes",
        style: {
          color: "#5CDD8B",
        },
      },
      labels: {
        style: {
          colors: "#b1b8c0",
        },
        formatter: (val: number) => formatBytes(val),
      },
    },
    {
      opposite: true,
      title: {
        text: "Packets / Alerts",
        style: {
          color: "#3498db",
        },
      },
      labels: {
        style: {
          colors: "#b1b8c0",
        },
        formatter: (val: number) => Math.round(val).toLocaleString(),
      },
    },
    {
      show: false,
      opposite: true,
      labels: {
        formatter: (val: number) => Math.round(val).toLocaleString(),
      },
    },
  ],
  legend: {
    show: true,
    position: "top",
    horizontalAlign: "right",
    labels: {
      colors: "#b1b8c0",
    },
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        chart: {
          height: 280,
        },
        legend: {
          position: "bottom",
          horizontalAlign: "center",
        },
        xaxis: {
          labels: {
            show: false,
          },
        },
      },
    },
  ],
}));
</script>

<style scoped>
.traffic-stats-card {
  overflow: hidden;
}

.traffic-stats-title {
  font-family: var(--app-font-family);
  color: #ffffff;
}

.traffic-chart-wrap {
  padding: 12px 12px 4px;
}

.traffic-state {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

:deep(.app-skeleton .v-card) {
  margin-bottom: 0 !important;
}

:deep(.apexcharts-tooltip) {
  background: #1e1e1e !important;
  border: none !important;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4) !important;
}

:deep(.apexcharts-tooltip-title) {
  background: #2d2d2d !important;
  border-bottom: 1px solid #3a3a3a !important;
}
</style>
