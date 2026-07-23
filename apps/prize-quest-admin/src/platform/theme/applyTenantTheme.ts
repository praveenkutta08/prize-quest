import type { TenantTheme } from "@/shared/contracts/tenant";

/**
 * Multi-tenant theming. The base "Nocturne" tokens live on :root (tokens.css).
 * A resolved tenant re-skins the console at runtime by layering its overrides as
 * inline CSS custom properties on <html> — these win over the :root defaults, so
 * a client's palette/fonts take effect with zero component changes. A tenant may
 * override only a subset; anything it omits falls back to the base token.
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

/** Read a token's computed value as `#rrggbb` (used by the /design-system page). */
export function tokenToHex(token: string): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const parts = raw.split(/[\s,]+/).map(Number);
  if (parts.length < 3 || parts.some(Number.isNaN)) return raw || "—";
  const [r, g, b] = parts;
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}
