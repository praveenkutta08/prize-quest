import type { TenantTheme } from "@/shared/contracts/tenant";

/**
 * Multi-tenant theming (pure DOM utility — lives in `shared` so both the
 * platform boot loader and the Settings feature's live theme editor can call it
 * without crossing the FSD boundary). The base "Nocturne" tokens live on :root
 * (tokens.css). A resolved tenant re-skins the console at runtime by layering
 * its overrides as inline CSS custom properties on <html> — these win over the
 * :root defaults, so a client's palette/fonts take effect with zero component
 * changes. A tenant may override only a subset; anything it omits falls back to
 * the base token.
 */
export function applyTenantTheme(theme: TenantTheme | undefined): void {
  const root = document.documentElement;
  if (!theme) return;

  for (const [token, value] of Object.entries(theme.tokenOverrides ?? {})) {
    // Only accept our own token names, never arbitrary properties.
    if (token.startsWith("--")) {
      root.style.setProperty(token, value);
    }
  }

  const fonts = theme.fonts;
  if (fonts?.display) root.style.setProperty("--font-display", fonts.display);
  if (fonts?.body) root.style.setProperty("--font-body", fonts.body);
  if (fonts?.mono) root.style.setProperty("--font-mono", fonts.mono);
}

/** Clear any tenant overrides, reverting to the base Nocturne tokens. */
export function clearTenantTheme(tokenNames: string[]): void {
  const root = document.documentElement;
  for (const token of tokenNames) root.style.removeProperty(token);
}

/** Read a token's computed value as `#rrggbb` (used by the /design-system page and theme editor). */
export function tokenToHex(token: string): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const parts = raw.split(/[\s,]+/).map(Number);
  if (parts.length < 3 || parts.some(Number.isNaN)) return raw || "—";
  const [r, g, b] = parts;
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

/** Parse an `#rrggbb` (or `#rgb`) hex string to space-separated RGB channels ("143 199 232"). */
export function hexToChannels(hex: string): string | null {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** Relative luminance (0–1) of an `#rrggbb` or `r g b` channel string, for contrast warnings. */
export function relativeLuminance(color: string): number | null {
  let r: number, g: number, b: number;
  if (color.startsWith("#")) {
    const ch = hexToChannels(color);
    if (!ch) return null;
    [r, g, b] = ch.split(" ").map(Number);
  } else {
    const parts = color
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (parts.length < 3 || parts.some(Number.isNaN)) return null;
    [r, g, b] = parts;
  }
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
