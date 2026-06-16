import { css } from "lit";

/** Scoped styles for `<pq-trust-strip>`. Visual reference: `.x02-trust` / `.x02-badge`. */
export const styles = css`
  :host {
    display: block;
  }
  .strip {
    background:
      radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.1) 0%, transparent 60%),
      var(--pq-navy-base, #102a43);
    border-top: 1px solid var(--pq-navy-hairline, #2a4f7a);
    padding: 20px 24px;
  }
  .inner {
    display: grid;
    grid-template-columns: repeat(var(--pq-trust-cols, 4), 1fr);
    gap: 16px;
  }
  @media (max-width: 560px) {
    .inner {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  .badge {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .icon {
    width: 36px;
    height: 36px;
    flex: 0 0 auto;
    border-radius: var(--pq-r-md, 8px);
    background: var(--pq-emerald-dim, #0b5c4a);
    color: var(--pq-emerald, #10b981);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .icon svg {
    width: 18px;
    height: 18px;
  }
  .title {
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 12px;
    margin: 0 0 1px;
    color: var(--pq-text, #f1f5f9);
  }
  .sub {
    font-size: 11px;
    color: var(--pq-text-muted, #94a3b8);
    margin: 0;
    line-height: 1.4;
  }

  /* ===== casino-loud — gold badge icons + marquee titles =====
     (icon bg/color already flip to gold via the emerald→gold remap.) */
  :host-context([data-pq-mode="casino-loud"]) .icon {
    box-shadow: 0 0 8px var(--cl-gold-glow, rgba(255, 182, 39, 0.45));
  }
  :host-context([data-pq-mode="casino-loud"]) .title {
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;
