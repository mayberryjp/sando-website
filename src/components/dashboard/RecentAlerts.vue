<template>
  <v-sheet rounded="lg" color="#090c10">
    <v-card-title class="alerts-header d-flex align-center px-4 py-3">
      <span class="text-h6 text-sm-h5 text-md-h4 alerts-title">{{ title }}</span>
      <v-btn-toggle
        v-if="showTimeFilter"
        v-model="selectedTimeFilter"
        class="time-filter-toggle ml-0 ml-sm-4 mt-2 mt-sm-0"
        density="compact"
        divided
        mandatory
        selected-class="time-filter-toggle--selected"
      >
        <v-btn
          v-for="option in timeFilterOptions"
          :key="option.value"
          :value="option.value"
          size="small"
        >
          {{ option.label }}
        </v-btn>
      </v-btn-toggle>
      <v-spacer></v-spacer>
      <v-btn
        v-if="showRefreshButton"
        icon="mdi-refresh"
        variant="text"
        size="small"
        @click="$emit('refresh')"
        :loading="loading"
      ></v-btn>
    </v-card-title>
    <v-divider></v-divider>

    <v-data-table
      :headers="headers"
      :items="filteredAlerts"
      :items-per-page="itemsPerPage"
      mobile-breakpoint="md"
      class="alerts-table app-table"
      density="compact"
      show-expand
    >
      <!-- Actions Column -->
      <template v-slot:item.actions="{ item }">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              variant="text"
              size="small"
              v-bind="props"
              :disabled="actionInProgress"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="whitelistExactFlow(item)">
              <v-list-item-title>Allowlist Exact Flow</v-list-item-title>
            </v-list-item>
            <v-list-item @click="whitelistSourceToPort(item)">
              <v-list-item-title
                >Allowlist Source to Port Any Destination</v-list-item-title
              >
            </v-list-item>
            <v-list-item @click="whitelistSourceToDestination(item)">
              <v-list-item-title
                >Allowlist Source to Destination Any Port</v-list-item-title
              >
            </v-list-item>
            <v-list-item @click="whitelistAsLocalServerExposed(item)">
              <v-list-item-title
                >Allowlist As Local Server Port Exposed To Internet</v-list-item-title
              >
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <!-- Category Column -->
      <template v-slot:item.category="{ item }">
        <span class="text-caption">{{ item.category }}</span>
      </template>

      <!-- IP Address Column -->
      <template v-slot:item.ip_address="{ item }">
        <div>
          <div v-if="item.local_description">
            {{ item.local_description }} ({{ item.ip_address }})
          </div>
          <div v-else>{{ item.ip_address }}</div>
        </div>
      </template>

      <!-- Times Seen Column -->
      <template v-slot:item.times_seen="{ item }">
        {{ item.times_seen }}
      </template>

      <!-- Acknowledged Column -->
      <template v-slot:item.acknowledged="{ item }">
        <v-chip
          size="small"
          :color="item.acknowledged ? 'green' : 'red'"
          text-color="white"
          @click="acknowledgeAlert(item)"
          :disabled="actionInProgress"
          :loading="actionInProgress && processingItemId === item.id"
          class="text-caption cursor-pointer"
        >
          {{ item.acknowledged ? "Acknowledged" : "Unacknowledged" }}
        </v-chip>
      </template>

     <!-- First Seen Column -->
      <template v-slot:item.first_seen="{ item }">
        <span class="date-column">{{ formatDate(item.first_seen) }}</span>
      </template>
      
      <!-- Last Seen Column -->
      <template v-slot:item.last_seen="{ item }">
        <span class="date-column">{{ formatDate(item.last_seen) }}</span>
      </template>

      <!-- Delete Column -->
      <template v-slot:item.delete="{ item }">
        <v-btn
          icon
          variant="text"
          size="small"
          color="error"
          @click="deleteAlert(item)"
          :disabled="actionInProgress"
          title="Delete Alert"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>

      <!-- Expanded Row for Flow Details -->
      <template v-slot:expanded-row="{ columns, item }">
        <tr class="expanded-row">
          <td :colspan="columns.length">
            <div class="flow-details-container pa-4">
              <!-- <v-divider color="blue-lighten-4" class="mb-3"></v-divider> -->

              <div v-if="item.flow" class="flow-details-text selectable">
                <div class="d-flex flex-wrap flow-row">
                  <div class="d-flex align-center flow-field mr-4">
                    <h4 class="text-subtitle-2 text-blue-lighten-3 mr-2">
                      Flow Details
                    </h4>
                    <v-btn
                      icon="mdi-content-copy"
                      density="compact"
                      variant="text"
                      size="small"
                      color="blue-lighten-3"
                      @click="copyFlowDetails(item)"
                      title="Copy Flow Details"
                    ></v-btn>
                  </div>

                  <div class="flow-field mr-4">
                    <span class="font-weight-medium text-blue-lighten-4 mr-1"
                      >Source IP:</span
                    >
                    <span class="text-white">{{
                      parseFlow(item.flow).src_ip || "N/A"
                    }}</span>
                  </div>

                  <div class="flow-field mr-4">
                    <span class="font-weight-medium text-blue-lighten-4 mr-1"
                      >Destination IP:</span
                    >
                    <span class="text-white">{{
                      parseFlow(item.flow).dst_ip || "N/A"
                    }}</span>
                  </div>

                  <div class="flow-field mr-4">
                    <span class="font-weight-medium text-blue-lighten-4 mr-1"
                      >Source Port:</span
                    >
                    <span class="text-white">{{
                      parseFlow(item.flow).src_port || "N/A"
                    }}</span>
                  </div>

                  <div class="flow-field mr-4">
                    <span class="font-weight-medium text-blue-lighten-4 mr-1"
                      >Destination Port:</span
                    >
                    <span class="text-white">{{
                      parseFlow(item.flow).dst_port || "N/A"
                    }}</span>
                  </div>

                  <div class="flow-field">
                    <span class="font-weight-medium text-blue-lighten-4 mr-1"
                      >Protocol:</span
                    >
                    <span class="text-white">{{
                      getProtocolName(parseFlow(item.flow).protocol) || "N/A"
                    }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-caption text-grey">
                No flow data available
              </div>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { Alert } from "@/types/alerts";
import {
  acknowledgeAlert as apiAcknowledgeAlert,
  deleteAlert as apiDeleteAlert,
  addToWhitelist,
  type WhitelistPayload,
} from "@/services/alerts";
import { formatDate } from "@/utils/date";
import { getProtocolName } from "@/utils/protocol";
import { useNotificationStore } from "@/stores/notification";

// Define props for the component
const props = defineProps<{
  alerts: Alert[];
  title?: string;
  loading?: boolean;
  showRefreshButton?: boolean;
  showTimeFilter?: boolean;
  itemsPerPage?: number;
}>();

// Define emits for the component
const emit = defineEmits<{
  (e: "actionComplete"): void;
  (e: "refresh"): void;
}>();

// Default values for props
const title = props.title || "Most Recent Detections";
const loading = props.loading || false;
const itemsPerPage = props.itemsPerPage || 50;
const actionInProgress = ref(false);
const processingItemId = ref<string | null>(null);
type TimeFilterValue = "48h" | "7d" | "14d" | "all";

const selectedTimeFilter = ref<TimeFilterValue>("48h");
const timeFilterOptions: { label: string; value: TimeFilterValue }[] = [
  { label: "48 Hours", value: "48h" },
  { label: "7 Days", value: "7d" },
  { label: "14 Days", value: "14d" },
  { label: "All Time", value: "all" },
];

const timeFilterHours: Record<Exclude<TimeFilterValue, "all">, number> = {
  "48h": 48,
  "7d": 7 * 24,
  "14d": 14 * 24,
};

const parseAlertTimestamp = (value: string): number => {
  const timestamp = new Date(value).getTime();

  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  return new Date(value.replace(" ", "T")).getTime();
};

const filteredAlerts = computed(() => {
  if (!props.showTimeFilter || selectedTimeFilter.value === "all") {
    return props.alerts;
  }

  const cutoff =
    Date.now() - timeFilterHours[selectedTimeFilter.value] * 60 * 60 * 1000;

  return props.alerts.filter((alert) => {
    const firstSeenTimestamp = parseAlertTimestamp(alert.first_seen);

    return (
      !Number.isNaN(firstSeenTimestamp) && firstSeenTimestamp >= cutoff
    );
  });
});

// Get notification store
const notificationStore = useNotificationStore();

// Parse flow information
const parseFlow = (
  flowString: string | string[]
): {
  src_ip: string;
  dst_ip: string;
  src_port: string | number;
  dst_port: string | number;
  protocol: string;
} => {
  try {
    // Format: [src_ip, dst_ip, src_port, dst_port, protocol, ...]
    // Example: "[\"192.168.60.4\", \"168.63.129.16\", 52462, 53, 17, ...]"

    // some-times the data is in array format, some-times in string format

    const flowArray = Array.isArray(flowString)
      ? flowString
      : JSON.parse(flowString);

    return {
      src_ip: flowArray[0] || "",
      dst_ip: flowArray[1] || "",
      src_port: flowArray[2] || "",
      dst_port: flowArray[3] || "",
      protocol: flowArray[4] || "",
    };
  } catch (error) {
    console.error("Error parsing flow data:", error, flowString);
    return {
      src_ip: "",
      dst_ip: "",
      src_port: "",
      dst_port: "",
      protocol: "",
    };
  }
};

// Function to copy flow details to clipboard
const copyFlowDetails = (alert: Alert) => {
  if (!alert.flow) return;

  const flow = parseFlow(alert.flow);
  const protocol = getProtocolName(flow.protocol);

  const text = `Source IP: ${flow.src_ip}
Destination IP: ${flow.dst_ip}
Source Port: ${flow.src_port}
Destination Port: ${flow.dst_port}
Protocol: ${protocol}`;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      notificationStore.showSuccess("Flow details copied to clipboard");
    })
    .catch((err) => {
      console.error("Failed to copy flow details: ", err);
      notificationStore.showError("Failed to copy flow details");
    });
};

// Action handlers
const acknowledgeAlert = async (alert: Alert) => {
  if (actionInProgress.value) return;
  actionInProgress.value = true;
  processingItemId.value = alert.id;

  try {
    // Toggle the acknowledged state
    const currentState = alert.acknowledged;
    await apiAcknowledgeAlert(alert.id, !currentState);

    // Update the alert in the local list
    alert.acknowledged = !currentState;

    notificationStore.showSuccess(
      alert.acknowledged
        ? "Alert acknowledged successfully"
        : "Alert unacknowledged successfully"
    );

    // Refresh the data
    emit("actionComplete");
    emit("refresh");
  } catch (error) {
    console.error("Error toggling alert acknowledgement:", error);
    notificationStore.showError("Failed to update alert acknowledgement");
  } finally {
    actionInProgress.value = false;
    processingItemId.value = null;
  }
};

const deleteAlert = async (alert: Alert) => {
  if (actionInProgress.value) return;
  actionInProgress.value = true;

  try {
    await apiDeleteAlert(alert.id);

    notificationStore.showSuccess("Alert deleted successfully");

    // Refresh the data
    emit("refresh");
  } catch (error) {
    console.error("Error deleting alert:", error);
    notificationStore.showError("Failed to delete alert");
  } finally {
    actionInProgress.value = false;
  }
};

const whitelistExactFlow = async (alert: Alert) => {
  if (actionInProgress.value) return;
  actionInProgress.value = true;

  try {
    const flowData = parseFlow(alert.flow);

    const payload: WhitelistPayload = {
      ignorelist_id: `IgnoreList_${alert.id}_Flow`,
      src_ip: alert.ip_address,
      dst_ip: flowData.dst_ip,
      dst_port: flowData.dst_port,
      protocol: flowData.protocol,
    };

    await addToWhitelist(payload);

    notificationStore.showSuccess("Exact flow added to allowlist");

    // Refresh the data
    emit("actionComplete");
    emit("refresh");
  } catch (error) {
    console.error("Error adding to whitelist:", error);
    notificationStore.showError("Failed to add to allowlist");
  } finally {
    actionInProgress.value = false;
  }
};

const whitelistSourceToPort = async (alert: Alert) => {
  if (actionInProgress.value) return;
  actionInProgress.value = true;

  try {
    const flowData = parseFlow(alert.flow);

    const payload: WhitelistPayload = {
      ignorelist_id: `IgnoreList_${alert.id}_Port`,
      src_ip: alert.ip_address,
      dst_ip: "*",
      dst_port: flowData.dst_port,
      protocol: flowData.protocol,
    };

    await addToWhitelist(payload);

    notificationStore.showSuccess("Source to port added to allowlist");

    // Refresh the data
    emit("actionComplete");
    emit("refresh");
  } catch (error) {
    console.error("Error adding to ignorelist:", error);
    notificationStore.showError("Failed to add to allowlist");
  } finally {
    actionInProgress.value = false;
  }
};

const whitelistSourceToDestination = async (alert: Alert) => {
  if (actionInProgress.value) return;
  actionInProgress.value = true;

  try {
    const flowData = parseFlow(alert.flow);

    const payload: WhitelistPayload = {
      ignorelist_id: `IgnoreList_${alert.id}_Destination`,
      src_ip: alert.ip_address,
      dst_ip: flowData.dst_ip,
      dst_port: "*",
      protocol: flowData.protocol,
    };

    await addToWhitelist(payload);

    notificationStore.showSuccess("Source to destination added to allowlist");

    // Refresh the data
    emit("actionComplete");
    emit("refresh");
  } catch (error) {
    console.error("Error adding to whitelist:", error);
    notificationStore.showError("Failed to add to allowlist");
  } finally {
    actionInProgress.value = false;
  }
};

const whitelistAsLocalServerExposed = async (alert: Alert) => {
  if (actionInProgress.value) return;
  actionInProgress.value = true;

  try {
    const flowData = parseFlow(alert.flow);

    const payload: WhitelistPayload = {
      ignorelist_id: `IgnoreList_${alert.id}_LocalServerExposed`,
      src_ip: flowData.src_ip,
      dst_ip: flowData.dst_ip,
      dst_port: flowData.dst_port,
      src_port: flowData.src_port,
      protocol: flowData.protocol,
    };

    await addToWhitelist(payload);

    notificationStore.showSuccess("Local server exposed to internet added to allowlist");

    // Refresh the data
    emit("actionComplete");
    emit("refresh");

  } catch (error) {
    console.error("Error adding to allowlist:", error);
    notificationStore.showError("Failed to add to allowlist");
  } finally {
    actionInProgress.value = false;
  }
};

// Table headers
const headers = [
  {
    title: "Actions",
    key: "actions",
    sortable: false,
    align: "start" as const,
  },
  { title: "Detection Category", key: "category", sortable: true },
  { title: "Local Host", key: "ip_address", sortable: true },
  { title: "Details", key: "alert_enrichment_1", sortable: true },
  { title: "Details", key: "alert_enrichment_2", sortable: true },
  { title: "Times Seen", key: "times_seen", sortable: true, width: "130px" },
  {
    title: "Acknowledged",
    key: "acknowledged",
    align: "center" as const,
    sortable: true,
    width: "180px",
  },
  { title: "First Seen", key: "first_seen", sortable: true, nowrap: true },
  { title: "Last Seen", key: "last_seen", sortable: true, nowrap: true },
  {
    title: "Delete",
    key: "delete",
    align: "center" as const,
    sortable: false,
    width: "50px",
  },

];
</script>

<style scoped>
/* Generic table theme + responsiveness lives in src/assets/app-table.css
   (applied via the `app-table` class). Only RecentAlerts-specific styling below. */

.alerts-table {
  color: #b1b8c0;
}

.alerts-header {
  gap: 8px;
  flex-wrap: wrap;
}

/* Alerts title colour (size comes from Vuetify text utilities) */
.alerts-title {
  color: #b1b8c0;
}

.time-filter-toggle {
  border: 1px solid #30363d;
  border-radius: 6px;
  flex-wrap: wrap;
  height: auto;
  overflow: hidden;
}

.time-filter-toggle :deep(.v-btn) {
  color: #b1b8c0;
  min-width: 76px;
}

.time-filter-toggle :deep(.time-filter-toggle--selected) {
  background-color: #1f6feb;
  color: #ffffff;
}

.cursor-pointer {
  cursor: pointer;
}

/* Flow tooltip styling */
:deep(.flow-tooltip-container) {
  opacity: 1 !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

.flow-tooltip {
  max-width: 300px;
  border: 1px solid rgba(97, 163, 254, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
}

.flow-label {
  min-width: 120px;
}

.flow-item {
  border-bottom: 1px dashed rgba(97, 163, 254, 0.15);
}

.flow-item:last-child {
  border-bottom: none;
}

.flow-details-container {
  border-radius: 8px;
  border: 1px solid rgba(97, 163, 254, 0.3);
  background-color: #1e2736;
}

.flow-field {
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
}

.selectable {
  user-select: all;
}

.flow-row {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}

.date-column {
  color: #b1b8c0;
  font-weight: 500;
}
</style>
