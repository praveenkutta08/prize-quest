import type {
  FulfillmentMethod,
  FulfillmentOrder,
  FulfillmentStatus,
} from "@/features/fulfillment/model";

/**
 * Fulfillment fixtures — ~30 orders across every status and method, both
 * priorities, spread across properties. Rewards lifted from the catalog
 * vocabulary. Deterministic (index math) so the queue is stable across reloads.
 */

const REWARDS = [
  { id: "rw-airpods", name: "AirPods Pro (2nd gen)", type: "physical", method: "ship" as const },
  { id: "rw-yeti", name: "YETI Rambler 64oz", type: "physical", method: "pickup" as const },
  { id: "rw-beats", name: "Beats Studio Pro", type: "physical", method: "ship" as const },
  { id: "rw-galaxytab", name: "Galaxy Tab S9", type: "physical", method: "ship" as const },
  { id: "rw-steak", name: "Steakhouse Dinner for Two", type: "comp", method: "manual" as const },
  { id: "rw-amazon100", name: "$100 Amazon Gift Card", type: "digital", method: "auto" as const },
  { id: "rw-suite", name: "Weekend Suite Stay", type: "comp", method: "manual" as const },
  { id: "rw-applewatch", name: "Apple Watch SE", type: "physical", method: "ship" as const },
];

const PLAYERS = [
  { id: "pl-001", name: "Ava Reyes" },
  { id: "pl-004", name: "Mason Delgado" },
  { id: "pl-007", name: "Elena Beckett" },
  { id: "pl-010", name: "Theo Marchetti" },
  { id: "pl-013", name: "Nadia Bianchi" },
  { id: "pl-016", name: "Omar Haddad" },
  { id: "pl-019", name: "Ruby Larsson" },
  { id: "pl-022", name: "Diego Costa" },
];

const STATUSES: FulfillmentStatus[] = [
  "pending",
  "pending",
  "processing",
  "processing",
  "shipped",
  "shipped",
  "delivered",
  "delivered",
  "cancelled",
  "failed",
];

const PROPERTIES = ["cr-lv", "cr-reno", "cr-tahoe"];

function daysAgoIso(days: number, hours = 0): string {
  const NOW = Date.UTC(2026, 6, 23, 12, 0, 0);
  return new Date(NOW - days * 86_400_000 - hours * 3_600_000).toISOString();
}

function buildOrder(i: number): FulfillmentOrder {
  const reward = REWARDS[i % REWARDS.length];
  const player = PLAYERS[i % PLAYERS.length];
  const status = STATUSES[i % STATUSES.length];
  const method: FulfillmentMethod = reward.method;
  const createdDays = 1 + (i % 20);
  const shipped = status === "shipped" || status === "delivered";
  return {
    id: `fo-${String(i + 1).padStart(4, "0")}`,
    playerId: player.id,
    playerName: player.name,
    rewardId: reward.id,
    rewardName: reward.name,
    rewardType: reward.type,
    quantity: 1 + (i % 3 === 0 ? 1 : 0),
    status,
    method,
    address:
      method === "ship"
        ? `${100 + i} Main St, Las Vegas, NV 891${i % 10}${(i * 3) % 10}`
        : undefined,
    trackingNumber:
      shipped && method === "ship" ? `1Z${(i * 7777).toString().padStart(9, "0")}` : undefined,
    vendorId: reward.type === "physical" ? "v-brandpartners" : undefined,
    priority: i % 5 === 0 ? "high" : "normal",
    createdAt: daysAgoIso(createdDays, i % 12),
    updatedAt: daysAgoIso(status === "pending" ? createdDays : Math.max(0, createdDays - 1), i % 6),
    propertyId: PROPERTIES[i % PROPERTIES.length],
  };
}

export const FULFILLMENT_ORDERS: FulfillmentOrder[] = Array.from({ length: 30 }, (_, i) =>
  buildOrder(i),
);

export function seedFulfillment(): FulfillmentOrder[] {
  return FULFILLMENT_ORDERS.map((o) => structuredClone(o));
}
