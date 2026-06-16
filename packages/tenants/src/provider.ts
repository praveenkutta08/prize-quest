import { applyTokens } from "@pq/tokens";
import type { TenantConfig } from "@pq/contracts";

/**
 * Tenant registry. Configs are JSON files committed to the repo for now
 * (migrate to a config service when onboarding tenant #3 — see repo-structure.md).
 * Each entry lazily imports its config so only the active tenant is fetched.
 */
/*
 * TRADEMARK CAVEAT (read before adding or deploying a "*-style" tenant) ───────────
 * The `*-style` configs below (resort/velvet/aria/emerald) are GENERIC operator-flavor
 * STYLE DEMOS for private sales use only. They deliberately use invented names
 * (Resort Rewards, Velvet Reserve, Aria Concierge, Emerald Club) — NOT real operator
 * trademarks. NEVER rename them to or deploy them publicly as a real brand (MGM,
 * Caesars, Bellagio, Wynn, etc.) without that operator's written permission AND legal
 * review. `arcade-demo` stays the public default; the style demos are reached only via
 * the dev-chrome tenant dropdown or a private `?tenant=resort-style` deep link.
 */
const loaders: Record<string, () => Promise<unknown>> = {
  "casino-royale-lv": () => import("./configs/casino-royale-lv.json"),
  "demo-purple": () => import("./configs/demo-purple.json"),
  luminara: () => import("./configs/luminara.json"),
  "station-casinos": () => import("./configs/station-casinos.json"),
  "station-arcade": () => import("./configs/station-arcade.json"),
  "arcade-demo": () => import("./configs/arcade-demo.json"),
  // Session 34 — operator-flavored arcade style demos (generic names; see caveat above).
  "resort-style": () => import("./configs/resort-style.json"),
  "velvet-style": () => import("./configs/velvet-style.json"),
  "aria-style": () => import("./configs/aria-style.json"),
  "emerald-style": () => import("./configs/emerald-style.json"),
};

/** All known tenant ids (drives the playground switcher). */
export function listTenantIds(): string[] {
  return Object.keys(loaders);
}

/** Load a tenant config by id. Rejects on an unknown id. */
export async function getTenant(id: string): Promise<TenantConfig> {
  const loader = loaders[id];
  if (!loader) {
    throw new Error(`Unknown tenant "${id}". Known: ${listTenantIds().join(", ")}`);
  }
  const mod = (await loader()) as { default: TenantConfig };
  return mod.default;
}

let active: TenantConfig | null = null;

/**
 * Load `id`, apply its tokens + fonts to the document, and update tenant-level DOM
 * (lang, title, favicon, `data-pq-tenant`). No page reload — call on every switch.
 */
export async function setActiveTenant(id: string): Promise<void> {
  const config = await getTenant(id);
  applyTokens(config);
  active = config;

  const root = document.documentElement;
  root.dataset.pqTenant = config.id;
  root.lang = config.copy.locale;
  document.title = config.brand.productName ?? config.name;
  updateFavicon(config.brand.favicon);
}

/** The currently active tenant config, or null before the first `setActiveTenant`. */
export function getActiveTenant(): TenantConfig | null {
  return active;
}

function updateFavicon(href: string): void {
  if (!href) return;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
}
