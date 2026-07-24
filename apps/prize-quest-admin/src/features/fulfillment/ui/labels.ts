import type { StatusTone } from "@/shared/ui";
import type { FulfillmentMethod, FulfillmentStatus } from "../model";

export const STATUS_LABEL: Record<FulfillmentStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
};

export const METHOD_LABEL: Record<FulfillmentMethod, string> = {
  ship: "Ship",
  pickup: "Pickup",
  auto: "Auto",
  manual: "Manual",
};

export function statusTone(status: FulfillmentStatus): StatusTone {
  switch (status) {
    case "pending":
      return "draft";
    case "processing":
      return "scheduled";
    case "shipped":
      return "active";
    case "delivered":
      return "active";
    case "cancelled":
      return "ended";
    case "failed":
      return "danger";
    default:
      return "draft";
  }
}
