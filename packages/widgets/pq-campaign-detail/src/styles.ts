import { css } from "lit";

/**
 * Scoped styles for `<pq-campaign-detail>`. Profile via reflected `profile` attr.
 * Visual reference: `.detail-hero` + prize grid; expanded = two-column.
 */
export const styles = css`
  :host {
    display: block;
    color: var(--pq-text, #f1f5f9);
  }

  .wrap {
    display: block;
  }
  :host([profile="expanded"]) .wrap {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    align-items: start;
  }

  /* ---------------- hero ---------------- */
  .hero {
    position: relative;
    padding: 24px;
    border-radius: var(--pq-r-2xl, 20px);
    overflow: hidden;
    background:
      radial-gradient(circle at 80% 0%, rgba(16, 185, 129, 0.18) 0%, transparent 55%),
      linear-gradient(180deg, var(--pq-navy-base, #102a43) 0%, var(--pq-navy-deep, #0a1a2e) 100%);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
  }
  .eyebrow-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }
  .timer {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--pq-text-faint, #64748b);
  }
  .title {
    font-family: var(--pq-font-serif, serif);
    font-weight: 500;
    font-size: 30px;
    line-height: 1.1;
    letter-spacing: -0.005em;
    margin: 4px 0 10px;
  }
  .sub {
    font-size: 14px;
    color: var(--pq-text-muted, #94a3b8);
    line-height: 1.6;
    margin: 0 0 24px;
  }
  .progress-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;
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
  .earn {
    margin: 16px 0 0;
    padding: 12px 14px;
    background: rgba(20, 51, 82, 0.5);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-md, 8px);
    font-size: 12px;
    color: var(--pq-text, #f1f5f9);
    line-height: 1.5;
  }
  .earn strong {
    color: var(--pq-emerald, #10b981);
    font-weight: 600;
  }

  /* ---------------- vault ---------------- */
  .vault {
    margin-top: 24px;
  }
  :host([profile="expanded"]) .vault {
    margin-top: 0;
  }
  .vault-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 0 0 16px;
  }
  .vault-title {
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 16px;
    margin: 0;
  }
  .vault-count {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    color: var(--pq-text-faint, #64748b);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .claim {
    margin-top: 20px;
    width: 100%;
    min-height: 48px;
    background: var(--pq-emerald, #10b981);
    color: var(--pq-navy-deep, #0a1a2e);
    border: none;
    border-radius: var(--pq-r-md, 8px);
    font-family: var(--pq-font-body, sans-serif);
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background 200ms var(--pq-ease, ease);
  }
  .claim:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .sk {
    background: var(--pq-navy-hairline, #2a4f7a);
    opacity: 0.35;
    border-radius: var(--pq-r-sm, 4px);
    display: block;
  }

  /* ====================== COMPACT (ref .det-hero + .prize-grid) ====================== */
  .wrap-compact {
    display: flex;
    flex-direction: column;
    gap: 4px;
    height: 100%;
  }
  /* A plain label row (Progress · $x / $y · pct) — the single progress bar that
     visualises completion is the <pq-progress-bar> rendered directly beneath it. */
  .det-hero {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .det-hero__label {
    margin: 0 auto 0 0;
    font-family: var(--pq-font-mono, monospace);
    font-size: 9px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--pq-text-faint, #8b7aaa);
  }
  .det-hero__title {
    margin: 0;
    font-family: var(--pq-font-display, sans-serif);
    font-size: 13px;
    line-height: 1;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--cl-gold-bright, var(--pq-text, #f1f5f9));
  }
  .det-hero__pct {
    flex: 0 0 auto;
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    font-weight: 700;
    color: var(--cl-cream, var(--pq-text, #f1f5f9));
  }
  .det-progress {
    margin-top: 2px;
    margin-bottom: 6px;
  }
  .prize-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    flex: 1;
    min-height: 0;
  }
  .prize-grid--locked {
    grid-template-columns: 1fr 1fr 1fr;
  }
  .locked-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 3px 8px;
    border-radius: 3px;
    border: 1px solid var(--cl-red-deep, var(--pq-danger, #ef4444));
    background: linear-gradient(180deg, rgba(168, 19, 26, 0.2), rgba(168, 19, 26, 0.06));
    font-family: var(--pq-font-display, sans-serif);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--cl-cream, var(--pq-text, #f1f5f9));
  }
  .locked-banner svg {
    width: 11px;
    height: 11px;
    color: var(--cl-red-bright, var(--pq-danger, #ef4444));
  }

  /* ====================== EXPANDED (kiosk / arcade rich detail) ====================== */
  .wrap-expanded {
    display: flex;
    flex-direction: column;
    gap: 40px;
    padding: 48px 56px;
  }

  .exp-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .exp-back {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 22px;
    border-radius: var(--pq-r-pill, 999px);
    border: 1px solid var(--pq-hairline, rgba(180, 130, 240, 0.35));
    background: var(--pq-surface-glass, rgba(60, 25, 110, 0.5));
    color: var(--pq-text-muted, #94a3b8);
    font-family: var(--pq-font-body, sans-serif);
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background 160ms var(--pq-ease, ease), color 160ms var(--pq-ease, ease);
  }
  .exp-back:hover {
    background: var(--pq-surface-elev, rgba(80, 40, 140, 0.6));
    color: var(--pq-text, #f1f5f9);
  }
  .exp-back svg {
    width: 18px;
    height: 18px;
  }
  .exp-freq {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 18px;
    border-radius: var(--pq-r-pill, 999px);
    border: 1px solid var(--exp-freq-accent, var(--pq-accent, #10b981));
    background: var(--exp-freq-bg, rgba(16, 185, 129, 0.18));
    font-family: var(--pq-font-mono, monospace);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--exp-freq-fg, var(--pq-accent, #10b981));
  }
  .exp-freq svg {
    width: 14px;
    height: 14px;
  }

  .exp-hero {
    display: grid;
    grid-template-columns: 1.4fr 0.8fr;
    gap: 56px;
    align-items: center;
  }
  .exp-hero__text {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .exp-display {
    margin: 0;
    font-family: var(--pq-font-display, sans-serif);
    font-size: 96px;
    line-height: 0.95;
    letter-spacing: 0.01em;
    text-transform: uppercase;
    color: var(--exp-display, var(--pq-accent, #10b981));
    text-shadow:
      0 0 32px var(--exp-display-glow, transparent),
      0 4px 0 var(--exp-display-deep, transparent);
  }
  .exp-desc {
    margin: 0;
    max-width: 700px;
    font-size: 22px;
    line-height: 1.5;
    color: var(--pq-text-muted, #94a3b8);
  }
  .exp-datepill {
    display: inline-flex;
    align-self: flex-start;
    align-items: center;
    gap: 16px;
    padding: 12px 22px;
    border-radius: var(--pq-r-pill, 999px);
    border: 1px solid var(--pq-hairline, rgba(180, 130, 240, 0.35));
    background: var(--pq-surface-glass, rgba(60, 25, 110, 0.5));
  }
  .exp-datepill svg {
    width: 20px;
    height: 20px;
    color: var(--pq-accent, #10b981);
  }
  .exp-datepill span {
    font-family: var(--pq-font-mono, monospace);
    font-size: 13px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--pq-text, #f1f5f9);
  }

  .exp-progress {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 12px;
  }
  .exp-progress__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .exp-progress__label {
    font-family: var(--pq-font-mono, monospace);
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--pq-text-faint, #64748b);
  }
  .exp-progress__val {
    font-family: var(--pq-font-display, sans-serif);
    font-size: 24px;
    letter-spacing: 0.02em;
    color: var(--pq-text, #f1f5f9);
  }
  .exp-progress__val strong {
    color: var(--pq-accent, #10b981);
  }
  .exp-pillrow {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .arc-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    border-radius: var(--pq-r-pill, 999px);
    font-family: var(--pq-font-display, sans-serif);
    font-size: 16px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .arc-pill svg {
    width: 16px;
    height: 16px;
  }
  .arc-pill--success {
    background: var(--exp-pill-success-bg, rgba(16, 185, 129, 0.22));
    border: 1px solid var(--pq-success, #10b981);
    color: var(--pq-success, #10b981);
  }
  .arc-pill--danger {
    background: var(--exp-pill-danger-bg, rgba(239, 68, 68, 0.22));
    border: 1px solid var(--pq-danger, #ef4444);
    color: var(--pq-danger, #ef4444);
  }
  .arc-pill--ghost {
    background: var(--pq-surface-glass, rgba(60, 25, 110, 0.5));
    border: 1px solid var(--pq-hairline, rgba(180, 130, 240, 0.35));
    color: var(--pq-text-muted, #94a3b8);
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.18em;
  }

  .exp-illus {
    position: relative;
    display: grid;
    place-items: center;
    height: 380px;
  }
  .exp-illus__glow {
    position: absolute;
    width: 340px;
    height: 340px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--exp-illus-glow, transparent), transparent 60%);
    filter: blur(20px);
  }
  .exp-illus__art {
    position: relative;
  }

  .exp-rewards {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .exp-rewards__title {
    margin: 0;
    font-family: var(--pq-font-display, sans-serif);
    font-size: 36px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--pq-text, #f1f5f9);
  }
  .exp-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }

  /* ===== casino-loud — marquee title + red hot claim button ===== */
  :host-context([data-pq-mode="casino-loud"]) .title {
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  :host-context([data-pq-mode="casino-loud"]) .claim {
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

  /* ====================== ARCADE MODE (CSS-only · expanded kiosk) ====================== */
  /* Wires the rich expanded layout to arcade tokens and the global keyframes
     (float / pulse-glow / shimmer) defined in @pq/tokens arcade.css. */
  :host-context([data-pq-mode="arcade"]) .exp-display {
    --exp-display: var(--arc-display, #ffd93d);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);
  }

  /* Eligible = pink frequency badge; locked dims into a calmer blue (state-driven,
     not mode-driven). Default arcade badge is pink. */
  :host-context([data-pq-mode="arcade"]) .exp-freq {
    --exp-freq-accent: var(--cat-pink, #ff3fa4);
    --exp-freq-bg: linear-gradient(
      135deg,
      rgba(255, 63, 164, 0.25),
      rgba(142, 71, 232, 0.35)
    );
    --exp-freq-fg: var(--cat-pink-bright, #ff6fb5);
  }
  :host-context([data-pq-mode="arcade"]):host(:not([status="eligible"])) .exp-freq {
    --exp-freq-accent: var(--cat-blue, #3d8bf5);
    --exp-freq-bg: linear-gradient(
      135deg,
      rgba(61, 139, 245, 0.25),
      rgba(45, 212, 191, 0.35)
    );
    --exp-freq-fg: var(--cat-blue-bright, #6fb2ff);
  }

  :host-context([data-pq-mode="arcade"]) .exp-illus {
    --exp-illus-glow: var(--arc-display-glow, rgba(255, 217, 61, 0.4));
  }
  :host-context([data-pq-mode="arcade"]):host(:not([status="eligible"])) .exp-illus {
    --exp-illus-glow: var(--cat-blue-glow, rgba(61, 139, 245, 0.25));
  }

  /* Reference the global keyframe by name (lives in arcade.css). */
  :host-context([data-pq-mode="arcade"]) .exp-illus__art {
    animation: float 4s ease-in-out infinite;
  }

  :host-context([data-pq-mode="arcade"]) .arc-pill--success {
    --exp-pill-success-bg: linear-gradient(
      135deg,
      rgba(52, 214, 112, 0.25),
      rgba(22, 163, 74, 0.4)
    );
  }
  :host-context([data-pq-mode="arcade"]) .arc-pill--danger {
    --exp-pill-danger-bg: linear-gradient(
      135deg,
      rgba(255, 77, 109, 0.2),
      rgba(233, 30, 99, 0.35)
    );
    color: #ff7088;
  }

  /* Honor reduced-motion locally (the token layer also wraps this globally). */
  @media (prefers-reduced-motion: reduce) {
    :host-context([data-pq-mode="arcade"]) .exp-illus__art {
      animation: none;
    }
  }

  /* ====================== ARCADE · COMPACT (TTD 480×234) ======================
     The compact detail shows a single progress treatment: a plain "Progress · $x /
     $y · pct" label row above ONE <pq-progress-bar>. The det-hero is intentionally
     NOT a panel/stripe (that read as a second bar) — just arcade-tinted text.
     CSS-only; ref prize-quest-ttd-arcade.html .arc-progress (single bar). */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .wrap-compact {
    gap: 6px;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .det-hero {
    padding: 0;
    background: none;
    border: none;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .det-hero::before {
    display: none;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .det-hero__label {
    font-family: var(--arc-font-mono, monospace);
    color: var(--arc-text-faint, #8b7aaa);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .det-hero__title {
    font-family: var(--arc-font-display, sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 13px;
    color: var(--arc-display, #ffd93d);
    letter-spacing: 0.02em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .det-hero__pct {
    font-family: var(--arc-font-display, sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 11px;
    color: var(--arc-cream, #f5efe0);
  }
  /* locked banner → arcade danger (was casino --cl-red, undefined in arcade). */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .locked-banner {
    border: 1px solid var(--arc-danger, #ff4d6d);
    background: linear-gradient(180deg, rgba(255, 77, 109, 0.2), rgba(255, 77, 109, 0.06));
    color: var(--arc-cream, #f5efe0);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .locked-banner svg {
    color: var(--arc-danger, #ff4d6d);
  }

  /* ===== portrait orientation (kiosk-portrait 1080×1920) — Section 10.6 =====
     Hero 2-col stacks to one column (text above, illustration below); the
     reward grid drops from 3-up to 2-up; the illustration loses its fixed
     380px height so portrait screens don't waste vertical space. */
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .exp-hero {
    grid-template-columns: 1fr;
    align-items: stretch;
    gap: 36px;
  }
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .exp-grid {
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: max-content;
    align-content: start;
  }
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .exp-illus {
    height: auto;
    min-height: 240px;
  }

  /* ===== iVIEW (compact profile) — single-column prize stack (no 2×2 / 3-up grid).
     Carousel (1-up swipe) is a filed polish followup; single column avoids overflow. ===== */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .prize-grid,
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .prize-grid--locked {
    grid-template-columns: 1fr;
  }

  /* ===== iVIEW compact-with-hero (renderCompactIview · 1024x600 + 800x480) =====
     A real hero block (name, description, date pill, progress + status) above a
     single-column reward list with per-row Claim CTAs. These .iv-* classes ONLY
     render at iVIEW, so the styling is gated to that form factor. Colors use arcade
     tokens with fallbacks. */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .wrap-iview {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }
  /* Back-to-campaigns affordance (KIOSK/EGM have it via .exp-back; iVIEW needs its
     own). Ghost pill, self-start so it doesn't stretch full width. Fires pq-back. */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-back {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: var(--arc-r-pill, 999px);
    border: 1px solid var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
    background: var(--arc-bg-glass, rgba(60, 25, 110, 0.5));
    color: var(--arc-text-dim, #d0bfec);
    font-family: var(--arc-font-body, sans-serif);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-back:hover {
    background: rgba(80, 40, 140, 0.6);
    color: var(--arc-cream, #f5efe0);
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-back svg {
    width: 14px;
    height: 14px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-hero {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-hero__name {
    margin: 0;
    font-family: var(--arc-font-display, sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 24px;
    line-height: 1.1;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--arc-display, #ffd93d);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-hero__desc {
    margin: 0;
    font-size: 12px;
    line-height: 1.4;
    color: var(--arc-text-dim, #d0bfec);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-hero__datepill {
    display: inline-flex;
    align-self: flex-start;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: var(--arc-r-pill, 999px);
    border: 1px solid var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
    background: var(--arc-bg-glass, rgba(60, 25, 110, 0.5));
    font-family: var(--arc-font-mono, monospace);
    font-size: 9px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--arc-cream, #f5efe0);
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-hero__datepill svg {
    width: 12px;
    height: 12px;
    color: var(--arc-display, #ffd93d);
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-progress {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-progress__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-progress__label {
    font-family: var(--arc-font-mono, monospace);
    font-size: 9px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--arc-text-faint, #8b7aaa);
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-progress__val {
    font-family: var(--arc-font-display, sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 14px;
    color: var(--arc-cream, #f5efe0);
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-progress__val strong {
    color: var(--arc-display, #ffd93d);
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-pillrow {
    display: flex;
    gap: 8px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: var(--arc-r-pill, 999px);
    font-family: var(--arc-font-display, sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-pill svg {
    width: 12px;
    height: 12px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-pill--success {
    background: linear-gradient(135deg, rgba(52, 214, 112, 0.25), rgba(22, 163, 74, 0.4));
    border: 1px solid var(--arc-success, #34d670);
    color: var(--arc-success, #34d670);
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-pill--danger {
    background: linear-gradient(135deg, rgba(255, 77, 109, 0.2), rgba(233, 30, 99, 0.35));
    border: 1px solid var(--arc-danger, #ff4d6d);
    color: #ff7088;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-rewards-title {
    margin: 0;
    font-family: var(--arc-font-display, sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 16px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--arc-cream, #f5efe0);
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-prize {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    text-align: left;
    border: 1px solid var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
    border-radius: var(--arc-r-md, 12px);
    background: linear-gradient(160deg, rgba(60, 25, 110, 0.45), rgba(30, 10, 60, 0.6));
    cursor: pointer;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-prize--locked {
    cursor: default;
    opacity: 0.55;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-prize__img {
    flex: 0 0 auto;
    width: 60px;
    height: 60px;
    display: grid;
    place-items: center;
    border-radius: var(--arc-r-sm, 8px);
    background: rgba(15, 4, 46, 0.55);
    color: var(--arc-display, #ffd93d);
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-prize__img svg {
    width: 28px;
    height: 28px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-prize__body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-prize__name {
    font-family: var(--arc-font-display, sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 13px;
    letter-spacing: 0.02em;
    color: var(--arc-cream, #f5efe0);
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-prize__value {
    font-family: var(--arc-font-display, sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 12px;
    color: var(--arc-display, #ffd93d);
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-prize__cta {
    flex: 0 0 auto;
    padding: 6px 14px;
    border-radius: var(--arc-r-sm, 8px);
    font-family: var(--arc-font-display, sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: linear-gradient(135deg, var(--arc-display-bright, #ffee5c), var(--cat-orange, #ff8c2c));
    color: var(--arc-bg-deep, #15042e);
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .iv-prize__locked {
    flex: 0 0 auto;
    font-family: var(--arc-font-mono, monospace);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--arc-danger, #ff4d6d);
  }

  /* Session 33 · "Pick your prize" CTA — arcade compact eligible detail routes to
     the dedicated reward-selection screen instead of an inline prize grid. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .rewards-cta {
    display: inline-flex;
    align-self: center;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    padding: 9px 18px;
    border: none;
    cursor: pointer;
    border-radius: var(--arc-r-pill, 999px);
    font-family: var(--arc-font-display, "Manrope", sans-serif);
    font-weight: 900;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--arc-bg-deep, #15042e);
    background: linear-gradient(
      135deg,
      var(--arc-display-bright, #ffee5c),
      var(--cat-orange, #ff8c2c)
    );
    box-shadow: 0 0 16px var(--arc-display-glow, rgba(255, 217, 61, 0.5)),
      0 4px 10px rgba(0, 0, 0, 0.4);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .rewards-cta svg {
    width: 15px;
    height: 15px;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .rewards-cta svg:first-child {
    width: 18px;
    height: 18px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .rewards-cta {
    font-size: 15px;
    padding: 11px 22px;
  }
`;
