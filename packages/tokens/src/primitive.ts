import type { TokenSet } from "./types";

/**
 * Locked default token values — the H&H corporate foundation plus the Prize Quest
 * overlay (gold-bright reward accent, cream warm neutral, status colors).
 *
 * Source of truth: the `:root` block in `prize-quest-html5.html`, which agrees with
 * `tokens.json` on every shared primitive (navy / emerald / gold / text) and on the
 * radius scale. `cream` is the Prize Quest premium overlay (not in the corporate guide).
 *
 * A tenant that supplies no overrides renders exactly this palette.
 */
export const TOKEN_DEFAULTS: TokenSet = {
  // Navy surfaces
  "--pq-navy-deep": "#0A1A2E",
  "--pq-navy-base": "#102A43",
  "--pq-navy-low": "#143352",
  "--pq-navy-mid": "#1B3756",
  "--pq-navy-hairline": "#2A4F7A",

  // Emerald — action / progress
  "--pq-emerald": "#10B981",
  "--pq-emerald-soft": "#1F8A6E",
  "--pq-emerald-dim": "#0B5C4A",

  // Gold — reward / celebration
  "--pq-gold": "#F59E0B",
  "--pq-gold-bright": "#FCBF49",
  "--pq-gold-deep": "#A56B05",

  // Text on navy
  "--pq-text": "#F1F5F9",
  "--pq-text-muted": "#94A3B8",
  "--pq-text-faint": "#64748B",

  // Cream — premium warm neutral
  "--pq-cream": "#F5EFE6",
  "--pq-cream-muted": "#C9B79C",

  // Status
  "--pq-danger": "#EF4444",
  "--pq-danger-soft": "#7F1D1D",
  "--pq-info": "#3B82F6",

  // Type families
  "--pq-font-display": "'Manrope', system-ui, sans-serif",
  "--pq-font-serif": "'Cormorant Garamond', Georgia, serif",
  "--pq-font-body": "'Inter', system-ui, sans-serif",
  "--pq-font-mono": "'IBM Plex Mono', ui-monospace, monospace",

  // Radius scale
  "--pq-r-sm": "4px",
  "--pq-r-md": "8px",
  "--pq-r-lg": "12px",
  "--pq-r-xl": "16px",
  "--pq-r-2xl": "20px",
  "--pq-r-full": "9999px",

  // Motion
  "--pq-ease": "cubic-bezier(0.22, 1, 0.36, 1)",
};
