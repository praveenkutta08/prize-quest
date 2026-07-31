import type { Campaign } from "./types";

/**
 * Mock campaigns matching prize-quest-html5.html screen 01:
 * Sunday Slot Sprint (ready), VIP Electronics Quest (72%),
 * Weekend Warrior Bonus (57%), Memorial Day Madness (ended), plus one more.
 *
 * These are the casino-royale-lv (default tenant) names. `api.ts` renames them
 * per tenant so demo-purple shows a different campaign line-up.
 */
export const campaigns: Campaign[] = [
  {
    // Eligible "hero" campaign for the casino-loud / TTD demo (station-casinos
    // renames this to "VIP Game Day Quest" via tenantCampaignNames below).
    id: "vip-game-day-quest",
    name: "VIP Game Day Quest",
    status: "eligible",
    progress: 1000,
    goal: 1000,
    pct: 100,
    meta: "Expires Jun 8",
    expiresAt: "2026-06-08",
    prizeIds: ["galaxy-tab-s9", "sony-xm5", "airpods-pro", "amazon-100"],
  },
  {
    // "Locked-prizes" campaign for the TTD demo. Status is `in-progress` (not
    // `locked`) on purpose: the card must stay tappable (pq-campaign-card makes
    // `locked` cards non-interactive), and pq-campaign-detail already renders the
    // locked prize vault + disabled "Keep playing to unlock" CTA for ANY
    // non-eligible status — which is exactly the reference HTML's "Screen 03
    // in-progress campaign" locked-prize variant. progress < goal keeps prizes locked.
    id: "vip-electronics",
    name: "VIP Electronics",
    status: "in-progress",
    progress: 725,
    goal: 1000,
    pct: 73,
    meta: "Keep playing to unlock",
    expiresAt: "2026-06-30",
    prizeIds: ["galaxy-tab-s9", "sony-xm5", "echo-show-15"],
  },
  {
    id: "sunday-slot-sprint",
    name: "Sunday Slot Sprint",
    status: "eligible",
    progress: 500,
    goal: 500,
    pct: 100,
    meta: "Expires Jun 7",
    expiresAt: "2026-06-07",
    prizeIds: ["airpods-pro", "yeti-rambler", "amazon-100"],
  },
  {
    id: "vip-electronics-quest",
    name: "VIP Electronics Quest",
    status: "in-progress",
    progress: 725,
    goal: 1000,
    pct: 72,
    meta: "26 days left",
    expiresAt: "2026-06-30",
    prizeIds: ["galaxy-tab-s9", "sony-xm5", "echo-show-15", "visa-250"],
  },
  {
    id: "weekend-warrior-bonus",
    name: "Weekend Warrior Bonus",
    status: "in-progress",
    progress: 425,
    goal: 750,
    pct: 57,
    meta: "Resets Mon",
    prizeIds: ["yeti-rambler", "amazon-100"],
  },
  {
    id: "memorial-day-madness",
    name: "Memorial Day Madness",
    status: "expired",
    progress: 180,
    goal: 500,
    pct: 36,
    meta: "Ended",
    expiresAt: "2026-05-26",
    prizeIds: ["amazon-100"],
  },
  {
    id: "high-roller-hundo",
    name: "High Roller Hundo",
    status: "in-progress",
    progress: 3200,
    goal: 5000,
    pct: 64,
    meta: "12 days left",
    expiresAt: "2026-06-16",
    prizeIds: ["galaxy-tab-s9", "visa-250"],
  },
];

/**
 * Per-tenant campaign name overrides (keyed by campaign id). Tenants not listed
 * fall back to the default names above. demo-purple gets a neon-themed line-up.
 */
export const tenantCampaignNames: Record<string, Record<string, string>> = {
  "demo-purple": {
    "sunday-slot-sprint": "Neon Jackpot Rush",
    "vip-electronics-quest": "Purple Reign Electronics",
    "weekend-warrior-bonus": "Midnight Multiplier",
    "memorial-day-madness": "Afterglow Bonus",
    "high-roller-hundo": "Velvet High Roller",
  },
};
