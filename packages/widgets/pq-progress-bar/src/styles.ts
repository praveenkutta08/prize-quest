import { css } from "lit";

/**
 * Scoped styles for `<pq-progress-bar>`. Every color/font flows from tenant
 * `--pq-*` custom properties (they pierce the shadow boundary as inherited
 * CSS variables), so the widget re-themes on tenant switch with no JS.
 *
 * Visual reference: `.promo-hero__progress-track` / `.detail-hero__progress-track`
 * in prize-quest-html5.html — a 2px line, navy-hairline track, cream-muted fill.
 */
export const styles = css`
  :host {
    display: block;
    width: 100%;
  }

  .eyebrow {
    display: block;
    margin: 0 0 8px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--pq-text-muted, #94a3b8);
  }

  .track {
    position: relative;
    width: 100%;
    height: 2px;
    border-radius: 1px;
    overflow: hidden;
    background: var(--pq-navy-hairline, #2a4f7a);
  }

  .fill {
    height: 100%;
    border-radius: 1px;
    background: var(--pq-cream-muted, #c9b79c);
    transform-origin: left center;
  }

  /* complete: brighter cream fill + one-time grow on mount */
  :host([variant="complete"]) .fill {
    background: var(--pq-cream, #f5efe6);
  }
  @media (prefers-reduced-motion: no-preference) {
    :host([variant="complete"]) .fill {
      animation: pq-grow 300ms cubic-bezier(0.22, 1, 0.36, 1) 1 both;
    }
  }
  @keyframes pq-grow {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }

  /* loading: indeterminate shimmer, cream-muted at 30% opacity, 1.8s loop.
     With reduced motion the bar sits static (no sweep). */
  .shimmer {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 40%;
    opacity: 0.3;
    background: var(--pq-cream-muted, #c9b79c);
  }
  @media (prefers-reduced-motion: no-preference) {
    .shimmer {
      animation: pq-shimmer 1.8s ease-in-out infinite;
    }
  }
  @keyframes pq-shimmer {
    0% {
      transform: translateX(-110%);
    }
    100% {
      transform: translateX(360%);
    }
  }

  /* ===== expanded profile (kiosk bar) — header row above an 18px pill track.
     Structure only; the arcade gradient/shimmer live in the MODE block below so
     the bar stays subtle in non-arcade tenants. Ref: .arc-progress. ===== */
  .arc-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .arc-label {
    font-family: var(--pq-font-mono, monospace);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--arc-text-faint, var(--pq-text-faint, #8b7aaa));
  }
  .arc-val {
    font-family: var(--pq-font-display, var(--arc-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 24px;
    letter-spacing: 0.02em;
    color: var(--arc-cream, var(--pq-text, #f5efe0));
  }
  .arc-val strong {
    color: var(--arc-display, var(--pq-accent, #ffd93d));
  }

  .track--arc {
    height: 18px;
    background: var(--arc-track-bg, var(--arc-surface-0, rgba(15, 4, 46, 0.7)));
    border: 1px solid var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
    border-radius: var(--arc-r-pill, 999px);
  }
  .fill--arc {
    position: relative;
    border-radius: var(--arc-r-pill, 999px);
    background: var(--pq-cream-muted, #c9b79c);
    overflow: hidden;
  }

  /* ===== casino-loud (gated on <html data-pq-mode>) — thick red→gold gradient
     fill + glow + white sweep shimmer. Premium is untouched. ===== */
  :host-context([data-pq-mode="casino-loud"]) .track {
    height: 6px;
    border-radius: 3px;
    background: rgba(6, 3, 10, 0.65);
    border: 1px solid rgba(255, 182, 39, 0.18);
  }
  :host-context([data-pq-mode="casino-loud"]) .fill,
  :host-context([data-pq-mode="casino-loud"]) :host([variant="complete"]) .fill {
    background: linear-gradient(90deg, var(--cl-red, #e63946), var(--cl-gold, #ffb627));
    border-radius: 3px;
    box-shadow: 0 0 6px var(--cl-gold-glow, rgba(255, 182, 39, 0.55));
  }
  :host-context([data-pq-mode="casino-loud"]) .shimmer {
    width: 30%;
    opacity: 1;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  }

  /* ===== ARCADE MODE (gated on <html data-pq-mode="arcade">) — CSS only.
     The expanded kiosk bar gets the full orange→yellow gradient + glow +
     shimmer sweep; the standard thin track stays deliberately subtle (just a
     display-tinted fill) so compact/standard surfaces don't shout. The
     shimmer keyframe is the global one from tokens/arcade.css. ===== */

  /* Expanded track: 2px display-tinted border so the bar reads as a framed pill. */
  :host-context([data-pq-mode="arcade"]) .track--arc {
    border-width: 2px;
    border-color: var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
  }

  /* Expanded bar: gradient fill + glow + inset highlight (ref .arc-progress__fill). */
  :host-context([data-pq-mode="arcade"]) .fill--arc {
    transform-origin: left center;
    background: linear-gradient(
      90deg,
      var(--cat-orange-deep, #ff6b1a) 0%,
      var(--arc-display, #ffd93d) 50%,
      var(--arc-display-bright, #ffee5c) 100%
    );
    box-shadow:
      0 0 18px var(--arc-display-glow, rgba(255, 217, 61, 0.55)),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  /* Grow the arcade fill from empty → its progress width once on mount (the track's
     own width is unchanged; only the colored fill animates in). */
  @media (prefers-reduced-motion: no-preference) {
    :host-context([data-pq-mode="arcade"]) .fill--arc,
    :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .fill {
      animation: pq-grow 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }
  }

  /* Shimmer sweep overlay on the expanded fill (ref .arc-progress__fill::after). */
  :host-context([data-pq-mode="arcade"]) .fill--arc::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
  }
  @media (prefers-reduced-motion: no-preference) {
    :host-context([data-pq-mode="arcade"]) .fill--arc::after {
      animation: shimmer 2.4s ease-in-out infinite;
    }
  }

  /* Loading shimmer in the expanded track reads as a display-tinted sweep. */
  :host-context([data-pq-mode="arcade"]) .track--arc .shimmer {
    width: 30%;
    opacity: 1;
    background: linear-gradient(
      90deg,
      transparent,
      var(--arc-display-glow, rgba(255, 217, 61, 0.55)),
      transparent
    );
  }

  /* Standard/compact thin track: keep it subtle — just a display-tinted fill +
     soft glow, no shimmer, no border change, so TTD/Luminara compact surfaces
     stay calm under arcade. */
  :host-context([data-pq-mode="arcade"]) .fill {
    background: var(--arc-display, #ffd93d);
    box-shadow: 0 0 6px var(--arc-display-glow, rgba(255, 217, 61, 0.4));
  }

  /* ===== ARCADE · COMPACT (TTD 480×234) — CSS only. =====
     The compact profile renders the thin .track/.fill template; under arcade we
     give it the full orange→yellow gradient + glow + shimmer sweep mapped from
     the preview's .arc-progress__track / __fill (prize-quest-ttd-arcade.html).
     More specific than the generic arcade .fill rule above (and later), so it
     wins for compact while standard surfaces keep the subtle treatment.
     Append-only; gated on :host([profile="compact"]). shimmer keyframe is the
     global one from tokens/arcade.css. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .track {
    /* Thick rounded pill matching the campaign-card shimmer bar (one progress-bar
       design everywhere). */
    height: 12px;
    background: var(--arc-surface-0, rgba(15, 4, 46, 0.7));
    border-radius: 999px;
    border: 1px solid var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .fill,
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][variant="complete"]) .fill {
    position: relative;
    border-radius: 999px;
    transform-origin: left center;
    background: linear-gradient(
      90deg,
      var(--cat-orange-deep, #ff6b1a) 0%,
      var(--arc-display, #ffd93d) 50%,
      var(--arc-display-bright, #ffee5c) 100%
    );
    box-shadow:
      0 0 6px var(--arc-display-glow, rgba(255, 217, 61, 0.55)),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    overflow: hidden;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .fill::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
  }
  @media (prefers-reduced-motion: no-preference) {
    :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .fill::after {
      animation: shimmer 2.4s ease-in-out infinite;
    }
  }
  /* compact loading shimmer reads as a display-tinted sweep in the pill track. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .shimmer {
    width: 30%;
    opacity: 1;
    background: linear-gradient(
      90deg,
      transparent,
      var(--arc-display-glow, rgba(255, 217, 61, 0.55)),
      transparent
    );
  }

  /* ===== iVIEW (1024x600 + 800x480) — scale compact up for touch ===== */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .track {
    height: 8px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .eyebrow {
    font-size: 11px;
  }
`;
