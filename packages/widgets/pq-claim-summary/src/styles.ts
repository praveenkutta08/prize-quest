import { css } from "lit";

/** Scoped styles for `<pq-claim-summary>`. */
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
  .rows {
    margin: 0;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-lg, 12px);
    background: var(--pq-navy-low, #143352);
    overflow: hidden;
  }
  .row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 18px;
    border-bottom: 1px solid var(--pq-navy-hairline, #2a4f7a);
  }
  .row:last-child {
    border-bottom: none;
  }
  .row dt {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--pq-text-muted, #94a3b8);
  }
  .row dd {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--pq-text, #f1f5f9);
    text-align: right;
  }
  .cta {
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: var(--pq-r-md, 8px);
    background: var(--pq-emerald, #10b981);
    color: var(--pq-navy-deep, #0a1a2e);
    font-family: var(--pq-font-body, sans-serif);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }
  .cta:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ---------- terms (showTerms) ---------- */
  .tnc {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.45;
    color: var(--pq-text, #f1f5f9);
    cursor: pointer;
  }
  .tnc a {
    color: var(--pq-gold-bright, #fcbf49);
    text-decoration: underline;
  }
  .tnc__box {
    position: relative;
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    border-radius: 3px;
    border: 1px solid var(--cl-success, var(--pq-emerald, #10b981));
    background: var(--cl-success, var(--pq-emerald, #10b981));
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--cl-black, #0a1a2e);
  }
  /* Unchecked state (the boolean data-checked attribute is absent): empty box with a
     visible hairline so the patron can see it toggle on/off. */
  .tnc__box:not([data-checked]) {
    background: transparent;
    border-color: var(--cl-gold-deep, var(--pq-navy-hairline, #2a4f7a));
  }
  .tnc__box input {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }
  .tnc__box svg {
    width: 10px;
    height: 10px;
  }

  /* ---------- compact tightening (must fit 480×234 without scrolling) ---------- */
  :host([profile="compact"]) .wrap {
    gap: 3px;
  }
  /* the screen header already reads "Confirm" + the eyebrow labels the step, so the
     big serif title is dropped in compact to keep the dense review on one screen. */
  :host([profile="compact"]) .eyebrow {
    font-size: 8px;
    letter-spacing: 0.16em;
  }
  :host([profile="compact"]) .title {
    display: none;
  }
  :host([profile="compact"]) .row {
    padding: 2px 8px;
    gap: 8px;
  }
  :host([profile="compact"]) .row dt {
    font-size: 8.5px;
  }
  :host([profile="compact"]) .row dd {
    font-size: 10.5px;
  }
  :host([profile="compact"]) .tnc {
    font-size: 10px;
  }
  :host([profile="compact"]) .cta {
    padding: 6px;
    font-size: 12px;
  }

  /* ---------- expanded (kiosk / big-screen final confirm) ---------- */
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
  .xl-grid {
    display: grid;
    align-items: start;
    padding: 0 80px;
  }
  .xl-grid--final {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
  .xl-detail {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* prize summary card (left) */
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
  .prize-card__cat {
    display: inline-flex;
    padding: 4px 12px;
    margin-bottom: 8px;
    border-radius: var(--pq-r-pill, 999px);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    background: rgba(255, 255, 255, 0.06);
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
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

  /* read-only address card (right) */
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

  /* big T&C row with filled square checkbox */
  .terms {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    line-height: 1.5;
    cursor: pointer;
  }
  .terms--xl {
    gap: 14px;
    padding: 20px;
    border-radius: var(--pq-r-lg, 12px);
    border: 1px solid var(--pq-gold-bright, #fcbf49);
    background: rgba(255, 255, 255, 0.03);
    font-size: 14px;
    color: var(--pq-text, #f1f5f9);
  }
  .terms a {
    color: var(--pq-gold-bright, #fcbf49);
    text-decoration: underline;
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
    background: linear-gradient(180deg, var(--pq-gold-bright, #fcbf49), var(--pq-gold, #f7a93a));
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
    box-shadow:
      0 0 10px var(--cl-red-glow, rgba(230, 57, 70, 0.55)),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  /* ====================== ARCADE MODE (CSS only) ======================
     Second axis: pure presentation layered on top of any profile. Per-category
     accent comes from --cat-* tints (resolved by the tenant); keyframes
     (shimmer / pulse-glow) live in arcade.css and are referenced by name.
     Ambient motion is gated behind prefers-reduced-motion: no-preference. */
  :host-context([data-pq-mode="arcade"]) .xl-title,
  :host-context([data-pq-mode="arcade"]) .summary-card__name {
    color: var(--arc-cream, var(--pq-text, #f1f5f9));
    letter-spacing: 0.02em;
  }
  :host-context([data-pq-mode="arcade"]) .eyebrow {
    color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
  }

  /* summary card carries the active category tint */
  :host-context([data-pq-mode="arcade"]) .summary-card {
    border-color: var(--cat-tint, var(--cat-purple, #8e47e8));
    background: linear-gradient(
      160deg,
      var(--cat-tint-bg, rgba(142, 71, 232, 0.18)),
      var(--arc-surface-2, rgba(40, 15, 75, 0.92))
    );
    box-shadow:
      0 0 48px var(--cat-tint-bg, rgba(142, 71, 232, 0.4)),
      0 24px 60px rgba(0, 0, 0, 0.6);
  }
  :host-context([data-pq-mode="arcade"]) .prize-card__cat {
    color: var(--cat-tint-bright, var(--cat-purple-bright, #b47bff));
    border-color: var(--cat-tint, var(--cat-purple, #8e47e8));
    background: var(--cat-tint-bg, rgba(142, 71, 232, 0.22));
  }
  :host-context([data-pq-mode="arcade"]) .summary-card__value {
    color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
  }

  /* arcade gradient primary CTA + glowing T&C square */
  :host-context([data-pq-mode="arcade"]) .cta--xl {
    background: linear-gradient(
      180deg,
      var(--arc-display, var(--pq-gold-bright, #fcbf49)),
      var(--arc-display-deep, var(--pq-gold, #f7a93a))
    );
    color: var(--arc-bg-deep, var(--pq-navy-deep, #0a1a2e));
    box-shadow: 0 0 24px var(--arc-display-glow, rgba(252, 191, 73, 0.45));
  }

  /* strong secondary "Cancel" button (ref .arc-btn--ghost): filled semi-opaque
     purple instead of the faint transparent base, with a visible hover. */
  :host-context([data-pq-mode="arcade"]) .ghost {
    background: var(--arc-bg-glass, var(--arc-surface-1, rgba(60, 25, 110, 0.5)));
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
    :host-context([data-pq-mode="arcade"]) .cta--xl:not(:disabled) {
      animation: pulse-glow 2.4s ease-in-out infinite;
    }
  }

  /* ===== portrait orientation (kiosk-portrait 1080×1920) — Section 10.6 =====
     The final-confirm 2-col stacks to one column; side padding tightens. */
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .xl-grid--final {
    grid-template-columns: 1fr;
    align-items: stretch;
    gap: 32px;
  }
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .xl-grid {
    padding: 0 40px;
  }

  /* ===== ARCADE × COMPACT (Session 29 — TTD 480×234, CSS only) =====
     Maps the arcade compact final-confirm treatment onto this widget's REAL
     compact render classes. Compact never uses the .xl-* expanded markup, so the
     preview's .addr-card / .address-card__pill / .tc-row panel have no compact
     equivalent — the address is just a .row inside .rows, and the T&C gate is the
     .tnc row with a .tnc__box filled square. Selectors mirror the file's existing
     arcade form (:host-context([data-pq-mode="arcade"]) .class) chained with
     :host([profile="compact"]) so they only fire in arcade + compact. */

  /* the rows panel → arcade glass card with a gold left accent (stand-in for the
     preview .addr-card's 3px gold left border + glass bg). */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .rows {
    border-color: var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    border-left: 3px solid var(--arc-display, var(--pq-gold-bright, #fcbf49));
    border-radius: var(--arc-r-sm, var(--pq-r-lg, 12px));
    background: linear-gradient(
      160deg,
      var(--arc-surface-1, rgba(60, 25, 110, 0.4)),
      var(--arc-surface-2, rgba(30, 10, 60, 0.7))
    );
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .row {
    border-bottom-color: var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .row dt {
    font-family: var(--arc-font-mono, var(--pq-font-mono, monospace));
    color: var(--arc-text-faint, var(--pq-text-muted, #94a3b8));
    letter-spacing: 0.14em;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .row dd {
    color: var(--arc-cream, var(--pq-text, #f1f5f9));
  }

  /* T&C agree row → tc-row panel + filled gold square (tc-checkbox) + gold link. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .tnc {
    gap: 6px;
    align-items: flex-start;
    padding: 5px 6px;
    border: 1px solid var(--arc-display, var(--pq-gold-bright, #fcbf49));
    border-radius: var(--arc-r-sm, var(--pq-r-md, 8px));
    background: var(--arc-surface-1, rgba(60, 25, 110, 0.3));
    color: var(--arc-cream, var(--pq-text, #f1f5f9));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .tnc__box {
    margin-top: 1px;
    border-color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
    background: var(--arc-display, var(--pq-gold-bright, #fcbf49));
    color: var(--arc-bg-deep, var(--cl-black, #0a1a2e));
    box-shadow: 0 0 4px var(--arc-display-glow, rgba(252, 191, 73, 0.6));
  }
  /* Unchecked: empty box with a gold hairline so it reads as toggleable. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .tnc__box:not([data-checked]) {
    background: transparent;
    box-shadow: none;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .tnc a {
    color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
    text-decoration: underline;
  }

  /* primary Submit/Place Reward CTA → arcade gradient button. */
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

  /* ===== Session 30 — "Confirmed" pill (replaces the old "Cannot change" pill) ===== */
  /* compact: inline green confirmed chip next to the "Ship to" label + fallback warning */
  .ship-confirmed {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    margin-left: 6px;
    padding: 1px 6px;
    border-radius: 999px;
    background: rgba(52, 214, 112, 0.18);
    border: 1px solid var(--pq-success, #34d670);
    color: var(--pq-success, #34d670);
    font-family: var(--pq-font-mono, monospace);
    font-size: 7px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    vertical-align: middle;
  }
  .ship-confirmed svg {
    width: 8px;
    height: 8px;
  }
  .ship-warning {
    margin: 2px 0 0;
    font-family: var(--pq-font-mono, monospace);
    font-size: 8px;
    color: var(--pq-warning, #ffb627);
    letter-spacing: 0.04em;
  }
  /* expanded: the address-card pill turns green ("Confirmed") instead of gold ("Cannot change") */
  .address-card__pill--confirmed {
    border-color: var(--pq-success, #34d670);
    background: rgba(52, 214, 112, 0.15);
    color: var(--pq-success, #34d670);
  }
  .address-card__warning {
    margin: 10px 0 0;
    font-size: 13px;
    color: var(--pq-warning, #ffb627);
  }
  :host-context([data-pq-mode="arcade"]) .address-card__pill--confirmed {
    border-color: var(--arc-success, #34d670);
    background: rgba(52, 214, 112, 0.18);
    color: var(--arc-success, #34d670);
  }

  /* ===== iVIEW (1024x600 + 800x480) — scale compact up for touch ===== */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .row {
    padding: 6px 10px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .row dt {
    font-size: 11px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .row dd {
    font-size: 13px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .tnc {
    font-size: 12px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cta {
    padding: 10px 18px;
    font-size: 14px;
  }
`;
