import { z } from "zod";
import { CampaignStatus, Trend } from "@/shared/contracts";

/**
 * Dashboard DTOs (Zod-first). Each schema is the single source of truth: the MSW
 * handler validates against it, and the RTK Query endpoints are typed from it.
 */

export const KpiKey = z.enum(["active-campaigns", "players", "claims", "liability"]);
export type KpiKey = z.infer<typeof KpiKey>;

export const KpiFormat = z.enum(["count", "money-compact", "plain"]);
export type KpiFormat = z.infer<typeof KpiFormat>;

export const Kpi = z.object({
  key: KpiKey,
  label: z.string(),
  value: z.number(),
  format: KpiFormat,
  delta: z.object({
    value: z.number(),
    trend: Trend,
    label: z.string(),
  }),
  /** Liability tile: progress against the budget cap. */
  progress: z
    .object({
      pct: z.number(),
      label: z.string(),
    })
    .optional(),
});
export type Kpi = z.infer<typeof Kpi>;

export const ClaimsPoint = z.object({
  label: z.string(),
  value: z.number(),
  highlight: z.boolean().optional(),
});
export type ClaimsPoint = z.infer<typeof ClaimsPoint>;

export const ActivityType = z.enum(["offer", "rule", "catalog", "tier", "schedule"]);
export type ActivityType = z.infer<typeof ActivityType>;

export const ActivityItem = z.object({
  id: z.string(),
  type: ActivityType,
  title: z.string(),
  subtitle: z.string(),
  timestamp: z.string(), // ISO
});
export type ActivityItem = z.infer<typeof ActivityItem>;

export const TopCampaignRow = z.object({
  id: z.string(),
  name: z.string(),
  subtitle: z.string(),
  sent: z.number(),
  redeemed: z.number(),
  rate: z.number(), // 0..1
  liability: z.number(),
  status: CampaignStatus,
});
export type TopCampaignRow = z.infer<typeof TopCampaignRow>;

export const KpiList = z.array(Kpi);
export const ClaimsSeries = z.array(ClaimsPoint);
export const ActivityList = z.array(ActivityItem);
export const TopCampaignList = z.array(TopCampaignRow);
