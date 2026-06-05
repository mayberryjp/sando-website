<template>
  <div>
    <StandardConfigurationSection
      :category="' Collaboration'"
      :settings="settings"
      :updating-configs="updatingConfigs"
      :standalone="standalone"
      @updateConfigurationValue="$emit('updateConfigurationValue', $event)"
    />

    <!-- Social links, shown below the config settings. -->
    <div class="social-links">
      <p class="social-links__intro">
        Help the project grow — follow along and join the community.
      </p>
      <div class="social-links__buttons">
        <v-btn
          v-for="social in socialLinks"
          :key="social.href"
          :href="social.href"
          target="_blank"
          rel="noopener noreferrer"
          :color="social.color"
          variant="flat"
          class="social-links__btn"
        >
          <v-icon start>{{ social.icon }}</v-icon>
          {{ social.title }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StandardConfigurationSection from './StandardConfigurationSection.vue';
import { socialLinks } from "@/constants/navigation";
import type { ConfigurationSetting } from "@/types/configurations";

interface Props {
  settings: ConfigurationSetting[];
  updatingConfigs?: Record<string, boolean>;
  standalone?: boolean;
}

defineProps<Props>();

defineEmits<{
  updateConfigurationValue: [setting: ConfigurationSetting];
}>();
</script>

<style scoped>
.social-links {
  margin-top: 24px;
  margin-bottom: 24px;
}

.social-links__intro {
  color: #b1b8c0;
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.social-links__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.social-links__btn {
  text-transform: none;
  font-weight: 600;
}
</style>
