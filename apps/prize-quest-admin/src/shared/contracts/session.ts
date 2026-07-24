import { z } from "zod";

/**
 * Auth / session contracts. UI-only RBAC: permissions gate affordances via
 * `usePermission()` — they never imply real backend security.
 */

export const Role = z.enum(["marketing-manager", "approver", "operations", "auditor", "admin"]);
export type Role = z.infer<typeof Role>;

/** Permission keys gate UI affordances. */
export const Permission = z.enum([
  "campaign.view",
  "campaign.create",
  "campaign.activate",
  "rule.view",
  "rule.create",
  "rule.toggle",
  "logs.view",
  "logs.export",
  "catalog.sync",
  "audit.export",
  "users.manage",
  "settings.manage",
  "players.adjust",
  "fulfillment.manage",
  "notifications.manage",
  "triggers.manage",
]);
export type Permission = z.infer<typeof Permission>;

export const OperatorUser = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  initials: z.string(),
  role: Role,
  title: z.string(),
});
export type OperatorUser = z.infer<typeof OperatorUser>;

/** Role catalog entry (from tenant context). */
export const RoleInfo = z.object({
  key: Role,
  label: z.string(),
});
export type RoleInfo = z.infer<typeof RoleInfo>;

export const Session = z.object({
  token: z.string(),
  user: OperatorUser,
  role: Role,
  permissions: z.array(Permission),
  tenantId: z.string(),
  defaultPropertyId: z.string(),
});
export type Session = z.infer<typeof Session>;

export const LoginRequest = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean().optional(),
});
export type LoginRequest = z.infer<typeof LoginRequest>;

/** Live figures shown on the login brand panel. */
export const BrandStats = z.object({
  activeCampaigns: z.number(),
  playersThisMonth: z.number(),
  claimsToday: z.number(),
});
export type BrandStats = z.infer<typeof BrandStats>;
