import type { TenantConfig, TokenName } from "@pq/contracts";
import { TOKEN_DEFAULTS } from "./primitive";

const GOOGLE_FONTS_LINK_ID = "pq-google-fonts";
const CASINO_LOUD_FONTS_ID = "pq-casino-loud-fonts";
const ARCADE_FONTS_ID = "pq-arcade-fonts";

/**
 * The fonts the casino-loud CSS layer depends on (Bebas Neue display + Inter body +
 * JetBrains Mono). Loaded only while `mode === 'casino-loud'` and removed on the way
 * back to premium so no Bebas font ever sticks.
 */
const CASINO_LOUD_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap";

/**
 * The fonts the arcade CSS layer depends on (Manrope display + Inter body + JetBrains
 * Mono). Loaded only while `mode === 'arcade'` and removed when leaving arcade so the
 * Manrope display font does not linger on another mode. The full 200..800 weight range
 * is requested so headlines can use Manrope 800 (matching Russo One's heft).
 */
const ARCADE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap";

/** The six arcade category color names → the `--cat-{name}` token they resolve to. */
const ARCADE_CATEGORY_COLORS = ["purple", "blue", "orange", "pink", "green", "teal"] as const;

/** Font role → [token to set, fallback stack appended after the tenant family]. */
const FONT_ROLES: Record<
  "display" | "serif" | "body" | "mono",
  [token: TokenName, fallback: string]
> = {
  display: ["--pq-font-display", "system-ui, sans-serif"],
  serif: ["--pq-font-serif", "Georgia, serif"],
  body: ["--pq-font-body", "system-ui, sans-serif"],
  mono: ["--pq-font-mono", "ui-monospace, monospace"],
};

/**
 * Resolve a tenant's theme into CSS custom properties on `:root`
 * (`document.documentElement`) and inject its Google Fonts `<link>`.
 *
 * Precedence (last wins): `TOKEN_DEFAULTS` → font-family tokens derived from
 * `theme.fonts` → explicit `theme.tokens` overrides. Idempotent — safe to call on
 * every tenant switch with no page reload.
 */
export function applyTokens(config: TenantConfig): void {
  const root = document.documentElement;
  const resolved: Record<string, string> = { ...TOKEN_DEFAULTS };

  // Derive font-family tokens from theme.fonts (a bare family name → full stack).
  const fonts = config.theme.fonts;
  (Object.keys(FONT_ROLES) as Array<keyof typeof FONT_ROLES>).forEach((role) => {
    const family = fonts[role];
    if (family) {
      const [token, fallback] = FONT_ROLES[role];
      resolved[token] = `'${family}', ${fallback}`;
    }
  });

  // Explicit token overrides win over everything.
  for (const [name, value] of Object.entries(config.theme.tokens)) {
    if (typeof value === "string") resolved[name] = value;
  }

  for (const [name, value] of Object.entries(resolved)) {
    root.style.setProperty(name, value);
  }

  injectGoogleFonts(config);

  // Surface the visual treatment for mode-specific styling hooks. All mode styling is
  // CSS-only, gated on `[data-pq-mode="<mode>"]` — no widget reads this in JS. Defaults
  // to premium when a tenant omits `mode`.
  const mode = config.theme.mode ?? "premium";
  root.dataset.pqMode = mode;
  // Arcade campaign-card progress treatment (segmented default · shimmer opt-in).
  // Read by pq-campaign-card from `<html data-pq-progress-style>`, mirroring the
  // data-pq-mode pattern (widgets never import tenant config).
  root.dataset.pqProgressStyle = config.theme.campaignProgressStyle ?? "segmented";
  applyModeFonts(ARCADE_FONTS_ID, ARCADE_FONTS_HREF, mode === "arcade");
  applyModeFonts(CASINO_LOUD_FONTS_ID, CASINO_LOUD_FONTS_HREF, mode === "casino-loud");
  applyCategoryMap(root, mode === "arcade" ? config.theme.categoryMap : undefined);
}

/**
 * Write the tenant's per-category accent map as `--pq-cat-{category}` custom properties
 * on `:root`, each pointing at the matching `--cat-{color}` arcade token (e.g.
 * `electronics: "purple"` → `--pq-cat-electronics: var(--cat-purple)`). Cleared when not
 * in arcade mode so a previous tenant's categories never bleed through.
 */
function applyCategoryMap(
  root: HTMLElement,
  map: Record<string, string> | undefined,
): void {
  // Clear any previously written category props first.
  for (let i = root.style.length - 1; i >= 0; i--) {
    const prop = root.style.item(i);
    if (prop.startsWith("--pq-cat-")) root.style.removeProperty(prop);
  }
  if (!map) return;
  for (const [category, color] of Object.entries(map)) {
    if (!(ARCADE_CATEGORY_COLORS as readonly string[]).includes(color)) continue;
    // Write all four variants so widgets resolve the whole accent ramp from the
    // category string alone (no @pq/tenants import in widget code — pure CSS vars).
    root.style.setProperty(`--pq-cat-${category}`, `var(--cat-${color})`);
    root.style.setProperty(`--pq-cat-${category}-deep`, `var(--cat-${color}-deep)`);
    root.style.setProperty(`--pq-cat-${category}-bright`, `var(--cat-${color}-bright)`);
    root.style.setProperty(`--pq-cat-${category}-glow`, `var(--cat-${color}-glow)`);
  }
}

/**
 * Add (idempotently) or remove a mode-specific Google Fonts link by stable id. Repeat
 * injects are a no-op; leaving the mode removes the link so its display font does not
 * linger on another mode.
 */
function applyModeFonts(id: string, href: string, active: boolean): void {
  const existing = document.getElementById(id);
  if (active) {
    if (existing) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  } else if (existing) {
    existing.remove();
  }
}

/** Add/replace the single `<link rel="stylesheet">` that loads the tenant's web fonts. */
function injectGoogleFonts(config: TenantConfig): void {
  const href = config.theme.fonts.googleFontsUrl ?? buildGoogleFontsUrl(config);
  if (!href) return;

  let link = document.getElementById(
    GOOGLE_FONTS_LINK_ID,
  ) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = GOOGLE_FONTS_LINK_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  link.href = href;
}

/** Build a `fonts.googleapis.com/css2` URL from the resolved family names. */
function buildGoogleFontsUrl(config: TenantConfig): string {
  const f = config.theme.fonts;
  const families = [
    f.display ?? "Manrope",
    f.body ?? "Inter",
    f.serif ?? "Cormorant Garamond",
    f.mono ?? "IBM Plex Mono",
  ];
  const params = Array.from(new Set(families))
    .map((name) => `family=${name.trim().replace(/\s+/g, "+")}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
