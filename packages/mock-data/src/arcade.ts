// @pq/mock-data — arcade-demo fixtures (kiosk-arcade host app, Session 26).
//
// The kiosk reference patron is James Morrison (Platinum). These fixtures are kept
// in their own module and surfaced for the `arcade-demo` tenant only (see api.ts),
// so the existing casino-royale-lv / station-casinos / demo-purple data is untouched.
//
// Category strings are LOWERCASE to match the arcade-demo tenant categoryMap keys
// (electronics / audio / outdoor / …) — the prize-tile resolves its per-category
// accent from `--pq-cat-{category}`, which applyTokens writes from that map.
import type { AddressData } from "@pq/contracts";
import type { Address, Campaign, Order, Player, Prize } from "./types";

/**
 * Arcade-demo patron (kiosk reference · id 7842, James Morrison, Platinum).
 * Richer than the store `Player` shape — the hub greeting reads `firstName`,
 * the header reads `name`/`tier`/`points`, the address step reads `address`.
 */
export const patron = {
  id: "7842",
  name: "James Morrison",
  firstName: "James",
  tier: "Platinum",
  tierLevel: 5,
  points: 142_580,
  address: {
    line1: "123 Casino Boulevard, Apt 1208",
    city: "Las Vegas",
    state: "NV",
    postalCode: "89109",
    country: "United States",
    phone: "(702) 555-0123",
  },
  email: "james.morrison@example.com",
  pin: "1234",
} as const;

/**
 * The patron's CMS shipping address as the editable-form `AddressData` (Session 30).
 * `<pq-address-form>` calls this for `initialAddress`; edits are written to the
 * `$shippingAddress` store atom and never mutate this fixture (so a fresh claim
 * always re-prefills from CMS). `name` seeds the expanded form's Recipient field.
 */
export function getPatronShippingAddress(): AddressData {
  return {
    name: patron.name,
    line1: patron.address.line1,
    city: patron.address.city,
    state: patron.address.state,
    postalCode: patron.address.postalCode,
    phone: patron.address.phone,
    email: patron.email,
  };
}

/** `$player`-shaped projection of the patron (drives the expanded screen header). */
export const arcadePlayer: Player = {
  id: patron.id,
  name: patron.name,
  tier: patron.tier,
  nextTier: "Diamond",
  pointsToNextTier: 7_420,
  points: patron.points,
};

/** Patron shipping address in the store `Address` shape (address-verified screen). */
export const arcadeAddress: Address = {
  name: patron.name,
  line1: "123 Casino Boulevard",
  line2: "Apt 1208",
  city: "Las Vegas",
  state: "NV",
  zip: "89109",
  phone: "(702) 555-0142",
  email: patron.email,
};

/** Prize catalog for the arcade campaigns. Categories are lowercase categoryMap keys. */
export const arcadePrizes: Prize[] = [
  {
    id: "airpods-pro",
    name: "Apple AirPods Pro",
    category: "electronics",
    value: 249,
    inStock: true,
    prizeType: "physical",
  },
  {
    id: "ipad-109",
    name: 'Apple iPad 10.9"',
    category: "electronics",
    value: 449,
    inStock: true,
    prizeType: "physical",
  },
  {
    id: "yeti-rambler-64",
    name: "YETI Rambler 64oz",
    category: "outdoor",
    value: 110,
    inStock: true,
    prizeType: "physical",
  },
  {
    id: "northface-backpack",
    name: "North Face Backpack",
    category: "outdoor",
    value: 99,
    inStock: true,
    prizeType: "physical",
  },
  {
    id: "amazon-100",
    name: "$100 Amazon Gift Card",
    category: "gift-cards",
    value: 100,
    inStock: true,
    prizeType: "digital",
  },
  {
    id: "vegas-trip",
    name: "Vegas Trip Package",
    category: "travel",
    value: 1500,
    inStock: true,
    prizeType: "physical",
  },
  {
    id: "topgolf-vip",
    name: "Topgolf VIP Day",
    category: "sports",
    value: 320,
    inStock: true,
    prizeType: "physical",
  },
  {
    id: "galaxy-tab-s9",
    name: "Samsung Galaxy Tab S9",
    category: "electronics",
    value: 800,
    inStock: true,
    prizeType: "physical",
  },
  {
    id: "sony-wh1000",
    name: "Sony WH-1000XM5",
    category: "audio",
    value: 400,
    inStock: true,
    prizeType: "physical",
  },
  {
    id: "echo-show-15",
    name: "Amazon Echo Show 15",
    category: "smart-home",
    value: 280,
    inStock: true,
    prizeType: "physical",
  },
];

/**
 * Three arcade campaigns matching the kiosk reference (stage 01):
 * Sunday Slot Sprint (ready/eligible · pink), VIP Game Day (in-progress · purple),
 * VIP Electronics (locked · blue). `locked` keeps the card non-interactive and
 * drives the detail screen's "Preview Your Rewards" locked variant.
 */
export const arcadeCampaigns: Campaign[] = [
  {
    id: "sunday-slot-sprint",
    name: "Sunday Slot Sprint",
    status: "eligible",
    progress: 500,
    goal: 500,
    pct: 100,
    meta: "Every Sunday in June 2026",
    expiresAt: "2026-06-30",
    prizeIds: ["airpods-pro", "ipad-109", "yeti-rambler-64", "northface-backpack"],
    prizePool: 907,
    frequency: "Weekly",
    description: "Wager 500 on Sundays · pick from premium electronics + gift cards",
    overview:
      "Wager 500 on Sundays to earn prizes from premium electronics and gift cards. The more you play, the more you can win!",
    steps: [
      "Play slots on Sundays",
      "Reach 500 in tracked wagers",
      "Pick your prize when you qualify",
    ],
    prizesNote: "Compete for 4 exciting prizes every Sunday.",
    category: "electronics",
  },
  {
    id: "vip-game-day",
    name: "VIP Game Day Quest",
    status: "in-progress",
    progress: 3200,
    goal: 5000,
    pct: 64,
    meta: "Through July 4, 2026",
    expiresAt: "2026-07-04",
    prizeIds: ["vegas-trip", "topgolf-vip", "amazon-100"],
    prizePool: 1920,
    frequency: "Monthly",
    description: "Earn 5,000 in slot play by July 4th · trip + gear bundle prizes",
    overview:
      "Earn 5,000 in slot play by July 4th to unlock the VIP bundle — a Vegas trip plus premium gear.",
    steps: [
      "Play any qualifying slots",
      "Reach 5,000 in tracked play by July 4",
      "Top qualifiers pick their prize",
    ],
    prizesNote: "3 VIP prizes including a Vegas trip package.",
    category: "travel",
  },
  {
    id: "vip-electronics",
    name: "VIP Electronics Quest",
    status: "locked",
    progress: 725,
    goal: 1000,
    pct: 73,
    meta: "Through July 31, 2026",
    expiresAt: "2026-07-31",
    prizeIds: ["galaxy-tab-s9", "sony-wh1000", "echo-show-15"],
    prizePool: 1480,
    frequency: "Seasonal",
    description: "Earn 1,000 in qualified table play · tablet bundle + audio",
    overview:
      "Earn 1,000 in qualified table play to unlock a premium electronics vault — tablets, audio and smart home.",
    steps: [
      "Play qualified table games",
      "Reach 1,000 in tracked play",
      "Unlock the electronics vault",
    ],
    prizesNote: "3 premium electronics prizes to choose from.",
    category: "electronics",
  },
  {
    id: "happy-hour-spins",
    name: "Happy Hour Spins",
    status: "eligible",
    progress: 300,
    goal: 300,
    pct: 100,
    meta: "Daily in June 2026",
    expiresAt: "2026-06-30",
    prizeIds: ["amazon-100", "yeti-rambler-64", "echo-show-15"],
    prizePool: 490,
    frequency: "Daily",
    description: "Wager 300 between 4–7pm · grab a gift card or outdoor gear",
    overview:
      "Wager 300 between 4 and 7pm any day to grab a same-day reward — gift cards, drinkware or smart home gear.",
    steps: ["Play between 4–7pm", "Reach 300 in tracked wagers", "Collect the same day"],
    prizesNote: "3 happy-hour prizes, refreshed daily.",
    category: "outdoor",
  },
  {
    id: "high-roller-bonus",
    name: "High Roller Bonus",
    status: "in-progress",
    progress: 1800,
    goal: 4000,
    pct: 45,
    meta: "Through Aug 2026",
    expiresAt: "2026-08-31",
    prizeIds: ["vegas-trip", "sony-wh1000", "topgolf-vip"],
    prizePool: 2220,
    frequency: "Monthly",
    description: "Reach 4,000 in table play · trip, audio + VIP experience prizes",
    overview:
      "Reach 4,000 in table play through August to compete for the high-roller tier — trips, audio and VIP experiences.",
    steps: [
      "Play table games through August",
      "Reach 4,000 in tracked play",
      "Prizes awarded to top qualifiers",
    ],
    prizesNote: "3 high-roller prizes for top qualifying players.",
    category: "wellness",
  },
];

/**
 * The patron's claim history. The first six match the kiosk reference (stage 10)
 * verbatim — ids PQ-26-7842-9F12 … -1A47 — and use only statuses the
 * order-history widget renders (delivered / shipped / in-transit). Six more
 * (page 2, ids …-3B72 … -7E10) back the order-history "Load 6 more" pagination
 * (Section 6.13, 12 total). `imageSeed` feeds `getOrderImageUrl` (picsum
 * placeholders) for surfaces that show photos.
 */
export const arcadeOrders: (Order & { imageSeed: string; category: string })[] = [
  {
    id: "PQ-26-7842-9F12",
    prizeName: "Beats Studio Pro",
    campaignName: "Sunday Slot Sprint",
    status: "delivered",
    claimedAt: "May 12, 2026",
    confirmation: "PQ-26-7842-9F12",
    value: 349,
    imageSeed: "beats-studio-pro",
    category: "electronics",
  },
  {
    id: "PQ-26-7842-A5C3",
    prizeName: "$50 DoorDash Gift",
    campaignName: "VIP Game Day Quest",
    status: "shipped",
    claimedAt: "May 28, 2026",
    confirmation: "PQ-26-7842-A5C3",
    tracking: "1Z999AA10123456784",
    carrier: "UPS Ground",
    value: 50,
    imageSeed: "doordash-gift",
    category: "gift-cards",
  },
  {
    id: "PQ-26-7842-B7D8",
    prizeName: "Apple AirTags 4-Pack",
    campaignName: "Sunday Slot Sprint",
    status: "in-transit",
    claimedAt: "Jun 2, 2026",
    confirmation: "PQ-26-7842-B7D8",
    value: 99,
    imageSeed: "airtags-4pack",
    category: "electronics",
  },
  {
    id: "PQ-26-7842-4E91",
    prizeName: "YETI Tumbler 30oz",
    campaignName: "Sunday Slot Sprint",
    status: "delivered",
    claimedAt: "Apr 18, 2026",
    confirmation: "PQ-26-7842-4E91",
    value: 45,
    imageSeed: "yeti-tumbler-30",
    category: "outdoor",
  },
  {
    id: "PQ-26-7842-2D88",
    prizeName: "$100 Amazon Gift",
    campaignName: "Sunday Slot Sprint",
    status: "delivered",
    claimedAt: "Mar 11, 2026",
    confirmation: "PQ-26-7842-2D88",
    value: 100,
    imageSeed: "amazon-100",
    category: "gift-cards",
  },
  {
    id: "PQ-26-7842-1A47",
    prizeName: "Ray-Ban Aviator",
    campaignName: "Sunday Slot Sprint",
    status: "delivered",
    claimedAt: "Feb 3, 2026",
    confirmation: "PQ-26-7842-1A47",
    value: 165,
    imageSeed: "rayban-aviators",
    category: "wellness",
  },
  {
    id: "PQ-26-7842-3B72",
    prizeName: "Sony WH-1000XM5",
    campaignName: "VIP Electronics Quest",
    status: "delivered",
    claimedAt: "Jan 22, 2026",
    confirmation: "PQ-26-7842-3B72",
    value: 400,
    imageSeed: "sony-wh1000",
    category: "electronics",
  },
  {
    id: "PQ-26-7842-6C44",
    prizeName: "Topgolf VIP Day",
    campaignName: "VIP Game Day Quest",
    status: "delivered",
    claimedAt: "Jan 9, 2026",
    confirmation: "PQ-26-7842-6C44",
    value: 320,
    imageSeed: "topgolf-vip",
    category: "sports",
  },
  {
    id: "PQ-26-7842-8AD1",
    prizeName: "$25 Starbucks Gift",
    campaignName: "Sunday Slot Sprint",
    status: "shipped",
    claimedAt: "Dec 28, 2025",
    confirmation: "PQ-26-7842-8AD1",
    tracking: "1Z999AA10987654321",
    carrier: "UPS Ground",
    value: 25,
    imageSeed: "starbucks-gift",
    category: "gift-cards",
  },
  {
    id: "PQ-26-7842-D90F",
    prizeName: "Hydro Flask 32oz",
    campaignName: "Sunday Slot Sprint",
    status: "delivered",
    claimedAt: "Dec 14, 2025",
    confirmation: "PQ-26-7842-D90F",
    value: 45,
    imageSeed: "hydro-flask-32",
    category: "outdoor",
  },
  {
    id: "PQ-26-7842-5E23",
    prizeName: "Apple AirPods Pro",
    campaignName: "VIP Electronics Quest",
    status: "delivered",
    claimedAt: "Nov 30, 2025",
    confirmation: "PQ-26-7842-5E23",
    value: 249,
    imageSeed: "airpods-pro",
    category: "electronics",
  },
  {
    id: "PQ-26-7842-7E10",
    prizeName: "Echo Show 15",
    campaignName: "VIP Electronics Quest",
    status: "delivered",
    claimedAt: "Nov 16, 2025",
    confirmation: "PQ-26-7842-7E10",
    value: 280,
    imageSeed: "echo-show-15",
    category: "smart-home",
  },
];

/** Count of arcade campaigns ready to claim (hub "X Reward Ready" badge). */
export function getClaimableCount(): number {
  return arcadeCampaigns.filter((c) => c.status === "eligible").length;
}

/** Picsum placeholder image URL for an order/prize (matches the HTML reference). */
export function getOrderImageUrl(order: { imageSeed: string }): string {
  return `https://picsum.photos/seed/${order.imageSeed}/400/300`;
}

/** Derived order-history stats (delivered / in-transit / total value / favorite). */
export function getOrderStats() {
  const delivered = arcadeOrders.filter((o) => o.status === "delivered").length;
  const inTransit = arcadeOrders.filter(
    (o) => o.status === "in-transit" || o.status === "shipped",
  ).length;
  const totalValue = arcadeOrders.reduce((sum, o) => sum + (o.value ?? 0), 0);

  const byCategory: Record<string, number> = {};
  arcadeOrders.forEach((o) => {
    byCategory[o.category] = (byCategory[o.category] ?? 0) + 1;
  });
  const favorite = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  return {
    delivered,
    inTransit,
    totalValue,
    favoriteCategory: favorite?.[0] ?? null,
    favoriteCount: favorite?.[1] ?? 0,
    totalOrders: arcadeOrders.length,
  };
}

/** The arcade-mode tenants that share the arcade campaign/order/prize catalog:
 *  arcade-demo (kiosk) and station-arcade (the TTD arcade tenant), plus the four
 *  Session-34 operator-flavored arcade demo tenants (style-only re-skins — same
 *  campaign/order/prize catalog, different palette + fonts via tenant tokens). */
const ARCADE_TENANTS = new Set([
  "arcade-demo",
  "station-arcade",
  // Tier Rewards — the production default tenant. Shares the arcade catalog so its
  // campaigns carry description / category / frequency (the fields the card's fact rail
  // reads now that the progress block is gone).
  "tier-rewards",
  "resort-style",
  "velvet-style",
  "aria-style",
  "emerald-style",
]);

/** True when `tenantId` is an arcade-mode tenant (kiosk arcade-demo or TTD station-arcade). */
export function isArcadeTenant(tenantId: string): boolean {
  return ARCADE_TENANTS.has(tenantId);
}
