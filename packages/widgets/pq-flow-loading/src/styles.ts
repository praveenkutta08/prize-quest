import { css } from "lit";

/**
 * Scoped styles for `<pq-flow-loading>`. Reference: `.loading` (TTD screen 06).
 * Colors use the premium-safe var(--cl-*, <fallback>) trick.
 */
export const styles = css`
  :host {
    display: block;
    color: var(--pq-text, #f1f5f9);
  }
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 100%;
    padding: 12px;
    text-align: center;
  }
  .spinner {
    width: 30px;
    height: 30px;
    border: 2px solid var(--cl-burgundy, var(--pq-navy-hairline, #2a4f7a));
    border-top-color: var(--cl-gold-bright, var(--pq-gold-bright, #fcbf49));
    border-right-color: var(--cl-gold-bright, var(--pq-gold-bright, #fcbf49));
    border-radius: 50%;
    box-shadow: 0 0 10px var(--cl-gold-glow, transparent);
  }
  @media (prefers-reduced-motion: no-preference) {
    .spinner {
      animation: pq-spin 0.9s linear infinite;
    }
    .step--active .dot {
      animation: pq-dot 1s ease-in-out infinite;
    }
  }
  @keyframes pq-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes pq-dot {
    50% {
      opacity: 0.5;
    }
  }
  .text {
    margin: 0;
    font-family: var(--pq-font-display, sans-serif);
    font-size: 14px;
    line-height: 1;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--cl-gold-bright, var(--pq-text, #f1f5f9));
    text-shadow: 0 0 6px var(--cl-gold-glow, transparent);
  }
  .sub {
    margin: 0;
    font-family: var(--pq-font-mono, monospace);
    font-size: 8px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--pq-text-muted, #94a3b8);
  }
  .steps {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
  }
  .step {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--cl-burgundy, var(--pq-navy-hairline, #2a4f7a));
  }
  .sep {
    color: var(--pq-text-faint, #64748b);
    font-size: 8px;
  }
  .step--pending {
    color: var(--pq-text-faint, #64748b);
  }
  .step--active {
    color: var(--cl-gold-bright, var(--pq-gold-bright, #fcbf49));
  }
  .step--active .dot {
    background: var(--cl-gold-bright, var(--pq-gold-bright, #fcbf49));
    box-shadow: 0 0 6px var(--cl-gold-glow, transparent);
  }
  .step--done {
    color: var(--cl-success, var(--pq-emerald, #10b981));
  }
  .step--done .dot {
    background: var(--cl-success, var(--pq-emerald, #10b981));
  }

  /* ============================================================
     EXPANDED PROFILE · big kiosk loader + pill stepper (spec 6.10)
     ============================================================ */
  :host([profile="expanded"]) .kiosk {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 48px;
    min-height: 100%;
    padding: 48px;
    text-align: center;
  }
  .loader {
    position: relative;
    width: 240px;
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .loader__glow {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      var(--cl-gold-glow, var(--pq-gold-glow, rgba(252, 191, 73, 0.28))) 0%,
      transparent 68%
    );
  }
  .loader__ring {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .loader__track {
    fill: none;
    stroke: var(--cl-burgundy, var(--pq-navy-hairline, #2a4f7a));
    stroke-width: 6;
    opacity: 0.4;
  }
  .loader__arc {
    fill: none;
    stroke: var(--cl-gold-bright, var(--pq-gold-bright, #fcbf49));
    stroke-width: 6;
    stroke-linecap: round;
    stroke-dasharray: 80 196;
    transform-origin: 50% 50%;
    filter: drop-shadow(0 0 8px var(--cl-gold-glow, transparent));
  }
  .loader__label {
    position: relative;
    font-family: var(--pq-font-mono, monospace);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--cl-gold-bright, var(--pq-text, #f1f5f9));
    text-shadow: 0 0 8px var(--cl-gold-glow, transparent);
  }
  .copy {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .headline {
    margin: 0;
    font-family: var(--pq-font-display, sans-serif);
    font-size: 56px;
    line-height: 1.05;
    color: var(--pq-text, #f1f5f9);
  }
  .subline {
    margin: 0;
    font-family: var(--pq-font-body, sans-serif);
    font-size: 20px;
    color: var(--pq-text-muted, #94a3b8);
  }
  .pills {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 22px;
    border-radius: var(--pq-r-pill, 999px);
    background: var(--pq-surface-glass, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--pq-hairline, rgba(148, 163, 184, 0.2));
  }
  .pill {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pill__mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    flex: none;
  }
  .pill__mark svg {
    width: 16px;
    height: 16px;
  }
  .pill__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--pq-text-faint, #64748b);
  }
  .pill__spinner {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-right-color: currentColor;
  }
  .pill__label {
    font-family: var(--pq-font-mono, monospace);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .pill--done .pill__mark {
    background: var(--cl-success, var(--pq-success, #10b981));
    color: #fff;
  }
  .pill--done .pill__label {
    color: var(--cl-success, var(--pq-success, #10b981));
  }
  .pill--active .pill__mark {
    background: var(--cl-gold-bright, var(--pq-accent, #fcbf49));
    color: var(--pq-surface, #0b1220);
  }
  .pill--active .pill__label {
    color: var(--cl-gold-bright, var(--pq-accent, #fcbf49));
  }
  .pill--pending .pill__mark {
    border: 2px solid var(--pq-text-faint, #64748b);
  }
  .pill--pending .pill__label {
    color: var(--pq-text-faint, #64748b);
  }
  @media (prefers-reduced-motion: no-preference) {
    :host([profile="expanded"]) .loader__arc {
      animation: pq-spin 1.2s linear infinite;
    }
    :host([profile="expanded"]) .pill__spinner {
      animation: pq-spin 0.9s linear infinite;
    }
  }

  /* ============================================================
     ARCADE MODE · CSS-only skin (global keyframes from arcade.css)
     ============================================================ */
  :host-context([data-pq-mode="arcade"]) .text,
  :host-context([data-pq-mode="arcade"]) .headline {
    color: var(--arc-display, var(--pq-text, #f1f5f9));
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }
  :host-context([data-pq-mode="arcade"]) .loader__arc {
    stroke: var(--arc-display, #ffd93d);
    filter: drop-shadow(0 0 10px var(--arc-display-glow, transparent));
  }
  :host-context([data-pq-mode="arcade"]) .loader__label {
    color: var(--arc-display, #ffd93d);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }
  :host-context([data-pq-mode="arcade"]) .loader__glow {
    background: radial-gradient(circle, var(--arc-display-glow, rgba(255, 217, 61, 0.55)) 0%, transparent 68%);
  }
  :host-context([data-pq-mode="arcade"]) .pill--done .pill__mark {
    background: var(--arc-success, #34d670);
  }
  :host-context([data-pq-mode="arcade"]) .pill--done .pill__label {
    color: var(--arc-success, #34d670);
  }
  :host-context([data-pq-mode="arcade"]) .pill--active .pill__mark {
    background: var(--arc-display, #ffd93d);
    color: var(--arc-bg-base, #1f0b3e);
  }
  :host-context([data-pq-mode="arcade"]) .pill--active .pill__label {
    color: var(--arc-display, #ffd93d);
  }
  :host-context([data-pq-mode="arcade"]) .pill--pending .pill__label {
    color: var(--arc-text-faint, #8b7aaa);
  }
  @media (prefers-reduced-motion: no-preference) {
    :host-context([data-pq-mode="arcade"]) .loader__arc {
      animation: spin-slow 1.2s linear infinite;
    }
    :host-context([data-pq-mode="arcade"]) .pill--active .pill__mark {
      animation: pulse-glow 1.6s ease-in-out infinite;
    }
  }

  /* ===== ARCADE · COMPACT (TTD 480×234) — neon reskin of default render ===== */
  /* Gated on arcade + compact so the shared .spinner/.text/.sub/.step classes
     are only re-skinned in the TTD compact profile; standard/expanded untouched.
     Note: .spinner is a CSS-border ring (template-set stroke colors) — we add the
     glow + pulse-glow halo via box-shadow; the title/status get arc display + mono. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .spinner {
    border-color: var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
    border-top-color: var(--arc-display, #ffd93d);
    border-right-color: var(--arc-display, #ffd93d);
    box-shadow: 0 0 12px var(--arc-display-glow, rgba(255, 217, 61, 0.55));
  }
  @media (prefers-reduced-motion: no-preference) {
    :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .spinner {
      animation:
        pq-spin 0.9s linear infinite,
        pulse-glow 2.4s ease-in-out infinite;
    }
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .text {
    font-family: var(--arc-font-display, sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    color: var(--arc-cream, #f5efe0);
    letter-spacing: 0.02em;
    text-transform: uppercase;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .sub {
    font-family: var(--arc-font-mono, monospace);
    color: var(--arc-display, #ffd93d);
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .step--active {
    color: var(--arc-display, #ffd93d);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .step--active .dot {
    background: var(--arc-display, #ffd93d);
    box-shadow: 0 0 6px var(--arc-display-glow, transparent);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .step--done {
    color: var(--arc-success, #34d670);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .step--done .dot {
    background: var(--arc-success, #34d670);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .step--pending,
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .sep {
    color: var(--arc-text-faint, #8b7aaa);
  }

  /* ============================================================
     PHASES MODE · explicit multi-phase loader (Session 30)
     Compact = verbatim ttd-arcade 06a/06b; expanded = scaled kiosk-arcade.
     Visuals are arcade-token-driven with premium-safe fallbacks so the
     widget also renders sanely outside arcade mode.
     ============================================================ */
  .load-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    min-height: 100%;
    padding: 12px;
    text-align: center;
  }
  .load-spinner {
    position: relative;
    width: 60px;
    height: 60px;
    display: grid;
    place-items: center;
    color: var(--arc-display, var(--cl-gold-bright, var(--pq-gold-bright, #ffd93d)));
  }
  .load-spinner__ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 4px solid var(--arc-hairline-2, rgba(140, 100, 200, 0.15));
    border-top-color: var(--arc-display, var(--cl-gold-bright, #ffd93d));
    border-right-color: var(--arc-display, var(--cl-gold-bright, #ffd93d));
    box-shadow: 0 0 12px var(--arc-display-glow, transparent);
  }
  .load-spinner__icon {
    position: relative;
    width: 20px;
    height: 20px;
  }
  .load-title {
    margin: 0;
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 18px;
    line-height: 1;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--arc-cream, var(--cl-gold-bright, var(--pq-text, #f5efe0)));
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }

  /* ---- Stepper (horizontal row of phase items + hairline connectors) ---- */
  .stepper {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .stepper__connector {
    width: 12px;
    height: 1px;
    background: var(--arc-hairline-2, var(--pq-hairline, rgba(140, 100, 200, 0.35)));
    flex: none;
  }
  .phase {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .phase__mark {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    flex: none;
  }
  .phase__mark svg {
    width: 9px;
    height: 9px;
  }
  .phase__dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--arc-hairline-2, var(--pq-text-faint, #8b7aaa));
  }
  .phase__label {
    font-family: var(--arc-font-mono, var(--pq-font-mono, monospace));
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  /* pending */
  .phase--pending .phase__mark {
    border: 1.5px solid var(--arc-hairline-2, var(--pq-text-faint, #8b7aaa));
  }
  .phase--pending .phase__label {
    color: var(--arc-text-faint, var(--pq-text-faint, #8b7aaa));
  }
  /* active — display bg, glyph in bg-deep, pulse-glow halo */
  .phase--active .phase__mark {
    background: var(--arc-display, var(--cl-gold-bright, #ffd93d));
    color: var(--arc-bg-deep, var(--pq-surface, #1f0b3e));
  }
  .phase--active .phase__label {
    color: var(--arc-display, var(--cl-gold-bright, #ffd93d));
  }
  /* completed — success bg, white check, success label */
  .phase--done .phase__mark {
    background: var(--arc-success, var(--cl-success, var(--pq-success, #34d670)));
    color: #fff;
    box-shadow: 0 0 6px var(--arc-success-glow, rgba(52, 214, 112, 0.6));
  }
  .phase--done .phase__label {
    color: var(--arc-success, var(--cl-success, var(--pq-success, #34d670)));
  }

  @media (prefers-reduced-motion: no-preference) {
    .load-spinner__ring {
      animation: pq-spin 1.2s linear infinite;
    }
    .phase--active .phase__mark {
      animation: pulse-glow 1.4s ease-in-out infinite;
    }
    .phase__spin {
      transform-origin: center;
      animation: spin-slow 1.2s linear infinite;
    }
  }
  /* spin-slow is a global arcade keyframe; provide a local fallback outside arcade */
  @keyframes spin-slow {
    to {
      transform: rotate(360deg);
    }
  }

  /* ---- Expanded scale (kiosk-arcade 06a/06b) ---- */
  .load-wrap--expanded {
    gap: 48px;
    padding: 56px;
  }
  .load-wrap--expanded .load-spinner {
    width: 240px;
    height: 240px;
  }
  .load-wrap--expanded .load-spinner__ring {
    border-width: 8px;
  }
  .load-wrap--expanded .load-spinner__icon {
    width: 64px;
    height: 64px;
  }
  .load-wrap--expanded .load-title {
    font-size: 56px;
  }
  .load-wrap--expanded .stepper {
    gap: 24px;
    padding: 16px 32px;
    border: 1px solid var(--arc-hairline-2, var(--pq-hairline, rgba(140, 100, 200, 0.35)));
    border-radius: var(--arc-r-pill, var(--pq-r-pill, 999px));
    background: var(--arc-pill-bg, rgba(60, 25, 110, 0.4));
  }
  .load-wrap--expanded .stepper__connector {
    width: 28px;
  }
  .load-wrap--expanded .phase {
    gap: 10px;
  }
  .load-wrap--expanded .phase__mark {
    width: 28px;
    height: 28px;
  }
  .load-wrap--expanded .phase__mark svg {
    width: 16px;
    height: 16px;
  }
  .load-wrap--expanded .phase__dot {
    width: 8px;
    height: 8px;
  }
  .load-wrap--expanded .phase__label {
    font-size: 13px;
    letter-spacing: 0.16em;
  }

  /* ============================================================
     CASINO-LOUD MODE · stepper override (ttd-casino-loud 06a/06b)
     Maps the phase stepper onto the .loading__step* token palette so the
     two-phase loader matches the casino-loud reference skin.
     ============================================================ */
  :host-context([data-cl-mode="loud"]) .load-title,
  :host-context([data-pq-mode="casino-loud"]) .load-title {
    font-family: var(--cl-font-display, var(--pq-font-display, sans-serif));
    color: var(--cl-gold-bright, var(--pq-gold-bright, #ffb627));
    text-shadow: 0 0 6px var(--cl-gold-glow, transparent);
  }
  :host-context([data-cl-mode="loud"]) .load-spinner__ring,
  :host-context([data-pq-mode="casino-loud"]) .load-spinner__ring {
    border-color: var(--cl-burgundy, var(--pq-navy-hairline, #2a4f7a));
    border-top-color: var(--cl-gold-bright, #ffb627);
    border-right-color: var(--cl-gold-bright, #ffb627);
    box-shadow: 0 0 10px var(--cl-gold-glow, transparent);
  }
  :host-context([data-cl-mode="loud"]) .phase--active .phase__mark,
  :host-context([data-pq-mode="casino-loud"]) .phase--active .phase__mark {
    background: var(--cl-gold-bright, #ffb627);
    color: var(--cl-bg-deep, var(--pq-surface, #1a0e1f));
  }
  :host-context([data-cl-mode="loud"]) .phase--active .phase__label,
  :host-context([data-pq-mode="casino-loud"]) .phase--active .phase__label {
    color: var(--cl-gold-bright, #ffb627);
  }
  :host-context([data-cl-mode="loud"]) .phase--done .phase__mark,
  :host-context([data-pq-mode="casino-loud"]) .phase--done .phase__mark {
    background: var(--cl-success, var(--pq-success, #2bd47d));
  }
  :host-context([data-cl-mode="loud"]) .phase--done .phase__label,
  :host-context([data-pq-mode="casino-loud"]) .phase--done .phase__label {
    color: var(--cl-success, var(--pq-success, #2bd47d));
  }
  :host-context([data-cl-mode="loud"]) .phase--pending .phase__label,
  :host-context([data-pq-mode="casino-loud"]) .phase--pending .phase__label {
    color: var(--cl-text-faint, var(--pq-text-faint, #64748b));
  }

  /* ===== iVIEW (1024x600 + 800x480) — scale compact up for touch ===== */
  /* Compact = the PHASES two-phase loader (.load-wrap with no --expanded
     modifier). This file's compact rules are bare base classes (expanded adds
     .load-wrap--expanded), so we mirror that form scoped to :not(--expanded)
     and prefix with the iVIEW form-factor context. */
  :host-context([data-formfactor^="iview"]) .load-wrap:not(.load-wrap--expanded) .load-spinner {
    width: 96px;
    height: 96px;
  }
  :host-context([data-formfactor^="iview"]) .load-wrap:not(.load-wrap--expanded) .load-spinner__ring {
    border-width: 6px;
  }
  :host-context([data-formfactor^="iview"]) .load-wrap:not(.load-wrap--expanded) .load-spinner__icon {
    width: 32px;
    height: 32px;
  }
  :host-context([data-formfactor^="iview"]) .load-wrap:not(.load-wrap--expanded) .load-title {
    font-size: 22px;
  }
  :host-context([data-formfactor^="iview"]) .load-wrap:not(.load-wrap--expanded) .phase__label {
    font-size: 12px;
  }
`;
