import { z } from "zod";

/** Fulfillment domain contracts (app-local, Zod-first). Property-scoped. */

export const FulfillmentStatus = z.enum([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
]);
export type FulfillmentStatus = z.infer<typeof FulfillmentStatus>;

export const FulfillmentMethod = z.enum(["ship", "pickup", "auto", "manual"]);
export type FulfillmentMethod = z.infer<typeof FulfillmentMethod>;

export const FulfillmentOrder = z.object({
  id: z.string(),
  playerId: z.string(),
  playerName: z.string(),
  rewardId: z.string(),
  rewardName: z.string(),
  rewardType: z.string(),
  quantity: z.number().int(),
  status: FulfillmentStatus,
  method: FulfillmentMethod,
  address: z.string().optional(),
  trackingNumber: z.string().optional(),
  vendorId: z.string().optional(),
  priority: z.enum(["normal", "high"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  propertyId: z.string(),
});
export type FulfillmentOrder = z.infer<typeof FulfillmentOrder>;

export const BulkAction = z.enum(["mark-processing", "mark-shipped", "cancel"]);
export type BulkAction = z.infer<typeof BulkAction>;

export const FulfillmentCounts = z.object({
  all: z.number(),
  pending: z.number(),
  processing: z.number(),
  shipped: z.number(),
  shippedToday: z.number(),
  delivered: z.number(),
  cancelled: z.number(),
  failed: z.number(),
});
export type FulfillmentCounts = z.infer<typeof FulfillmentCounts>;

export const FulfillmentListResponse = z.object({
  rows: z.array(FulfillmentOrder),
  total: z.number(),
  counts: FulfillmentCounts,
});
export type FulfillmentListResponse = z.infer<typeof FulfillmentListResponse>;

export const BulkResult = z.object({ updated: z.number() });
export type BulkResult = z.infer<typeof BulkResult>;

/** The forward status order for the timeline. */
export const STATUS_FLOW: FulfillmentStatus[] = ["pending", "processing", "shipped", "delivered"];

/** Next status in the happy path, or null if terminal. */
export function nextStatus(status: FulfillmentStatus): FulfillmentStatus | null {
  const i = STATUS_FLOW.indexOf(status);
  if (i === -1 || i >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[i + 1];
}
