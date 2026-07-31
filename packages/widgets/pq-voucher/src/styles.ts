import { css } from "lit";

/** Scoped styles for `<pq-voucher>`. Visual reference: `.vou-*` (screen 08v). */
export const styles = css`
  :host {
    display: block;
    color: var(--pq-text, #f1f5f9);
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 24px 20px;
  }

  .hero {
    text-align: center;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--pq-cream-muted, #c9b79c);
    font-weight: 500;
  }
  .badge::before {
    content: "";
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--pq-emerald, #10b981);
  }
  .hero__title {
    font-family: var(--pq-font-serif, serif);
    font-weight: 500;
    font-size: 28px;
    line-height: 1.1;
    letter-spacing: -0.005em;
    margin: 8px 0 0;
  }
  .hero__title em {
    font-style: italic;
    color: var(--pq-cream-muted, #c9b79c);
  }

  .card {
    background: var(--pq-navy-base, #102a43);
    border: 1px solid var(--pq-cream-muted, #c9b79c);
    border-radius: var(--pq-r-xl, 16px);
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    position: relative;
  }
  .card__brand {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--pq-cream-muted, #c9b79c);
    font-weight: 500;
  }
  .card__value {
    font-family: var(--pq-font-serif, serif);
    font-weight: 500;
    font-size: 56px;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--pq-cream, #f5efe6);
  }
  .card__name {
    font-family: var(--pq-font-serif, serif);
    font-style: italic;
    font-size: 16px;
    color: var(--pq-text, #f1f5f9);
    text-align: center;
    margin: 0;
  }
  .qr {
    width: 144px;
    height: 144px;
    background: #fff;
    padding: 10px;
    border-radius: var(--pq-r-md, 8px);
  }
  .qr svg {
    width: 100%;
    height: 100%;
    display: block;
  }
  .code {
    font-family: var(--pq-font-mono, monospace);
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.14em;
    background: transparent;
    padding: 10px 18px;
    border-radius: var(--pq-r-md, 8px);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    color: var(--pq-cream, #f5efe6);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .code:hover {
    border-color: var(--pq-cream-muted, #c9b79c);
  }
  .code svg {
    width: 14px;
    height: 14px;
  }
  .expiry {
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    color: var(--pq-text-muted, #94a3b8);
  }

  /* redeemed */
  :host([redeemed]) .card {
    opacity: 0.7;
    border-color: var(--pq-navy-hairline, #2a4f7a);
  }
  :host([redeemed]) .qr svg {
    filter: grayscale(1);
    opacity: 0.5;
  }
  .stamp {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-12deg);
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 28px;
    letter-spacing: 0.1em;
    color: var(--pq-emerald, #10b981);
    border: 3px solid var(--pq-emerald, #10b981);
    border-radius: var(--pq-r-md, 8px);
    padding: 4px 16px;
    text-transform: uppercase;
    pointer-events: none;
  }

  .how {
    background: var(--pq-navy-low, #143352);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-lg, 12px);
    padding: 16px;
  }
  .how__title {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--pq-emerald, #10b981);
    font-weight: 600;
    margin: 0 0 12px;
  }
  .how__row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-size: 12px;
    color: var(--pq-text, #f1f5f9);
    line-height: 1.5;
    margin-bottom: 10px;
  }
  .how__row:last-child {
    margin-bottom: 0;
  }
  .how__num {
    flex: 0 0 auto;
    color: var(--pq-emerald, #10b981);
    font-family: var(--pq-font-mono, monospace);
    font-weight: 600;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .cta {
    width: 100%;
    min-height: 48px;
    background: var(--pq-emerald, #10b981);
    color: var(--pq-navy-deep, #0a1a2e);
    border: none;
    border-radius: var(--pq-r-md, 8px);
    font-family: var(--pq-font-body, sans-serif);
    font-weight: 700;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
  }
  .cta--ghost {
    background: transparent;
    color: var(--pq-text-muted, #94a3b8);
    font-weight: 500;
    text-transform: none;
    letter-spacing: normal;
  }

  /* ====================== COMPACT (ref .vou-wrap) ======================
     Split layout: left value/code column + QR on the right. Tap to dismiss. */
  :host([profile="compact"]) {
    cursor: pointer;
  }
  .vou-wrap {
    display: flex;
    gap: 6px;
    padding: 6px 4px;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    outline: none;
  }
  .vou-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    text-align: center;
    min-width: 0;
  }
  .vou-badge {
    font-family: var(--pq-font-mono, monospace);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 1.5px 6px;
    border-radius: 8px;
    border: 1px solid var(--cl-gold-deep, var(--pq-navy-hairline, #2a4f7a));
    color: var(--cl-gold, var(--pq-cream-muted, #c9b79c));
  }
  .vou-value {
    margin: 0;
    font-family: var(--pq-font-display, sans-serif);
    font-size: 32px;
    line-height: 1;
    color: var(--cl-gold-bright, var(--pq-cream, #f5efe6));
    text-shadow: 0 0 10px var(--cl-gold-glow, transparent);
  }
  .vou-name {
    margin: 0;
    font-family: var(--pq-font-display, sans-serif);
    font-size: 11px;
    line-height: 1;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--cl-cream, var(--pq-text, #f1f5f9));
  }
  .vou-code {
    margin-top: 1px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px dashed var(--cl-gold-deep, var(--pq-navy-hairline, #2a4f7a));
    background: transparent;
    color: var(--cl-gold, var(--pq-cream, #f5efe6));
    cursor: pointer;
  }
  .vou-qr {
    flex: 0 0 auto;
    width: 92px;
    height: 92px;
    padding: 4px;
    border-radius: 4px;
    background: var(--cl-cream, #f5f1e8);
  }
  .vou-qr svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  /* ====================== EXPANDED (ref Section 6.12) ======================
     Centered ~800px ticket-style block: notched stub card, mono code, QR. */
  .exp {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 32px 24px;
  }
  .exp__head {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .exp__title {
    font-family: var(--pq-font-serif, serif);
    font-weight: 500;
    font-size: 34px;
    line-height: 1.1;
    letter-spacing: -0.01em;
    margin: 0;
  }
  .exp__title em {
    font-style: italic;
    color: var(--pq-cream-muted, #c9b79c);
  }
  .exp__brand {
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--pq-cream-muted, #c9b79c);
  }

  /* Ticket: main panel + perforated stub, joined by notch cut-outs. */
  .ticket {
    position: relative;
    display: flex;
    align-items: stretch;
    background: var(--pq-navy-base, #102a43);
    border: 1px solid var(--pq-cream-muted, #c9b79c);
    border-radius: var(--pq-r-xl, 16px);
    overflow: hidden;
  }
  .ticket__main {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 36px 32px;
    text-align: center;
    min-width: 0;
  }
  .ticket__value {
    font-family: var(--pq-font-serif, serif);
    font-weight: 500;
    font-size: 64px;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--pq-cream, #f5efe6);
  }
  .ticket__name {
    font-family: var(--pq-font-serif, serif);
    font-style: italic;
    font-size: 18px;
    color: var(--pq-text, #f1f5f9);
    margin: 0;
  }
  .ticket__code {
    font-family: var(--pq-font-mono, monospace);
    font-size: 32px;
    font-weight: 500;
    letter-spacing: 0.08em;
    background: var(--pq-navy-low, #143352);
    padding: 14px 24px;
    border-radius: var(--pq-r-md, 8px);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    color: var(--pq-cream, #f5efe6);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 14px;
  }
  .ticket__code:hover {
    border-color: var(--pq-cream-muted, #c9b79c);
  }
  .ticket__code svg {
    width: 24px;
    height: 24px;
  }
  /* Perforated divider + ticket-stub notches via radial cut-outs. */
  .ticket__stub {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 28px 32px;
    border-left: 2px dashed var(--pq-navy-hairline, #2a4f7a);
    position: relative;
  }
  .ticket__stub::before,
  .ticket__stub::after {
    content: "";
    position: absolute;
    left: -10px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--pq-bg, #0a1a2e);
  }
  .ticket__stub::before {
    top: -10px;
  }
  .ticket__stub::after {
    bottom: -10px;
  }
  .ticket .qr {
    width: 160px;
    height: 160px;
  }

  .exp__actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
  .exp__actions .cta {
    width: auto;
    min-width: 200px;
  }
  /* Secondary nav row — always gives the patron a way off the voucher screen
     (back to the hub or into order history). Quieter than the primary actions. */
  .exp__nav {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 4px;
  }
  .exp__nav .cta {
    width: auto;
    min-width: 200px;
    font-size: 14px;
    padding: 12px 22px;
  }

  :host([redeemed]) .ticket {
    opacity: 0.7;
    border-color: var(--pq-navy-hairline, #2a4f7a);
  }
  :host([redeemed]) .ticket .qr svg {
    filter: grayscale(1);
    opacity: 0.5;
  }

  /* ===== casino-loud — gold ticket value, dashed code, red hot CTA ===== */
  :host-context([data-pq-mode="casino-loud"]) .card {
    border-color: var(--cl-gold-deep, #c68a1a);
    box-shadow: 0 0 10px rgba(255, 182, 39, 0.18);
  }
  :host-context([data-pq-mode="casino-loud"]) .card__value {
    color: var(--cl-gold-bright, #ffd55c);
    text-shadow: 0 0 10px var(--cl-gold-glow, rgba(255, 182, 39, 0.55));
  }
  :host-context([data-pq-mode="casino-loud"]) .code {
    border-style: dashed;
    border-color: var(--cl-gold-deep, #c68a1a);
    color: var(--cl-gold, #ffb627);
  }
  :host-context([data-pq-mode="casino-loud"]) .cta:not(.cta--ghost) {
    background: linear-gradient(
      180deg,
      var(--cl-red-bright, #ff5b6a),
      var(--cl-red, #e63946),
      var(--cl-red-deep, #a8131a)
    );
    color: var(--cl-cream, #f5f1e8);
    box-shadow:
      0 0 10px var(--cl-red-glow, rgba(230, 57, 70, 0.55)),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  /* ====================== ARCADE (kiosk / EGM / iVIEW) ======================
     CSS-only mode override keyed off [data-pq-mode="arcade"] on the host root.
     Vibrant deep-purple surfaces, neon-yellow display, chunky pressable CTAs.
     No widget code changes — same markup, flipped treatment. */
  :host-context([data-pq-mode="arcade"]) .card,
  :host-context([data-pq-mode="arcade"]) .ticket {
    background: linear-gradient(160deg, var(--arc-bg-mid, #2a1454), var(--arc-bg-base, #1f0b3e));
    border-color: var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
    box-shadow: 0 0 24px var(--arc-glow-soft, rgba(255, 217, 61, 0.18));
  }
  :host-context([data-pq-mode="arcade"]) .card__value,
  :host-context([data-pq-mode="arcade"]) .ticket__value,
  :host-context([data-pq-mode="arcade"]) .vou-value,
  :host-context([data-pq-mode="arcade"]) .exp__title em,
  :host-context([data-pq-mode="arcade"]) .hero__title em {
    font-family: var(--arc-font-display, "Manrope", sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-style: normal;
    color: var(--arc-display-bright, #ffee5c);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);
  }
  :host-context([data-pq-mode="arcade"]) .exp__title,
  :host-context([data-pq-mode="arcade"]) .hero__title {
    font-family: var(--arc-font-display, "Manrope", sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  :host-context([data-pq-mode="arcade"]) .badge,
  :host-context([data-pq-mode="arcade"]) .exp__brand,
  :host-context([data-pq-mode="arcade"]) .card__brand {
    color: var(--arc-display, #ffd93d);
  }
  :host-context([data-pq-mode="arcade"]) .badge::before {
    background: var(--arc-success, #34d670);
  }
  :host-context([data-pq-mode="arcade"]) .code,
  :host-context([data-pq-mode="arcade"]) .ticket__code,
  :host-context([data-pq-mode="arcade"]) .vou-code {
    border-style: dashed;
    border-color: var(--arc-display-deep, #e0b71b);
    background: var(--arc-bg-glass, var(--arc-surface-1, rgba(60, 25, 110, 0.45)));
    color: var(--arc-display, #ffd93d);
  }
  :host-context([data-pq-mode="arcade"]) .how {
    background: var(--arc-bg-glass-2, rgba(80, 35, 140, 0.3));
    border-color: var(--arc-hairline, rgba(140, 100, 200, 0.22));
  }
  :host-context([data-pq-mode="arcade"]) .how__title,
  :host-context([data-pq-mode="arcade"]) .how__num {
    color: var(--arc-display, #ffd93d);
  }
  /* Primary arcade gradient CTA — chunky, pressable. */
  :host-context([data-pq-mode="arcade"]) .cta:not(.cta--ghost) {
    background: linear-gradient(
      135deg,
      var(--arc-display-bright, #ffee5c),
      var(--arc-orange, var(--cat-orange, #ff8c2c))
    );
    color: var(--arc-bg-deep, #15042e);
    font-family: var(--arc-font-display, "Manrope", sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    box-shadow:
      0 4px 0 var(--arc-display-deep, #e0b71b),
      0 12px 32px var(--arc-display-glow, rgba(255, 217, 61, 0.55)),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
    transition:
      transform 80ms ease,
      box-shadow 80ms ease;
  }
  :host-context([data-pq-mode="arcade"]) .cta:not(.cta--ghost):active {
    transform: translateY(2px);
    box-shadow:
      0 2px 0 var(--arc-display-deep, #e0b71b),
      0 4px 12px rgba(0, 0, 0, 0.5);
  }
  :host-context([data-pq-mode="arcade"]) .cta--ghost {
    background: var(--arc-bg-glass, var(--arc-surface-1, rgba(60, 25, 110, 0.5)));
    border: 1px solid var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
    color: var(--arc-text-dim, #d0bfec);
  }
  :host-context([data-pq-mode="arcade"]) .ticket__stub::before,
  :host-context([data-pq-mode="arcade"]) .ticket__stub::after {
    background: var(--arc-bg-base, #1f0b3e);
  }
  :host-context([data-pq-mode="arcade"]) .stamp {
    color: var(--arc-success, #34d670);
    border-color: var(--arc-success, #34d670);
  }
  @media (prefers-reduced-motion: reduce) {
    :host-context([data-pq-mode="arcade"]) .cta:not(.cta--ghost) {
      transition: none;
    }
    :host-context([data-pq-mode="arcade"]) .cta:not(.cta--ghost):active {
      transform: none;
    }
  }
`;
