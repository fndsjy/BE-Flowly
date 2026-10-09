import { isDefiniteNoSendFailure } from "./notification-delivery.js";
export type DeliveryState = "PENDING" | "SENT" | "FAILED" | "UNCERTAIN";
export const deliveryState = (rows: Array<{status: string; attempts: number; lastError: string | null}>): DeliveryState => {
  if (rows.some(row => row.status === "SENT")) return "SENT";
  // A durable reservation is normal while HTTP is in flight. It prevents replay,
  // but is not evidence of a failed send. Only an actual ambiguous failure is uncertain.
  if (rows.some(row => row.status === "FAILED" ? !isDefiniteNoSendFailure(row.lastError)
    : row.lastError?.startsWith("DELIVERY_UNCERTAIN:") || !["PENDING", "PROCESSING", "SKIPPED"].includes(row.status))) return "UNCERTAIN";
  if (!rows.length || rows.some(row => row.status === "PENDING" || row.status === "PROCESSING")) return "PENDING";
  return "FAILED";
};
