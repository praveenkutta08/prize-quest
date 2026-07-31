import { css } from "lit";

/**
 * Scoped styles for `<pq-prize-tile>`. State is driven by the reflected `state`
 * attribute (`selectable` | `locked` | `oos`) and the `selected` attribute. All
 * colors from `--pq-*` tokens. Visual reference: `.pcard` (prize grid, screen 02/03).
 */
export const styles = css`
  :host {
    display: block;
  }

  .tile {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 12px;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-lg, 12px);
    background: linear-gradient(180deg, var(--pq-navy-low, #143352) 0%, rgba(20, 51, 82, 0.6) 100%);
    transition:
      transform 200ms var(--pq-ease, ease),
      border-color 200ms var(--pq-ease, ease);
    outline: none;
  }

  :host([state="selectable"]) .tile {
    cursor: pointer;
  }
  :host([state="selectable"]) .tile:hover {
    transform: translateY(-2px);
    border-color: var(--pq-gold-bright, #fcbf49);
  }
  :host(:focus-visible) .tile {
    outline: 2px solid var(--pq-gold-bright, #fcbf49);
    outline-offset: 2px;
  }

  /* selected */
  :host([selected]) .tile {
    border-color: var(--pq-gold-bright, #fcbf49);
    box-shadow:
      0 0 0 1px var(--pq-gold-bright, #fcbf49),
      0 8px 20px -8px rgba(252, 191, 73, 0.4);
  }

  .img {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: var(--pq-r-sm, 4px);
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(circle at 50% 50%, rgba(252, 191, 73, 0.1) 0%, transparent 60%),
      var(--pq-navy-deep, #0a1a2e);
    margin-bottom: 10px;
  }
  .img svg {
    width: 40%;
    height: 40%;
    color: var(--pq-gold-bright, #fcbf49);
    opacity: 0.85;
  }

  .value {
    position: absolute;
    top: 8px;
    right: 8px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: var(--pq-r-full, 9999px);
    background: rgba(10, 26, 46, 0.85);
    color: var(--pq-gold-bright, #fcbf49);
  }

  .check {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--pq-gold-bright, #fcbf49);
    color: var(--pq-navy-deep, #0a1a2e);
    display: none;
    align-items: center;
    justify-content: center;
  }
  .check svg {
    width: 12px;
    height: 12px;
  }
  :host([selected]) .check {
    display: flex;
  }

  .name {
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 13px;
    margin: 0 0 2px;
    color: var(--pq-text, #f1f5f9);
  }
  .cat {
    font-size: 11px;
    color: var(--pq-text-muted, #94a3b8);
    margin: 0 0 8px;
  }
  .meta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    letter-spacing: 0.02em;
    color: var(--pq-emerald, #10b981);
  }

  /* locked */
  :host([state="locked"]) .name,
  :host([state="locked"]) .cat {
    filter: blur(2.5px);
    opacity: 0.5;
    user-select: none;
  }
  :host([state="locked"]) .value {
    color: var(--pq-text-muted, #94a3b8);
  }
  :host([state="locked"]) .meta {
    color: var(--pq-text-muted, #94a3b8);
  }
  .lock {
    position: absolute;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
  }
  .lock span {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(10, 26, 46, 0.85);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    color: var(--pq-text-muted, #94a3b8);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .lock svg {
    width: 14px;
    height: 14px;
  }
  :host([state="locked"]) .lock {
    display: flex;
  }

  /* out of stock */
  :host([state="oos"]) .tile {
    opacity: 0.45;
    cursor: not-allowed;
  }
  :host([state="oos"]) .img svg {
    color: var(--pq-text-faint, #64748b);
  }
  :host([state="oos"]) .value {
    color: var(--pq-text-faint, #64748b);
  }
  :host([state="oos"]) .meta {
    color: var(--pq-danger, #ef4444);
  }

  /* ====================== COMPACT (ref .prize-tile) ======================
     Selectable = horizontal 48px img + name + value, check overlay top-right.
     Locked = column with lock icon, dimmed name, no value. Premium-safe colors. */
  :host([profile="compact"]) .tile {
    flex-direction: row;
    align-items: center;
    gap: 5px;
    padding: 4px 6px;
    border-radius: 4px;
    border: 1px solid var(--cl-burgundy, var(--pq-navy-hairline, #2a4f7a));
    background: linear-gradient(
      180deg,
      var(--cl-wine-elev, var(--pq-navy-low, #143352)),
      var(--cl-wine, var(--pq-navy-base, #102a43))
    );
  }
  :host([profile="compact"]) .img {
    width: 48px;
    height: 48px;
    flex: 0 0 auto;
    aspect-ratio: auto;
    margin-bottom: 0;
    border-radius: 3px;
    border: 1px solid var(--cl-gold-glow, rgba(42, 79, 122, 0.4));
    background: radial-gradient(
      circle,
      var(--cl-gold-glow, rgba(252, 191, 73, 0.18)),
      rgba(6, 3, 10, 0.85)
    );
  }
  :host([profile="compact"]) .img svg {
    width: 22px;
    height: 22px;
  }
  :host([profile="compact"]) .info {
    flex: 1;
    min-width: 0;
  }
  :host([profile="compact"]) .name {
    font-size: 10px;
    line-height: 1.05;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  :host([profile="compact"]) .val {
    font-family: var(--pq-font-mono, monospace);
    font-size: 8px;
    font-weight: 700;
    margin: 1px 0 0;
    color: var(--cl-gold, var(--pq-gold-bright, #fcbf49));
  }
  :host([profile="compact"]) .check {
    top: 2px;
    right: 2px;
    left: auto;
    width: 12px;
    height: 12px;
  }
  :host([profile="compact"]) .check svg {
    width: 7px;
    height: 7px;
  }
  /* compact locked tile */
  :host([profile="compact"][state="locked"]) .tile {
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    gap: 3px;
    text-align: center;
    border-style: dashed;
  }
  :host([profile="compact"][state="locked"]) .img {
    width: 100%;
    height: 28px;
  }
  :host([profile="compact"][state="locked"]) .img svg {
    width: 16px;
    height: 16px;
    color: var(--cl-gold-deep, var(--pq-text-muted, #94a3b8));
  }
  :host([profile="compact"][state="locked"]) .name {
    white-space: normal;
    font-size: 9px;
    line-height: 1.15;
    color: var(--cl-text-dim, var(--pq-text-muted, #94a3b8));
    /* override the standard locked blur for the compact preview tile */
    filter: none;
    opacity: 1;
  }
  :host([profile="compact"]) .lock-pin {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: auto;
    color: var(--pq-text-faint, #64748b);
  }
  :host([profile="compact"]) .lock-pin svg {
    width: 9px;
    height: 9px;
  }

  /* ====================== EXPANDED (ref .prize-card) ======================
     Roomy arcade prize card: per-category top accent, image well, category pill,
     name, value + stock meta row, full-width Claim CTA. Locked drops the CTA,
     dims the image, overlays a 64px lock, and swaps stock for a Locked pill.
     Per-category tint vars are set by the tile--<color> modifier classes below. */
  :host([profile="expanded"]) .tile {
    position: relative;
    padding: 28px;
    gap: 18px;
    overflow: hidden;
    border: 1px solid var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    border-radius: var(--arc-r-xl, var(--pq-r-xl, 28px));
    background: linear-gradient(
      160deg,
      var(--arc-surface-1, rgba(60, 25, 110, 0.7)),
      var(--arc-surface-2, rgba(30, 10, 60, 0.85))
    );
  }
  :host([profile="expanded"]) .tile::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: var(--cat-tint, var(--cat-purple, #8e47e8));
  }

  /* image well */
  :host([profile="expanded"]) .img {
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: var(--arc-r-lg, var(--pq-r-lg, 20px));
    margin-bottom: 0;
    border: 1px solid rgba(255, 255, 255, 0.05);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  }
  :host([profile="expanded"]) .img svg {
    width: 40%;
    height: 40%;
    color: var(--cat-tint-bright, var(--cat-purple-bright, #b47bff));
    opacity: 0.9;
  }

  /* category pill */
  :host([profile="expanded"]) .cat-pill {
    align-self: flex-start;
    padding: 6px 14px;
    border-radius: var(--arc-r-pill, var(--pq-r-full, 9999px));
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    background: var(--cat-tint-bg, rgba(142, 71, 232, 0.22));
    color: var(--cat-tint-bright, var(--cat-purple-bright, #b47bff));
    border: 1px solid var(--cat-tint, var(--cat-purple, #8e47e8));
  }

  /* name */
  :host([profile="expanded"]) .name {
    font-family: var(--pq-font-display, sans-serif);
    font-size: 24px;
    line-height: 1.1;
    margin: 0;
    text-transform: uppercase;
    color: var(--pq-text, #f1f5f9);
  }

  /* meta row: value + stock */
  :host([profile="expanded"]) .meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  :host([profile="expanded"]) .val {
    font-family: var(--pq-font-display, sans-serif);
    font-size: 28px;
    color: var(--arc-display, var(--pq-accent, #fcbf49));
  }
  :host([profile="expanded"]) .stock {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--arc-success, var(--pq-emerald, #10b981));
  }
  :host([profile="expanded"]) .stock::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--arc-success, var(--pq-emerald, #10b981));
  }

  /* CTA */
  :host([profile="expanded"]) .cta {
    margin-top: auto;
    width: 100%;
    padding: 16px 24px;
    border: none;
    border-radius: var(--arc-r-md, var(--pq-r-md, 12px));
    cursor: pointer;
    font-family: var(--pq-font-display, sans-serif);
    font-size: 16px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #fff;
    background: linear-gradient(
      180deg,
      var(--cat-tint, var(--cat-purple, #8e47e8)),
      var(--cat-tint-deep, var(--cat-purple-deep, #6b2dd0))
    );
    box-shadow:
      0 4px 0 var(--cat-tint-deep, var(--cat-purple-deep, #6b2dd0)),
      0 8px 24px var(--cat-tint-bg, rgba(142, 71, 232, 0.4)),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
    transition: transform 200ms var(--pq-ease, ease);
  }
  :host([profile="expanded"]) .cta:active {
    transform: translateY(2px);
  }

  /* lock overlay (hidden unless locked) */
  :host([profile="expanded"]) .lock-overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--pq-text, #f1f5f9);
  }
  :host([profile="expanded"]) .lock-overlay svg {
    width: 64px;
    height: 64px;
    opacity: 1;
  }
  :host([profile="expanded"]) .stock-locked {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--arc-text-faint, var(--pq-text-faint, #64748b));
  }
  :host([profile="expanded"]) .stock-locked svg {
    width: 12px;
    height: 12px;
  }

  /* locked variant */
  :host([profile="expanded"][state="locked"]) .tile {
    opacity: 0.65;
  }
  :host([profile="expanded"][state="locked"]) .img svg {
    opacity: 0.4;
  }

  /* per-category modifier classes — map the resolved color to the tint vars.
     Default (purple) covers any unmapped category. */
  :host([profile="expanded"]) .tile--purple {
    --cat-tint: var(--cat-purple, #8e47e8);
    --cat-tint-bg: var(--cat-purple-glow, rgba(142, 71, 232, 0.22));
    --cat-tint-bright: var(--cat-purple-bright, #b47bff);
    --cat-tint-deep: var(--cat-purple-deep, #6b2dd0);
  }
  :host([profile="expanded"]) .tile--blue {
    --cat-tint: var(--cat-blue, #3d8bf5);
    --cat-tint-bg: var(--cat-blue-glow, rgba(61, 139, 245, 0.22));
    --cat-tint-bright: var(--cat-blue-bright, #6fb2ff);
    --cat-tint-deep: var(--cat-blue-deep, #1f6fe6);
  }
  :host([profile="expanded"]) .tile--orange {
    --cat-tint: var(--cat-orange, #ff8c2c);
    --cat-tint-bg: var(--cat-orange-glow, rgba(255, 140, 44, 0.22));
    --cat-tint-bright: var(--cat-orange-bright, #ffb066);
    --cat-tint-deep: var(--cat-orange-deep, #ff6b1a);
  }
  :host([profile="expanded"]) .tile--pink {
    --cat-tint: var(--cat-pink, #ff3fa4);
    --cat-tint-bg: var(--cat-pink-glow, rgba(255, 63, 164, 0.22));
    --cat-tint-bright: var(--cat-pink-bright, #ff6fb5);
    --cat-tint-deep: var(--cat-pink-deep, #e91e63);
  }
  :host([profile="expanded"]) .tile--green {
    --cat-tint: var(--cat-green, #34d670);
    --cat-tint-bg: var(--cat-green-glow, rgba(52, 214, 112, 0.22));
    --cat-tint-bright: var(--cat-green-bright, #5be389);
    --cat-tint-deep: var(--cat-green-deep, #16a34a);
  }
  :host([profile="expanded"]) .tile--teal {
    --cat-tint: var(--cat-teal, #2dd4bf);
    --cat-tint-bg: var(--cat-teal-glow, rgba(45, 212, 191, 0.22));
    --cat-tint-bright: var(--cat-teal-bright, #5eead4);
    --cat-tint-deep: var(--cat-teal-deep, #14b8a6);
  }

  /* ===== casino-loud ===== */
  :host-context([data-pq-mode="casino-loud"]) .name {
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  /* selected tile: extra gold glow (premium-safe — transparent fallback). */
  :host([selected]) .tile {
    box-shadow:
      0 0 0 1px var(--pq-gold-bright, #fcbf49),
      0 8px 20px -8px rgba(252, 191, 73, 0.4),
      0 0 12px var(--cl-gold-glow, transparent);
  }
  /* locked tile: dashed casino frame (chained host-context + host state). */
  :host-context([data-pq-mode="casino-loud"]):host([state="locked"]) .tile {
    border-style: dashed;
    background: linear-gradient(180deg, rgba(31, 8, 21, 0.55), rgba(15, 4, 11, 0.7));
  }

  /* ====================== ARCADE MODE (CSS only) ======================
     Mode is the second axis: pure presentation on top of any profile. Keyframes
     (shimmer/float/pulse-glow/burst-in) are global in arcade.css — referenced by
     name. Ambient motion is gated behind prefers-reduced-motion: no-preference. */
  :host-context([data-pq-mode="arcade"]) .name {
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  /* expanded card under arcade: selectable hover lift toward the category tint */
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"][state="selectable"])
    .tile:hover {
    transform: translateY(-4px);
    border-color: var(--cat-tint, var(--cat-purple, #8e47e8));
    box-shadow: 0 16px 40px -16px var(--cat-tint-bg, rgba(142, 71, 232, 0.4));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"]:focus-visible) .tile {
    outline-color: var(--cat-tint-bright, var(--cat-purple-bright, #b47bff));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"][selected]) .tile {
    border-color: var(--cat-tint, var(--cat-purple, #8e47e8));
    box-shadow:
      0 0 0 1px var(--cat-tint, var(--cat-purple, #8e47e8)),
      0 0 32px var(--cat-tint-bg, rgba(142, 71, 232, 0.4));
  }

  @media (prefers-reduced-motion: no-preference) {
    /* ambient sheen sweeping the image well of an arcade expanded card */
    :host-context([data-pq-mode="arcade"]):host([profile="expanded"]) .img::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        100deg,
        transparent 35%,
        rgba(255, 255, 255, 0.12) 50%,
        transparent 65%
      );
      animation: shimmer 4.5s ease-in-out infinite;
      pointer-events: none;
    }
    /* selected arcade card pulses with its category glow */
    :host-context([data-pq-mode="arcade"]):host([profile="expanded"][selected]) .tile {
      animation: pulse-glow 2.4s ease-in-out infinite;
    }
  }

  /* ====================== ARCADE COMPACT (ref .prize-tile) ======================
     Mirrors the casino-loud compact treatment, swapping casino-loud→arcade. Pure
     presentation on top of the compact layout: arcade gradient + hairline tile,
     per-category top accent (reusing the --cat-tint / --cat-purple var the widget
     already uses, falling back to purple when no inline tint is set), arcade-display
     name/value, green --arc-success selected check, and a muted lock treatment with
     a danger-red lock pin for the locked tile. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .tile {
    gap: 5px;
    padding: 4px;
    border-radius: var(--arc-r-sm, 4px);
    border: 1px solid var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    background: linear-gradient(
      160deg,
      var(--arc-surface-1, rgba(60, 25, 110, 0.55)),
      var(--arc-surface-2, rgba(30, 10, 60, 0.75))
    );
    overflow: hidden;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .tile::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--cat-tint, var(--cat-purple, #8e47e8));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .img {
    width: 36px;
    height: 36px;
    border-radius: 3px;
    border: none;
    background: var(--arc-surface-0, rgba(15, 4, 46, 0.6));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .img svg {
    width: 80%;
    height: 80%;
    color: var(--cat-tint-bright, var(--cat-purple-bright, #b47bff));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .name {
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 9px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    line-height: 1.05;
    color: var(--arc-cream, var(--pq-text, #f1f5f9));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .val {
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-size: 9px;
    font-weight: var(--arc-font-display-weight, 800);
    color: var(--arc-display, var(--pq-accent, #fcbf49));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .check {
    top: 3px;
    right: 3px;
    left: auto;
    width: 12px;
    height: 12px;
    background: var(--arc-success, var(--pq-emerald, #10b981));
    color: #fff;
    box-shadow: 0 0 6px rgba(52, 214, 112, 0.6);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .check svg {
    width: 8px;
    height: 8px;
  }

  /* arcade compact locked tile: dimmed, muted hairline, danger lock pin, no value */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][state="locked"]) .tile {
    opacity: 0.7;
    border-color: var(--arc-text-mute, var(--pq-text-muted, #94a3b8));
    border-style: solid;
    cursor: default;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][state="locked"]) .tile::before {
    background: var(--arc-text-mute, var(--pq-text-muted, #94a3b8));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][state="locked"]) .img {
    width: 100%;
    height: 24px;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][state="locked"]) .img svg {
    color: var(--arc-text-mute, var(--pq-text-muted, #94a3b8));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][state="locked"]) .name {
    color: var(--arc-text-mute, var(--pq-text-muted, #94a3b8));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .lock-pin {
    color: var(--arc-danger, var(--pq-danger, #ef4444));
  }
`;
