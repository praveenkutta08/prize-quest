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
      linear-gradient(165deg, rgba(40, 15, 75, 0.85), rgba(20, 8, 40, 0.95))
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
`;
