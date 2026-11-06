<template>
  <v-card color="#0d1117" class="pa-6">
    <!-- Header -->
    <v-row align="center" class="mb-8">
      <v-col>
        <h1 class="text-h4 text-grey-lighten-1 font-weight-medium">Edit</h1>
      </v-col>
    </v-row>

    <!-- Form Container -->
    <v-row>
      <v-col cols="12" md="8" lg="6">
        <v-form ref="form" v-model="valid" @submit.prevent="saveHost">
          <!-- IP Address Field -->
          <v-text-field
            v-model="formData.ipAddress"
            label="IP Address"
            variant="outlined"
            density="comfortable"
            class="mb-6"
            prepend-inner-icon="mdi-ip"
            hint="IP address of this device"
            persistent-hint
            clearable
            :disabled="selectingIp || saving"
          />

          <div v-if="showNetworkSelection" class="mb-6">
            <v-select
              v-model="selectedNetwork"
              :items="networkOptions"
              item-title="title"
              item-value="cidr"
              label="Local Network"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lan"
              :loading="networksLoading"
              :disabled="networksLoading || selectingIp || saving"
              :no-data-text="networksError ? 'Failed to load local networks' : 'No IPv4 local networks configured'"
              hint="Select the network to find an unused IPv4 address"
              persistent-hint
              clearable
              class="mb-2"
            />
            <v-btn
              v-if="networksError"
              type="button"
              variant="text"
              color="info"
              class="mb-2 me-2"
              @click="loadLocalNetworks"
            >
              Retry Loading Networks
            </v-btn>
            <v-btn
              type="button"
              variant="outlined"
              size="small"
              color="info"
              prepend-icon="mdi-auto-fix"
              :loading="selectingIp"
              :disabled="!selectedNetwork || networksLoading || selectingIp || saving"
              @click="selectUnusedIp"
            >
              AUTO-SELECT UNUSED IP
            </v-btn>
            <div class="mt-2 text-caption text-grey">
              Inventory lookup only; does not reserve or probe the address. Save Changes to apply.
            </div>
          </div>

          <!-- IPv6 Address Field -->
          <v-text-field
            v-model="formData.ip6Address"
            label="IPv6 Address"
            variant="outlined"
            density="comfortable"
            class="mb-6"
            prepend-inner-icon="mdi-ip"
            hint="IPv6 address of this device"
            persistent-hint
            clearable
          />

           <!-- MAC Address Field -->
          <v-text-field
            v-model="formData.macAddress"
            label="MAC Address"
            variant="outlined"
            density="comfortable"
            class="mb-6"
            prepend-inner-icon="mdi-lan"
            hint="Physical MAC address of this device"
            persistent-hint
            clearable
          />         

          <!-- Domain Name Field -->
          <v-text-field
            v-model="formData.domainName"
            label="Domain Name"
            variant="outlined"
            density="comfortable"
            class="mb-6"
            prepend-inner-icon="mdi-web"
            hint="Domain name of this device"
            persistent-hint
            clearable
          />

          <!-- Device Category Dropdown -->
          <v-select
            v-model="formData.category"
            :items="deviceCategories"
            item-title="name"
            item-value="value"
            label="Device Category"
            variant="outlined"
            density="comfortable"
            class="mb-2"
            :loading="categoriesLoading"
            :disabled="categoriesLoading"
            clearable
            prepend-inner-icon="mdi-devices"
            hide-details
          >
            <template #no-data>
              <v-list-item>
                <v-list-item-title>
                  {{
                    categoriesError
                      ? "Failed to load categories"
                      : "No categories available"
                  }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-select>

          <!-- Auto Classification Button -->
          <div class="mb-6">
            <v-btn
              variant="outlined"
              size="small"
              color="info"
              :loading="classifying"
              :disabled="!props.hostDetail || classifying"
              @click="attemptAutoClassify"
              class="mb-2"
              prepend-icon="mdi-auto-fix"
            >
              Attempt To Auto Classify Device
            </v-btn>

            <div
              v-if="classificationOptions.length > 0"
              class="mt-1 text-caption text-grey"
            >
              <div><strong>Possible device types:</strong></div>
              <v-chip-group>
                <v-chip
                  v-for="(option, index) in classificationOptions"
                  :key="index"
                  size="x-small"
                  variant="outlined"
                  color="primary"
                  @click="selectClassification(option)"
                  class="chip-hover"
                  :class="{
                    'selected-chip': formData.category === option.value,
                  }"
                  elevation="0"
                >
                  {{ option.name }}
                </v-chip>
              </v-chip-group>
            </div>
          </div>

          <!-- Friendly Name -->
          <v-text-field
            v-model="formData.friendlyName"
            label="Friendly Name"
            variant="outlined"
            density="comfortable"
            class="mb-6"
            prepend-inner-icon="mdi-tag"
            hint="A descriptive name for this device"
            persistent-hint
            clearable
          />

          <!-- Management Link -->
          <v-text-field
            v-model="formData.managementLink"
            label="Management Link"
            variant="outlined"
            density="comfortable"
            class="mb-6"
            prepend-inner-icon="mdi-link"
            hint="URL to the device's management interface"
            persistent-hint
            clearable
            type="url"
            placeholder="https://..."
            :rules="[urlValidationRule]"
          >
            <template
              #append-inner
              v-if="
                formData.managementLink && isValidUrl(formData.managementLink)
              "
            >
              <v-tooltip text="Test Link" location="top">
                <template #activator="{ props: tooltipProps }">
                  <v-btn
                    v-bind="tooltipProps"
                    icon="mdi-open-in-new"
                    variant="text"
                    size="small"
                    @click="openManagementLink"
                    color="primary"
                  />
                </template>
              </v-tooltip>
            </template>
          </v-text-field>

          <!-- Action Buttons -->
          <v-row justify="end" class="mt-8">
            <v-col cols="auto">
              <v-btn
                variant="outlined"
                @click="$emit('close')"
                :disabled="saving"
                class="me-3"
              >
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                type="submit"
                :loading="saving"
                :disabled="!hasChanges || saving || selectingIp"
              >
                Save Changes
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>

  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { isAxiosError } from "axios";
import type { Localhost } from "@/types/localhosts";
import {
  updateHost,
  getDeviceCategories,
  autoClassifyDevice,
  getAvailableIp,
} from "@/services/hosts";
import { getLocalNetworks } from "@/services/settings";
import {
  isValidUrl,
  openUrlSafely,
  createUrlValidationRule,
} from "@/utils/general";
import { useNotificationStore } from "@/stores/notification";

// Props
const props = defineProps<{
  hostDetail: Localhost | null;
}>();

// Emits
const emit = defineEmits<{
  close: [];
  saved: [];
}>();

// Reactive data
const valid = ref(false);
const saving = ref(false);
const categoriesLoading = ref(false);
const categoriesError = ref(false);
const deviceCategories = ref<Array<{ name: string; value: string }>>([]);
const classifying = ref(false);
const classificationOptions = ref<Array<{ name: string; value: string }>>([]);
const selectedNetwork = ref<string | null>(null);
const networkOptions = ref<Array<{ title: string; cidr: string }>>([]);
const networksLoading = ref(false);
const networksLoaded = ref(false);
const networksError = ref(false);
const selectingIp = ref(false);

const formData = ref({
  ipAddress: "",
  category: "",
  friendlyName: "",
  managementLink: "",
  macAddress: "",
  ip6Address: "",
  domainName: "",
});

const originalData = ref({
  ipAddress: "",
  category: "",
  friendlyName: "",
  managementLink: "",
  macAddress: "",
  ip6Address: "",
  domainName: "",
});

const notificationStore = useNotificationStore();
const showNetworkSelection = computed(() =>
  !!props.hostDetail && (!originalData.value.ipAddress || !formData.value.ipAddress)
);

const loadLocalNetworks = async () => {
  networksLoading.value = true;
  networksError.value = false;
  try {
    const networks = await getLocalNetworks();
    networkOptions.value = networks
      .filter(network =>
        network.cidr && !network.cidr.includes(":") && network.ip_version !== "IPv6"
      )
      .map(network => ({
        cidr: network.cidr,
        title: network.firewall_interface_name
          ? `${network.firewall_interface_name} (${network.cidr})`
          : network.cidr,
      }));
    networksLoaded.value = true;
  } catch (error) {
    networksError.value = true;
    notificationStore.showError("Failed to load local networks. Please retry.");
  } finally {
    networksLoading.value = false;
  }
};

const selectUnusedIp = async () => {
  if (!selectedNetwork.value || selectingIp.value || saving.value) return;
  const network = selectedNetwork.value;
  const currentForm = formData.value;
  selectingIp.value = true;
  try {
    const { data } = await getAvailableIp(network);
    if (formData.value === currentForm && selectedNetwork.value === network) {
      formData.value.ipAddress = data.ip_address;
    }
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    notificationStore.showError(
      status === 404
        ? "No unused IPv4 addresses are available in the selected network."
        : status === 400
          ? "The selected network is invalid. Check its IPv4 CIDR configuration."
          : "Failed to find an unused IP address. Please try again."
    );
  } finally {
    selectingIp.value = false;
  }
};

// Computed
const hasChanges = computed(() => {
  return (
    formData.value.ipAddress !== originalData.value.ipAddress ||
    formData.value.category !== originalData.value.category ||
    formData.value.friendlyName !== originalData.value.friendlyName ||
    formData.value.managementLink !== originalData.value.managementLink ||
    formData.value.macAddress !== originalData.value.macAddress ||
    formData.value.ip6Address !== originalData.value.ip6Address ||
    formData.value.domainName !== originalData.value.domainName
  );
});

const urlValidationRule = createUrlValidationRule(false, true);

const openManagementLink = () => {
  if (
    formData.value.managementLink &&
    isValidUrl(formData.value.managementLink)
  ) {
    openUrlSafely(formData.value.managementLink);
  }
};

// Methods
const loadDeviceCategories = async () => {
  categoriesLoading.value = true;
  categoriesError.value = false;

  try {
    const { data } = await getDeviceCategories();
    // Transform the API response to the expected format and sort alphabetically
    if (Array.isArray(data)) {
      deviceCategories.value = data
        .map((category: string) => ({
          name: category,
          value: category,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
    }
  } catch (error) {
    console.error("Error loading device categories:", error);
    categoriesError.value = true;
  } finally {
    categoriesLoading.value = false;
  }
};

const attemptAutoClassify = async () => {
  if (!props.hostDetail) return;

  classifying.value = true;
  classificationOptions.value = [];

  try {
    const { data } = await autoClassifyDevice(props.hostDetail.ip_address);

    if (data && data.best_match && Array.isArray(data.best_match)) {
      classificationOptions.value = data.best_match.map((category: string) => ({
        name: category,
        value: category,
      }));

      if (classificationOptions.value.length > 0) {
        formData.value.category = classificationOptions.value[0].value;
      }
    }
  } catch (error) {
    console.error("Error auto-classifying device:", error);
    notificationStore.showError("Failed to auto-classify device. Please try again.");
  } finally {
    classifying.value = false;
  }
};

const selectClassification = (option: { name: string; value: string }) => {
  formData.value.category = option.value;
};

const initializeForm = () => {
  selectedNetwork.value = null;
  if (props.hostDetail) {
    const ipAddress = props.hostDetail.ip_address || "";
    const friendlyName = props.hostDetail.local_description || "";
    const managementLink = props.hostDetail.management_link || "";
    const category = props.hostDetail.icon || "";
    const macAddress = props.hostDetail.mac_address || "";
    const ip6Address = props.hostDetail.ip6_address || "";
    const domainName = props.hostDetail.domain_name || "";

    formData.value = {
      ipAddress,
      category,
      friendlyName,
      managementLink,
      macAddress,
      ip6Address,
      domainName,
    };

    originalData.value = {
      ipAddress,
      category,
      friendlyName,
      managementLink,
      macAddress,
      ip6Address,
      domainName,
    };
  }
};

const saveHost = async () => {
  if (!props.hostDetail || !valid.value || selectingIp.value) return;

  saving.value = true;

  try {
    const updateData = {
      ip_address: formData.value.ipAddress,
      local_description: formData.value.friendlyName,
      management_link: formData.value.managementLink,
      icon: formData.value.category,
      mac_address: formData.value.macAddress,
      ip6_address: formData.value.ip6Address,
      domain_name: formData.value.domainName,
    };

    // If IP address was changed, use MAC address as the identifier in the API call
    const identifier =
      formData.value.ipAddress !== originalData.value.ipAddress
        ? formData.value.macAddress
        : props.hostDetail.ip_address;

    await updateHost(identifier, updateData);

    originalData.value = { ...formData.value };

    emit("saved");

    notificationStore.showSuccess("Host details updated successfully");

    setTimeout(() => {
      emit("close");
    }, 1000);
  } catch (error) {
    console.error("Error saving host details:", error);
    notificationStore.showError("Failed to update host details. Please try again.");
  } finally {
    saving.value = false;
  }
};

// Watchers
watch(() => props.hostDetail, initializeForm, { immediate: true });
watch(showNetworkSelection, (show) => {
  if (show && !networksLoaded.value && !networksLoading.value && !networksError.value) {
    loadLocalNetworks();
  }
}, { immediate: true });

// Lifecycle
onMounted(() => {
  loadDeviceCategories();
  initializeForm();
});
</script>

<style scoped>
.chip-hover {
  transition: all 0.2s ease;
  cursor: pointer;
}

.chip-hover:hover {
  transform: translateY(-2px);
}

.selected-chip {
  background-color: rgba(var(--v-theme-primary), 0.15);
  font-weight: bold;
}
</style>
