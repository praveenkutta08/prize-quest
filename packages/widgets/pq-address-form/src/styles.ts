import { css } from "lit";

/**
 * Scoped styles for `<pq-address-form>`.
 *
 * Three presentation profiles, each anchored to a visual ground truth:
 *  - compact  → TTD arcade 480x234 (ref ttd-arcade Screen 07): `.addr-form*` selectors
 *               copied VERBATIM from prize-quest-ttd-arcade.html (CSS lines 979-1025).
 *  - expanded → kiosk arcade 1920x1080 (ref kiosk-arcade Screen 07): `.addr-form-wrap*`
 *               selectors copied VERBATIM from prize-quest-kiosk-arcade.html (CSS 769-822).
 *  - standard → mobile/tablet single-column stack, neutral `.std-*` classes on --pq-* tokens.
 *
 * The verbatim arcade CSS uses --arc-* tokens; a casino-loud override block maps the
 * same fields onto --cl-* tokens (ref ttd-casino-loud.html "Editable address form").
 */
export const styles = css`
  :host {
    display: block;
    color: var(--pq-text, #f1f5f9);
  }

  /* =========================================================
     COMPACT PROFILE — TTD arcade 480x234 (ref Screen 07)
     CSS below copied VERBATIM from prize-quest-ttd-arcade.html lines 979-1025.
     ========================================================= */
  .addr-form { display: flex; flex-direction: column; gap: 5px; flex: 1; min-height: 0; }
  .addr-form-row { display: flex; gap: 5px; }
  .addr-form-field { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .addr-form-label {
    font-family: var(--arc-font-mono);
    font-size: 7px;
    color: var(--arc-text-faint);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
  }
  .addr-form-input {
    width: 100%;
    height: 20px;
    padding: 0 6px;
    background: rgba(15, 4, 46, 0.6);
    border: 1px solid var(--arc-hairline-2);
    border-radius: 3px;
    color: var(--arc-cream);
    font-family: var(--arc-font-body);
    font-size: 10px;
    outline: none;
    transition: border-color 120ms ease, box-shadow 120ms ease;
  }
  .addr-form-input:focus {
    border-color: var(--arc-display);
    box-shadow: 0 0 0 1px var(--arc-glow-soft);
  }
  .addr-form-input--retrieved {
    border-color: var(--arc-display);
    box-shadow: 0 0 4px var(--arc-glow-soft);
  }
  .addr-retrieved-pill {
    display: inline-flex; align-items: center; gap: 4px;
    align-self: flex-start;
    padding: 2px 7px;
    background: rgba(52, 214, 112, 0.18);
    border: 1px solid var(--arc-success);
    border-radius: 999px;
    color: var(--arc-success);
    font-family: var(--arc-font-mono);
    font-size: 7px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
  }
  .addr-retrieved-pill svg { width: 8px; height: 8px; }
  /* End verbatim TTD block. */

  /* Compact wrapper + button row. min-height (not height) so the fuller SS5 layout
     — title + Full Name + address + phone + email — can grow and scroll inside the
     #screen frame; when short, margin-top:auto still pins the button row to the bottom. */
  .wrap-compact {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-height: 100%;
    box-sizing: border-box;
  }
  .addr-form-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }
  .addr-form-title {
    margin: 0;
    font-family: var(--arc-font-display, "Manrope", sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 13px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--arc-display, #ffd93d);
  }
  .wrap-compact .addr-btn-row {
    display: flex;
    gap: 6px;
    margin-top: auto;
  }

  /* Compact arc buttons (ref ttd-arcade .arc-btn / --primary / --ghost). */
  .arc-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 6px 12px;
    border: none;
    border-radius: var(--arc-r-md, var(--pq-r-md, 6px));
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    color: var(--arc-text, var(--pq-text, #f5efe0));
    background: var(--pq-navy-low, #143352);
    transition: transform 60ms ease, box-shadow 60ms ease;
  }
  .arc-btn svg { width: 10px; height: 10px; }
  .arc-btn:active { transform: translateY(1px); }
  .arc-btn--primary {
    background: linear-gradient(
      135deg,
      var(--arc-display-bright, var(--pq-gold-bright, #ffee5c)),
      var(--cat-orange, var(--pq-gold, #ff8c2c))
    );
    color: var(--arc-bg-deep, var(--pq-navy-deep, #0a1a2e));
    box-shadow: 0 2px 0 var(--arc-display-deep, var(--pq-gold, #e0b71b)),
      0 4px 12px var(--arc-display-glow, rgba(252, 191, 73, 0.45)),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
  }
  .arc-btn--ghost {
    background: var(--arc-bg-glass, rgba(60, 25, 110, 0.5));
    border: 1px solid var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    color: var(--arc-text-dim, var(--pq-text-muted, #d0bfec));
    box-shadow: none;
    font-family: var(--arc-font-body, var(--pq-font-body, sans-serif));
    font-weight: 600;
    font-size: 10px;
    text-transform: none;
    letter-spacing: 0;
    padding: 4px 10px;
  }
  .arc-btn[disabled] {
    opacity: 0.45;
    cursor: not-allowed;
    filter: grayscale(0.3);
  }

  /* =========================================================
     EXPANDED PROFILE — kiosk arcade 1920x1080 (ref Screen 07)
     CSS below copied VERBATIM from prize-quest-kiosk-arcade.html lines 769-822.
     ========================================================= */
  .addr-form-wrap {
    width: 100%;
    max-width: 900px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .addr-form-wrap .addr-form-row { display: flex; gap: 18px; }
  .addr-form-wrap .addr-form-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .addr-form-wrap .addr-form-label {
    font-family: var(--arc-font-mono);
    font-size: 12px;
    font-weight: 700;
    color: var(--arc-text-faint);
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .addr-form-wrap .addr-form-input {
    width: 100%;
    height: 56px;
    padding: 0 18px;
    background: var(--arc-bg-glass);
    border: 1px solid var(--arc-hairline-2);
    border-radius: var(--arc-r-md);
    color: var(--arc-cream);
    font-family: var(--arc-font-body);
    font-size: 18px;
    outline: none;
    transition: border-color 160ms ease, box-shadow 160ms ease;
  }
  .addr-form-wrap .addr-form-input:focus {
    border-color: var(--arc-display);
    box-shadow: 0 0 0 2px var(--arc-glow-soft);
  }
  .addr-form-wrap .addr-form-input--retrieved {
    border-color: var(--arc-display);
    box-shadow: 0 0 12px var(--arc-glow-soft);
  }
  .addr-form-wrap-pill.addr-retrieved-pill {
    gap: 8px;
    padding: 8px 18px;
    border-radius: var(--arc-r-pill, 999px);
    font-family: var(--arc-font-display);
    font-size: 13px;
    letter-spacing: 0.10em;
    font-weight: var(--arc-font-display-weight, 800);
  }
  .addr-form-wrap-pill.addr-retrieved-pill svg { width: 14px; height: 14px; }
  /* End verbatim kiosk block. */

  /* Expanded scroll/flow wrapper + hero + button row. */
  .wrap-expanded {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    width: 100%;
    box-sizing: border-box;
    padding: 8px 56px 24px;
  }
  .xl-head {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    text-align: center;
  }
  .xl-eyebrow {
    margin: 0;
    font-family: var(--arc-font-mono, var(--pq-font-mono, monospace));
    font-size: 13px;
    color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 700;
  }
  .xl-title {
    margin: 0;
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 56px;
    line-height: 1;
    color: var(--arc-cream, var(--pq-text, #f1f5f9));
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  .xl-sub {
    margin: 0;
    font-size: 18px;
    color: var(--arc-text-dim, var(--pq-text-muted, #94a3b8));
  }
  .xl-btn-row {
    display: flex;
    gap: 18px;
    width: 100%;
    max-width: 900px;
    padding-top: 8px;
  }
  .xl-btn-row .arc-btn {
    padding: 18px 28px;
    font-size: 20px;
    border-radius: var(--arc-r-md, var(--pq-r-md, 8px));
  }
  .xl-btn-row .arc-btn svg { width: 22px; height: 22px; }
  .xl-btn-row .arc-btn--ghost { font-size: 18px; }

  /* =========================================================
     STANDARD PROFILE — mobile/tablet single-column stack.
     Neutral .std-* classes themed on semantic --pq-* tokens so they don't
     collide with the verbatim arcade selectors above.
     ========================================================= */
  .std-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .std-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    align-self: flex-start;
    padding: 4px 12px;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid var(--pq-emerald, #10b981);
    border-radius: var(--pq-r-full, 9999px);
    color: var(--pq-emerald, #10b981);
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 700;
  }
  .std-pill svg { width: 12px; height: 12px; }
  .std-row { display: flex; gap: 12px; }
  .std-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    flex: 1;
  }
  .std-label {
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    font-weight: 700;
    color: var(--pq-text-muted, #94a3b8);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .std-input {
    width: 100%;
    box-sizing: border-box;
    height: 40px;
    padding: 0 12px;
    background: var(--pq-bg-glass, rgba(10, 26, 46, 0.5));
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-md, 8px);
    color: var(--pq-text, #f1f5f9);
    font-family: var(--pq-font-body, sans-serif);
    /* 16px avoids iOS Safari zoom-on-focus. */
    font-size: 16px;
    outline: none;
    transition: border-color 160ms ease, box-shadow 160ms ease;
  }
  .std-input:focus {
    border-color: var(--pq-gold-bright, #fcbf49);
    box-shadow: 0 0 0 2px rgba(252, 191, 73, 0.25);
  }
  .std-input--retrieved {
    border-color: var(--pq-gold-bright, #fcbf49);
  }
  .std-input--error {
    border-color: var(--pq-danger, #ef4444);
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25);
  }
  .std-err {
    font-size: 11px;
    color: var(--pq-danger, #ef4444);
  }
  .std-btn-row {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 6px;
  }
  .std-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: var(--pq-r-md, 8px);
    font-family: var(--pq-font-display, var(--pq-font-body, sans-serif));
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
  }
  .std-btn--primary {
    background: var(--pq-gold-bright, #fcbf49);
    color: var(--pq-navy-deep, #0a1a2e);
  }
  .std-btn--ghost {
    background: transparent;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    color: var(--pq-text-muted, #94a3b8);
  }
  .std-btn[disabled] {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* Shared error styling for the arcade (compact/expanded) inputs. */
  .addr-form-input--error,
  .addr-form-wrap .addr-form-input--error {
    border-color: var(--pq-danger, #ef4444);
    box-shadow: 0 0 0 1px var(--pq-danger, #ef4444);
  }

  /* =========================================================
     CASINO-LOUD MODE OVERRIDES
     Map the verbatim --arc-* form fields onto --cl-* tokens.
     Values ref prize-quest-ttd-casino-loud.html "Editable address form".
     ========================================================= */
  :host-context([data-pq-mode="casino-loud"]) .addr-retrieved-pill,
  :host-context([data-pq-mode="casino-loud"]) .std-pill {
    background: rgba(56, 210, 125, 0.18);
    border-color: var(--cl-success, #38d27d);
    color: var(--cl-success, #38d27d);
    font-family: var(--cl-font-mono, var(--pq-font-mono, monospace));
  }
  :host-context([data-pq-mode="casino-loud"]) .addr-form-label,
  :host-context([data-pq-mode="casino-loud"]) .std-label {
    color: var(--cl-cream, var(--pq-text, #f5efe0));
    opacity: 0.6;
    font-family: var(--cl-font-mono, var(--pq-font-mono, monospace));
  }
  :host-context([data-pq-mode="casino-loud"]) .addr-form-input,
  :host-context([data-pq-mode="casino-loud"]) .std-input {
    background: var(--cl-black, #06030a);
    border-color: var(--cl-burgundy, #5a1626);
    color: var(--cl-cream, var(--pq-text, #f5efe0));
    font-family: var(--cl-font-body, var(--pq-font-body, sans-serif));
  }
  :host-context([data-pq-mode="casino-loud"]) .addr-form-input:focus,
  :host-context([data-pq-mode="casino-loud"]) .std-input:focus {
    border-color: var(--cl-gold, #d4a017);
    box-shadow: 0 0 0 1px var(--cl-gold-glow, rgba(212, 160, 23, 0.5));
  }
  :host-context([data-pq-mode="casino-loud"]) .addr-form-input--retrieved,
  :host-context([data-pq-mode="casino-loud"]) .std-input--retrieved {
    border-color: var(--cl-gold, #d4a017);
    box-shadow: 0 0 4px var(--cl-gold-glow, rgba(212, 160, 23, 0.5));
  }
  :host-context([data-pq-mode="casino-loud"]) .arc-btn--primary,
  :host-context([data-pq-mode="casino-loud"]) .std-btn--primary {
    background: linear-gradient(
      180deg,
      var(--cl-red-bright, #ff5a5a),
      var(--cl-red, #d12030),
      var(--cl-red-deep, #8a0f1c)
    );
    color: var(--cl-cream, #f5efe0);
    border: 1px solid var(--cl-red, #d12030);
    box-shadow: 0 0 10px var(--cl-red-glow, rgba(209, 32, 48, 0.5)),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  :host-context([data-pq-mode="casino-loud"]) .arc-btn--ghost,
  :host-context([data-pq-mode="casino-loud"]) .std-btn--ghost {
    background: transparent;
    color: var(--cl-text-dim, var(--pq-text-muted, #c3b6a0));
    border: 1px solid var(--cl-burgundy, #5a1626);
    font-family: var(--cl-font-mono, var(--pq-font-mono, monospace));
  }

  /* ===== iVIEW (1024x600 + 800x480) — scale compact up for touch ===== */
  /* Compact = the verbatim TTD arcade form (.addr-form-* bare classes) + the
     compact .arc-btn buttons. This file's compact rules are bare classes
     (expanded scopes under .addr-form-wrap / .xl-*; standard uses .std-*), so
     we mirror the bare-class form prefixed with the iVIEW form-factor context. */
  :host-context([data-formfactor^="iview"]) .addr-form-label {
    font-size: 10px;
  }
  :host-context([data-formfactor^="iview"]) .addr-form-input {
    height: 36px;
    line-height: 36px;
    padding: 0 10px;
    font-size: 14px;
  }
  :host-context([data-formfactor^="iview"]) .arc-btn {
    padding: 10px 18px;
    font-size: 13px;
  }
  :host-context([data-formfactor^="iview"]) .arc-btn--ghost {
    padding: 10px 18px;
    font-size: 13px;
  }
`;
