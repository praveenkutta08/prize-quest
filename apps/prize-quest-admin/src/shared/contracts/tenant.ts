import { z } from "zod";
import { Jurisdiction } from "./enums";
import { RoleInfo } from "./session";

/**
 * Tenant context — resolved at boot from `tenants/<id>/` data (served by MSW).
 * Brand + theme come from the client/tenant (multi-tenant): they drive the shell,
 * login, and the runtime token overrides. Shape mirrors the player-side
 * `TenantConfig` (brand · compliance.jurisdiction · vendor · features) for parity,
 * plus admin additions: `properties[]`, `modules[]`, `roles[]`.
 */

export const Property = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(), // e.g. "LV", "RNO", "TAH"
  timezone: z.string(),
  jurisdiction: Jurisdiction,
});
export type Property = z.infer<typeof Property>;

/** Sidebar module keys — which surfaces this tenant has enabled. */
export const ModuleKey = z.enum([
  "dashboard",
  "reports",
  "promotions",
  "rewards",
  "players",
  "rules",
  "triggers",
  "fulfillment",
  "audit",
  "notifications",
  "settings",
  "users",
]);
export type ModuleKey = z.infer<typeof ModuleKey>;

export const Module = z.object({
  key: ModuleKey,
  enabled: z.boolean(),
});
export type Module = z.infer<typeof Module>;

export const TenantBrand = z.object({
  productName: z.string(),
  operatorName: z.string(),
  initials: z.string(),
  tagline: z.string(),
});
export type TenantBrand = z.infer<typeof TenantBrand>;

/** Runtime theme overrides applied over the base Nocturne tokens. */
export const TenantTheme = z.object({
  /** Token name → space-separated RGB channels, e.g. `{ "--brand": "143 199 232" }`. */
  tokenOverrides: z.record(z.string(), z.string()).default({}),
  fonts: z
    .object({
      display: z.string().optional(),
      body: z.string().optional(),
      mono: z.string().optional(),
    })
    .optional(),
});
export type TenantTheme = z.infer<typeof TenantTheme>;

export const TenantVendor = z.object({
  type: z.enum(["konami", "igt", "aristocrat", "lw"]),
});
export type TenantVendor = z.infer<typeof TenantVendor>;

export const TenantFeatures = z.object({
  reports: z.boolean(),
  rewardsCatalog: z.boolean(),
  players: z.boolean(),
  triggers: z.boolean(),
  fulfillment: z.boolean(),
  auditLogs: z.boolean(),
});
export type TenantFeatures = z.infer<typeof TenantFeatures>;

export const TenantIdentity = z.object({
  id: z.string(),
  name: z.string(),
  brand: TenantBrand,
  compliance: z.object({
    jurisdiction: Jurisdiction,
    jurisdictionLabel: z.string(),
    budgetCapEnforced: z.boolean(),
  }),
  vendor: TenantVendor,
  features: TenantFeatures,
});
export type TenantIdentity = z.infer<typeof TenantIdentity>;

export const TenantContext = z.object({
  tenant: TenantIdentity,
  theme: TenantTheme,
  properties: z.array(Property),
  modules: z.array(Module),
  roles: z.array(RoleInfo),
});
export type TenantContext = z.infer<typeof TenantContext>;
