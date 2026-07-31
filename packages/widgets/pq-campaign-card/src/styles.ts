import { css } from "lit";

/**
 * Scoped styles for `<pq-campaign-card>`. Three profiles selected via the
 * reflected `profile` attribute; `ready`/`dimmed`/`loading` host attributes drive
 * state styling. All colors come from tenant `--pq-*` tokens (incl. the embedded
 * pq-progress-bar / pq-status-pill, which inherit the custom properties).
 *
 * Visual reference: `.camp` (screen 01, standard) + `.x01-card` (screen 01x, expanded).
 */
export const styles = css`
  :host {
    display: block;
    color: var(--pq-text, #f1f5f9);
  }

  .card {
    box-sizing: border-box;
    outline: none;
  }
  :host([dimmed]) .card,
  :host([loading]) .card {
    cursor: default;
  }
  :host(:focus-visible) .card {
    outline: 2px solid var(--pq-emerald, #10b981);
    outline-offset: 2px;
    border-radius: var(--pq-r-md, 8px);
  }

  /* ---------- shared text ---------- */
  .title {
    margin: 0;
    color: var(--pq-text, #f1f5f9);
  }
  .meta,
  .sub {
    margin: 0;
    font-family: var(--pq-font-mono, monospace);
    color: var(--pq-text-faint, #64748b);
  }

  /* ====================== STANDARD ====================== */
  :host([profile="standard"]) .card {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid var(--pq-navy-hairline, #2a4f7a);
    cursor: pointer;
    transition: background 200ms var(--pq-ease, ease);
  }
  :host([profile="standard"]:not([dimmed]):not([loading])) .card:hover {
    background: rgba(245, 239, 230, 0.02);
  }
  :host([profile="standard"][ready]) .card {
    border-left: 2px solid var(--pq-emerald, #10b981);
    padding-left: 14px;
  }
  :host([profile="standard"]) .title {
    font-family: var(--pq-font-serif, serif);
    font-weight: 500;
    font-size: 20px;
    line-height: 1.2;
    margin-bottom: 6px;
  }
  :host([profile="standard"]) .meta {
    font-size: 10px;
    letter-spacing: 0.06em;
    margin-bottom: 12px;
  }
  .arrow {
    display: inline-flex;
    color: var(--pq-text-faint, #64748b);
  }
  .arrow svg {
    width: 16px;
    height: 16px;
  }

  /* ====================== EXPANDED ======================
     Full kiosk card: 240px image area (per-category gradient + centered icon +
     frequency/status chips) over a flex body (title, description, progress, CTA).
     Per-category tint is resolved by a card--<color> modifier that sets --cat-tint*
     from the arcade --cat-* tokens; premium falls back to the navy/emerald palette. */
  :host([profile="expanded"]) .card {
    --cat-tint: var(--cat-purple, var(--pq-emerald, #10b981));
    --cat-tint-deep: var(--cat-purple-deep, var(--pq-navy-base, #102a43));
    --cat-tint-bright: var(--cat-purple-bright, var(--pq-emerald, #34d399));
    --cat-tint-glow: var(--cat-purple-glow, rgba(16, 185, 129, 0.45));
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 580px;
    overflow: hidden;
    border: 1px solid var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    border-radius: var(--arc-r-2xl, var(--pq-r-lg, 12px));
    background: linear-gradient(
      160deg,
      var(--cat-tint-glow, rgba(16, 185, 129, 0.12)),
      var(--arc-card-base, rgba(20, 51, 82, 0.85))
    );
    cursor: pointer;
    transition:
      transform 200ms var(--pq-ease, ease),
      border-color 200ms var(--pq-ease, ease);
  }
  :host([profile="expanded"]:not([dimmed]):not([loading])) .card:hover {
    transform: translateY(-2px);
  }
  /* ready/eligible: 2px category-pink border + glow (pulse added in arcade block). */
  :host([profile="expanded"][ready]) .card {
    border: 2px solid var(--cat-pink, var(--pq-emerald, #10b981));
    box-shadow: 0 0 32px var(--cat-pink-glow, rgba(16, 185, 129, 0.4));
  }

  /* ---- per-category tint modifiers ---- */
  :host([profile="expanded"]) .card--purple {
    --cat-tint: var(--cat-purple, #8e47e8);
    --cat-tint-deep: var(--cat-purple-deep, #6b2dd0);
    --cat-tint-bright: var(--cat-purple-bright, #b47bff);
    --cat-tint-glow: var(--cat-purple-glow, rgba(142, 71, 232, 0.4));
  }
  :host([profile="expanded"]) .card--blue {
    --cat-tint: var(--cat-blue, #3d8bf5);
    --cat-tint-deep: var(--cat-blue-deep, #1f6fe6);
    --cat-tint-bright: var(--cat-blue-bright, #6fb2ff);
    --cat-tint-glow: var(--cat-blue-glow, rgba(61, 139, 245, 0.4));
  }
  :host([profile="expanded"]) .card--orange {
    --cat-tint: var(--cat-orange, #ff8c2c);
    --cat-tint-deep: var(--cat-orange-deep, #ff6b1a);
    --cat-tint-bright: var(--cat-orange-bright, #ffb066);
    --cat-tint-glow: var(--cat-orange-glow, rgba(255, 140, 44, 0.4));
  }
  :host([profile="expanded"]) .card--pink {
    --cat-tint: var(--cat-pink, #ff3fa4);
    --cat-tint-deep: var(--cat-pink-deep, #e91e63);
    --cat-tint-bright: var(--cat-pink-bright, #ff6fb5);
    --cat-tint-glow: var(--cat-pink-glow, rgba(255, 63, 164, 0.4));
  }
  :host([profile="expanded"]) .card--green {
    --cat-tint: var(--cat-green, #34d670);
    --cat-tint-deep: var(--cat-green-deep, #16a34a);
    --cat-tint-bright: var(--cat-green-bright, #5be389);
    --cat-tint-glow: var(--cat-green-glow, rgba(52, 214, 112, 0.4));
  }
  :host([profile="expanded"]) .card--teal {
    --cat-tint: var(--cat-teal, #2dd4bf);
    --cat-tint-deep: var(--cat-teal-deep, #14b8a6);
    --cat-tint-bright: var(--cat-teal-bright, #5eead4);
    --cat-tint-glow: var(--cat-teal-glow, rgba(45, 212, 191, 0.4));
  }

  /* ---- image area ---- */
  :host([profile="expanded"]) .img {
    position: relative;
    height: 240px;
    display: grid;
    place-items: center;
    overflow: hidden;
    background: linear-gradient(135deg, var(--cat-tint-deep), var(--cat-tint));
  }
  :host([profile="expanded"]) .img-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(
      circle at 30% 30%,
      var(--arc-display-glow, rgba(252, 191, 73, 0.35)),
      transparent 50%
    );
  }
  :host([profile="expanded"]) .icon {
    position: relative;
    width: 120px;
    height: 120px;
    color: var(--arc-on-tint, var(--arc-cream, var(--pq-text, #f1f5f9)));
    filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.5));
  }
  :host([profile="expanded"]) .icon svg {
    width: 100%;
    height: 100%;
  }

  /* ---- chips ---- */
  :host([profile="expanded"]) .chip {
    position: absolute;
    top: 16px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: var(--arc-r-pill, 999px);
    text-transform: uppercase;
    white-space: nowrap;
  }
  :host([profile="expanded"]) .chip svg {
    width: 12px;
    height: 12px;
  }
  :host([profile="expanded"]) .chip--freq {
    left: 16px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    background: var(--cat-tint);
    color: #fff;
  }
  :host([profile="expanded"]) .chip--status {
    right: 16px;
    font-family: var(--pq-font-display, sans-serif);
    font-size: 12px;
    letter-spacing: 0.1em;
    color: #fff;
    background: var(--pq-info, #4a8fe6);
  }
  :host([profile="expanded"]) .chip--ready {
    background: var(--pq-success, #34d670);
    color: var(--arc-bg-deep, #0a1a2e);
  }
  :host([profile="expanded"]) .chip--locked {
    background: var(--pq-danger, #ff4d6d);
  }

  /* ---- body ---- */
  :host([profile="expanded"]) .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
  }
  .head {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  :host([profile="expanded"]) .title {
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 28px;
    line-height: 1.1;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--arc-cream, var(--pq-text, #f1f5f9));
  }
  :host([profile="expanded"]) .sub {
    font-family: var(--pq-font-body, inherit);
    font-size: 14px;
    line-height: 1.4;
    color: var(--arc-text-dim, var(--pq-text-muted, #94a3b8));
  }
  :host([profile="expanded"]) pq-progress-bar {
    display: block;
  }
  /* ---- CTA: full-width per-category gradient pinned to bottom ---- */
  :host([profile="expanded"]) .cta {
    margin-top: auto;
    width: 100%;
    border: none;
    border-radius: var(--arc-r-md, var(--pq-r-md, 8px));
    padding: 18px 32px;
    font-family: var(--pq-font-display, sans-serif);
    font-size: 18px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    color: var(--arc-on-tint, var(--arc-text, #fff));
    background: linear-gradient(180deg, var(--cat-tint), var(--cat-tint-deep));
    box-shadow:
      0 4px 0 var(--cat-tint-deep),
      0 8px 24px var(--cat-tint-glow),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
    transition: transform 80ms var(--pq-ease, ease);
  }
  :host([profile="expanded"]) .cta:hover {
    transform: translateY(-1px);
  }

  /* ====================== COMPACT (ref .camp-card) ======================
     Dense casino card: title + state pill + meta + local bar + CTA. Colors use
     the premium-safe var(--cl-*, <fallback>) trick so a non-casino compact surface
     still renders a sane card. */
  :host([profile="compact"]) .card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 7px 8px;
    border: 1px solid var(--cl-burgundy, var(--pq-navy-hairline, #2a4f7a));
    border-radius: var(--cl-r-md, var(--pq-r-md, 6px));
    background: linear-gradient(
      180deg,
      var(--cl-wine-elev, var(--pq-navy-low, #143352)),
      var(--cl-wine, var(--pq-navy-base, #102a43))
    );
    cursor: pointer;
    overflow: hidden;
  }
  :host([profile="compact"]) .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
  }
  :host([profile="compact"]) .title {
    font-family: var(--pq-font-display, sans-serif);
    font-size: 13px;
    line-height: 1;
    letter-spacing: 0.04em;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  :host([profile="compact"]) .pill {
    flex: 0 0 auto;
    font-family: var(--pq-font-mono, monospace);
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 1.5px 5px;
    border-radius: 8px;
    background: var(--cl-burgundy, var(--pq-navy-hairline, #2a4f7a));
    color: var(--cl-cream, var(--pq-text, #f1f5f9));
  }
  :host([profile="compact"]) .meta {
    font-size: 8px;
    letter-spacing: 0.06em;
  }
  :host([profile="compact"]) .bar {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  :host([profile="compact"]) .bar-track {
    flex: 1;
    height: 5px;
    border-radius: 3px;
    overflow: hidden;
    background: rgba(6, 3, 10, 0.65);
    border: 1px solid var(--cl-gold-glow, rgba(42, 79, 122, 0.5));
  }
  :host([profile="compact"]) .bar-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(
      90deg,
      var(--cl-red, var(--pq-emerald, #10b981)),
      var(--cl-gold, var(--pq-gold-bright, #fcbf49))
    );
  }
  :host([profile="compact"]) .bar-pct {
    flex: 0 0 auto;
    min-width: 28px;
    text-align: right;
    font-family: var(--pq-font-mono, monospace);
    font-size: 9px;
    font-weight: 700;
    color: var(--cl-gold, var(--pq-gold-bright, #fcbf49));
  }
  :host([profile="compact"]) .cta {
    margin-top: 1px;
    align-self: stretch;
    border: none;
    border-radius: 3px;
    padding: 3px 8px;
    font-family: var(--pq-font-display, sans-serif);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    background: linear-gradient(
      180deg,
      var(--cl-gold, var(--pq-gold-bright, #fcbf49)),
      var(--cl-gold-deep, #c68a1a)
    );
    color: var(--cl-black, #0a1a2e);
  }
  /* ready compact treatment (host [ready] attr is toggled in updated()) */
  :host([profile="compact"][ready]) .card {
    border-color: var(--cl-gold, var(--pq-gold-bright, #fcbf49));
  }
  :host([profile="compact"][ready]) .pill {
    background: var(--cl-gold-bright, var(--pq-gold-bright, #fcbf49));
    color: var(--cl-black, #0a1a2e);
  }
  :host([profile="compact"][ready]) .bar-fill {
    background: linear-gradient(90deg, var(--cl-gold, #fcbf49), var(--cl-gold-bright, #ffd55c));
  }
  :host([profile="compact"][ready]) .cta {
    background: linear-gradient(180deg, var(--cl-red-bright, #ff5b6a), var(--cl-red, #e63946));
    color: var(--cl-cream, #fff);
  }

  /* ====================== SKELETON ====================== */
  .sk {
    background: var(--pq-navy-hairline, #2a4f7a);
    opacity: 0.35;
    border-radius: var(--pq-r-sm, 4px);
  }
  @media (prefers-reduced-motion: no-preference) {
    .sk {
      animation: pq-pulse 1.6s ease-in-out infinite;
    }
  }
  @keyframes pq-pulse {
    0%,
    100% {
      opacity: 0.25;
    }
    50% {
      opacity: 0.5;
    }
  }
  .sk--title {
    height: 18px;
    width: 60%;
    margin-bottom: 10px;
  }
  .sk--meta {
    height: 10px;
    width: 40%;
    margin-bottom: 14px;
  }
  .sk--bar {
    height: 2px;
    width: 100%;
  }
  .sk--icon {
    width: 44px;
    height: 44px;
    border-radius: var(--pq-r-md, 8px);
  }
  .sk--line {
    height: 12px;
    width: 100%;
  }

  /* ===== casino-loud =====
     Mode-only decorations via :host-context; state/profile-combined treatments via
     the premium-safe var(--cl-*, <fallback>) trick (the --cl-* tokens only exist
     when [data-pq-mode="casino-loud"] is set, so premium resolves to the fallback
     and stays pixel-identical). */
  :host-context([data-pq-mode="casino-loud"]) .title,
  :host-context([data-pq-mode="casino-loud"]) .name {
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  :host-context([data-pq-mode="casino-loud"]) .card {
    border-color: var(--cl-gold-deep, #c68a1a);
  }
  :host-context([data-pq-mode="casino-loud"]) .icon {
    border-color: var(--cl-gold-deep, #c68a1a);
  }
  /* "ready" hot treatment — premium-safe (transparent glow / unchanged color). */
  :host([ready]) .card {
    box-shadow: 0 0 12px var(--cl-gold-glow, transparent);
  }
  :host([ready]) .title {
    color: var(--cl-gold-bright, var(--pq-text, #f1f5f9));
    text-shadow: 0 0 6px var(--cl-gold-glow, transparent);
  }
  /* compact ready card pulses gold on the casino floor (motion-gated). */
  @media (prefers-reduced-motion: no-preference) {
    :host-context([data-pq-mode="casino-loud"]):host([profile="compact"][ready]) .card {
      animation: cl-card-ready-pulse 2s ease-in-out infinite;
    }
    :host-context([data-pq-mode="casino-loud"]):host([profile="compact"]) .bar-fill::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
      animation: cl-bar-shimmer 2s linear infinite;
    }
    :host-context([data-pq-mode="casino-loud"]):host([profile="compact"]) .bar-fill {
      position: relative;
      overflow: hidden;
    }
  }
  @keyframes cl-card-ready-pulse {
    0%,
    100% {
      box-shadow: 0 0 8px var(--cl-gold-glow, transparent);
    }
    50% {
      box-shadow: 0 0 18px var(--cl-gold-glow, transparent);
    }
  }
  @keyframes cl-bar-shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  /* ====================== ARCADE MODE (CSS-only) ======================
     Mode flourishes layered over the expanded card. Color/font/glow/animation
     only — structure stays identical to premium. Per-category tint already comes
     from the --cat-* tokens (which only exist under arcade); here we add the neon
     title glow, the ready-state pulse, and motion-gated ambient float/shimmer.
     Global keyframes (pulse-glow, float, shimmer) are referenced by name. */
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"]) .title {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"]) .card {
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"][ready]) .card {
    border-color: var(--cat-pink);
    box-shadow:
      0 0 32px var(--cat-pink-glow),
      0 16px 40px rgba(0, 0, 0, 0.5);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="expanded"]) .cta {
    color: var(--arc-text, #fff);
  }

  @media (prefers-reduced-motion: no-preference) {
    /* ready/eligible cards breathe with a neon pulse on the arcade floor. */
    :host-context([data-pq-mode="arcade"]):host([profile="expanded"][ready]) .card {
      animation: pulse-glow 3s ease-in-out infinite;
    }
    /* hero icon gently floats; shimmer sweeps the image highlight. */
    :host-context([data-pq-mode="arcade"]):host([profile="expanded"]) .icon {
      animation: float 4s ease-in-out infinite;
    }
    :host-context([data-pq-mode="arcade"]):host([profile="expanded"]) .img-glow {
      animation: shimmer 6s ease-in-out infinite;
    }
  }

  /* ====================== ARCADE · COMPACT (TTD 480×234) ======================
     CSS-only arcade skin for the dense compact card (ref .cmp-card in
     prize-quest-ttd-arcade.html). Mirrors the casino-loud compact block's
     selector targets (.card / .row / .title / .pill / .bar-track / .bar-fill /
     .cta) but swaps casino-loud → arcade values. Per-category tint reuses the
     widget's existing --cat-tint mechanism (set inline by catTintStyle on the
     expanded card; on compact it falls back to --cat-purple exactly like the
     preview's var(--cat-tint, var(--cat-purple))). Append-only; gated on
     :host-context([data-pq-mode="arcade"]):host([profile="compact"]). */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .card {
    background: linear-gradient(
      160deg,
      var(--arc-surface-1, rgba(60, 25, 110, 0.55)),
      var(--arc-surface-2, rgba(30, 10, 60, 0.85))
    );
    border: 1px solid var(--arc-hairline-2);
    border-radius: var(--arc-r-md);
  }
  /* accent stripe (ref .cmp-card::before) — reads the per-category tint. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--cat-tint, var(--cat-purple));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .card {
    position: relative;
  }
  /* head row (ref .cmp-card__head). */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .row {
    align-items: center;
    gap: 4px;
  }
  /* title (ref .cmp-card__name). */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .title {
    font-family: var(--arc-font-display);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 11px;
    color: var(--arc-cream);
    letter-spacing: 0.02em;
    text-transform: uppercase;
    line-height: 1.1;
  }
  /* status pill (ref .cmp-card__pill / --inprog default). */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .pill {
    font-family: var(--arc-font-display);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 7px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 1px 5px;
    border-radius: 999px;
    background: var(--arc-info);
    color: white;
  }
  /* progress track + fill (ref .arc-progress__track / __fill). */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .bar-track {
    height: 5px;
    background: var(--arc-surface-0, rgba(15, 4, 46, 0.7));
    border-radius: 999px;
    border: 1px solid var(--arc-hairline-2);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .bar-fill {
    position: relative;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      var(--cat-orange-deep) 0%,
      var(--arc-display) 50%,
      var(--arc-display-bright) 100%
    );
    box-shadow:
      0 0 6px var(--arc-display-glow),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    overflow: hidden;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .bar-pct {
    font-family: var(--arc-font-display);
    font-weight: var(--arc-font-display-weight, 800);
    color: var(--arc-display);
  }
  /* CTA: per-category arcade gradient button. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cta {
    font-family: var(--arc-font-display);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 11px;
    padding: 5px 10px;
    border-radius: var(--arc-r-sm);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--arc-text, #fff);
    background: linear-gradient(
      180deg,
      var(--cat-tint, var(--cat-purple)),
      var(--cat-tint-deep, var(--cat-purple-deep))
    );
    box-shadow: 0 2px 0 var(--cat-tint-deep, var(--cat-purple-deep));
  }
  /* ready state (ref .cmp-card--ready / __pill--ready). */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][ready]) .card {
    border: 1px solid var(--cat-pink);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][ready]) .card::before {
    height: 3px;
    background: linear-gradient(90deg, var(--cat-pink), var(--arc-display));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"][ready]) .pill {
    background: var(--arc-success);
    color: var(--arc-bg-deep);
  }
  @media (prefers-reduced-motion: no-preference) {
    /* ready compact card breathes with the pink neon pulse (keyframe in arcade.css). */
    :host-context([data-pq-mode="arcade"]):host([profile="compact"][ready]) .card {
      animation: pulse-glow-pink 2.4s ease-in-out infinite;
    }
    /* shimmer sweep across the fill (ref .arc-progress__fill::after). */
    :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .bar-fill::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.4) 50%,
        transparent 100%
      );
      animation: shimmer 2.4s ease-in-out infinite;
    }
  }

  /* ===== iVIEW (1024x600 + 800x480) — scale compact up for touch ===== */
  /* Card chrome for the campaign-list compact cards. No pre-existing iVIEW
     rule in this file, so these are all-new sizing rules (the single-column
     grid override lives in pq-campaign-list). CSS sizes only; colors kept.
     Card grows ~30% taller via min-height + roomier padding/gaps. */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .card {
    gap: 6px;
    padding: 12px 16px;
    min-height: 96px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .title {
    font-size: 16px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .pill {
    font-size: 10px;
    padding: 3px 8px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .meta {
    font-size: 11px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .bar-track {
    height: 7px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .bar-pct {
    font-size: 12px;
    min-width: 34px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cta {
    padding: 6px 12px;
    font-size: 13px;
  }

  /* ===== Session 33 · arcade compact HERO card (.cmpd) — carousel layout =====
     Diagonal hero panel + content stack + slim footer. Gated arcade+compact so
     casino-loud / premium compact keep the dense .card layout above. Colors come
     from --arc-* / per-category --cat-tint vars (set inline by catTintStyle). */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd {
    box-sizing: border-box;
    height: 100%;
    min-height: 150px;
    display: grid;
    grid-template-columns: 112px 1fr;
    grid-template-rows: 1fr 22px;
    background: linear-gradient(
      155deg,
      var(--cat-tint-glow, rgba(142, 71, 232, 0.18)),
      var(--arc-bg-base, #1f0b3e)
    );
    border: 1.5px solid var(--cat-tint, var(--cat-purple));
    border-radius: 9px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 8px 24px -10px rgba(0, 0, 0, 0.6);
  }
  /* iVIEW (800×480 / 1024×600): taller card + wider hero fill the larger screen. */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cmpd {
    min-height: 300px;
    grid-template-columns: 160px 1fr;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cmpd__hero-value {
    font-size: 40px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cmpd__name {
    font-size: 22px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cmpd__desc {
    font-size: 12px;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    z-index: 4;
    background: linear-gradient(
      90deg,
      var(--cat-tint, var(--cat-pink)) 0%,
      var(--arc-display) 50%,
      var(--cat-orange) 100%
    );
  }

  /* Diagonal hero panel (full height, angular right edge). */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__hero {
    grid-column: 1;
    grid-row: 1 / span 2;
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    padding: 6px 16px 6px 6px;
    clip-path: polygon(0 0, 100% 0, 90% 100%, 0 100%);
    background:
      radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 55%),
      linear-gradient(
        160deg,
        var(--cat-tint-bright, var(--cat-purple-bright)) 0%,
        var(--cat-tint, var(--cat-purple)) 50%,
        var(--cat-tint-deep, var(--cat-purple-deep)) 100%
      );
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__hero::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      48deg,
      transparent 0 5px,
      rgba(255, 255, 255, 0.045) 5px 6px
    );
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__hero::after {
    content: "";
    position: absolute;
    top: -15%;
    left: -10%;
    width: 70%;
    height: 50%;
    pointer-events: none;
    background: radial-gradient(ellipse, rgba(255, 255, 255, 0.22), transparent 70%);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__hero-icon {
    font-size: 22px;
    line-height: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45));
  }
  /* The hero panel is painted with the CATEGORY TINT, so its ink has to be tenant-
     controlled: on a dark tint (arcade purple) the value is gold; on a light tint
     (Tier Rewards' gold) gold-on-gold is invisible, so those tenants override the
     --arc-tint-ink-* trio with near-blacks and the value reads as a struck plaque. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__hero-value {
    font-family: var(--arc-font-display);
    font-weight: 900;
    font-size: 30px;
    line-height: 1;
    letter-spacing: -0.015em;
    margin-top: 1px;
    background: linear-gradient(
      180deg,
      var(--arc-tint-ink-hi, var(--arc-display-bright)) 0%,
      var(--arc-tint-ink, var(--arc-display)) 35%,
      var(--arc-tint-ink-lo, var(--cat-orange)) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.4));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__hero-label {
    font-family: var(--arc-font-mono);
    font-size: 7px;
    font-weight: 700;
    color: var(--arc-on-tint, rgba(255, 255, 255, 0.95));
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin-top: 3px;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__hero-pool {
    font-family: var(--arc-font-mono);
    font-size: 6.5px;
    color: var(--arc-on-tint-soft, rgba(255, 255, 255, 0.62));
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-top: 1px;
  }

  /* Content column: chips -> title -> progress -> desc. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__main {
    grid-column: 2;
    grid-row: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 7px 11px 6px 6px;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    flex-shrink: 0;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__chips {
    display: flex;
    gap: 3px;
    align-items: center;
    min-width: 0;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__cat {
    font-family: var(--arc-font-mono);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 1.5px 6px;
    border-radius: 999px;
    background: var(--cat-tint-glow, rgba(255, 63, 164, 0.22));
    color: var(--cat-tint-bright, var(--cat-pink-bright));
    border: 1px solid var(--cat-tint, var(--cat-pink));
    white-space: nowrap;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__pill {
    font-family: var(--arc-font-display);
    font-weight: 900;
    font-size: 8.5px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 2.5px 9px;
    border-radius: 999px;
    white-space: nowrap;
    flex-shrink: 0;
    background: var(--arc-info);
    color: #fff;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__pill--ready {
    background: linear-gradient(180deg, var(--arc-success), var(--cat-green-deep));
    color: var(--arc-bg-deep);
    box-shadow: 0 0 8px var(--cat-green-glow, rgba(52, 214, 112, 0.45));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__pill--locked {
    background: var(--arc-bg-elev);
    color: var(--arc-text-faint);
    border: 1px solid var(--arc-hairline-2);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__name {
    font-family: var(--arc-font-display);
    font-weight: 900;
    font-size: 17px;
    color: var(--arc-cream);
    letter-spacing: 0.005em;
    text-transform: uppercase;
    line-height: 1;
    margin: 1px 0 0;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__desc {
    font-family: var(--arc-font-body);
    font-size: 9.5px;
    color: var(--arc-text-dim);
    line-height: 1.35;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Slim countdown footer. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__foot {
    grid-column: 1 / -1;
    grid-row: 2;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 11px;
    height: 22px;
    background: linear-gradient(
      180deg,
      var(--arc-bg-glass-2, rgba(10, 3, 28, 0.92)),
      var(--arc-bg-deep, var(--arc-surface-0, rgba(15, 4, 46, 0.98)))
    );
    border-top: 1px solid var(--arc-hairline);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__expires {
    font-family: var(--arc-font-mono);
    font-size: 8.5px;
    font-weight: 700;
    color: var(--cat-orange);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__expires::before {
    content: "⏱ ";
  }

  /* ===================== A+B · MARQUEE NAME + FACT RAIL =====================
     The progress block that used to sit here is gone (progress is no longer shown
     anywhere in the patron flow). The campaign NAME takes the space instead: two
     lines of gradient display type over a sweeping gold rule, with a rail of short
     facts beneath it. Nothing here needs data the card did not already have. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__name--marquee {
    font-size: 19px;
    line-height: 1.02;
    letter-spacing: -0.005em;
    margin: 2px 0 0;
    /* Gradient display type — the same treatment the hub hero tile uses, so the
       promotion name reads as the loudest thing on the card. */
    background: linear-gradient(
      135deg,
      var(--arc-display-bright) 0%,
      var(--arc-display) 45%,
      var(--cat-tint-bright, var(--cat-purple-bright)) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
    /* Two lines max — long operator campaign names must not push the rail off-card. */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__rule {
    height: 2px;
    border-radius: 999px;
    margin: 4px 0 1px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    background: linear-gradient(
      90deg,
      var(--arc-display) 0%,
      var(--cat-tint-bright, var(--cat-purple-bright)) 45%,
      transparent 100%
    );
  }
  @media (prefers-reduced-motion: no-preference) {
    :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__rule::after {
      content: "";
      position: absolute;
      inset: 0;
      width: 34%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.85), transparent);
      animation: pq-rule-sweep 2.6s ease-in-out infinite;
    }
  }
  @keyframes pq-rule-sweep {
    from {
      transform: translateX(-120%);
    }
    to {
      transform: translateX(340%);
    }
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__facts {
    display: flex;
    gap: 4px;
    flex-wrap: nowrap;
    overflow: hidden;
    flex-shrink: 0;
    margin-top: 1px;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__fact {
    font-family: var(--arc-font-mono);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    white-space: nowrap;
    padding: 2px 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--arc-hairline);
    color: var(--arc-text-dim);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd__fact--hi {
    color: var(--arc-display);
    border-color: var(--arc-hairline-2);
    background: var(--arc-glow-soft);
  }
  /* iVIEW (1024×600) — the marquee scales with the bigger card. */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cmpd__name--marquee {
    font-size: 30px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cmpd__rule {
    height: 3px;
    margin: 8px 0 3px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cmpd__fact {
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 4px;
  }
`;
