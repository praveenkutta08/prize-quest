import { z } from "zod";

/** Audit domain contracts (app-local, Zod-first). Tenant-level, read-only. */

export const AuditAction = z.enum([
  "create",
  "update",
  "delete",
  "activate",
  "pause",
  "login",
  "export",
  "permission-change",
  "invite",
]);
export type AuditAction = z.infer<typeof AuditAction>;

export const AuditTargetType = z.enum([
  "campaign",
  "rule",
  "reward",
  "user",
  "setting",
  "player",
  "trigger",
  "fulfillment",
]);
export type AuditTargetType = z.infer<typeof AuditTargetType>;

export const AuditEntry = z.object({
  id: z.string(),
  actorId: z.string(),
  actorName: z.string(),
  action: AuditAction,
  targetType: AuditTargetType,
  targetId: z.string(),
  targetLabel: z.string(),
  summary: z.string(),
  time: z.string(),
  ip: z.string().optional(),
  propertyId: z.string().optional(),
  before: z.record(z.string(), z.unknown()).optional(),
  after: z.record(z.string(), z.unknown()).optional(),
});
export type AuditEntry = z.infer<typeof AuditEntry>;

export const AuditCounts = z.object({
  all: z.number(),
});
export type AuditCounts = z.infer<typeof AuditCounts>;

export const AuditListResponse = z.object({
  rows: z.array(AuditEntry),
  total: z.number(),
  counts: AuditCounts,
  nextCursor: z.string().optional(),
});
export type AuditListResponse = z.infer<typeof AuditListResponse>;
