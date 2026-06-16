import { css } from "lit";

/**
 * Scoped styles for `<pq-promo-hero>`. Profile via reflected `profile` attr;
 * `dimmed`/`loading` host attrs for state. All colors from `--pq-*` tokens.
 * Visual reference: `.promo-hero` (standard) and `.x01-hero` (expanded).
 */
export const styles = css`
  :host {
    display: block;
  }

  .hero {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-2xl, 20px);
    background: linear-gradient(
      180deg,
      var(--pq-navy-base, #102a43) 0%,
      var(--pq-navy-low, #143352) 100%
    );
  }
  :host([dimmed]) .hero {
    opacity: 0.45;
  }

  .row1 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }
  .timer {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    letter-spacing: 0.06em;
    color: var(--pq-text-muted, #94a3b8);
    white-space: nowrap;
  }
  .title {
    font-family: var(--pq-font-serif, serif);
    font-weight: 500;
    letter-spacing: -0.005em;
    line-height: 1.1;
    margin: 4px 0 8px;
    color: var(--pq-text, #f1f5f9);
  }
  .sub {
    font-size: 13px;
    color: var(--pq-text-muted, #94a3b8);
    line-height: 1.55;
    margin: 0 0 16px;
  }

  .progress-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
  }
  .progress-label {
    font-size: 11px;
    color: var(--pq-text-muted, #94a3b8);
    font-weight: 500;
  }
  .progress-value {
    font-family: var(--pq-font-mono, monospace);
    font-size: 12px;
    font-weight: 600;
    color: var(--pq-text, #f1f5f9);
  }

  .thumbs {
    margin-top: 18px;
    display: flex;
    gap: 10px;
  }
  .thumb {
    flex: 1;
    aspect-ratio: 1;
    background: rgba(10, 26, 46, 0.55);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-md, 8px);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--pq-gold-bright, #fcbf49);
  }
  .thumb svg {
    width: 40%;
    height: 40%;
  }
  .thumb--more {
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    font-weight: 600;
    color: var(--pq-text-muted, #94a3b8);
  }

  .cta {
    margin-top: 20px;
    width: 100%;
    min-height: 48px;
    background: var(--pq-cream, #f5efe6);
    color: var(--pq-navy-deep, #0a1a2e);
    border: none;
    border-radius: var(--pq-r-md, 8px);
    font-family: var(--pq-font-body, sans-serif);
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0.01em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: background 200ms var(--pq-ease, ease);
  }
  .cta:hover {
    background: #fff;
  }
  .cta:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  .cta svg {
    width: 14px;
    height: 14px;
  }

  /* ---------------- standard ---------------- */
  :host([profile="standard"]) .hero {
    padding: 28px 24px;
  }
  :host([profile="standard"]) .title {
    font-size: 32px;
  }
  :host([profile="standard"]) .sub {
    max-width: 280px;
  }

  /* ---------------- expanded ---------------- */
  :host([profile="expanded"]) .hero {
    padding: 40px;
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 40px;
    align-items: center;
  }
  :host([profile="expanded"]) .title {
    font-size: 48px;
    margin: 12px 0 14px;
  }
  :host([profile="expanded"]) .sub {
    font-size: 15px;
    max-width: 460px;
  }
  :host([profile="expanded"]) .thumbs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 0;
  }
  :host([profile="expanded"]) .thumb {
    flex: none;
    aspect-ratio: auto;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 14px;
  }
  .thumb__img {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: var(--pq-r-sm, 4px);
    background: rgba(10, 26, 46, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .thumb__name {
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 12px;
    margin: 0;
    color: var(--pq-text, #f1f5f9);
  }
  .thumb__cat {
    font-size: 10px;
    color: var(--pq-text-muted, #94a3b8);
    margin: 0;
  }
  .thumb__val {
    position: absolute;
    top: 6px;
    right: 6px;
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 9px;
    background: rgba(10, 26, 46, 0.85);
    color: var(--pq-gold-bright, #fcbf49);
    padding: 2px 6px;
    border-radius: var(--pq-r-full, 9999px);
  }

  /* ---------------- compact ---------------- */
  :host([profile="compact"]) .hero {
    padding: 16px 18px;
  }
  :host([profile="compact"]) .title {
    font-size: 20px;
    margin: 6px 0;
  }

  /* skeleton */
  .sk {
    background: var(--pq-navy-hairline, #2a4f7a);
    opacity: 0.35;
    border-radius: var(--pq-r-sm, 4px);
  }
  @media (prefers-reduced-motion: no-preference) {
    .sk {
      animation: pq-pulse 1.6s ease-in-out infinite;
    }
  }
  @keyframes pq-pulse {
    0%,
    100% {
      opacity: 0.25;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* ===== casino-loud — red hot CTA + uppercase marquee title ===== */
  :host-context([data-pq-mode="casino-loud"]) .title {
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  :host-context([data-pq-mode="casino-loud"]) .cta {
    background: linear-gradient(
      180deg,
      var(--cl-red-bright, #ff5b6a),
      var(--cl-red, #e63946),
      var(--cl-red-deep, #a8131a)
    );
    color: var(--cl-cream, #f5f1e8);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    box-shadow: 0 0 10px var(--cl-red-glow, rgba(230, 57, 70, 0.55)),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  :host-context([data-pq-mode="casino-loud"]) .cta:hover {
    background: linear-gradient(180deg, var(--cl-red-bright, #ff5b6a), var(--cl-red, #e63946));
  }
`;
