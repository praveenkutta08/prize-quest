import type { Tier } from "@/shared/contracts";
import type {
  Player,
  PlayerActivity,
  PlayerActivityType,
  PlayerCampaignRef,
  PlayerRewardRef,
  PlayerSegment,
  SegmentInfo,
} from "@/features/players/model";

/**
 * Players fixtures — ~36 fictional players (NO real PII). Spread across tiers,
 * all six segments, and every property, with plausible LTV / points / visit
 * recency. Generated deterministically from index math so the data is stable
 * across reloads. Each player gets synthesized activity, reward, and campaign
 * references. The DB clones these on boot so the points-adjust mutation persists.
 */

const FIRST = [
  "Ava",
  "Liam",
  "Mia",
  "Noah",
  "Zoe",
  "Ethan",
  "Layla",
  "Lucas",
  "Emma",
  "Mason",
  "Isla",
  "Kai",
  "Nora",
  "Diego",
  "Priya",
  "Owen",
  "Sofia",
  "Jamal",
  "Elena",
  "Marcus",
  "Yuki",
  "Ravi",
  "Chloe",
  "Andre",
  "Nadia",
  "Hugo",
  "Bianca",
  "Theo",
  "Amara",
  "Felix",
  "Lena",
  "Omar",
  "Ruby",
  "Sven",
  "Talia",
  "Cole",
];
const LAST = [
  "Reyes",
  "Okafor",
  "Nakamura",
  "Bauer",
  "Costa",
  "Mensah",
  "Petrov",
  "Haddad",
  "Lindqvist",
  "Delgado",
  "Osei",
  "Fontaine",
  "Kapoor",
  "Novak",
  "Ibrahim",
  "Sorensen",
  "Vega",
  "Duarte",
  "Beckett",
  "Marchetti",
  "Larsson",
  "Adeyemi",
  "Kovac",
  "Rivera",
  "Bianchi",
  "Farrell",
  "Sato",
  "Moreau",
  "Chowdhury",
  "Engel",
  "Silva",
  "Voss",
  "Nguyen",
  "Abbas",
  "Rossi",
  "Park",
];

const SEGMENTS: PlayerSegment[] = ["vip", "high-roller", "regular", "new", "at-risk", "dormant"];
const PROPERTIES = ["cr-lv", "cr-reno", "cr-tahoe"];

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Deterministic date `daysAgo` before a fixed "now" (2026-07-23). */
const NOW = Date.UTC(2026, 6, 23, 12, 0, 0);
function daysAgoIso(days: number): string {
  return new Date(NOW - days * 86_400_000).toISOString();
}

const SEGMENT_TIER: Record<PlayerSegment, Tier> = {
  vip: "Diamond",
  "high-roller": "Platinum",
  regular: "Gold",
  new: "Silver",
  "at-risk": "Gold",
  dormant: "Silver",
};

function buildPlayer(i: number): Player {
  const name = `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`;
  // Decouple segment from property: `floor(i/3) % 6` cycles all six segments
  // within each property class (property is `i % 3`), so every property shows a
  // full segment spread rather than the two that a shared factor would allow.
  const segment = SEGMENTS[Math.floor(i / 3) % SEGMENTS.length];
  const tier = SEGMENT_TIER[segment];
  const propertyId = PROPERTIES[i % PROPERTIES.length];

  // LTV / recency vary by segment for a believable directory.
  const ltvBase: Record<PlayerSegment, number> = {
    vip: 82_000,
    "high-roller": 51_000,
    regular: 18_000,
    new: 2_400,
    "at-risk": 22_000,
    dormant: 9_500,
  };
  const lastVisitBySeg: Record<PlayerSegment, number> = {
    vip: 2,
    "high-roller": 5,
    regular: 9,
    new: 4,
    "at-risk": 34,
    dormant: 96,
  };
  const lifetimeValue = ltvBase[segment] + ((i * 733) % 9000);
  const lastVisitDays = lastVisitBySeg[segment] + (i % 5);
  const status: Player["status"] =
    segment === "dormant" && i % 7 === 0
      ? "self-excluded"
      : segment === "dormant"
        ? "inactive"
        : "active";

  return {
    id: `pl-${String(i + 1).padStart(3, "0")}`,
    name,
    initials: initials(name),
    tier,
    segment,
    propertyId,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
    phone: `+1 (702) 555-${String(1000 + ((i * 37) % 8999)).padStart(4, "0")}`,
    age: 24 + ((i * 3) % 46),
    joinedAt: daysAgoIso(40 + ((i * 53) % 1400)),
    lastVisitAt: daysAgoIso(lastVisitDays),
    lastVisitDays,
    lifetimeValue,
    pointsBalance: 500 + ((i * 271) % 48_000),
    visitsYtd: 4 + ((i * 5) % 90),
    status,
  };
}

export const PLAYERS: Player[] = Array.from({ length: 36 }, (_, i) => buildPlayer(i));

// ── Activity synthesis ────────────────────────────────────────────────────────

const ACTIVITY_LABELS: Record<PlayerActivityType, (n: number) => { label: string; meta: string }> =
  {
    visit: (n) => ({
      label: "Visited the floor",
      meta: `Session ${n} · ${45 + (n % 6) * 15}m on property`,
    }),
    wager: (n) => ({
      label: "Slot session",
      meta: `$${(1200 + n * 340).toLocaleString()} coin-in`,
    }),
    "reward-claim": (n) => ({
      label: "Claimed a reward",
      meta: n % 2 ? "$50 Free Play" : "Steakhouse Dinner for Two",
    }),
    "tier-change": () => ({ label: "Tier promoted", meta: "Gold → Platinum" }),
    "campaign-enroll": (n) => ({
      label: "Enrolled in a campaign",
      meta: n % 2 ? "Summer Bash 2026" : "March Madness",
    }),
    "points-adjust": () => ({ label: "Points adjusted", meta: "+2,500 · host courtesy" }),
  };

const ACTIVITY_CYCLE: PlayerActivityType[] = [
  "visit",
  "wager",
  "visit",
  "reward-claim",
  "wager",
  "campaign-enroll",
  "visit",
  "wager",
  "tier-change",
  "visit",
  "reward-claim",
  "wager",
  "visit",
  "wager",
  "campaign-enroll",
  "visit",
];

/** Deterministic activity list for a player, most-recent first. */
export function buildActivity(playerId: string, seedIndex: number): PlayerActivity[] {
  const n = 14 + (seedIndex % 6); // 14–19 entries
  return Array.from({ length: n }, (_, k) => {
    const type = ACTIVITY_CYCLE[(seedIndex + k) % ACTIVITY_CYCLE.length];
    const { label, meta } = ACTIVITY_LABELS[type](k + 1);
    return {
      id: `${playerId}-act-${k}`,
      playerId,
      type,
      label,
      meta,
      time: daysAgoIso(k * 3 + (seedIndex % 3)),
    };
  });
}

const REWARD_POOL = [
  { rewardId: "rw-freeplay50", name: "$50 Free Play" },
  { rewardId: "rw-steak", name: "Steakhouse Dinner for Two" },
  { rewardId: "rw-airpods", name: "AirPods Pro (2nd gen)" },
  { rewardId: "rw-spaday", name: "Spa Day Package" },
  { rewardId: "rw-amazon100", name: "$100 Amazon Gift Card" },
];

export function buildRewards(seedIndex: number): PlayerRewardRef[] {
  const statuses = ["fulfilled", "claimed", "pending"] as const;
  const count = 2 + (seedIndex % 3);
  return Array.from({ length: count }, (_, k) => {
    const pick = REWARD_POOL[(seedIndex + k) % REWARD_POOL.length];
    return {
      rewardId: pick.rewardId,
      name: pick.name,
      claimedAt: daysAgoIso(6 + k * 11 + (seedIndex % 4)),
      status: statuses[(seedIndex + k) % statuses.length],
    };
  });
}

const CAMPAIGN_POOL = [
  { campaignId: "cmp-summer-bash", name: "Summer Bash 2026" },
  { campaignId: "cmp-march-madness", name: "March Madness" },
  { campaignId: "cmp-sunday-slot-sprint", name: "Sunday Slot Sprint" },
];

export function buildCampaignRefs(seedIndex: number): PlayerCampaignRef[] {
  const count = 1 + (seedIndex % 3);
  return Array.from({ length: count }, (_, k) => {
    const pick = CAMPAIGN_POOL[(seedIndex + k) % CAMPAIGN_POOL.length];
    return {
      campaignId: pick.campaignId,
      name: pick.name,
      enrolledAt: daysAgoIso(12 + k * 20 + (seedIndex % 5)),
      status: k === 0 ? "active" : "completed",
    };
  });
}

// ── Segments ──────────────────────────────────────────────────────────────────

export const SEGMENTS_INFO: SegmentInfo[] = [
  {
    key: "vip",
    label: "VIP",
    count: PLAYERS.filter((p) => p.segment === "vip").length,
    description: "Top-tier members with the highest lifetime value and host relationships.",
    criteria: {
      conjunction: "AND",
      conditions: [
        { field: "player.tier", operator: "in", value: ["Platinum", "Diamond"] },
        { field: "player.weeklyCoinIn", operator: "gte", value: 50000 },
      ],
    },
  },
  {
    key: "high-roller",
    label: "High roller",
    count: PLAYERS.filter((p) => p.segment === "high-roller").length,
    description: "Heavy players with strong weekly coin-in, just below VIP.",
    criteria: {
      conjunction: "AND",
      conditions: [
        { field: "player.tier", operator: "in", value: ["Platinum", "Diamond"] },
        { field: "player.weeklyCoinIn", operator: "gte", value: 20000 },
      ],
    },
  },
  {
    key: "regular",
    label: "Regular",
    count: PLAYERS.filter((p) => p.segment === "regular").length,
    description: "Consistent mid-tier players who visit steadily throughout the month.",
    criteria: {
      conjunction: "AND",
      conditions: [{ field: "player.lastVisitDays", operator: "lte", value: 14 }],
    },
  },
  {
    key: "new",
    label: "New",
    count: PLAYERS.filter((p) => p.segment === "new").length,
    description: "Members who joined recently and are still in their welcome window.",
    criteria: {
      conjunction: "AND",
      conditions: [{ field: "player.segment", operator: "in", value: ["new"] }],
    },
  },
  {
    key: "at-risk",
    label: "At-risk",
    count: PLAYERS.filter((p) => p.segment === "at-risk").length,
    description: "Valuable players whose visit frequency is slipping — a win-back target.",
    criteria: {
      conjunction: "AND",
      conditions: [{ field: "player.lastVisitDays", operator: "gte", value: 30 }],
    },
  },
  {
    key: "dormant",
    label: "Dormant",
    count: PLAYERS.filter((p) => p.segment === "dormant").length,
    description: "Lapsed players who haven't visited in months.",
    criteria: {
      conjunction: "AND",
      conditions: [{ field: "player.lastVisitDays", operator: "gte", value: 90 }],
    },
  },
];

export function seedPlayers(): Player[] {
  return PLAYERS.map((p) => structuredClone(p));
}
export function seedSegments(): SegmentInfo[] {
  return SEGMENTS_INFO.map((s) => structuredClone(s));
}
