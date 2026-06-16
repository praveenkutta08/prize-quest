import { css } from "lit";

/** Scoped styles for `<pq-address-block>`. Visual reference: `.addr-card` (screen 06). */
export const styles = css`
  :host {
    display: block;
    color: var(--pq-text, #f1f5f9);
  }

  .card {
    background: linear-gradient(180deg, var(--pq-navy-low, #143352) 0%, rgba(20, 51, 82, 0.6) 100%);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-xl, 16px);
    padding: 20px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 14px;
    margin-bottom: 14px;
    border-bottom: 1px solid var(--pq-navy-hairline, #2a4f7a);
  }
  .source {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--pq-text-muted, #94a3b8);
  }
  .source svg {
    width: 12px;
    height: 12px;
    color: var(--pq-emerald, #10b981);
  }
  .verified {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.4);
    border-radius: var(--pq-r-full, 9999px);
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    font-weight: 600;
    color: var(--pq-emerald, #10b981);
  }
  .verified svg {
    width: 10px;
    height: 10px;
  }

  .name {
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 18px;
    margin: 0 0 6px;
  }
  .line {
    font-size: 13px;
    color: var(--pq-text, #f1f5f9);
    margin: 0;
    line-height: 1.55;
  }

  .contact {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--pq-navy-hairline, #2a4f7a);
  }
  .contact span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--pq-text-muted, #94a3b8);
  }
  .contact svg {
    width: 12px;
    height: 12px;
  }

  .edit {
    margin-top: 14px;
    padding: 12px 14px;
    border: 1px dashed var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-md, 8px);
  }
  .edit p {
    margin: 0 0 6px;
    font-size: 11px;
    color: var(--pq-text-muted, #94a3b8);
    line-height: 1.5;
  }
  .edit button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    padding: 0;
    font-family: var(--pq-font-body, sans-serif);
    font-size: 12px;
    font-weight: 600;
    color: var(--pq-emerald, #10b981);
    cursor: pointer;
  }

  /* ===== casino-loud — gold-framed card + marquee name ===== */
  :host-context([data-pq-mode="casino-loud"]) .card {
    border-color: var(--cl-gold-deep, #c68a1a);
  }
  :host-context([data-pq-mode="casino-loud"]) .name {
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--cl-gold-bright, #ffd55c);
  }

  /* ====================== EXPANDED PROFILE (kiosk, ref stage 07 — extended) ===
     Hero + two-column layout that fills the frame width. Colors stay on --pq-*
     fallbacks so it reads premium without arcade tokens; the arcade block below
     promotes to --arc-* tokens. Sizing/structure mirror the visual ground truth. */
  .flow {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 36px;
    width: 100%;
    box-sizing: border-box;
    padding: 8px 56px 24px;
  }
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;
  }
  .hero__disc {
    width: 132px;
    height: 132px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #fff;
    background: radial-gradient(circle at 50% 35%, #4ade9b, var(--pq-emerald, #10b981));
    box-shadow: 0 0 36px rgba(52, 214, 112, 0.45);
  }
  .hero__disc svg {
    width: 70px;
    height: 70px;
  }
  .hero__eyebrow {
    margin: 0;
    font-family: var(--pq-font-mono, monospace);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--pq-gold-bright, #fcbf49);
  }
  .hero__title {
    margin: 0;
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 52px;
    line-height: 1;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--pq-text, #f1f5f9);
  }
  .hero__sub {
    margin: 0;
    font-size: 18px;
    color: var(--pq-text-muted, #94a3b8);
  }
  .addr-2col {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 40px;
    width: 100%;
    max-width: 1500px;
    align-items: stretch;
  }
  .card--xl {
    padding: 32px 36px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-radius: var(--pq-r-xl, 16px);
  }
  .header--xl {
    padding-bottom: 0;
    margin-bottom: 0;
    border-bottom: none;
    align-items: center;
  }
  .source--xl {
    gap: 14px;
    font-size: 10px;
    letter-spacing: 0.18em;
  }
  .source--xl svg {
    width: 28px;
    height: 28px;
    color: var(--pq-gold-bright, #fcbf49);
  }
  .verified--xl {
    gap: 8px;
    padding: 8px 14px;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .verified--xl svg {
    width: 14px;
    height: 14px;
  }

  .addr--xl {
    font-size: 24px;
    line-height: 1.55;
    color: var(--pq-text, #f1f5f9);
    padding: 20px;
    background: var(--pq-bg-glass, rgba(10, 26, 46, 0.5));
    border-radius: var(--pq-r-md, 8px);
    border-left: 4px solid var(--pq-gold-bright, #fcbf49);
  }
  .name--xl {
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 24px;
    margin: 0;
    line-height: 1.55;
  }
  .line--xl {
    font-size: 24px;
    line-height: 1.55;
  }
  .contact--xl {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
    gap: 24px;
  }
  .contact--xl span {
    font-size: 14px;
  }

  /* Right column: "what happens next" fulfillment panel. */
  .next-panel {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 28px 32px;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-xl, 16px);
    background: var(--pq-bg-glass, rgba(10, 26, 46, 0.5));
  }
  .next-panel__title {
    margin: 0 0 2px;
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 20px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--pq-text, #f1f5f9);
  }
  .next-step {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }
  .next-step__num {
    flex: 0 0 auto;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 16px;
    color: var(--pq-navy-deep, #0a1a2e);
    background: var(--pq-gold-bright, #fcbf49);
  }
  .next-step__name {
    margin: 0 0 2px;
    font-size: 16px;
    font-weight: 600;
    color: var(--pq-text, #f1f5f9);
  }
  .next-step__sub {
    margin: 0;
    font-size: 13px;
    line-height: 1.4;
    color: var(--pq-text-muted, #94a3b8);
  }
  .trust-line {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid var(--pq-navy-hairline, #2a4f7a);
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--pq-text-muted, #94a3b8);
  }
  .trust-line svg {
    width: 14px;
    height: 14px;
    color: var(--pq-emerald, #10b981);
  }

  .actions--xl {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    flex-wrap: wrap;
  }
  .confirm--xl {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 18px 40px;
    border: none;
    border-radius: var(--pq-r-md, 8px);
    background: var(--pq-cream, #f5efe6);
    color: var(--pq-navy-deep, #0a1a2e);
    font-family: var(--pq-font-display, var(--pq-font-body, sans-serif));
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .confirm--xl svg {
    width: 22px;
    height: 22px;
  }
  /* Strong secondary "ghost" button (ref .arc-btn--ghost) — replaces the old
     faint text link so the Edit affordance reads as a real button. */
  .ghost-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 16px 24px;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-md, 8px);
    background: transparent;
    color: var(--pq-text-muted, #94a3b8);
    font-family: var(--pq-font-body, sans-serif);
    font-size: 16px;
    cursor: pointer;
  }
  .ghost-btn svg {
    width: 16px;
    height: 16px;
  }

  /* ====================== ARCADE MODE (CSS only) ======================
     Second presentation axis, layered on top of any profile. Base colors stay
     on --pq-* above; here we promote to --arc-* tokens (with --pq-* fallbacks).
     Ambient motion is gated behind prefers-reduced-motion: no-preference. */
  :host-context([data-pq-mode="arcade"]) .card {
    border-color: var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    background: linear-gradient(
      160deg,
      rgba(60, 25, 110, 0.5),
      rgba(40, 15, 75, 0.85)
    );
  }
  :host-context([data-pq-mode="arcade"]) .name,
  :host-context([data-pq-mode="arcade"]) .name--xl {
    color: var(--arc-cream, var(--pq-text, #f1f5f9));
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  :host-context([data-pq-mode="arcade"]) .source svg,
  :host-context([data-pq-mode="arcade"]) .source--xl svg {
    color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
  }
  :host-context([data-pq-mode="arcade"]) .verified,
  :host-context([data-pq-mode="arcade"]) .verified--xl {
    background: rgba(52, 214, 112, 0.18);
    border-color: var(--arc-success, var(--pq-emerald, #10b981));
    color: var(--arc-success, var(--pq-emerald, #10b981));
  }
  :host-context([data-pq-mode="arcade"]) .addr--xl {
    color: var(--arc-cream, var(--pq-text, #f1f5f9));
    background: var(--arc-bg-glass, rgba(15, 4, 46, 0.5));
    border-left-color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
  }
  :host-context([data-pq-mode="arcade"]) .confirm--xl {
    background: linear-gradient(
      180deg,
      var(--arc-display, var(--pq-gold-bright, #fcbf49)),
      var(--arc-display-deep, var(--pq-gold, #f7a93a))
    );
    color: var(--arc-bg-deep, var(--pq-navy-deep, #0a1a2e));
    box-shadow: 0 0 24px var(--arc-display-glow, rgba(252, 191, 73, 0.45));
  }

  /* hero — neon display headline + green verified disc */
  :host-context([data-pq-mode="arcade"]) .hero__disc {
    background: radial-gradient(
      circle at 50% 35%,
      var(--cat-teal, #2dd4bf),
      var(--arc-success, var(--pq-emerald, #34d670))
    );
    box-shadow: 0 0 40px rgba(52, 214, 112, 0.5);
  }
  :host-context([data-pq-mode="arcade"]) .hero__eyebrow {
    color: var(--arc-display, var(--pq-gold-bright, #ffd93d));
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }
  :host-context([data-pq-mode="arcade"]) .hero__title {
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    color: var(--arc-cream, var(--pq-text, #f5efe0));
  }
  :host-context([data-pq-mode="arcade"]) .hero__sub,
  :host-context([data-pq-mode="arcade"]) .next-step__sub,
  :host-context([data-pq-mode="arcade"]) .trust-line {
    color: var(--arc-text-dim, var(--pq-text-muted, #94a3b8));
  }

  /* "what happens next" panel — glass surface + neon numbered steps */
  :host-context([data-pq-mode="arcade"]) .next-panel {
    border-color: var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    background: linear-gradient(160deg, rgba(60, 25, 110, 0.5), rgba(40, 15, 75, 0.85));
  }
  :host-context([data-pq-mode="arcade"]) .next-panel__title,
  :host-context([data-pq-mode="arcade"]) .next-step__name {
    color: var(--arc-cream, var(--pq-text, #f5efe0));
  }
  :host-context([data-pq-mode="arcade"]) .next-step__num {
    background: linear-gradient(
      135deg,
      var(--arc-display, var(--pq-gold-bright, #ffd93d)),
      var(--cat-orange, #ff8c2c)
    );
    color: var(--arc-bg-deep, var(--pq-navy-deep, #0a1a2e));
  }
  :host-context([data-pq-mode="arcade"]) .trust-line svg {
    color: var(--arc-success, var(--pq-emerald, #34d670));
  }

  /* strong secondary "ghost" Edit button (ref .arc-btn--ghost) */
  :host-context([data-pq-mode="arcade"]) .ghost-btn {
    background: var(--arc-bg-glass, rgba(60, 25, 110, 0.5));
    border-color: var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    color: var(--arc-text-dim, var(--pq-text, #f5efe0));
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
  }
  :host-context([data-pq-mode="arcade"]) .ghost-btn:hover {
    background: rgba(80, 40, 140, 0.6);
    border-color: var(--arc-display, var(--pq-gold-bright, #ffd93d));
    color: var(--arc-cream, var(--pq-text, #f5efe0));
  }

  /* ===== portrait orientation (kiosk-portrait 1080×1920) — stack the columns,
     shrink the hero so it doesn't dominate the narrower frame. ===== */
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .addr-2col {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .hero__title {
    font-size: 40px;
  }
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .flow {
    padding: 8px 40px 24px;
    gap: 28px;
  }

  @media (prefers-reduced-motion: no-preference) {
    :host-context([data-pq-mode="arcade"]) .confirm--xl {
      transition: box-shadow 0.3s ease, transform 0.15s ease;
    }
    :host-context([data-pq-mode="arcade"]) .confirm--xl:hover {
      box-shadow: 0 0 36px var(--arc-display-glow, rgba(252, 191, 73, 0.65));
      transform: translateY(-1px);
    }
  }

  /* ====================== ARCADE MODE · COMPACT (TTD 480×234, Session 29) ===
     The compact/standard render reuses .card / .verified / .source / .line /
     .edit. The arcade host above already restyles the full-size .card surface;
     here we tune the dense-frame compact specifics onto the SAME compact classes
     so the TTD frame reads the arcade theme. Spec map: verified check badge →
     .verified (green→teal disc-ish glow), "Ships to" eyebrow → .source, address
     body text → .line (cream, line-height 1.4) inside a gold-left-edge .card,
     Continue → inline .confirm (arc primary gradient), Edit → .edit button
     (arc ghost). Append-only; gated on arcade + compact. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .card {
    border-left: 3px solid var(--arc-display, var(--pq-gold-bright, #ffd93d));
    border-radius: var(--arc-r-sm, var(--pq-r-md, 6px));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .source {
    color: var(--arc-text-faint, var(--pq-text-faint, #8b7aaa));
    font-family: var(--arc-font-mono, var(--pq-font-mono, monospace));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .source svg {
    color: var(--arc-display, var(--pq-gold-bright, #ffd93d));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .verified {
    background: linear-gradient(
      135deg,
      var(--arc-success, var(--pq-emerald, #34d670)),
      var(--cat-teal, #2dd4bf)
    );
    border-color: transparent;
    color: var(--arc-bg-deep, var(--pq-navy-deep, #15042e));
    box-shadow: 0 0 12px rgba(52, 214, 112, 0.5);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .verified svg {
    color: var(--arc-bg-deep, var(--pq-navy-deep, #15042e));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .line {
    color: var(--arc-cream, var(--pq-text, #f5efe0));
    line-height: 1.4;
  }
  /* Continue = arc primary (the compact .confirm button) */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .confirm {
    background: linear-gradient(
      135deg,
      var(--arc-display-bright, var(--pq-gold-bright, #ffee5c)),
      var(--cat-orange, #ff8c2c)
    );
    color: var(--arc-bg-deep, var(--pq-navy-deep, #15042e));
  }
  /* Edit = arc ghost (the compact .edit button) */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .edit {
    border-color: var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .edit button {
    background: rgba(60, 25, 110, 0.5);
    border: 1px solid var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    border-radius: var(--arc-r-sm, var(--pq-r-md, 6px));
    padding: 4px 8px;
    color: var(--arc-text-dim, var(--pq-text-muted, #d0bfec));
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
  }

  /* ====================== COMPACT · address-verified (renderCompact) =========
     Dedicated dense TTD layout (ref ttd-arcade Screen 07): small check + a
     condensed .card (reusing .header/.source/.verified/.name/.line styling, incl.
     the arcade-compact overrides above) + a bottom Edit/Continue row. Sized to
     fit 480×234 without scroll; the inline-styled standard .confirm button is NOT
     used here. Themed via --pq-* (casino/arcade) + arcade specifics below. */
  :host([profile="compact"]) .wrap-compact {
    display: flex;
    flex-direction: column;
    gap: 5px;
    height: 100%;
    box-sizing: border-box;
    padding-bottom: 2px;
  }
  :host([profile="compact"]) .cm-check {
    flex: 0 0 auto;
    width: 26px;
    height: 26px;
    margin: 0 auto;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--pq-emerald, #10b981);
    color: #fff;
  }
  :host([profile="compact"]) .cm-check svg {
    width: 14px;
    height: 14px;
  }
  :host([profile="compact"]) .cm-card {
    padding: 6px 9px;
    border-radius: var(--pq-r-md, 8px);
  }
  :host([profile="compact"]) .cm-card .header {
    padding-bottom: 5px;
    margin-bottom: 5px;
  }
  :host([profile="compact"]) .cm-card .name {
    font-size: 13px;
    margin: 0 0 2px;
  }
  :host([profile="compact"]) .cm-card .line {
    font-size: 11px;
    line-height: 1.35;
  }
  :host([profile="compact"]) .cm-actions {
    display: flex;
    gap: 6px;
    margin-top: auto;
  }
  :host([profile="compact"]) .cm-edit {
    flex: 0 0 auto;
    padding: 7px 10px;
    border-radius: var(--pq-r-md, 6px);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    background: transparent;
    color: var(--pq-text-muted, #94a3b8);
    font-family: var(--pq-font-body, sans-serif);
    font-size: 11px;
    cursor: pointer;
  }
  :host([profile="compact"]) .cm-go {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 7px 10px;
    border: none;
    border-radius: var(--pq-r-md, 6px);
    background: var(--pq-gold, #fcbf49);
    color: var(--pq-navy-deep, #0a1a2e);
    font-family: var(--pq-font-display, sans-serif);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
  }
  :host([profile="compact"]) .cm-go svg {
    width: 14px;
    height: 14px;
  }

  /* arcade specifics: neon check disc + gold-gradient Continue + glass ghost Edit */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cm-check {
    background: radial-gradient(circle at 50% 35%, #4ade9b, var(--arc-success, #34d670));
    box-shadow: 0 0 14px rgba(52, 214, 112, 0.6);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cm-go {
    background: linear-gradient(135deg, var(--arc-display-bright, #ffee5c), var(--cat-orange, #ff8c2c));
    color: var(--arc-bg-deep, #15042e);
    box-shadow:
      0 2px 0 var(--arc-display-deep, #e0b71b),
      0 0 10px var(--arc-display-glow, rgba(255, 217, 61, 0.45));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cm-edit {
    background: rgba(60, 25, 110, 0.5);
    border-color: var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
    color: var(--arc-text-dim, #d0bfec);
    font-family: var(--arc-font-display, sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
  }
`;
