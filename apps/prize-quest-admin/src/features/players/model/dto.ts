import { z } from "zod";
import { ConditionGroup, Tier } from "@/shared/contracts";
import type { ActivityFeedItem } from "@/shared/ui";

/**
 * Players domain contracts (app-local, Zod-first). Reuses `Tier` and the shared
 * `ConditionGroup` (for read-only segment criteria previews). Players are
 * fictional — no real PII. One schema types the RTK Query endpoints and
 * validates MSW payloads at the boundary.
 */

export { Tier };

export const PlayerSegment = z.enum(["vip", "high-roller", "regular", "new", "at-risk", "dormant"]);
export type PlayerSegment = z.infer<typeof PlayerSegment>;

export const PlayerStatus = z.enum(["active", "inactive", "self-excluded"]);
export type PlayerStatus = z.infer<typeof PlayerStatus>;

export const Player = z.object({
  id: z.string(),
  name: z.string(),
  initials: z.string(),
  tier: Tier,
  segment: PlayerSegment,
  propertyId: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  age: z.number().int(),
  joinedAt: z.string(),
  lastVisitAt: z.string(),
  lastVisitDays: z.number().int(),
  lifetimeValue: z.number(),
  pointsBalance: z.number(),
  visitsYtd: z.number().int(),
  status: PlayerStatus,
  avatarRef: z.string().optional(),
});
export type Player = z.infer<typeof Player>;

export const PlayerActivityType = z.enum([
  "visit",
  "wager",
  "reward-claim",
  "tier-change",
  "campaign-enroll",
  "points-adjust",
]);
export type PlayerActivityType = z.infer<typeof PlayerActivityType>;

export const PlayerActivity = z.object({
  id: z.string(),
  playerId: z.string(),
  type: PlayerActivityType,
  label: z.string(),
  time: z.string(),
  meta: z.string().optional(),
});
export type PlayerActivity = z.infer<typeof PlayerActivity>;

export const PlayerRewardRef = z.object({
  rewardId: z.string(),
  name: z.string(),
  claimedAt: z.string(),
  status: z.enum(["claimed", "fulfilled", "pending"]),
});
export type PlayerRewardRef = z.infer<typeof PlayerRewardRef>;

export const PlayerCampaignRef = z.object({
  campaignId: z.string(),
  name: z.string(),
  enrolledAt: z.string(),
  status: z.string(),
});
export type PlayerCampaignRef = z.infer<typeof PlayerCampaignRef>;

export const SegmentInfo = z.object({
  key: PlayerSegment,
  label: z.string(),
  count: z.number(),
  description: z.string(),
  criteria: ConditionGroup.optional(),
});
export type SegmentInfo = z.infer<typeof SegmentInfo>;

export const PointsAdjust = z.object({
  delta: z.number(),
  reason: z.string(),
});
export type PointsAdjust = z.infer<typeof PointsAdjust>;

// ── List response ─────────────────────────────────────────────────────────────

export const PlayerSegmentCounts = z.object({
  all: z.number(),
  vip: z.number(),
  "high-roller": z.number(),
  regular: z.number(),
  new: z.number(),
  "at-risk": z.number(),
  dormant: z.number(),
});
export type PlayerSegmentCounts = z.infer<typeof PlayerSegmentCounts>;

export const PlayerListStats = z.object({
  totalPlayers: z.number(),
  activeThisMonth: z.number(),
  avgLifetimeValue: z.number(),
  atRisk: z.number(),
});
export type PlayerListStats = z.infer<typeof PlayerListStats>;

export const PlayerListResponse = z.object({
  rows: z.array(Player),
  total: z.number(),
  counts: PlayerSegmentCounts,
  stats: PlayerListStats,
});
export type PlayerListResponse = z.infer<typeof PlayerListResponse>;

export const PlayerActivityResponse = z.object({
  rows: z.array(PlayerActivity),
  nextCursor: z.string().optional(),
});
export type PlayerActivityResponse = z.infer<typeof PlayerActivityResponse>;

export const PlayerRewardList = z.array(PlayerRewardRef);
export const PlayerCampaignList = z.array(PlayerCampaignRef);
export const SegmentInfoList = z.array(SegmentInfo);

/** Map a player-activity entry to the reused ActivityFeed item shape (icon/tone by type). */
export function toActivityFeedItem(a: PlayerActivity): ActivityFeedItem {
  const TYPE_TO_FEED: Record<PlayerActivityType, string> = {
    visit: "schedule",
    wager: "offer",
    "reward-claim": "offer",
    "tier-change": "tier",
    "campaign-enroll": "rule",
    "points-adjust": "catalog",
  };
  return {
    id: a.id,
    type: TYPE_TO_FEED[a.type] ?? "catalog",
    title: a.label,
    subtitle: a.meta ?? "",
    timestamp: a.time,
  };
}
