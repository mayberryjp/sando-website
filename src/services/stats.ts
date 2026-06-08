import api from "./api";

export interface TrafficStat {
  timestamp: string;
  total_packets: number;
  total_bytes: number;
  alerts: number;
}

export const getQuickStats = async () => {
  try {
    const response = await api.get("/quickstats");
    console.log("Quick stats fetched successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Error fetching quick stats:", error);
    throw error;
  }
};

export const getTrafficStats = async () => {
  try {
    const response = await api.get<TrafficStat[]>("/trafficstats");
    return response;
  } catch (error) {
    console.error("Error fetching traffic stats:", error);
    throw error;
  }
};
