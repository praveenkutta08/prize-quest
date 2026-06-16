import { css } from "lit";

/**
 * `<pq-reward-select>` styles — the reward-selection screen body. The pinned
 * GREEN progress strip (`.rwd-prog`) mirrors Section B.3 of the direction
 * preview (campaign won → complete state). The reward grid is the shared
 * `<pq-list-carousel>` of `<pq-reward-card>` (each self-styled).
 */
export const styles = css`
  :host {
    display: block;
  }
  .rwd-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 2px 2px 10px;
    min-height: 0;
  }
  .empty {
    padding: 16px;
    color: var(--arc-text-dim, #d0bfec);
    font-family: var(--arc-font-body, sans-serif);
    font-size: 12px;
    text-align: center;
  }

  /* Pinned complete-state progress strip — uses the SAME orange→yellow palette as
     every other progress bar (campaign card / detail / kiosk) so the colour is
     consistent across all screens. */
  .rwd-prog {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 6px 9px 7px;
    background: linear-gradient(
      180deg,
      rgba(255, 217, 61, 0.16),
      rgba(255, 217, 61, 0.05)
    );
    border: 1px solid var(--arc-hairline-2, rgba(255, 217, 61, 0.45));
    border-radius: 6px;
    position: relative;
    overflow: hidden;
  }
  .rwd-prog::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      var(--cat-orange-deep, #ff6b1a),
      var(--arc-display, #ffd93d),
      var(--arc-display-bright, #ffee5c)
    );
  }
  .rwd-prog__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .rwd-prog__label {
    font-family: var(--arc-font-mono, monospace);
    font-size: 7.5px;
    font-weight: 700;
    color: var(--arc-display, #ffd93d);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .rwd-prog__val {
    font-family: var(--arc-font-display, "Manrope", sans-serif);
    font-weight: 900;
    font-size: 11px;
    color: var(--arc-cream, #f5efe0);
    letter-spacing: 0.01em;
    white-space: nowrap;
  }
  .rwd-prog__val strong {
    color: var(--arc-display-bright, #ffee5c);
  }
  .rwd-prog__cta {
    font-family: var(--arc-font-display, "Manrope", sans-serif);
    font-weight: 800;
    font-size: 9px;
    color: var(--arc-display, #ffd93d);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    padding: 1.5px 8px;
    background: rgba(255, 217, 61, 0.18);
    border: 1px solid var(--arc-display, #ffd93d);
    border-radius: 999px;
    box-shadow: 0 0 8px var(--arc-display-glow, rgba(255, 217, 61, 0.35));
    white-space: nowrap;
  }
  /* Complete-state SHIMMER bar (replaces the 5 segmented checks): a full green fill
     with a sweeping sheen, mirroring the campaign-card shimmer treatment. */
  .rwd-prog__bar {
    position: relative;
    height: 11px;
    border-radius: 999px;
    background: rgba(15, 4, 46, 0.7);
    border: 1px solid var(--arc-hairline-2, rgba(255, 217, 61, 0.45));
    overflow: hidden;
  }
  .rwd-prog__fill {
    position: absolute;
    inset: 0;
    border-radius: 999px;
    transform-origin: left center;
    background: linear-gradient(
      90deg,
      var(--cat-orange-deep, #ff6b1a) 0%,
      var(--arc-display, #ffd93d) 50%,
      var(--arc-display-bright, #ffee5c) 100%
    );
    box-shadow: 0 0 8px var(--arc-display-glow, rgba(255, 217, 61, 0.55)),
      inset 0 0 3px rgba(255, 255, 255, 0.3);
  }
  .rwd-prog__fill::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 20%,
      rgba(255, 255, 255, 0.55) 50%,
      transparent 80%
    );
  }
  @media (prefers-reduced-motion: no-preference) {
    /* Grow from empty → full once on mount, then loop the shimmer sheen. */
    .rwd-prog__fill {
      animation: pq-prog-grow 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .rwd-prog__fill::after {
      animation: shimmer 2.2s ease-in-out infinite;
    }
  }
  @keyframes pq-prog-grow {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }

  pq-list-carousel {
    --carousel-gutter: 42px;
  }
`;
