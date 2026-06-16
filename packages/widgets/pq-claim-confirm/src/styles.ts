import { css } from "lit";

/** Scoped styles for `<pq-claim-confirm>`. */
export const styles = css`
  :host {
    display: block;
  }
  .wrap {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .eyebrow {
    margin: 0;
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--pq-cream-muted, #c9b79c);
  }
  .title {
    margin: 0;
    font-family: var(--pq-font-serif, Georgia, serif);
    font-size: 26px;
    font-weight: 500;
    color: var(--pq-text, #f1f5f9);
  }
  .card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-lg, 12px);
    background: var(--pq-navy-low, #143352);
  }
  .card__name {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 600;
    color: var(--pq-text, #f1f5f9);
  }
  .card__meta,
  .card__camp {
    margin: 0;
    font-size: 12px;
    color: var(--pq-text-muted, #94a3b8);
  }
  .card__value {
    font-family: var(--pq-font-serif, Georgia, serif);
    font-size: 24px;
    color: var(--pq-gold-bright, #fcbf49);
    white-space: nowrap;
  }
  .empty {
    color: var(--pq-text-muted, #94a3b8);
    font-size: 13px;
  }
  .terms {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    font-size: 13px;
    line-height: 1.5;
    color: var(--pq-text-muted, #94a3b8);
    cursor: pointer;
  }
  .terms input {
    margin-top: 2px;
    width: 18px;
    height: 18px;
    accent-color: var(--pq-emerald, #10b981);
    flex: none;
  }
  .terms a {
    color: var(--pq-text, #f1f5f9);
    text-decoration: underline;
  }
  .cta {
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: var(--pq-r-md, 8px);
    background: var(--pq-cream, #f5efe6);
    color: var(--pq-navy-deep, #0a1a2e);
    font-family: var(--pq-font-body, sans-serif);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  .cta:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ---------- pre-PIN rows (showTerms=false) ---------- */
  .cc {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .cc-row {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .cc-row__label {
    margin: 0;
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--cl-gold, var(--pq-cream-muted, #c9b79c));
  }
  .cc-row__value {
    margin: 0;
    font-family: var(--pq-font-display, sans-serif);
    font-size: 18px;
    line-height: 1.1;
    color: var(--pq-text, #f1f5f9);
  }
  .cc-row__value--prize {
    color: var(--cl-gold-bright, var(--pq-gold-bright, #fcbf49));
    text-shadow: 0 0 5px var(--cl-gold-glow, transparent);
  }
  .cc-divider {
    height: 1px;
    background: var(--cl-gold-glow, var(--pq-navy-hairline, #2a4f7a));
    opacity: 0.4;
  }
  .cc-warning {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 6px;
    padding: 6px 10px;
    border-radius: 3px;
    border: 1px solid var(--cl-gold-deep, var(--pq-navy-hairline, #2a4f7a));
    background: var(--cl-gold-glow, rgba(255, 182, 39, 0.08));
    font-size: 11px;
    font-weight: 500;
    color: var(--cl-gold-bright, var(--pq-gold-bright, #fcbf49));
  }
  .cc-warning svg {
    width: 11px;
    height: 11px;
    flex: 0 0 auto;
  }

  /* ---------- compact tightening ---------- */
  :host([profile="compact"]) .wrap {
    gap: 6px;
  }
  :host([profile="compact"]) .cc-row__value {
    font-size: 14px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  :host([profile="compact"]) .cc-warning {
    font-size: 10px;
    padding: 5px 8px;
  }
  :host([profile="compact"]) .cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px;
    font-size: 12px;
  }
  :host([profile="compact"]) .cta svg {
    width: 13px;
    height: 13px;
  }
  /* compact secondary "pick a different reward" — small ghost row under the CTA */
  :host([profile="compact"]) .ghost {
    padding: 6px;
    font-size: 11px;
    gap: 5px;
  }
  :host([profile="compact"]) .ghost svg {
    width: 12px;
    height: 12px;
  }

  /* ---------- expanded (kiosk / big-screen) ---------- */
  .wrap--xl {
    gap: 32px;
  }
  .xl-head {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
  }
  .xl-title {
    margin: 0;
    font-family: var(--pq-font-display, var(--pq-font-serif, Georgia, serif));
    font-size: 52px;
    line-height: 1;
    font-weight: 700;
    color: var(--pq-text, #f1f5f9);
  }
  .xl-sub {
    margin: 0;
    max-width: 700px;
    font-size: 18px;
    color: var(--pq-text-muted, #94a3b8);
  }
  .xl-grid {
    display: grid;
    gap: 56px;
    align-items: center;
    padding: 0 80px;
  }
  .xl-grid--prepin {
    grid-template-columns: 1fr 1.2fr;
  }
  .xl-grid--final {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    align-items: start;
  }
  .xl-detail {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* big selected-prize card (left, pre-PIN) */
  .prize-card {
    position: relative;
    padding: 36px;
    border: 2px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-2xl, 20px);
    background: var(--pq-navy-low, #143352);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
  }
  .prize-card__accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8px;
    border-radius: var(--pq-r-2xl, 20px) var(--pq-r-2xl, 20px) 0 0;
    background: var(--pq-gold-bright, #fcbf49);
  }
  .prize-card__img {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    margin-bottom: 24px;
    display: grid;
    place-items: center;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--pq-r-lg, 12px);
    background: rgba(0, 0, 0, 0.25);
  }
  .prize-card__img svg {
    width: 40%;
    height: 40%;
    color: var(--pq-cream-muted, #c9b79c);
    filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.7));
  }
  .prize-card__cat {
    display: inline-flex;
    padding: 8px 18px;
    margin-bottom: 16px;
    border-radius: var(--pq-r-pill, 999px);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    background: rgba(255, 255, 255, 0.06);
    font-family: var(--pq-font-mono, monospace);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--pq-cream-muted, #c9b79c);
  }
  .prize-card__name {
    margin: 0 0 12px;
    font-family: var(--pq-font-display, var(--pq-font-serif, Georgia, serif));
    font-size: 38px;
    line-height: 1.1;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--pq-text, #f1f5f9);
  }
  .prize-card__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  .prize-card__value {
    font-family: var(--pq-font-display, var(--pq-font-serif, Georgia, serif));
    font-size: 36px;
    color: var(--pq-gold-bright, #fcbf49);
  }
  .prize-card__stock {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 13px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--pq-emerald, #10b981);
  }
  .prize-card__stock .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--pq-emerald, #10b981);
    box-shadow: 0 0 8px var(--pq-emerald, #10b981);
  }

  /* "What you get" detail block (right, pre-PIN) */
  .detail-card {
    padding: 24px;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-lg, 12px);
    background: rgba(255, 255, 255, 0.03);
  }
  .detail-card__title {
    margin: 0 0 14px;
    font-family: var(--pq-font-display, var(--pq-font-serif, Georgia, serif));
    font-size: 18px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--pq-gold-bright, #fcbf49);
  }
  .detail-card__list {
    margin: 0;
    padding-left: 22px;
    font-size: 16px;
    line-height: 1.8;
    color: var(--pq-text, #f1f5f9);
  }

  /* prize summary card (left, final) */
  .summary-card {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 28px;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-xl, 16px);
    background: var(--pq-navy-low, #143352);
  }
  .summary-card__eyebrow {
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--pq-cream-muted, #c9b79c);
  }
  .summary-card__main {
    display: flex;
    gap: 20px;
    align-items: center;
  }
  .summary-card__thumb {
    width: 110px;
    height: 110px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: var(--pq-r-md, 8px);
    background: rgba(0, 0, 0, 0.3);
  }
  .summary-card__thumb svg {
    width: 50%;
    height: 50%;
    color: var(--pq-cream-muted, #c9b79c);
  }
  .summary-card__name {
    font-family: var(--pq-font-display, var(--pq-font-serif, Georgia, serif));
    font-size: 26px;
    line-height: 1.1;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--pq-text, #f1f5f9);
  }
  .summary-card__value {
    margin-top: 4px;
    font-family: var(--pq-font-display, var(--pq-font-serif, Georgia, serif));
    font-size: 22px;
    color: var(--pq-gold-bright, #fcbf49);
  }
  .summary-card__meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 13px;
    color: var(--pq-text-muted, #94a3b8);
  }
  .summary-card__meta strong {
    display: block;
    margin-bottom: 4px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--pq-cream-muted, #c9b79c);
  }

  /* read-only address card (right, final) */
  .address-card {
    padding: 28px;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-xl, 16px);
    background: rgba(255, 255, 255, 0.03);
  }
  .address-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .address-card__label {
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--pq-cream-muted, #c9b79c);
  }
  .address-card__pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: var(--pq-r-pill, 999px);
    border: 1px solid var(--pq-gold-bright, #fcbf49);
    background: rgba(252, 191, 73, 0.12);
    font-family: var(--pq-font-mono, monospace);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--pq-gold-bright, #fcbf49);
  }
  .address-card__body {
    font-size: 17px;
    line-height: 1.55;
    color: var(--pq-text, #f1f5f9);
  }

  /* big T&C row with the filled square checkbox */
  .terms--xl {
    gap: 14px;
    padding: 20px;
    border-radius: var(--pq-r-lg, 12px);
    border: 1px solid var(--pq-gold-bright, #fcbf49);
    background: rgba(255, 255, 255, 0.03);
    font-size: 14px;
    color: var(--pq-text, #f1f5f9);
  }
  .terms__box {
    position: relative;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    margin-top: 2px;
    display: grid;
    place-items: center;
    border-radius: 6px;
    background: var(--pq-gold-bright, #fcbf49);
    color: var(--pq-navy-deep, #0a1a2e);
    box-shadow: 0 0 12px rgba(252, 191, 73, 0.5);
  }
  .terms__box[data-checked="false"] {
    background: transparent;
    border: 2px solid var(--pq-gold-bright, #fcbf49);
    box-shadow: none;
  }
  .terms__input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  /* expanded actions + CTA */
  .xl-actions {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .xl-actions--row {
    flex-direction: row;
    align-items: center;
  }
  .xl-actions--row .cta--xl {
    flex: 1;
  }
  .cta--xl {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 20px 28px;
    font-family: var(--pq-font-display, sans-serif);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: linear-gradient(
      180deg,
      var(--pq-gold-bright, #fcbf49),
      var(--pq-gold, #f7a93a)
    );
    color: var(--pq-navy-deep, #0a1a2e);
  }
  .ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-md, 8px);
    background: transparent;
    color: var(--pq-text-muted, #94a3b8);
    font-family: var(--pq-font-body, sans-serif);
    font-size: 16px;
    cursor: pointer;
  }

  /* ===== casino-loud — red hot primary button ===== */
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

  /* ====================== ARCADE MODE (CSS only) ======================
     Second axis: pure presentation layered on top of any profile. Per-category
     accent comes from --cat-* tints (resolved by the tenant); keyframes
     (shimmer / pulse-glow) live in arcade.css and are referenced by name.
     Ambient motion is gated behind prefers-reduced-motion: no-preference. */
  :host-context([data-pq-mode="arcade"]) .xl-title,
  :host-context([data-pq-mode="arcade"]) .prize-card__name,
  :host-context([data-pq-mode="arcade"]) .summary-card__name {
    color: var(--arc-cream, var(--pq-text, #f1f5f9));
    letter-spacing: 0.02em;
  }
  :host-context([data-pq-mode="arcade"]) .eyebrow,
  :host-context([data-pq-mode="arcade"]) .detail-card__title {
    color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
  }

  /* prize / summary cards carry the active category tint */
  :host-context([data-pq-mode="arcade"]) .prize-card,
  :host-context([data-pq-mode="arcade"]) .summary-card {
    border-color: var(--cat-tint, var(--cat-purple, #8e47e8));
    background: linear-gradient(
      160deg,
      var(--cat-tint-bg, rgba(142, 71, 232, 0.18)),
      rgba(40, 15, 75, 0.92)
    );
    box-shadow:
      0 0 48px var(--cat-tint-bg, rgba(142, 71, 232, 0.4)),
      0 24px 60px rgba(0, 0, 0, 0.6);
  }
  :host-context([data-pq-mode="arcade"]) .prize-card__accent {
    background: var(--cat-tint, var(--cat-purple, #8e47e8));
  }
  :host-context([data-pq-mode="arcade"]) .prize-card__cat {
    color: var(--cat-tint-bright, var(--cat-purple-bright, #b47bff));
    border-color: var(--cat-tint, var(--cat-purple, #8e47e8));
    background: var(--cat-tint-bg, rgba(142, 71, 232, 0.22));
  }
  :host-context([data-pq-mode="arcade"]) .prize-card__value,
  :host-context([data-pq-mode="arcade"]) .summary-card__value {
    color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
  }

  /* gold/arcade gradient primary CTA + glowing T&C square */
  :host-context([data-pq-mode="arcade"]) .cta--xl {
    background: linear-gradient(
      180deg,
      var(--arc-display, var(--pq-gold-bright, #fcbf49)),
      var(--arc-display-deep, var(--pq-gold, #f7a93a))
    );
    color: var(--arc-bg-deep, var(--pq-navy-deep, #0a1a2e));
    box-shadow: 0 0 24px var(--arc-display-glow, rgba(252, 191, 73, 0.45));
  }
  /* strong secondary "ghost" button (ref .arc-btn--ghost): filled semi-opaque
     purple instead of the faint transparent base, with a visible hover. */
  :host-context([data-pq-mode="arcade"]) .ghost {
    background: var(--arc-bg-glass, rgba(60, 25, 110, 0.5));
    border-color: var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    color: var(--arc-text-dim, var(--pq-text, #f5efe0));
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
  }
  :host-context([data-pq-mode="arcade"]) .ghost:hover {
    background: rgba(80, 40, 140, 0.6);
    border-color: var(--arc-display, var(--pq-gold-bright, #ffd93d));
    color: var(--arc-cream, var(--pq-text, #f5efe0));
  }
  :host-context([data-pq-mode="arcade"]) .terms--xl {
    border-color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
  }
  :host-context([data-pq-mode="arcade"]) .terms__box[data-checked="true"] {
    background: var(--arc-display, var(--pq-gold-bright, #fcbf49));
    color: var(--arc-bg-deep, var(--pq-navy-deep, #0a1a2e));
    box-shadow: 0 0 12px var(--arc-display-glow, rgba(252, 191, 73, 0.6));
  }
  :host-context([data-pq-mode="arcade"]) .address-card__pill {
    border-color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
    color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
  }

  @media (prefers-reduced-motion: no-preference) {
    /* ambient sheen sweeping the prize image well in arcade */
    :host-context([data-pq-mode="arcade"]) .prize-card__img::after {
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
    :host-context([data-pq-mode="arcade"]) .cta--xl:not(:disabled) {
      animation: pulse-glow 2.4s ease-in-out infinite;
    }
  }

  /* ===== portrait orientation (kiosk-portrait 1080×1920) — Section 10.6 =====
     Both pre-PIN (1fr 1.2fr) and final (1fr 1fr) grids stack to one column and
     the wide 0 80px side padding tightens to 0 40px. */
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .xl-grid--prepin,
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .xl-grid--final {
    grid-template-columns: 1fr;
    align-items: stretch;
    gap: 32px;
  }
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .xl-grid {
    padding: 0 40px;
  }

  /* ===== ARCADE × COMPACT (Session 29 — TTD 480×234, CSS only) =====
     Maps the arcade compact-confirm treatment onto this widget's REAL compact
     render classes. Compact never goes through the .xl-* expanded markup, so the
     preview's panel/image/category/Cancel elements have no compact equivalent —
     the pre-PIN prize "echo" is the .cc-row__value--prize line (not a card) and
     the premium variant is the .card block. Selectors mirror the file's existing
     arcade form (:host-context([data-pq-mode="arcade"]) .class) chained with
     :host([profile="compact"]) so they only fire in arcade + compact. */

  /* showTerms=false (pre-PIN): wrap the bare Promo/Prize rows in a defined arcade
     "ticket" panel (purple glass + neon top accent) so the compact confirm reads
     like the kiosk's prize card rather than text floating on the background, then
     tighten the rows to sit inside it. The "Cannot change" notice → warning pill. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cc {
    position: relative;
    gap: 2px;
    padding: 8px 10px;
    border: 1px solid var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    border-radius: var(--arc-r-md, 8px);
    background: linear-gradient(160deg, rgba(60, 25, 110, 0.45), rgba(30, 10, 60, 0.7));
    overflow: hidden;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cc::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--cat-pink, #ff3fa4), var(--arc-display, #ffd93d));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cc-row {
    position: relative;
    padding: 3px 2px;
    border-radius: var(--arc-r-sm, 6px);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cc-row__label {
    font-family: var(--arc-font-mono, var(--pq-font-mono, monospace));
    color: var(--arc-text-faint, var(--cl-gold, var(--pq-cream-muted, #c9b79c)));
    letter-spacing: 0.14em;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cc-row__value {
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    color: var(--arc-cream, var(--pq-text, #f1f5f9));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cc-row__value--prize {
    color: var(--arc-display, var(--cl-gold-bright, var(--pq-gold-bright, #fcbf49)));
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cc-divider {
    background: var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    opacity: 0.5;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cc-warning {
    border-radius: 3px;
    border-color: rgba(255, 217, 61, 0.4);
    background: rgba(255, 217, 61, 0.1);
    font-family: var(--arc-font-mono, var(--pq-font-mono, monospace));
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
  }

  /* showTerms=true (premium): the prize echo card → arcade purple panel with a
     2px top accent + glass gradient; name/value pick up display/category tints. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .card {
    position: relative;
    overflow: hidden;
    border-color: var(--cat-tint, var(--cat-purple, #8e47e8));
    background: linear-gradient(
      160deg,
      var(--cat-tint-bg, rgba(142, 71, 232, 0.18)),
      rgba(60, 25, 110, 0.55)
    );
    border-radius: var(--arc-r-md, var(--pq-r-lg, 12px));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--cat-tint, var(--cat-purple, #8e47e8));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .card__name {
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    text-transform: uppercase;
    color: var(--arc-cream, var(--pq-text, #f1f5f9));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .card__value {
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .terms a {
    color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
  }

  /* primary Confirm/Continue CTA → arcade gradient button. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cta {
    background: linear-gradient(
      135deg,
      var(--arc-display-bright, var(--arc-display, var(--pq-gold-bright, #fcbf49))),
      var(--cat-orange, var(--arc-display-deep, var(--pq-gold, #f7a93a)))
    );
    color: var(--arc-bg-deep, var(--pq-navy-deep, #0a1a2e));
    box-shadow:
      0 2px 0 var(--arc-display-deep, var(--pq-gold, #f7a93a)),
      0 4px 12px var(--arc-display-glow, rgba(252, 191, 73, 0.45)),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
    border-radius: var(--arc-r-md, var(--pq-r-md, 8px));
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* ===== iVIEW (1024x600 + 800x480) — scale compact up for touch ===== */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cc-row__value {
    font-size: 18px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cta {
    padding: 10px 18px;
    font-size: 14px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .ghost {
    padding: 8px 10px;
    font-size: 12px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cc {
    padding: 14px;
  }
`;
