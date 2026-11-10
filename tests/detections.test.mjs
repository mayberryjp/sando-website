import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { compileScript, parse } from "@vue/compiler-sfc";
import * as vue from "vue";
import { createPinia, defineStore, setActivePinia } from "pinia";
import ts from "typescript";

const loadModule = (source, imports) => {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const exports = {};
  runInNewContext(outputText, {
    exports,
    require: (name) => {
      assert.ok(name in imports, `Unexpected import: ${name}`);
      return imports[name];
    },
    console,
  });
  return exports;
};

const readSource = (path) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

const alerts = Array.from({ length: 153 }, (_, index) => ({
  id: `detection-${String(index + 1).padStart(3, "0")}`,
  ip_address: "192.0.2.1",
  category: `Detection ${index + 1}`,
  flow: '["192.0.2.1","198.51.100.1",12345,443,6]',
  enrichment_1: "",
  enrichment_2: "",
  times_seen: 1,
  first_seen: new Date(
    Date.now() - (index < 151 ? Math.floor(index / 2) * 1000 : (index - 150) * 120 * 3600000)
  ).toISOString(),
  last_seen: new Date(Date.now() - (153 - index) * 1000).toISOString(),
  acknowledged: false,
  local_description: "",
}));

test("retrieves and stores the full ordered array without server-side slicing", async () => {
  const requests = [];
  const service = loadModule(readSource("../src/services/alerts.ts"), {
    "./api": {
      default: {
        async get(...args) {
          requests.push(args);
          return { data: alerts };
        },
      },
    },
    axios: {},
    "@/utils/port": {},
  });
  setActivePinia(createPinia());
  const { useHostsStore } = loadModule(readSource("../src/stores/hosts.ts"), {
    "@/services/alerts": service,
    "@/services/hosts": {},
    pinia: { defineStore },
    vue: { ...vue, onMounted() {} },
  });
  const hosts = useHostsStore();
  await hosts.fetchRecentAlerts();

  assert.equal(requests.length, 1);
  assert.equal(requests[0].length, 1);
  assert.equal(requests[0][0], "/alerts/recent");
  assert.equal(hosts.alertsRecent.length, 153);
  assert.deepEqual(hosts.alertsRecent.map(alert => alert.id), alerts.map(alert => alert.id));
});

test("time filters retain more than 100 detections for the table to paginate", () => {
  const { descriptor } = parse(
    readSource("../src/components/dashboard/RecentAlerts.vue")
  );
  const script = compileScript(descriptor, { id: "detections-test" });
  const component = loadModule(script.content, {
    vue,
    "@/services/alerts": {},
    "@/utils/date": {},
    "@/utils/protocol": {},
    "@/stores/notification": { useNotificationStore: () => ({}) },
  }).default;
  const state = component.setup(
    { alerts, showTimeFilter: true },
    { expose() {} }
  );

  assert.equal(state.itemsPerPage, 50);
  assert.equal(state.selectedTimeFilter.value, "48h");
  assert.equal(state.filteredAlerts.value.length, 151);
  assert.equal(state.filteredAlerts.value[100].id, "detection-101");
  assert.equal(state.filteredAlerts.value[150].id, "detection-151");

  state.selectedTimeFilter.value = "7d";
  assert.equal(state.filteredAlerts.value.length, 152);
  state.selectedTimeFilter.value = "14d";
  assert.equal(state.filteredAlerts.value.length, 153);
  state.selectedTimeFilter.value = "all";
  assert.equal(state.filteredAlerts.value, alerts);

  const unfiltered = component.setup(
    { alerts, showTimeFilter: false },
    { expose() {} }
  );
  assert.equal(unfiltered.filteredAlerts.value, alerts);
});
