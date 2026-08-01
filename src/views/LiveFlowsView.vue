<template>
  <div>
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
      <div class="d-flex align-center ga-3">
        <div class="text-h5 font-weight-bold">Live Flows</div>
        <v-chip size="small" variant="tonal" :color="isLive ? 'success' : 'warning'">
          {{ isLive ? "Live" : "Paused" }}
        </v-chip>
        <v-chip size="small" variant="outlined" color="primary">
          Poll {{ POLL_INTERVAL_MS / 1000 }}s
        </v-chip>
      </div>

      <div class="d-flex align-center ga-2 flex-wrap">
        <span class="text-caption text-medium-emphasis">
          Refreshing in {{ secondsUntilRefresh }}s
        </span>
        <v-btn
          size="small"
          :color="isLive ? 'warning' : 'success'"
          variant="tonal"
          @click="toggleLive"
        >
          {{ isLive ? "Pause" : "Resume" }}
        </v-btn>
        <v-btn
          size="small"
          variant="outlined"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="refreshNow"
        >
          Refresh
        </v-btn>
      </div>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" closable class="mb-4">
      {{ error }}
    </v-alert>

    <v-sheet rounded="lg" color="#090c10" class="pa-3 mb-4 d-flex flex-column flex-md-row ga-3 align-md-center">
      <v-text-field
        v-model="searchQuery"
        density="compact"
        variant="outlined"
        label="Filter live flows"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        class="search-field"
      />

      <v-chip size="small" color="primary" variant="tonal">
        {{ filteredFlows.length }} shown
      </v-chip>
      <v-chip size="small" variant="outlined">
        {{ aggregateCount }} aggregated
      </v-chip>
      <v-chip size="small" variant="outlined">
        Last poll: {{ lastPollLabel }}
      </v-chip>
    </v-sheet>

    <v-sheet rounded="lg" color="#0d1117 !important" class="liveflows-table-sheet">
      <v-data-table
        :headers="headers"
        :items="filteredFlows"
        :loading="loading"
        :no-data-text="loading ? 'Loading live flows...' : 'No live flows to show'"
        class="app-table"
        density="compact"
        mobile-breakpoint="md"
        :items-per-page="100"
      >
        <template #item.src_name="{ item }">
          <span class="name-ellipsis" :title="item.src_name || '-'">{{ item.src_name || "-" }}</span>
        </template>

        <template #item.dst_name="{ item }">
          <span class="name-ellipsis" :title="item.dst_name || '-'">{{ item.dst_name || "-" }}</span>
        </template>

        <template #item.protocol="{ item }">
          <span class="text-caption">{{ getProtocolName(item.protocol ?? "") }}</span>
        </template>

        <template #item.last_seen="{ item }">
          <span>{{ formatTimeOnly(item.last_seen || item.max_last_seen || "") }}</span>
        </template>

        <template #item.total_src_packets="{ item }">
          <span>{{ item.total_src_packets.toLocaleString() }}</span>
        </template>

        <template #item.total_src_bytes="{ item }">
          <span class="nowrap-cell">{{ formatBytes(item.total_src_bytes) }}</span>
        </template>

        <template #item.total_dst_packets="{ item }">
          <span>{{ item.total_dst_packets.toLocaleString() }}</span>
        </template>

        <template #item.total_dst_bytes="{ item }">
          <span class="nowrap-cell">{{ formatBytes(item.total_dst_bytes) }}</span>
        </template>

        <template #item.activity_events="{ item }">
          <v-chip
            size="small"
            :color="item.activity_events >= 10 ? 'red' : item.activity_events >= 4 ? 'amber-darken-2' : 'blue'"
            text-color="white"
            class="text-caption"
          >
            {{ item.activity_events }}
          </v-chip>
        </template>

      </v-data-table>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useNotificationStore } from "@/stores/notification";
import { getLiveFlows, pollLiveFlows } from "@/services/liveflows";
import type { LiveFlowItem } from "@/types/liveflows";
import { getProtocolName } from "@/utils/protocol";
import { formatDateTime } from "@/utils/date";
import { formatBytes } from "@/utils/filesize";

type AggregatedFlow = LiveFlowItem & {
  flow_key: string;
  activity_events: number;
  total_src_packets: number;
  total_src_bytes: number;
  total_dst_packets: number;
  total_dst_bytes: number;
  total_packets: number;
  total_bytes: number;
  total_times_seen: number;
  most_recent_unix_ms: number;
};

const INITIAL_LOAD_LIMIT = 200;
const POLL_LIMIT = 200;
const MAX_AGGREGATED_FLOWS = 5000;
const MAX_SEEN_FLOW_EVENTS = 40000;
const POLL_INTERVAL_MS = 5000;

const notificationStore = useNotificationStore();

const loading = ref(true);
const error = ref("");
const isLive = ref(true);
const searchQuery = ref("");
const lastPollAt = ref<Date | null>(null);
const secondsUntilRefresh = ref(POLL_INTERVAL_MS / 1000);

const aggregateMap = ref<Map<string, AggregatedFlow>>(new Map());
const seenFlowEvents = ref<Set<string>>(new Set());

let pollTimer: ReturnType<typeof setInterval> | null = null;
let countdownTimer: ReturnType<typeof setInterval> | null = null;

const headers = [
  { title: "Last Seen", key: "last_seen", sortable: true },
  { title: "Source IP", key: "src_ip", sortable: true },
  { title: "Source Name", key: "src_name", sortable: true },
  { title: "Destination IP", key: "dst_ip", sortable: true },
  { title: "Destination Name", key: "dst_name", sortable: true },
  { title: "Dest Port", key: "dst_port", sortable: true },
  { title: "Protocol", key: "protocol", sortable: true },
  { title: "Src Packets", key: "total_src_packets", sortable: true },
  { title: "Src Bytes", key: "total_src_bytes", sortable: true },
  { title: "Dst Packets", key: "total_dst_packets", sortable: true },
  { title: "Dst Bytes", key: "total_dst_bytes", sortable: true },
  { title: "Times Seen", key: "activity_events", sortable: true },
];

const aggregateCount = computed(() => aggregateMap.value.size);

const lastPollLabel = computed(() => {
  if (!lastPollAt.value) return "never";
  const h = String(lastPollAt.value.getHours()).padStart(2, "0");
  const m = String(lastPollAt.value.getMinutes()).padStart(2, "0");
  const s = String(lastPollAt.value.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
});

const sortedFlows = computed(() => {
  return [...aggregateMap.value.values()].sort((a, b) => {
    if (b.total_dst_packets !== a.total_dst_packets) return b.total_dst_packets - a.total_dst_packets;
    if (b.total_dst_bytes !== a.total_dst_bytes) return b.total_dst_bytes - a.total_dst_bytes;
    if (b.activity_events !== a.activity_events) return b.activity_events - a.activity_events;
    if (b.total_times_seen !== a.total_times_seen) return b.total_times_seen - a.total_times_seen;
    return b.most_recent_unix_ms - a.most_recent_unix_ms;
  });
});

const filteredFlows = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return sortedFlows.value;

  return sortedFlows.value.filter((flow) => {
    const parts = [
      flow.flow_key,
      flow.src_ip,
      flow.src_name,
      flow.dst_ip,
      flow.dst_name,
      flow.src_port,
      flow.dst_port,
      flow.protocol,
      flow.src_dns,
      flow.dst_dns,
      flow.src_country,
      flow.dst_country,
      flow.src_isp,
      flow.dst_isp,
      flow.src_sandoname,
      flow.dst_sandoname,
    ];

    const haystack = parts
      .map((value) => String(value ?? "").toLowerCase())
      .join(" ");

    return haystack.includes(query);
  });
});

const formatTimeOnly = (value: string): string => {
  const raw = String(value || "").trim();
  if (!raw) return "-";

  // Fast path for SQL datetime: YYYY-MM-DD HH:mm:ss
  if (raw.length >= 19 && raw[10] === " ") {
    return raw.slice(11, 19);
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    // Keep previous fallback behavior for unknown formats.
    return formatDateTime(raw);
  }

  return parsed.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getTimestamp = (flow: LiveFlowItem): number => {
  const value = (flow.last_seen as string) || (flow.max_last_seen as string) || "";
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const hasValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

const flowIdentity = (flow: LiveFlowItem): string => {
  const prebuilt = String(flow.flow_key ?? "").trim();
  if (prebuilt) return prebuilt;

  return [
    flow.src_ip ?? "",
    flow.src_port ?? "",
    flow.dst_ip ?? "",
    flow.dst_port ?? "",
    flow.protocol ?? "",
  ].join("|");
};

const flowEventIdentity = (flow: LiveFlowItem, key: string): string => {
  const ts = (flow.last_seen as string) || (flow.max_last_seen as string) || "";
  return `${key}|${ts}`;
};

const trimAggregateSize = () => {
  if (aggregateMap.value.size <= MAX_AGGREGATED_FLOWS) return;

  const keep = sortedFlows.value.slice(0, MAX_AGGREGATED_FLOWS);
  const nextMap = new Map<string, AggregatedFlow>();
  keep.forEach((flow) => nextMap.set(flow.flow_key, flow));
  aggregateMap.value = nextMap;
};

const trimSeenEventSet = () => {
  if (seenFlowEvents.value.size <= MAX_SEEN_FLOW_EVENTS) return;

  const next = new Set<string>();
  const keep = [...seenFlowEvents.value].slice(-MAX_SEEN_FLOW_EVENTS);
  keep.forEach((value) => next.add(value));
  seenFlowEvents.value = next;
};

const mergeFlows = (incoming: LiveFlowItem[]) => {
  if (!incoming.length) return;

  const map = new Map(aggregateMap.value);

  for (const flow of incoming) {
    const key = flowIdentity(flow);
    if (!key) continue;

    const eventId = flowEventIdentity(flow, key);
    if (eventId && seenFlowEvents.value.has(eventId)) {
      continue;
    }

    seenFlowEvents.value.add(eventId);

    const srcPacketsRaw = toNumber(flow.src_packets);
    const srcBytesRaw = toNumber(flow.src_bytes);
    const dstPacketsRaw = toNumber(flow.dst_packets);
    const dstBytesRaw = toNumber(flow.dst_bytes);
    const legacyPackets = toNumber(flow.sum_packets ?? flow.packets);
    const legacyBytes = toNumber(flow.sum_bytes ?? flow.bytes);

    const hasDirectionalPackets = hasValue(flow.src_packets) || hasValue(flow.dst_packets);
    const hasDirectionalBytes = hasValue(flow.src_bytes) || hasValue(flow.dst_bytes);

    const srcPackets = hasDirectionalPackets ? srcPacketsRaw : legacyPackets;
    const srcBytes = hasDirectionalBytes ? srcBytesRaw : legacyBytes;
    const dstPackets = hasDirectionalPackets ? dstPacketsRaw : 0;
    const dstBytes = hasDirectionalBytes ? dstBytesRaw : 0;
    const packets = srcPackets + dstPackets;
    const bytes = srcBytes + dstBytes;
    const timesSeen = toNumber(flow.sum_times_seen ?? flow.times_seen);
    const ts = getTimestamp(flow);

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...flow,
        flow_key: key,
        activity_events: 1,
        total_src_packets: srcPackets,
        total_src_bytes: srcBytes,
        total_dst_packets: dstPackets,
        total_dst_bytes: dstBytes,
        total_packets: packets,
        total_bytes: bytes,
        total_times_seen: timesSeen,
        most_recent_unix_ms: ts,
      });
      continue;
    }

    map.set(key, {
      ...existing,
      ...flow,
      flow_key: key,
      activity_events: existing.activity_events + 1,
      total_src_packets: existing.total_src_packets + srcPackets,
      total_src_bytes: existing.total_src_bytes + srcBytes,
      total_dst_packets: existing.total_dst_packets + dstPackets,
      total_dst_bytes: existing.total_dst_bytes + dstBytes,
      total_packets: existing.total_packets + packets,
      total_bytes: existing.total_bytes + bytes,
      total_times_seen: existing.total_times_seen + timesSeen,
      most_recent_unix_ms: Math.max(existing.most_recent_unix_ms, ts),
    });
  }

  aggregateMap.value = map;
  trimAggregateSize();
  trimSeenEventSet();
};

const fetchInitial = async () => {
  loading.value = true;
  error.value = "";

  try {
    const batch = await getLiveFlows({ limit: INITIAL_LOAD_LIMIT });
    mergeFlows(batch.flows || []);
    lastPollAt.value = new Date();
  } catch (e) {
    console.error("Failed to load initial live flows", e);
    error.value = "Failed to load live flows. Check if the backend is reachable.";
    notificationStore.showError("Failed to load live flows");
  } finally {
    loading.value = false;
  }
};

const pollOnce = async () => {
  if (!isLive.value) return;

  try {
    const batch = await pollLiveFlows({
      seconds: Math.max(1, Math.floor(POLL_INTERVAL_MS / 1000)),
      limit: POLL_LIMIT,
    });

    mergeFlows(batch.flows || []);
    lastPollAt.value = new Date();
    error.value = "";
  } catch (e) {
    console.error("Failed to poll live flows", e);
    if (!aggregateMap.value.size) {
      error.value = "Backend unavailable while polling live flows.";
    }
  }
};

const refreshNow = async () => {
  await pollOnce();
  secondsUntilRefresh.value = POLL_INTERVAL_MS / 1000;
};

const toggleLive = () => {
  isLive.value = !isLive.value;
};

const startTimers = () => {
  pollTimer = setInterval(() => {
    void pollOnce();
  }, POLL_INTERVAL_MS);

  countdownTimer = setInterval(() => {
    if (!isLive.value) return;

    if (secondsUntilRefresh.value <= 1) {
      secondsUntilRefresh.value = POLL_INTERVAL_MS / 1000;
      return;
    }

    secondsUntilRefresh.value -= 1;
  }, 1000);
};

const stopTimers = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

onMounted(async () => {
  await fetchInitial();
  secondsUntilRefresh.value = POLL_INTERVAL_MS / 1000;
  startTimers();
});

onUnmounted(() => {
  stopTimers();
});
</script>

<style scoped>
.liveflows-table-sheet {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-field {
  max-width: 100%;
}

.name-ellipsis {
  display: inline-block;
  max-width: 30ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.nowrap-cell {
  white-space: nowrap;
}

@media (min-width: 960px) {
  .search-field {
    max-width: 430px;
  }
}
</style>
