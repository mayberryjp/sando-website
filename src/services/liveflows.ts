import api from "./api";
import type { LiveFlowBatch, LiveFlowItem } from "@/types/liveflows";

export interface LiveFlowInitialParams {
  limit?: number;
}

export interface LiveFlowPollParams {
  seconds: number;
  limit?: number;
}

const POLL_PATH_CANDIDATES = [
  "/liveflows/since",
  "/liveflows/poll",
  "/liveflows/recent",
  "/liveflows",
];

let preferredPollPath: string | null = null;

const toArray = (value: unknown): LiveFlowItem[] => {
  if (!Array.isArray(value)) return [];
  return value as LiveFlowItem[];
};

const pickSinceFromFlows = (flows: LiveFlowItem[]): string | null => {
  const timestamps = flows
    .map((flow) => {
      const raw = (flow.last_seen as string) || (flow.max_last_seen as string);
      return raw ? new Date(raw).getTime() : NaN;
    })
    .filter((time) => Number.isFinite(time));

  if (!timestamps.length) return null;
  return new Date(Math.min(...timestamps)).toISOString();
};

const normalizeBatch = (payload: unknown): LiveFlowBatch => {
  if (Array.isArray(payload)) {
    const flows = toArray(payload);
    return {
      flows,
      since: pickSinceFromFlows(flows),
    };
  }

  if (!payload || typeof payload !== "object") {
    return { flows: [], since: null };
  }

  const dataRoot = payload as Record<string, unknown>;
  const nestedData =
    dataRoot.data && typeof dataRoot.data === "object" && !Array.isArray(dataRoot.data)
      ? (dataRoot.data as Record<string, unknown>)
      : null;

  const pickArray = (...values: unknown[]): LiveFlowItem[] => {
    for (const value of values) {
      if (Array.isArray(value)) {
        return value as LiveFlowItem[];
      }
    }
    return [];
  };

  const flows = pickArray(
    dataRoot.data,
    dataRoot.results,
    dataRoot.items,
    dataRoot.flows,
    nestedData?.results,
    nestedData?.items,
    nestedData?.flows
  );

  const sinceValue =
    (typeof dataRoot.next_since === "string" && dataRoot.next_since) ||
    (typeof nestedData?.next_since === "string" && nestedData.next_since) ||
    (typeof dataRoot.since === "string" && dataRoot.since) ||
    (typeof nestedData?.since === "string" && nestedData.since) ||
    pickSinceFromFlows(flows);

  return {
    flows,
    since: sinceValue || null,
  };
};

export const getLiveFlows = async (
  params: LiveFlowInitialParams = {}
): Promise<LiveFlowBatch> => {
  try {
    const response = await api.get("/liveflows", {
      params: {
        limit: params.limit,
      },
    });

    return normalizeBatch(response.data);
  } catch (error) {
    console.error("Error fetching initial live flows:", error);
    throw error;
  }
};

const tryPollPath = async (
  path: string,
  params: LiveFlowPollParams
): Promise<LiveFlowBatch> => {
  const response = await api.get(path, {
    params: {
      seconds: params.seconds,
      limit: params.limit,
    },
  });

  return normalizeBatch(response.data);
};

export const pollLiveFlows = async (
  params: LiveFlowPollParams
): Promise<LiveFlowBatch> => {
  const orderedPaths = preferredPollPath
    ? [preferredPollPath, ...POLL_PATH_CANDIDATES.filter((path) => path !== preferredPollPath)]
    : POLL_PATH_CANDIDATES;

  let lastError: unknown = null;

  for (const path of orderedPaths) {
    try {
      const batch = await tryPollPath(path, params);
      preferredPollPath = path;
      return batch;
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      lastError = error;

      if (status === 404) {
        continue;
      }

      throw error;
    }
  }

  console.error("Error polling live flows:", lastError);
  throw lastError;
};
