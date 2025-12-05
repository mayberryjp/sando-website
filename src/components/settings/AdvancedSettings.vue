<template>
  <div>
    <div>
      <div class="maintenance-actions">
        <div class="maintenance-action mb-6">
          <v-btn
            color="error"
            variant="elevated"
            min-width="260"
            elevation="2"
            prepend-icon="mdi-delete-alert"
            @click="confirmDeleteAllAlerts"
            :loading="isDeleteAlertsLoading"
          >
            Delete All Alerts
          </v-btn>
          <p class="text-body-2 mt-2">
            This will permanently delete all alert data from the system. This
            action cannot be undone.
          </p>
        </div>

        <div class="maintenance-action">
          <v-btn
            color="primary"
            variant="elevated"
            min-width="260"
            elevation="2"
            prepend-icon="mdi-reload"
            @click="confirmRecalculateThreatScores"
            :loading="isRecalculatingScores"
          >
            Recalculate Threat Scores
          </v-btn>
          <p class="text-body-2 mt-2">
            This will recalculate threat scores for all hosts in the system.
            This may take a few minutes to complete.
          </p>
        </div>

        <!-- Export Localhosts Button -->
        <div class="maintenance-action mt-6">
          <v-btn
            color="secondary"
            variant="elevated"
            min-width="260"
            elevation="2"
            prepend-icon="mdi-download"
            @click="exportLocalhosts"
          >
            Export Localhosts CSV
          </v-btn>
          <p class="text-body-2 mt-2">
            Download a CSV export of all localhosts.
          </p>
        </div>
      </div>
    </div>

    <!-- Delete Alerts Confirmation Dialog -->
    <v-dialog v-model="deleteAlertsDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">Delete All Alerts</v-card-title>
        <v-card-text>
          Are you sure you want to delete all alerts? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="deleteAlertsDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="text" @click="deleteAllAlerts">
            Delete All
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Recalculate Threat Scores Confirmation Dialog -->
    <v-dialog v-model="recalculateScoresDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">Recalculate Threat Scores</v-card-title>
        <v-card-text>
          Are you sure you want to recalculate threat scores for all hosts? This may take some time.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="recalculateScoresDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="text" @click="recalculateThreatScores">
            Recalculate
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Configuration Details Section -->
    <div class="maintenance-action mt-8">
      <h3>Configuration Details</h3>
      <v-card flat color="transparent" class="pa-2">
        <v-row>
          <v-col
            cols="12"
            v-for="item in displayedConfig"
            :key="item.key"
            class="py-1"
          >
            <strong>{{ item.key }}:</strong> <span>{{ item.value }}</span>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import api from "@/services/api";
import { deleteAllAlerts as deleteAllAlertsService, forceThreatCollection } from "@/services/alerts";
import { useNotificationStore } from "@/stores/notification";

// Get SANDO_API_URL from environment variables
const SANDO_API_URL = import.meta.env.VITE_API_BASE_URL || "";

// State management
const isDeleteAlertsLoading = ref(false);
const isRecalculatingScores = ref(false);
const deleteAlertsDialog = ref(false);
const recalculateScoresDialog = ref(false);
const notificationStore = useNotificationStore();

// Delete all alerts
const confirmDeleteAllAlerts = () => {
  deleteAlertsDialog.value = true;
};

const deleteAllAlerts = async () => {
  isDeleteAlertsLoading.value = true;
  try {
    await deleteAllAlertsService();
    notificationStore.showSuccess("All alerts have been successfully deleted");
  } catch (error) {
    console.error("Error deleting alerts:", error);
    notificationStore.showError("Failed to delete alerts. Please try again.");
  } finally {
    isDeleteAlertsLoading.value = false;
    deleteAlertsDialog.value = false;
  }
};

// Recalculate threat scores
const confirmRecalculateThreatScores = () => {
  recalculateScoresDialog.value = true;
};

const recalculateThreatScores = async () => {
  isRecalculatingScores.value = true;
  try {
    await forceThreatCollection();
    notificationStore.showSuccess("Threat score recalculation has been initiated");
  } catch (error) {
    console.error("Error recalculating threat scores:", error);
    notificationStore.showError("Failed to recalculate threat scores. Please try again.");
  } finally {
    isRecalculatingScores.value = false;
    recalculateScoresDialog.value = false;
  }
};

// Export Localhosts CSV
const exportLocalhosts = () => {
  window.open(`${SANDO_API_URL}/api/localhosts/csv`, "_blank");
};

// Configuration details
const configDetails = ref<Array<{ key: string; value: any }>>([]);

const keysToShow = [
  "Version",
  "DatabaseSchemaVersion",
  "SiteName",
  // Add more keys as needed
];

const displayedConfig = computed(() =>
  configDetails.value.filter(item => keysToShow.includes(item.key))
);

onMounted(async () => {
  try {
    const res = await api.get("/configurations");
    if (Array.isArray(res.data)) {
      configDetails.value = res.data;
    } else {
      configDetails.value = [];
    }
  } catch (e) {
    configDetails.value = [{ key: "Version", value: "Unavailable" }];
  }
});
</script>

<style scoped>
.maintenance-actions {
  display: flex;
  flex-direction: column;
  max-width: 500px;
}

.maintenance-action {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
