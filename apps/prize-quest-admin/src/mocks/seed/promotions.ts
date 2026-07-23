import type {
  CampaignDefinition,
  ConditionGroup,
  EarnRule,
  PrizeCatalogItem,
} from "@/features/promotions/model";

/**
 * Promotions fixtures. Names/values lifted from `admin-app.html` (Screens 03/04/05).
 * Campaigns spread across statuses and properties so status tabs and property
 * scoping visibly change the list. The DB clones these on boot so create/edit/
 * pause persist for the session without mutating the seed.
 */

// ── Prize catalog (12) ────────────────────────────────────────────────────────

export const PRIZES: PrizeCatalogItem[] = [
  {
    id: "pz-airpods",
    name: "AirPods Pro",
    category: "Electronics",
    value: 249,
    prizeType: "physical",
    inStock: true,
    vendorSku: "APL-APP-2",
    rarity: "premium",
  },
  {
    id: "pz-yeti",
    name: "YETI Rambler 64oz",
    category: "Merch",
    value: 80,
    prizeType: "physical",
    inStock: true,
    vendorSku: "YET-64-BLK",
  },
  {
    id: "pz-amazon100",
    name: "$100 Amazon Gift Card",
    category: "Gift card",
    value: 100,
    prizeType: "digital",
    inStock: true,
  },
  {
    id: "pz-beats",
    name: "Beats Studio Pro",
    category: "Electronics",
    value: 349,
    prizeType: "physical",
    inStock: true,
    vendorSku: "BTS-STD-PRO",
    rarity: "premium",
  },
  {
    id: "pz-galaxytab",
    name: "Galaxy Tab S9",
    category: "Electronics",
    value: 299,
    prizeType: "physical",
    inStock: true,
    vendorSku: "SAM-TAB-S9",
  },
  {
    id: "pz-switch",
    name: "Nintendo Switch OLED",
    category: "Electronics",
    value: 349,
    prizeType: "physical",
    inStock: false,
    vendorSku: "NTD-SW-OLED",
    rarity: "premium",
  },
  {
    id: "pz-dining50",
    name: "$50 Dining Credit",
    category: "Dining",
    value: 50,
    prizeType: "digital",
    inStock: true,
  },
  {
    id: "pz-rayban",
    name: "Ray-Ban Wayfarer",
    category: "Apparel",
    value: 180,
    prizeType: "physical",
    inStock: true,
    vendorSku: "RB-WAY-CLS",
  },
  {
    id: "pz-bose",
    name: "Bose QuietComfort Ultra",
    category: "Electronics",
    value: 299,
    prizeType: "physical",
    inStock: true,
    vendorSku: "BOSE-QC-U",
    rarity: "premium",
  },
  {
    id: "pz-freeplay250",
    name: "$250 Free Play",
    category: "Free play",
    value: 250,
    prizeType: "digital",
    inStock: true,
  },
  {
    id: "pz-weekend",
    name: "Weekend Suite Stay",
    category: "Hospitality",
    value: 620,
    prizeType: "physical",
    inStock: true,
    rarity: "elite",
  },
  {
    id: "pz-applewatch",
    name: "Apple Watch SE",
    category: "Electronics",
    value: 249,
    prizeType: "physical",
    inStock: true,
    vendorSku: "APL-AW-SE",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function elig(conditions: ConditionGroup["conditions"]): ConditionGroup {
  return { conjunction: "AND", conditions };
}

const slotWager = (threshold: number, timeWindow?: string): EarnRule => ({
  activity: "slot-wager",
  threshold,
  currency: "USD",
  countsToward: "coin-in",
  timeWindow,
});

// ── Campaigns (11) ────────────────────────────────────────────────────────────

export const CAMPAIGNS: CampaignDefinition[] = [
  {
    id: "cmp-summer-bash",
    name: "Summer Bash 2026",
    type: "goal-based",
    status: "active",
    description:
      "Wager $500 on slots between June 1 – August 31 to choose your prize from premium electronics, gift cards, and exclusive merch.",
    ownerId: "u-james-chen",
    audienceLabel: "Gold+ · 25–55",
    schedule: { start: "2026-06-01", end: "2026-08-31", recurrence: "one-shot" },
    eligibility: elig([
      { field: "player.tier", operator: "in", value: ["Gold", "Platinum", "Diamond"] },
      { field: "player.age", operator: "between", value: [25, 55] },
    ]),
    earnRule: slotWager(500, "Campaign window"),
    prizeIds: [
      "pz-airpods",
      "pz-yeti",
      "pz-amazon100",
      "pz-beats",
      "pz-galaxytab",
      "pz-bose",
      "pz-applewatch",
      "pz-freeplay250",
    ],
    propertyIds: ["cr-lv"],
    compliance: {
      budgetCap: 60000,
      budgetUsed: 38400,
      approverId: "u-maya-rodriguez",
      filingRef: "NV-CR-2026-Q3-PQ-101",
      jurisdiction: "NV",
    },
    metrics: {
      reach: 12400,
      offers: 8,
      engagementRate: 0.342,
      funnel: { eligible: 12400, started: 5100, completed: 2210, claimed: 1680 },
    },
  },
  {
    id: "cmp-march-madness",
    name: "March Madness",
    type: "milestone",
    status: "active",
    description:
      "Property-wide bracket challenge — earn milestones across the tournament for escalating rewards.",
    ownerId: "u-james-chen",
    audienceLabel: "All players",
    schedule: { start: "2026-03-01", end: "2026-03-31", recurrence: "weekly-reset" },
    eligibility: elig([{ field: "player.age", operator: "gte", value: 21 }]),
    earnRule: slotWager(250),
    prizeIds: ["pz-amazon100", "pz-dining50", "pz-freeplay250", "pz-galaxytab", "pz-switch"],
    propertyIds: ["cr-lv", "cr-reno", "cr-tahoe"],
    compliance: {
      budgetCap: 90000,
      budgetUsed: 51200,
      approverId: "u-maya-rodriguez",
      filingRef: "NV-CR-2026-Q1-PQ-072",
      jurisdiction: "NV",
    },
    metrics: {
      reach: 28600,
      offers: 5,
      engagementRate: 0.418,
      funnel: { eligible: 28600, started: 14100, completed: 6900, claimed: 5210 },
    },
  },
  {
    id: "cmp-vip-week",
    name: "VIP Appreciation Week",
    type: "goal-based",
    status: "scheduled",
    description:
      "A high-value reward sweep for our Platinum and Diamond members — invitation only.",
    ownerId: "u-maya-rodriguez",
    audienceLabel: "Platinum + Diamond",
    schedule: { start: "2026-06-15", end: "2026-06-21", recurrence: "one-shot" },
    eligibility: elig([
      { field: "player.tier", operator: "in", value: ["Platinum", "Diamond"] },
      { field: "player.segment", operator: "in", value: ["vip"] },
    ]),
    earnRule: slotWager(1000),
    prizeIds: ["pz-weekend", "pz-bose", "pz-applewatch", "pz-switch"],
    propertyIds: ["cr-lv", "cr-tahoe"],
    compliance: {
      budgetCap: 120000,
      budgetUsed: 0,
      approverId: "u-maya-rodriguez",
      filingRef: "NV-CR-2026-Q2-PQ-090",
      jurisdiction: "NV",
    },
    metrics: {
      reach: 1200,
      offers: 4,
      engagementRate: 0,
      funnel: { eligible: 1200, started: 0, completed: 0, claimed: 0 },
    },
  },
  {
    id: "cmp-sunday-slot-sprint",
    name: "Sunday Slot Sprint",
    type: "goal-based",
    status: "active",
    description:
      "Wager $500 on Sundays to unlock a prize of your choice. Valid on any slot machine across all three properties.",
    ownerId: "u-james-chen",
    audienceLabel: "Gold+ · all slot players",
    schedule: { start: "2026-06-01", end: "2026-06-30", recurrence: "weekly-reset" },
    eligibility: elig([
      { field: "player.tier", operator: "in", value: ["Gold", "Platinum", "Diamond"] },
      { field: "player.age", operator: "gte", value: 21 },
      { field: "player.property", operator: "in", value: ["cr-lv", "cr-reno", "cr-tahoe"] },
    ]),
    earnRule: slotWager(500, "12:00 AM – 11:59 PM Sunday (property time)"),
    prizeIds: ["pz-airpods", "pz-yeti", "pz-amazon100", "pz-beats"],
    propertyIds: ["cr-lv", "cr-reno", "cr-tahoe"],
    compliance: {
      budgetCap: 35000,
      budgetUsed: 22400,
      approverId: "u-maya-rodriguez",
      filingRef: "NV-CR-2026-Q2-PQ-088",
      jurisdiction: "NV",
    },
    metrics: {
      reach: 12407,
      offers: 4,
      engagementRate: 0.319,
      funnel: { eligible: 12407, started: 3840, completed: 1240, claimed: 892 },
    },
  },
  {
    id: "cmp-new-member-blitz",
    name: "New Member Blitz",
    type: "repeating-multi-tier",
    status: "active",
    description:
      "A welcome path for the first 30 days — escalating bonuses as new members explore the floor.",
    ownerId: "u-james-chen",
    audienceLabel: "New players (0–30 days)",
    schedule: { start: "2026-02-15", end: "2026-03-31", recurrence: "daily-reset" },
    eligibility: elig([
      { field: "player.segment", operator: "in", value: ["new"] },
      { field: "player.lastVisitDays", operator: "lte", value: 30 },
    ]),
    earnRule: slotWager(100),
    prizeIds: ["pz-dining50", "pz-freeplay250", "pz-amazon100"],
    propertyIds: ["cr-lv"],
    compliance: {
      budgetCap: 25000,
      budgetUsed: 14600,
      approverId: "u-maya-rodriguez",
      filingRef: "NV-CR-2026-Q1-PQ-066",
      jurisdiction: "NV",
    },
    metrics: {
      reach: 4200,
      offers: 3,
      engagementRate: 0.583,
      funnel: { eligible: 4200, started: 2960, completed: 1720, claimed: 1310 },
    },
  },
  {
    id: "cmp-weekend-warriors",
    name: "Weekend Warriors",
    type: "goal-based",
    status: "ended",
    description: "Friday–Sunday activity bonus for our most consistent weekend players.",
    ownerId: "u-james-chen",
    audienceLabel: "Silver+ · weekend players",
    schedule: { start: "2026-02-01", end: "2026-02-28", recurrence: "weekly-reset" },
    eligibility: elig([
      { field: "player.tier", operator: "in", value: ["Silver", "Gold", "Platinum"] },
      { field: "player.segment", operator: "in", value: ["slots", "tables"] },
    ]),
    earnRule: slotWager(300, "Fri–Sun"),
    prizeIds: ["pz-yeti", "pz-rayban", "pz-dining50"],
    propertyIds: ["cr-reno"],
    compliance: {
      budgetCap: 30000,
      budgetUsed: 28900,
      approverId: "u-maya-rodriguez",
      filingRef: "NV-CR-2026-Q1-PQ-051",
      jurisdiction: "NV",
    },
    metrics: {
      reach: 9800,
      offers: 5,
      engagementRate: 0.285,
      funnel: { eligible: 9800, started: 4100, completed: 2790, claimed: 2450 },
    },
  },
  {
    id: "cmp-high-roller",
    name: "High Roller Invitational",
    type: "goal-based",
    status: "draft",
    description:
      "Exclusive, invite-only sweep for the top 1% of spenders — the ultimate reward slate.",
    ownerId: "u-maya-rodriguez",
    audienceLabel: "Diamond · top 1% spenders",
    schedule: { start: "2026-04-15", end: "2026-05-15", recurrence: "one-shot" },
    eligibility: elig([
      { field: "player.tier", operator: "in", value: ["Diamond"] },
      { field: "player.segment", operator: "in", value: ["vip"] },
    ]),
    earnRule: slotWager(2500),
    prizeIds: ["pz-weekend", "pz-switch"],
    propertyIds: ["cr-lv"],
    compliance: { budgetCap: 150000, budgetUsed: 0, jurisdiction: "NV" },
    metrics: {
      reach: 300,
      offers: 2,
      engagementRate: 0,
      funnel: { eligible: 300, started: 0, completed: 0, claimed: 0 },
    },
  },
  {
    id: "cmp-easter",
    name: "Easter Extravaganza",
    type: "milestone",
    status: "scheduled",
    description:
      "A spring multi-channel promo with milestone rewards throughout the holiday weekend.",
    ownerId: "u-james-chen",
    audienceLabel: "Active 30+ · 18–65",
    schedule: { start: "2026-04-01", end: "2026-04-20", recurrence: "daily-reset" },
    eligibility: elig([
      { field: "player.age", operator: "between", value: [18, 65] },
      { field: "player.lastVisitDays", operator: "lte", value: 30 },
    ]),
    earnRule: slotWager(200),
    prizeIds: ["pz-amazon100", "pz-dining50", "pz-rayban", "pz-galaxytab"],
    propertyIds: ["cr-lv", "cr-reno", "cr-tahoe"],
    compliance: {
      budgetCap: 70000,
      budgetUsed: 0,
      approverId: "u-maya-rodriguez",
      filingRef: "NV-CR-2026-Q2-PQ-084",
      jurisdiction: "NV",
    },
    metrics: {
      reach: 18900,
      offers: 6,
      engagementRate: 0,
      funnel: { eligible: 18900, started: 0, completed: 0, claimed: 0 },
    },
  },
  {
    id: "cmp-comeback-kings",
    name: "Comeback Kings",
    type: "goal-based",
    status: "paused",
    description: "A win-back push for lapsed players — paused pending a budget-cap review.",
    ownerId: "u-james-chen",
    audienceLabel: "Dormant 60+ days",
    schedule: { start: "2026-05-01", end: "2026-06-30", recurrence: "weekly-reset" },
    eligibility: elig([
      { field: "player.segment", operator: "in", value: ["dormant"] },
      { field: "player.lastVisitDays", operator: "gte", value: 60 },
    ]),
    earnRule: slotWager(150),
    prizeIds: ["pz-freeplay250", "pz-dining50"],
    propertyIds: ["cr-reno"],
    compliance: {
      budgetCap: 40000,
      budgetUsed: 12800,
      approverId: "u-maya-rodriguez",
      filingRef: "NV-CR-2026-Q2-PQ-079",
      jurisdiction: "NV",
    },
    metrics: {
      reach: 6400,
      offers: 2,
      engagementRate: 0.212,
      funnel: { eligible: 6400, started: 1360, completed: 640, claimed: 470 },
    },
  },
  {
    id: "cmp-diamond-dash",
    name: "Diamond Dash",
    type: "repeating-multi-tier",
    status: "ended",
    description: "A quarterly Tahoe-exclusive tier race for Platinum and Diamond members.",
    ownerId: "u-maya-rodriguez",
    audienceLabel: "Platinum + Diamond · Tahoe",
    schedule: { start: "2026-01-01", end: "2026-01-31", recurrence: "weekly-reset" },
    eligibility: elig([
      { field: "player.tier", operator: "in", value: ["Platinum", "Diamond"] },
      { field: "player.property", operator: "in", value: ["cr-tahoe"] },
    ]),
    earnRule: slotWager(750),
    prizeIds: ["pz-bose", "pz-applewatch", "pz-weekend"],
    propertyIds: ["cr-tahoe"],
    compliance: {
      budgetCap: 55000,
      budgetUsed: 49500,
      approverId: "u-maya-rodriguez",
      filingRef: "NV-CR-2026-Q1-PQ-041",
      jurisdiction: "NV",
    },
    metrics: {
      reach: 2100,
      offers: 3,
      engagementRate: 0.372,
      funnel: { eligible: 2100, started: 980, completed: 610, claimed: 540 },
    },
  },
  {
    id: "cmp-july-fireworks",
    name: "Fourth of July Fireworks",
    type: "goal-based",
    status: "active",
    description: "An Independence Day slot celebration across all three properties.",
    ownerId: "u-james-chen",
    audienceLabel: "Silver+ · all properties",
    schedule: { start: "2026-07-01", end: "2026-07-07", recurrence: "daily-reset" },
    eligibility: elig([
      { field: "player.tier", operator: "in", value: ["Silver", "Gold", "Platinum", "Diamond"] },
      { field: "player.age", operator: "gte", value: 21 },
    ]),
    earnRule: slotWager(400),
    prizeIds: ["pz-amazon100", "pz-yeti", "pz-freeplay250", "pz-rayban"],
    propertyIds: ["cr-lv", "cr-reno", "cr-tahoe"],
    compliance: {
      budgetCap: 80000,
      budgetUsed: 41200,
      approverId: "u-maya-rodriguez",
      filingRef: "NV-CR-2026-Q3-PQ-096",
      jurisdiction: "NV",
    },
    metrics: {
      reach: 21500,
      offers: 4,
      engagementRate: 0.401,
      funnel: { eligible: 21500, started: 9800, completed: 4600, claimed: 3720 },
    },
  },
];

/** Fresh clones so the mutable DB never aliases the seed arrays. */
export function seedCampaigns(): CampaignDefinition[] {
  return CAMPAIGNS.map((c) => structuredClone(c));
}
export function seedPrizes(): PrizeCatalogItem[] {
  return PRIZES.map((p) => structuredClone(p));
}
