export interface LiveFlowItem {
  flow_key?: string;
  src_ip?: string;
  src_name?: string | null;
  dst_ip?: string;
  dst_name?: string | null;
  src_port?: number | string;
  dst_port?: number | string;
  protocol?: number | string;
  src_packets?: number | string;
  src_bytes?: number | string;
  dst_packets?: number | string;
  dst_bytes?: number | string;
  src_dns?: string | null;
  dst_dns?: string | null;
  src_country?: string | null;
  dst_country?: string | null;
  src_isp?: string | null;
  dst_isp?: string | null;
  src_sandoname?: string | null;
  dst_sandoname?: string | null;
  packets?: number | string;
  bytes?: number | string;
  times_seen?: number | string;
  sum_packets?: number | string;
  sum_bytes?: number | string;
  sum_times_seen?: number | string;
  flow_start?: string;
  first_seen?: string;
  last_seen?: string;
  max_last_seen?: string;
  [key: string]: unknown;
}

export interface LiveFlowBatch {
  flows: LiveFlowItem[];
  since: string | null;
}
