import { css } from "lit";

/**
 * `<pq-reward-card>` styles — mirrors `.rwd-card` / `.rwd-card--<rarity>` in
 * prize-quest-direction-preview.html. Rarity is reflected to the host attribute;
 * the rarity ramp (`--rarity` / `--rarity-glow`) is set per `:host([rarity=…])`
 * and consumed by the card border, top stripe, glow and tier label.
 */
export const styles = css`
  :host {
    display: block;
    height: 100%;
    min-height: 118px;
    --rarity: var(--arc-text-faint, #8b7aaa);
    --rarity-glow: rgba(139, 122, 170, 0.18);
  }
  :host-context([data-formfactor^="iview"]) {
    min-height: 200px;
  }
  :host-context([data-formfactor^="iview"]) .art {
    height: 64px;
    font-size: 40px;
  }
  :host-context([data-formfactor^="iview"]) .name {
    font-size: 13px;
    min-height: 30px;
  }
  :host-context([data-formfactor^="iview"]) .val {
    font-size: 20px;
  }
  :host-context([data-formfactor^="iview"]) .tier {
    font-size: 9px;
  }
  :host([rarity="common"]) {
    --rarity: #c0c0c8;
    --rarity-glow: rgba(192, 192, 200, 0.18);
  }
  :host([rarity="rare"]) {
    --rarity: #6fa4ff;
    --rarity-glow: rgba(111, 164, 255, 0.3);
  }
  :host([rarity="epic"]) {
    --rarity: #b47bff;
    --rarity-glow: rgba(180, 123, 255, 0.4);
  }
  :host([rarity="legendary"]) {
    --rarity: var(--arc-display, #ffd93d);
    --rarity-glow: rgba(255, 217, 61, 0.5);
  }

  .rwd-card {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    text-align: center;
    /* Card surface defaults to the dark showcase gradient; a light tenant (e.g.
       aria-style) overrides --rwd-card-bg so the dark name text reads on a light card. */
    background: var(
      --rwd-card-bg,
      linear-gradient(
        165deg,
        var(--arc-surface-2, rgba(40, 15, 75, 0.85)),
        var(--arc-surface-0, rgba(20, 8, 40, 0.95))
      )
    );
    border: 1.5px solid var(--rarity);
    border-radius: 7px;
    padding: 6px 5px 5px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 10px var(--rarity-glow);
    cursor: pointer;
    font: inherit;
    color: inherit;
  }
  .rwd-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--rarity);
  }
  .rwd-card:disabled {
    cursor: default;
    opacity: 0.55;
  }

  .art {
    display: grid;
    place-items: center;
    height: 38px;
    font-size: 24px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
    margin-bottom: 2px;
  }
  .art img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }

  .name {
    font-family: var(--arc-font-display, "Manrope", sans-serif);
    font-weight: 900;
    font-size: 9.5px;
    color: var(--arc-cream, #f5efe0);
    letter-spacing: 0.01em;
    text-transform: uppercase;
    line-height: 1.1;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 22px;
  }

  .val {
    font-family: var(--arc-font-display, "Manrope", sans-serif);
    font-weight: 900;
    font-size: 14px;
    background: linear-gradient(180deg, #ffee5c 0%, #ffd93d 50%, #ff8c2c 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 6px rgba(255, 217, 61, 0.45));
    margin-top: auto;
    line-height: 1;
  }

  .tier {
    font-family: var(--arc-font-mono, "JetBrains Mono", monospace);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--rarity);
    margin-top: 3px;
    padding-top: 3px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  /* ═══════════ WIDE · full-width product well (reward-selection screen) ═══════════
     One prize per carousel page. Art sits in a lit square well like a product shot;
     the copy and the action button take the rest. No price is rendered in this
     layout — the prize is already earned. */
  :host([layout="wide"]) {
    min-height: 150px;
  }
  .rwd-wide {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    /* Fills the screen body so no dead band opens between the card and the dots. */
    min-height: 150px;
    display: grid;
    grid-template-columns: 104px 1fr;
    gap: 12px;
    align-items: center;
    padding: 11px 13px;
    text-align: left;
    border: 1px solid var(--arc-hairline-2, rgba(255, 217, 61, 0.35));
    border-radius: 9px;
    background: linear-gradient(150deg, var(--arc-bg-elev, #2a1454), var(--arc-bg-deep, #15042e));
    box-shadow: 0 8px 24px -10px rgba(0, 0, 0, 0.6);
    cursor: pointer;
    font: inherit;
    color: inherit;
  }
  .rwd-wide[disabled] {
    cursor: default;
    opacity: 0.55;
  }
  /* LOCKED preview: the prize stays at full strength — the patron should want it —
     only the action reads unavailable. Overrides the generic disabled dimming. */
  :host([locked]) .rwd-wide[disabled] {
    opacity: 1;
  }
  .wide-art {
    position: relative;
    aspect-ratio: 1;
    border-radius: 8px;
    display: grid;
    place-items: center;
    font-size: 42px;
    line-height: 1;
    background:
      radial-gradient(
        ellipse at 50% 30%,
        var(--arc-glow-soft, rgba(255, 217, 61, 0.16)),
        transparent 65%
      ),
      rgba(255, 255, 255, 0.045);
    border: 1px solid var(--arc-hairline, rgba(160, 180, 215, 0.2));
  }
  .wide-art::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 8px;
    box-shadow: inset 0 0 22px var(--arc-glow-soft, rgba(255, 217, 61, 0.16));
    pointer-events: none;
  }
  .wide-art img {
    width: 78%;
    height: 78%;
    object-fit: contain;
  }
  .wide-body {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .wide-name {
    margin: 0;
    font-family: var(--arc-font-display, "Manrope", sans-serif);
    font-weight: var(--arc-font-display-weight, 900);
    font-size: 19px;
    line-height: 1.05;
    letter-spacing: 0.005em;
    text-transform: uppercase;
    color: var(--arc-cream, #f5efe0);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .wide-sub {
    margin: 0;
    font-family: var(--arc-font-body, "Inter", sans-serif);
    font-size: 9.5px;
    line-height: 1.35;
    color: var(--arc-text-dim, #d0bfec);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .wide-row {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 2px;
  }
  /* Rendered as a <span> inside the card button — a nested <button> would be an
     invalid interactive descendant. The whole card is the hit target. */
  .wide-cta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 16px;
    border-radius: 5px;
    font-family: var(--arc-font-display, "Manrope", sans-serif);
    font-weight: var(--arc-font-display-weight, 900);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--arc-bg-deep, #15042e);
    background: linear-gradient(
      180deg,
      var(--arc-display-bright, #ffee5c),
      var(--arc-display, #ffd93d) 55%,
      var(--arc-display-deep, #e0b71b)
    );
    box-shadow: 0 2px 10px var(--arc-glow-soft, rgba(255, 217, 61, 0.28));
  }
  .rwd-wide[disabled] .wide-cta {
    background: var(--arc-bg-elev, #2a1454);
    color: var(--arc-text-faint, #8b7aaa);
    box-shadow: none;
  }
  .wide-stock {
    font-family: var(--arc-font-mono, monospace);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 3px;
    white-space: nowrap;
    color: var(--arc-display, #ffd93d);
    border: 1px solid var(--arc-hairline-2, rgba(255, 217, 61, 0.35));
    background: var(--arc-glow-soft, rgba(255, 217, 61, 0.16));
  }
  .rwd-wide[disabled] .wide-stock {
    color: var(--arc-text-faint, #8b7aaa);
    border-color: var(--arc-hairline, rgba(160, 180, 215, 0.2));
    background: transparent;
  }
  /* iVIEW (1024×600) — the well and copy scale with the bigger card. */
  :host-context([data-formfactor^="iview"]) .rwd-wide {
    grid-template-columns: 300px 1fr;
    gap: 36px;
    padding: 30px 40px;
    min-height: 466px;
  }
  :host-context([data-formfactor^="iview"]) .wide-art {
    font-size: 92px;
    border-radius: 14px;
  }
  :host-context([data-formfactor^="iview"]) .wide-name {
    font-size: 38px;
  }
  :host-context([data-formfactor^="iview"]) .wide-sub {
    font-size: 17px;
  }
  :host-context([data-formfactor^="iview"]) .wide-cta {
    font-size: 18px;
    padding: 12px 30px;
    border-radius: 8px;
  }
  :host-context([data-formfactor^="iview"]) .wide-stock {
    font-size: 12px;
    padding: 5px 11px;
  }
`;
