export interface ExploreFlow {
  src_ip: string;
  dst_ip: string;
  src_ip_int: number;
  dst_ip_int: number;
  dst_port: number;
  protocol: string;
  tags: string;
  src_dns: string;
  dst_dns: string;
  src_country: string;
  dst_country: string;
  src_asn: string | number | null;
  dst_asn: string | number | null;
  src_isp: string | null;
  dst_isp: string | null;
  src_sandoname: string | null;
  dst_sandoname: string | null;
  sum_packets: number;
  sum_bytes: number;
  sum_times_seen: number;
  max_last_seen: string;
  row_count: number;
}

export interface ExploreResponseData {
  limit: number;
  total: number;
  page: number;
  success: boolean;
  results: ExploreFlow[];
}

export interface ExploreResponse {
  success: boolean;
  data: ExploreResponseData;
}
