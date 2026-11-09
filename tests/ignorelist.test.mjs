import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { isAxiosError } from "axios";

const loadModule = (path, imports = {}) => {
  const { outputText } = ts.transpileModule(
    readFileSync(new URL(path, import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } }
  );
  const exports = {};
  runInNewContext(outputText, {
    exports,
    require: (name) => {
      assert.ok(name in imports, `Unexpected import: ${name}`);
      return imports[name];
    },
    console: { error() {} },
  });
  return exports;
};

const ports = loadModule("../src/utils/port.ts");
const invalidPorts = [
  undefined, null, "", " ", "\t", -1, 65536, 1.5, true, false,
  "1.0", "1.5", "invalid", "0x10", "1e2", [], {}, NaN, Infinity,
];

test("normalizes literal zero, decimal integers, and explicit wildcard", () => {
  for (const [input, expected] of [
    [0, 0], ["0", 0], [443, 443], ["443", 443],
    [65535, 65535], ["65535", 65535], ["*", "*"],
  ]) {
    assert.equal(ports.normalizeRulePort(input), expected);
  }
});

test("rejects missing and invalid ports without coercing them to zero", () => {
  for (const input of invalidPorts) {
    assert.throws(() => ports.normalizeRulePort(input), /must be an integer/);
  }
});

const createService = (post) => loadModule("../src/services/alerts.ts", {
  "./api": { default: { post } },
  axios: { isAxiosError },
  "@/utils/port": ports,
});

const payload = {
  ignorelist_id: "IgnoreList_10.4.60.13_10.4.20.17_1_0_NewOutboundDetection_Flow",
  src_ip: "10.4.60.13",
  dst_ip: "10.4.20.17",
  dst_port: 0,
  protocol: 1,
};

test("submits numeric zero for every protocol, preserving IDs and optional source zero", async () => {
  const requests = [];
  const service = createService(async (url, body) => {
    requests.push({ url, body: JSON.parse(JSON.stringify(body)) });
    return { data: { message: "IgnoreList entry added successfully" } };
  });
  for (const protocol of [1, 58, 6, 17]) {
    for (const dst_port of [0, "0", 443, "443", 65535, "*"]) {
      const input = { ...payload, dst_port, protocol, src_port: 0 };
      await service.addToWhitelist(input);
      assert.deepEqual(requests.at(-1), {
        url: "/ignorelist",
        body: { ...input, dst_port: dst_port === "*" ? "*" : Number(dst_port) },
      });
    }
  }
  await service.addToWhitelist(payload);
  assert.equal("src_port" in requests.at(-1).body, false);
});

test("invalid destination and included source ports never send requests", async () => {
  let requests = 0;
  const service = createService(async () => { requests++; });
  for (const dst_port of invalidPorts) {
    await assert.rejects(service.addToWhitelist({ ...payload, dst_port }), /must be an integer/);
  }
  for (const src_port of invalidPorts.filter(value => value !== undefined)) {
    await assert.rejects(service.addToWhitelist({ ...payload, src_port }), /must be an integer/);
  }
  assert.equal(requests, 0);
});

test("surfaces the backend error and leaves caller input unchanged", async () => {
  const service = createService(async () => {
    throw {
      isAxiosError: true,
      response: { status: 400, data: { error: "Destination port is invalid" } },
    };
  });
  const input = { ...payload, dst_port: "0" };
  await assert.rejects(service.addToWhitelist(input), /Destination port is invalid/);
  assert.equal(input.dst_port, "0");
});
