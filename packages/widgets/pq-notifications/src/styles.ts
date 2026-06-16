import { css } from "lit";

/** Scoped styles for `<pq-notifications>`. Visual reference: `.x01-bell` + `.ntf-*`. */
export const styles = css`
  :host {
    display: inline-block;
    position: relative;
  }

  .bell {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: transparent;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    color: var(--pq-text, #f1f5f9);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 200ms var(--pq-ease, ease);
  }
  .bell:hover {
    background: var(--pq-navy-mid, #1b3756);
  }
  .bell svg {
    width: 16px;
    height: 16px;
  }
  .bell__dot {
    position: absolute;
    top: 8px;
    right: 9px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--pq-emerald, #10b981);
    border: 2px solid var(--pq-navy-deep, #0a1a2e);
  }

  .tray {
    position: absolute;
    top: 48px;
    right: 0;
    width: 340px;
    background: var(--pq-navy-low, #143352);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-lg, 12px);
    box-shadow: 0 24px 56px -16px rgba(5, 13, 26, 0.8);
    z-index: 20;
    overflow: hidden;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--pq-navy-hairline, #2a4f7a);
  }
  .head__title {
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 14px;
    margin: 0;
  }
  .head__action {
    background: none;
    border: none;
    color: var(--pq-emerald, #10b981);
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: pointer;
  }
  .list {
    max-height: 360px;
    overflow-y: auto;
  }
  .item {
    display: grid;
    grid-template-columns: 36px 1fr;
    gap: 12px;
    padding: 14px 16px;
    position: relative;
    border-bottom: 1px solid rgba(42, 79, 122, 0.4);
  }
  .item--unread {
    background: rgba(16, 185, 129, 0.04);
  }
  .item--unread::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--pq-emerald, #10b981);
  }
  .item__icon {
    width: 36px;
    height: 36px;
    border-radius: var(--pq-r-md, 8px);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .item__icon svg {
    width: 16px;
    height: 16px;
  }
  .icon--campaign { background: var(--pq-emerald-dim, #0b5c4a); color: var(--pq-emerald, #10b981); }
  .icon--time { background: rgba(252, 191, 73, 0.16); color: var(--pq-gold-bright, #fcbf49); }
  .icon--shipping { background: rgba(59, 130, 246, 0.16); color: var(--pq-info, #3b82f6); }
  .icon--alert { background: rgba(239, 68, 68, 0.16); color: var(--pq-danger, #ef4444); }

  .item__title {
    font-size: 13px;
    font-weight: 600;
    margin: 0 0 2px;
    color: var(--pq-text, #f1f5f9);
  }
  .item__body {
    font-size: 12px;
    color: var(--pq-text-muted, #94a3b8);
    margin: 0 0 6px;
    line-height: 1.45;
  }
  .item__time {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    color: var(--pq-text-faint, #64748b);
  }
  .item__cta {
    background: none;
    border: none;
    padding: 4px 0 0;
    color: var(--pq-emerald, #10b981);
    font-family: var(--pq-font-body, sans-serif);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    display: block;
  }
  .empty {
    padding: 28px 16px;
    text-align: center;
    color: var(--pq-text-muted, #94a3b8);
    font-size: 12px;
  }

  /* ===== casino-loud — gold bell + marquee tray title =====
     (unread accent + campaign icon already flip to gold via the emerald→gold remap.) */
  :host-context([data-pq-mode="casino-loud"]) .bell:hover {
    border-color: var(--cl-gold, #ffb627);
  }
  :host-context([data-pq-mode="casino-loud"]) .bell__dot {
    box-shadow: 0 0 6px var(--cl-gold-glow, rgba(255, 182, 39, 0.55));
  }
  :host-context([data-pq-mode="casino-loud"]) .head__title {
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;
