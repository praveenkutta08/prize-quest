import type { Notification, Order } from "./types";

/** Mock order history (screen — order/history). casino-royale-lv naming. */
export const orders: Order[] = [
  {
    id: "order-1",
    prizeName: "Apple AirPods Pro",
    campaignName: "Sunday Slot Sprint",
    status: "in-transit",
    claimedAt: "Jun 1, 2026",
    confirmation: "PQ-96521571",
    tracking: "1Z999AA10123456784",
    carrier: "UPS Ground",
    value: 249,
  },
  {
    id: "order-2",
    prizeName: "YETI Rambler 64oz",
    campaignName: "Weekend Warrior Bonus",
    status: "processing",
    claimedAt: "Jun 4, 2026",
    confirmation: "PQ-44120098",
    value: 80,
  },
  {
    id: "order-3",
    prizeName: "Amazon Gift Card",
    campaignName: "Memorial Day Madness",
    status: "delivered",
    claimedAt: "May 20, 2026",
    confirmation: "PQ-31882204",
    value: 100,
  },
];

/** Mock notifications. */
export const notifications: Notification[] = [
  {
    id: "ntf-1",
    type: "shipping",
    title: "Your AirPods Pro shipped",
    body: "UPS · arriving June 7 · tracking 1Z999AA10123456784",
    time: "2m",
    read: false,
    ctaLabel: "Track shipment",
  },
  {
    id: "ntf-2",
    type: "time",
    title: "Birthday Bonus expires soon",
    body: "Claim before 11:59 PM tonight · 1 prize ready",
    time: "1h",
    read: false,
    ctaLabel: "Claim now",
  },
  {
    id: "ntf-3",
    type: "campaign",
    title: "New Gold-tier campaign",
    body: "Summer Bash 2026 just launched · wager 500 for a premium prize",
    time: "3h",
    read: true,
    ctaLabel: "View campaign",
  },
];

/** Per-tenant order/notification name overrides (demo-purple gets neon naming). */
const tenantOrderCampaigns: Record<string, Record<string, string>> = {
  "demo-purple": {
    "Sunday Slot Sprint": "Neon Jackpot Rush",
    "Weekend Warrior Bonus": "Midnight Multiplier",
    "Memorial Day Madness": "Afterglow Bonus",
  },
};

export function ordersForTenant(tenantId: string): Order[] {
  const map = tenantOrderCampaigns[tenantId];
  return orders.map((o) =>
    map && map[o.campaignName] ? { ...o, campaignName: map[o.campaignName] } : { ...o },
  );
}
