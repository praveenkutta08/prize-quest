import { z } from "zod";
import { Jurisdiction } from "@/shared/contracts";

/**
 * Settings per-panel form DTOs (app-local, Zod-first). These REUSE the tenant
 * contracts (`TenantBrand`, `TenantTheme`, `Property`, `Module`, `ModuleKey`,
 * `TenantFeatures`, `TenantVendor`) — we only add the form-shaped schemas that
 * drive each panel's RHF resolver. Do not redefine the tenant contracts.
 */

// General / Brand → TenantBrand
export const BrandForm = z.object({
  productName: z.string().min(1, "Product name is required"),
  operatorName: z.string().min(1, "Operator name is required"),
  initials: z
    .string()
    .min(1, "Add initials")
    .max(3, "Up to 3 characters")
    .transform((s) => s.toUpperCase()),
  tagline: z.string().optional(),
  logoRef: z.string().optional(),
});
export type BrandForm = z.infer<typeof BrandForm>;

// Theme & appearance → TenantTheme. Curated editable token subset.
export const THEME_TOKEN_KEYS = [
  "--brand",
  "--brand-bright",
  "--success",
  "--warning",
  "--danger",
  "--info",
] as const;
export type ThemeTokenKey = (typeof THEME_TOKEN_KEYS)[number];

export const THEME_TOKEN_LABEL: Record<ThemeTokenKey, string> = {
  "--brand": "Brand accent",
  "--brand-bright": "Brand (hover)",
  "--success": "Success",
  "--warning": "Warning / money",
  "--danger": "Danger",
  "--info": "Info / scheduled",
};

export const ThemeForm = z.object({
  tokenOverrides: z.record(z.string(), z.string()),
  fonts: z.object({
    display: z.string(),
    body: z.string(),
    mono: z.string(),
  }),
});
export type ThemeForm = z.infer<typeof ThemeForm>;

// Properties → Property
export const PropertyForm = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Property name is required"),
  code: z
    .string()
    .min(2, "2–4 characters")
    .max(4, "2–4 characters")
    .transform((s) => s.toUpperCase()),
  timezone: z.string().min(1, "Timezone is required"),
  jurisdiction: Jurisdiction,
});
export type PropertyForm = z.infer<typeof PropertyForm>;

// Modules → Module[]
export const ModulesForm = z.object({
  modules: z.array(z.object({ key: z.string(), enabled: z.boolean() })),
});
export type ModulesForm = z.infer<typeof ModulesForm>;

// Compliance → tenant.compliance
export const ComplianceForm = z.object({
  jurisdiction: Jurisdiction,
  jurisdictionLabel: z.string().min(1, "Add a label"),
  budgetCapEnforced: z.boolean(),
});
export type ComplianceForm = z.infer<typeof ComplianceForm>;

// Vendor → TenantVendor
export const VendorForm = z.object({
  type: z.enum(["konami", "igt", "aristocrat", "lw"]),
  baseUrl: z.string().url("Enter a valid URL"),
  environment: z.enum(["sandbox", "staging", "production"]),
});
export type VendorForm = z.infer<typeof VendorForm>;
