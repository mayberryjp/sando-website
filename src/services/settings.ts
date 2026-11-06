import api from "./api";

export interface LocalNetworkOption {
  cidr: string;
  firewall_interface_name?: string;
  ip_version?: string;
}

export const getLocalNetworks = async (): Promise<LocalNetworkOption[]> => {
  try {
    const { data } = await getConfigurations();
    const setting: unknown = Array.isArray(data)
      ? data.find((item: unknown) =>
          typeof item === "object" && item !== null &&
          "key" in item && item.key === "LocalNetworks"
        )
      : undefined;
    let value: unknown = Array.isArray(data)
      ? setting && typeof setting === "object" && "value" in setting
        ? setting.value
        : []
      : data?.LocalNetworks ?? [];
    if (typeof value === "string") {
      value = JSON.parse(value);
    }
    if (!Array.isArray(value)) {
      throw new Error("LocalNetworks must be an array.");
    }
    return value.map((network: unknown) => {
      if (
        typeof network !== "object" || network === null ||
        !("cidr" in network) || typeof network.cidr !== "string"
      ) {
        throw new Error("Invalid local network configuration.");
      }
      return {
        cidr: network.cidr.trim(),
        firewall_interface_name:
          "firewall_interface_name" in network &&
          typeof network.firewall_interface_name === "string"
            ? network.firewall_interface_name.trim() : undefined,
        ip_version:
          "ip_version" in network && typeof network.ip_version === "string"
            ? network.ip_version : undefined,
      };
    });
  } catch (error) {
    console.error("Error fetching local networks:", error);
    throw error;
  }
};

export const getConfigurations = async () => {
  try {
    const response = await api.get("/configurations");
    return response;
  } catch (error) {
    console.error("Error fetching configuration:", error);
    throw error;
  }
};

export const updateConfiguration = async (config: Record<string, any>) => {
  try {
    const response = await api.post("/configurations", config);
    return response.data;
  } catch (error) {
    console.error("Error updating configuration:", error);
    throw error;
  }
};
