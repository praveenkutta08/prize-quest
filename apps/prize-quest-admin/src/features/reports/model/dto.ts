import { z } from "zod";
import { CampaignStatus, Trend } from "@/shared/contracts";

/** Reports domain contracts (app-local, Zod-first). Read-only — no mutations. */

export { Trend };

export const ReportRange = z.enum(["24h", "7d", "30d", "90d", "custom"]);
export type ReportRange = z.infer<typeof ReportRange>;

export const ReportKpi = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
  format: z.enum(["number", "currency", "percent"]),
  delta: z.number(),
  trend: Trend,
});
export type ReportKpi = z.infer<typeof ReportKpi>;

export const TimeSeriesPoint = z.object({ date: z.string(), value: z.number() });
export type TimeSeriesPoint = z.infer<typeof TimeSeriesPoint>;

export const Breakdown = z.object({ label: z.string(), value: z.number() });
export type Breakdown = z.infer<typeof Breakdown>;

export const ReportFilter = z.object({
  range: ReportRange,
  propertyId: z.string(),
  segment: z.string().optional(),
});
export type ReportFilter = z.infer<typeof ReportFilter>;

export const CampaignReportRow = z.object({
  id: z.string(),
  name: z.string(),
  status: CampaignStatus,
  reach: z.number(),
  offers: z.number(),
  redemptions: z.number(),
  engagementRate: z.number(),
  revenueImpact: z.number(),
});
export type CampaignReportRow = z.infer<typeof CampaignReportRow>;

// ── Endpoint responses ────────────────────────────────────────────────────────

export const OverviewResponse = z.object({
  kpis: z.array(ReportKpi),
  engagement: z.array(TimeSeriesPoint),
  redemptions: z.array(TimeSeriesPoint),
  funnel: z.object({
    eligible: z.number(),
    started: z.number(),
    completed: z.number(),
    claimed: z.number(),
  }),
});
export type OverviewResponse = z.infer<typeof OverviewResponse>;

export const CampaignReportResponse = z.object({
  rows: z.array(CampaignReportRow),
  comparison: z.array(Breakdown),
});
export type CampaignReportResponse = z.infer<typeof CampaignReportResponse>;

export const PlayerReportResponse = z.object({
  tierDistribution: z.array(Breakdown),
  ltvBands: z.array(Breakdown),
  segments: z.array(Breakdown),
});
export type PlayerReportResponse = z.infer<typeof PlayerReportResponse>;

export const RewardReportResponse = z.object({
  topRedeemed: z.array(Breakdown),
  categoryBreakdown: z.array(Breakdown),
});
export type RewardReportResponse = z.infer<typeof RewardReportResponse>;
