import { css } from "lit";

/**
 * Scoped styles for `<pq-status-pill>`: a mono uppercase label + a 5px dot.
 * No backgrounds, gradients, or borders — just text + dot, both tinted by the
 * per-variant `--pq-pill-color` (mapped to tenant tokens, so they re-theme live).
 *
 * Token palette (per spec): emerald · cream-muted · info · danger · text-faint.
 */
export const styles = css`
  :host {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    font-weight: 500;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--pq-pill-color, var(--pq-text-muted, #94a3b8));
    /* default tint; overridden per variant below */
    --pq-pill-color: var(--pq-text-faint, #64748b);
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex: 0 0 auto;
    background: var(--pq-pill-color);
  }

  :host([variant="eligible"]) {
    --pq-pill-color: var(--pq-emerald, #10b981);
  }
  :host([variant="in-progress"]) {
    --pq-pill-color: var(--pq-info, #3b82f6);
  }
  :host([variant="expired"]) {
    --pq-pill-color: var(--pq-text-faint, #64748b);
  }
  :host([variant="claimed"]) {
    --pq-pill-color: var(--pq-cream-muted, #c9b79c);
  }
  :host([variant="shipped"]) {
    --pq-pill-color: var(--pq-info, #3b82f6);
  }
  :host([variant="delivered"]) {
    --pq-pill-color: var(--pq-emerald, #10b981);
  }
  :host([variant="locked"]) {
    --pq-pill-color: var(--pq-text-faint, #64748b);
  }
  :host([variant="danger"]) {
    --pq-pill-color: var(--pq-danger, #ef4444);
  }

  /* ===== casino-loud — solid glossy pills (dark text, no dot). The per-variant
     --pq-pill-color already remaps to the casino palette. ===== */
  :host-context([data-pq-mode="casino-loud"]) {
    padding: 2px 8px;
    border-radius: 999px;
    font-weight: 700;
    background-color: var(--pq-pill-color);
    background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(0, 0, 0, 0.12));
    color: var(--cl-black, #06030a);
  }
  :host-context([data-pq-mode="casino-loud"]) .dot {
    display: none;
  }

  /* =====================================================================
     PROFILE axis — expanded. Layout/sizes only, driven by --pq-* fallbacks.
     compact + standard keep the legacy dot+label above untouched; the
     expanded template swaps the 5px dot for a 16px glyph and a display-font
     label. The neon gradient/border/glow per variant lives in the ARCADE
     MODE block at the very end of this file.
     ===================================================================== */
  :host([profile="expanded"]) {
    gap: 8px;
    padding: 8px 18px;
    border-radius: var(--arc-r-pill, 999px);
    font-family: var(--pq-font-display, var(--pq-font-mono, monospace));
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--pq-pill-color, var(--pq-text-muted, #94a3b8));
  }
  :host([profile="expanded"]) .icon {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    flex: 0 0 auto;
    background: var(--pq-pill-color);
  }

  /* =====================================================================
     ARCADE MODE — CSS-only, gated on [data-pq-mode="arcade"]. The expanded
     pill picks up neon gradients, a 1px variant border, and a soft glow.
     Each status variant maps onto one of the reference's 5 pill families
     (success · danger · warning · info · ghost) entirely in CSS, so no
     mode/profile branching is needed in TS.
     ===================================================================== */
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"]) {
    border: 1px solid var(--pq-pill-color);
    background-image: linear-gradient(
      135deg,
      color-mix(in srgb, var(--pq-pill-color) 22%, transparent),
      color-mix(in srgb, var(--pq-pill-color) 38%, transparent)
    );
    box-shadow: 0 0 18px color-mix(in srgb, var(--pq-pill-color) 30%, transparent);
  }

  /* success family (eligible / delivered) — green */
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"][variant="eligible"]),
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"][variant="delivered"]) {
    --pq-pill-color: var(--arc-success, var(--pq-success, #34d670));
  }
  /* danger family — red */
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"][variant="danger"]) {
    --pq-pill-color: var(--arc-danger, var(--pq-danger, #ff4d6d));
  }
  /* warning family (claimed) — gold / display */
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"][variant="claimed"]) {
    --pq-pill-color: var(--arc-display, var(--pq-warning, #ffd93d));
  }
  /* info family (in-progress / shipped) — blue */
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"][variant="in-progress"]),
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"][variant="shipped"]) {
    --pq-pill-color: var(--arc-info, var(--pq-info, #4a8fe6));
  }
  /* ghost family (expired / locked) — glass bg, mono 11px, no gradient/glow */
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"][variant="expired"]),
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"][variant="locked"]) {
    --pq-pill-color: var(--arc-text-dim, var(--pq-text-muted, #d0bfec));
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.18em;
    border-color: var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
    background-image: none;
    background-color: var(--arc-bg-glass, var(--arc-surface-1, rgba(60, 25, 110, 0.5)));
    box-shadow: none;
  }

  @media (prefers-reduced-motion: no-preference) {
    :host-context([data-pq-mode="arcade"]):host([profile="expanded"]) {
      transition: box-shadow 200ms ease;
    }
  }

  /* =====================================================================
     ARCADE MODE — COMPACT (TTD 480×234). CSS-only, gated on
     [data-pq-mode="arcade"] + [profile="compact"]. Renders the legacy
     dot + .label as the reference .arc-pill: a tiny rounded gradient
     chip (display font, 9px, uppercase) with a 1px variant border. The
     per-variant --pq-pill-color already remaps to the arc palette below,
     mirroring the expanded variant→intent map (success · danger ·
     warning · info · ghost). Append-only; base + casino-loud untouched.
     ===================================================================== */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) {
    gap: 4px;
    padding: 3px 8px;
    border-radius: 999px;
    font-family: var(--arc-font-display, var(--pq-font-display, var(--pq-font-mono, monospace)));
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.06em;
    border: 1px solid var(--pq-pill-color);
    color: var(--pq-pill-color);
    background-image: linear-gradient(
      135deg,
      color-mix(in srgb, var(--pq-pill-color) 22%, transparent),
      color-mix(in srgb, var(--pq-pill-color) 38%, transparent)
    );
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .dot {
    width: 8px;
    height: 8px;
  }

  /* success family (eligible / delivered) — green */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][variant="eligible"]),
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][variant="delivered"]) {
    --pq-pill-color: var(--arc-success, var(--pq-success, #34d670));
  }
  /* danger family — red */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][variant="danger"]) {
    --pq-pill-color: var(--arc-danger, var(--pq-danger, #ff4d6d));
  }
  /* warning family (claimed) — gold / display */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][variant="claimed"]) {
    --pq-pill-color: var(--arc-display, var(--pq-warning, #ffd93d));
  }
  /* info family (in-progress / shipped) — blue */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][variant="in-progress"]),
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][variant="shipped"]) {
    --pq-pill-color: var(--arc-info, var(--pq-info, #4a8fe6));
  }
  /* ghost family (expired / locked) — glass bg, mono 8px, no gradient */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][variant="expired"]),
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][variant="locked"]) {
    --pq-pill-color: var(--arc-text-dim, var(--pq-text-muted, #d0bfec));
    font-family: var(--arc-font-mono, var(--pq-font-mono, monospace));
    font-size: 8px;
    letter-spacing: 0.14em;
    border-color: var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
    background-image: none;
    background-color: var(--arc-bg-glass, var(--arc-surface-1, rgba(60, 25, 110, 0.5)));
  }

  /* ===== iVIEW (1024x600 + 800x480) — scale compact up for touch ===== */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) {
    padding: 6px 14px;
    font-size: 12px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .dot {
    width: 12px;
    height: 12px;
  }
`;
