import { TenantContext } from "@/shared/contracts";
import casinoRoyaleConfig from "../../../tenants/casino-royale/config.json";
import casinoRoyaleTheme from "../../../tenants/casino-royale/theme.json";
import casinoRoyaleProperties from "../../../tenants/casino-royale/properties.json";

/**
 * Tenant context is assembled from the `tenants/<id>/` data files (config +
 * theme + properties) and validated with Zod. Because brand + theme come from
 * this data, editing `tenants/casino-royale/theme.json` re-skins the whole
 * console with no code change — the multi-tenant pipeline, proven.
 */
function loadTenant(config: unknown, theme: unknown, properties: unknown): TenantContext {
  const cfg = config as {
    tenant: unknown;
    modules: unknown;
    roles: unknown;
  };
  return TenantContext.parse({
    tenant: cfg.tenant,
    theme,
    properties,
    modules: cfg.modules,
    roles: cfg.roles,
  });
}

export const casinoRoyaleContext = loadTenant(
  casinoRoyaleConfig,
  casinoRoyaleTheme,
  casinoRoyaleProperties,
);

export const TENANTS: Record<string, TenantContext> = {
  "casino-royale": casinoRoyaleContext,
};

/** Fresh clones so the mutable DB never aliases the parsed seed (Settings edits it). */
export function seedTenants(): Record<string, TenantContext> {
  return { "casino-royale": structuredClone(casinoRoyaleContext) };
}
