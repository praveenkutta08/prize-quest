import type { StatusTone } from "@/shared/ui";
import type { PlayerSegment, PlayerStatus } from "../model";

export const SEGMENT_LABEL: Record<PlayerSegment, string> = {
  vip: "VIP",
  "high-roller": "High roller",
  regular: "Regular",
  new: "New",
  "at-risk": "At-risk",
  dormant: "Dormant",
};

export const STATUS_LABEL: Record<PlayerStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  "self-excluded": "Self-excluded",
};

/** Segment → badge variant for the directory. */
export const SEGMENT_BADGE: Record<
  PlayerSegment,
  "brand" | "success" | "info" | "warning" | "danger" | "neutral"
> = {
  vip: "brand",
  "high-roller": "info",
  regular: "success",
  new: "neutral",
  "at-risk": "warning",
  dormant: "danger",
};

/** Player status → StatusPill tone. */
export function statusTone(status: PlayerStatus): StatusTone {
  switch (status) {
    case "active":
      return "active";
    case "inactive":
      return "ended";
    case "self-excluded":
      return "danger";
    default:
      return "draft";
  }
}

/** Tier → StatusPill-ish tone. */
export function tierTone(tier: string): StatusTone {
  switch (tier) {
    case "Diamond":
      return "event";
    case "Platinum":
      return "scheduled";
    case "Gold":
      return "paused";
    default:
      return "draft";
  }
}

/** lastVisitDays → "3d ago". */
export function lastVisitLabel(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}
