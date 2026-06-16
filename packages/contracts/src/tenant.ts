/**
 * The TenantConfig contract — the single most important contract in the system.
 * A new tenant = a new JSON file in @pq/tenants/src/configs/ that satisfies
 * this shape. No code changes.
 *
 * Lives in @pq/contracts (types only, no runtime) so @pq/tokens can
 * consume `TenantConfig` for `applyTokens()` without depending on @pq/tenants,
 * and @pq/tenants can still depend on @pq/tokens. No workspace cycle.
 */

export interface TenantConfig {
  id: string; // 'casino-royale-lv'
  name: string; // 'Casino Royale Las Vegas'

  brand: {
    logo: { src: string; alt: string; height?: number };
    favicon: string;
    productName?: string; // override 'Prize Quest' if needed
  };

  theme: {
    tokens: TokenOverrides; // any CSS custom prop from tokens.json
    fonts: {
      display?: string; // default: 'Manrope'
      serif?: string; // default: 'Cormorant Garamond'
      body?: string; // default: 'Inter'
      mono?: string; // default: 'IBM Plex Mono'
      googleFontsUrl?: string; // pre-built URL for non-default fonts
    };
    mode?: "premium" | "casino-loud" | "arcade"; // visual treatment switch — defaults to 'premium' when omitted
    /**
     * Per-category prize-accent map for arcade mode: category string → one of the six
     * arcade color names. applyTokens writes each as `--pq-cat-{category}` pointing at
     * the matching `--cat-{color}`. Unmapped categories fall back to purple.
     */
    categoryMap?: Record<string, "purple" | "blue" | "orange" | "pink" | "green" | "teal">;
    /**
     * Arcade campaign-card progress treatment. `applyTokens` writes this to
     * `<html data-pq-progress-style>`; `pq-campaign-card` reads it to pick the
     * segmented (default) or shimmer progress block. Arcade mode only.
     */
    campaignProgressStyle?: "segmented" | "shimmer";
  };

  copy: {
    locale: string; // 'en-US'
    overrides?: Record<string, string>; // tenant-specific microcopy
  };

  features: {
    // feature flags — disable widgets per tenant
    voucher: boolean;
    notifications: boolean;
    offlineMode: boolean;
    tierProgress: boolean;
    twoColumnDetail: boolean;
    horizontalCarousel: boolean;
  };

  vendor: {
    type: "konami" | "igt" | "aristocrat" | "lw";
    pinLength: 4 | 5 | 6;
    pinShuffle: boolean;
  };

  compliance: {
    jurisdiction: string; // 'NV', 'tribal-XX', etc.
    auditLogEndpoint?: string;
    budgetCapEnforced: boolean;
  };
}

export interface TokenOverrides {
  // Every CSS variable in tokens.json is overridable.
  // Naming follows the existing --pq-* convention.
  "--pq-navy-deep"?: string;
  "--pq-navy-base"?: string;
  "--pq-navy-low"?: string;
  "--pq-navy-mid"?: string;
  "--pq-navy-hairline"?: string;
  "--pq-emerald"?: string;
  "--pq-emerald-soft"?: string;
  "--pq-gold"?: string;
  "--pq-gold-bright"?: string;
  "--pq-cream"?: string;
  "--pq-cream-muted"?: string;
  "--pq-text"?: string;
  "--pq-text-muted"?: string;
  "--pq-font-display"?: string;
  "--pq-font-serif"?: string;
  "--pq-font-body"?: string;
  "--pq-font-mono"?: string;
  "--pq-r-md"?: string;
  "--pq-r-lg"?: string;
  // Forward-compat: any other --pq-* token may be added.
  [token: `--pq-${string}`]: string | undefined;
  // Arcade-mode treatment tokens. Arcade colors live in the `--arc-*` / `--cat-*`
  // layer (packages/tokens/src/arcade.css under :root[data-pq-mode="arcade"]), and the
  // `--pq-*` semantic remap there is `!important` — so an arcade tenant MUST override
  // `--arc-*` (not `--pq-*`) to re-theme. Operator-flavored arcade tenants (Session 34)
  // set the whole `--arc-*` ramp here so no default purple bleeds through.
  [token: `--arc-${string}`]: string | undefined;
  [token: `--cat-${string}`]: string | undefined;
}
