<template>
  <div class="alert-bars" :style="{ minWidth: `min(${containerMinWidth}px, 100%)` }">
    <div
      v-for="(count, index) in alertIntervals"
      :key="index"
      class="alert-bar"
      :class="getAlertClass(count)"
      :style="{
        maxWidth: `${width}px`,
        height: `${height}px`,
      }"
      :title="`${count} alerts`"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  alertIntervals: {
    type: Array as () => number[],
    default: () => [],
  },
  height: {
    type: Number,
    default: 16,
  },
  width: {
    type: Number,
    default: 5,
  },
});

// Reserve room for every bar at full width so they aren't squeezed thin (e.g. in
// the sidebar). Each bar = width + 2px gap + 2px margins.
const containerMinWidth = computed(
  () => props.alertIntervals.length * (props.width + 4)
);

const getAlertClass = (alertCount: number): string => {
  if (alertCount === 0) return "alert-none";
  if (alertCount <= 1) return "alert-low";
  if (alertCount <= 5) return "alert-medium";
  if (alertCount <= 20) return "alert-high";
  return "alert-critical";
};
</script>

<style scoped>
.alert-bars {
  display: flex;
  gap: 2px;
  max-width: 100%;
  /* min-width (set inline) reserves room so bars aren't squeezed thin */
}

.alert-bar {
  /* Share container width equally so all bars show (no scroll), capped at width */
  flex: 1 1 0;
  min-width: 0;
  margin: 1px;
  border-radius: 50rem;
  box-sizing: border-box;
  transition: transform 0.2s ease;
}

.alert-none {
  background-color: #00c853;
}

.alert-low {
  background-color: #f0b969;
}

.alert-medium {
  background-color: #f86b40;
}

.alert-high {
  background-color: #f43b63;
}

.alert-critical {
  background-color: #a2344c;
}

.alert-bar:hover {
  transform: scale(1.5);
}
</style>
