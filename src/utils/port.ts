export type RulePort = number | "*";

export const normalizeRulePort = (
  value: unknown,
  field = "Destination port"
): RulePort => {
  if (value === "*") return "*";

  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && !/^[0-9]+$/.test(value))
  ) {
    throw new Error(`${field} must be an integer from 0 to 65535 or an explicitly selected "*".`);
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`${field} must be an integer from 0 to 65535.`);
  }

  return port;
};
