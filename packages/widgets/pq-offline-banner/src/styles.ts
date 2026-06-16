import { css } from "lit";

/** Scoped styles for `<pq-offline-banner>`. Visual reference: `.off-banner`. */
export const styles = css`
  :host {
    display: block;
  }
  .banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    font-size: 12px;
    line-height: 1.4;
  }

  /* offline = gold warning */
  :host([state="offline"]) .banner {
    background: linear-gradient(180deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%);
    border-bottom: 1px solid var(--pq-gold-deep, #a56b05);
  }
  :host([state="offline"]) .icon,
  :host([state="offline"]) strong {
    color: var(--pq-gold-bright, #fcbf49);
  }

  /* reconnected = emerald success */
  :host([state="reconnected"]) .banner {
    background: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
    border-bottom: 1px solid var(--pq-emerald-dim, #0b5c4a);
  }
  :host([state="reconnected"]) .icon,
  :host([state="reconnected"]) strong {
    color: var(--pq-emerald, #10b981);
  }
  @media (prefers-reduced-motion: no-preference) {
    :host([state="reconnected"]) .banner {
      animation: pq-slide-in 400ms var(--pq-ease, ease);
    }
  }
  @keyframes pq-slide-in {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .icon {
    flex: 0 0 auto;
    display: inline-flex;
  }
  .icon svg {
    width: 16px;
    height: 16px;
  }
  .text {
    flex: 1;
    color: var(--pq-text, #f1f5f9);
  }
  .retry {
    flex: 0 0 auto;
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 4px 10px;
    border-radius: var(--pq-r-sm, 4px);
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid var(--pq-gold-deep, #a56b05);
    color: var(--pq-gold-bright, #fcbf49);
    cursor: pointer;
  }

  /* ===== casino-loud — marquee label + gold retry ===== */
  :host-context([data-pq-mode="casino-loud"]) strong {
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  :host-context([data-pq-mode="casino-loud"]) .retry {
    background: rgba(255, 182, 39, 0.15);
    border-color: var(--cl-gold-deep, #c68a1a);
    color: var(--cl-gold-bright, #ffd55c);
  }
`;
