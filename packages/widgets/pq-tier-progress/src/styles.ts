import { css } from "lit";

/** Scoped styles for `<pq-tier-progress>`. Visual reference: `.x01-tier-chip`. */
export const styles = css`
  :host {
    display: inline-block;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-full, 9999px);
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    font-weight: 500;
    color: var(--pq-cream, #f5efe6);
  }
  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--pq-cream-muted, #c9b79c);
  }
  .sub {
    font-size: 10px;
    font-weight: 400;
    color: var(--pq-text-muted, #94a3b8);
    padding-left: 10px;
    border-left: 1px solid var(--pq-navy-hairline, #2a4f7a);
  }
  .bar {
    display: block;
    width: 140px;
    margin-top: 8px;
  }

  /* ===== expanded — glass "Status" pill (kiosk/arcade). Base sizing only;
     mode tint lives in the data-pq-mode="arcade" block below. ===== */
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 8px 18px 8px 12px;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-full, 9999px);
    background: var(--pq-glass-bg, rgba(20, 38, 64, 0.6));
  }
  .pill-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: linear-gradient(
      135deg,
      var(--pq-gold, #ffd93d),
      var(--pq-gold-2, #ff8c2c)
    );
    color: var(--pq-navy-deep, #15042e);
    font-weight: 800;
    font-size: 14px;
  }
  .pill-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .pill-label {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--pq-text-muted, #94a3b8);
  }
  .pill-name {
    font-family: var(--pq-font-display, var(--pq-font-mono, monospace));
    font-size: 14px;
    letter-spacing: 0.04em;
    color: var(--pq-cream, #f5efe6);
  }

  /* ===== casino-loud — marquee tier chip (bar flair comes from pq-progress-bar) ===== */
  :host-context([data-pq-mode="casino-loud"]) .chip {
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    color: var(--cl-gold-bright, #ffd55c);
  }

  /* ===== arcade — neon glass "Status" pill (expanded). CSS-only; no TS branch. ===== */
  :host-context([data-pq-mode="arcade"]) .pill {
    background: var(--arc-glass-bg, rgba(60, 25, 110, 0.6));
    border-color: var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
  }
  :host-context([data-pq-mode="arcade"]) .pill-icon {
    background: linear-gradient(
      135deg,
      var(--arc-display, #ffd93d),
      var(--cat-orange, #ff8c2c)
    );
    color: var(--arc-bg-deep, #15042e);
  }
  :host-context([data-pq-mode="arcade"]) .pill-label {
    font-family: var(--arc-font-mono, monospace);
    color: var(--arc-text-faint, #8b7aaa);
  }
  :host-context([data-pq-mode="arcade"]) .pill-name {
    font-family: var(--arc-font-display, "Manrope", "Impact", sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    color: var(--arc-cream, #f5efe0);
  }
`;
