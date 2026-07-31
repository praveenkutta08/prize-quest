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
  /* BUTTON FEEL (customer ask): the card already behaves as a button — clickable,
     keyboard-activated — so this block only adds the tactile affordances. All of it is
     CSS on the existing markup: a resting glow, a press-down on :active (the state that
     matters on a touchscreen), and a focus ring for the keyboard path. Colours resolve
     through the category tint / tenant ramp, and motion respects reduced-motion. */
  /* Every descendant border-box: width:100% + padding must never overflow a panel
     (the COLLECT bar was jutting past the poster's right edge on device fonts). */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd,
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd * {
    box-sizing: border-box;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd {
    /* FIXED height (customer issue: Konami scroll / hidden dots): the 234px panel has
       no scroll affordance, so the card must never outgrow the space above the dots
       regardless of device font metrics. Measured: card top sits at 53px (screen pad +
       header) and the dot row needs 14px below the card → 53 + 164 + 14 = 231 ≤ 234.
       Content clamps; the frame never scrolls. */
    height: 164px;
    min-height: 0;
    display: grid;
    grid-template-columns: 158px 1fr;
    grid-template-rows: 1fr;
    gap: 7px;
    padding: 6px;
    /* SS2 "3D hard edge": one near-black surface, faint gold outline, and a HARD
       (unblurred) gold ledge under the bottom edge. No gold top rail, no inner panel
       borders — the customer adopted SS2 for borders only. */
    background: linear-gradient(180deg, var(--arc-bg-mid, #1c0a38), var(--arc-bg-deep, #15042e));
    border: 1px solid var(--arc-hairline-2, rgba(255, 217, 61, 0.3));
    border-radius: 9px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    box-shadow:
      0 4px 0 var(--arc-display-deep, #b8860b),
      0 10px 24px -8px rgba(0, 0, 0, 0.7);
    transition:
      transform 130ms cubic-bezier(0.34, 1.3, 0.64, 1),
      box-shadow 130ms ease,
      filter 130ms ease;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }
  /* Pointer hover (dev/demo on a desktop; harmless on touch). */
  @media (hover: hover) {
    :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd:hover {
      transform: translateY(-1px);
      box-shadow:
        0 5px 0 var(--arc-display-deep, #b8860b),
        0 12px 26px -8px rgba(0, 0, 0, 0.7);
    }
  }
  /* The press — the state that makes it FEEL like a button on a touchscreen. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd:active {
    transform: translateY(2px) scale(0.99);
    filter: brightness(1.08);
    box-shadow:
      0 2px 0 var(--arc-display-deep, #b8860b),
      0 6px 14px -8px rgba(0, 0, 0, 0.7);
  }
  /* Keyboard path — the host already carries tabindex + Enter/Space handling. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd:focus-visible,
  :host(:focus-visible) .cmpd {
    outline: 2px solid var(--arc-display, #ffd93d);
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .cmpd {
      transition: none;
    }
  }

  /* ============== CUSTOMER TWO-PANE LAYOUT (poster · details) ==============
     Replaces the diagonal hero / marquee-name layout. Grid: poster column left
     (trophy art, name, prize chip, COLLECT), details column right (Overview /
     How It Works / Prizes). All colour resolves through the tenant ramp. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__poster {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 5px 8px 7px;
    text-align: center;
    border-radius: 7px;
    /* Gold spotlight rays behind the trophy, like the mock's poster. */
    background:
      /* sparkle particles */
      radial-gradient(
        1.5px 1.5px at 18% 22%,
        var(--arc-display-bright, #ffee5c) 40%,
        transparent 60%
      ),
      radial-gradient(1px 1px at 80% 16%, var(--arc-display, #ffd93d) 40%, transparent 60%),
      radial-gradient(
        1.5px 1.5px at 72% 44%,
        var(--arc-display-bright, #ffee5c) 40%,
        transparent 60%
      ),
      radial-gradient(1px 1px at 24% 56%, var(--arc-display, #ffd93d) 40%, transparent 60%),
      radial-gradient(1px 1px at 60% 70%, var(--arc-display-bright, #ffee5c) 40%, transparent 60%),
      /* trophy spotlight + rays */
      radial-gradient(
          ellipse at 50% 26%,
          var(--arc-display-glow, rgba(255, 217, 61, 0.4)) 0%,
          transparent 60%
        ),
      conic-gradient(
        from 158deg at 50% 24%,
        transparent 0deg,
        var(--arc-glow-soft, rgba(255, 217, 61, 0.16)) 10deg,
        transparent 22deg,
        var(--arc-glow-soft, rgba(255, 217, 61, 0.16)) 34deg,
        transparent 46deg,
        var(--arc-glow-soft, rgba(255, 217, 61, 0.16)) 58deg,
        transparent 72deg
      ),
      linear-gradient(
        180deg,
        var(--arc-surface-1, rgba(60, 25, 110, 0.5)),
        var(--arc-surface-0, rgba(15, 4, 46, 0.85))
      );
    overflow: hidden;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__art {
    width: 32px;
    height: 32px;
    filter: drop-shadow(0 0 10px var(--arc-display-glow, rgba(255, 217, 61, 0.65)));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__art svg {
    width: 100%;
    height: 100%;
  }
  /* Two-tone name per the mock: top words white, last word gold between em-dashes. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__name {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
    font-family: var(--arc-font-display);
    font-weight: var(--arc-font-display-weight, 900);
    font-size: 12.5px;
    line-height: 1.08;
    letter-spacing: 0.015em;
    text-transform: uppercase;
    max-width: 100%;
    overflow: hidden;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__name-top {
    color: var(--arc-cream, #f5efe0);
    text-shadow: 0 2px 3px rgba(0, 0, 0, 0.6);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__name-gold {
    background: linear-gradient(
      180deg,
      var(--arc-display-bright, #ffee5c),
      var(--arc-display, #ffd93d) 60%,
      var(--arc-display-deep, #e0b71b)
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.55));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__name-gold i {
    font-style: normal;
    opacity: 0.65;
    font-weight: 400;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--arc-font-mono);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid var(--arc-hairline-2, rgba(255, 217, 61, 0.4));
    background: var(--arc-glow-soft, rgba(255, 217, 61, 0.12));
    color: var(--arc-display, #ffd93d);
    white-space: nowrap;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__chip svg {
    width: 9px;
    height: 9px;
  }
  /* COLLECT — the mock's 3-D gold bar: circular gift badge on the left, dark bold
     label, sitting on an elliptical glow ring. Spans, not buttons: the whole card is
     the tap target and the click bubbles to the card handler. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__ctawrap {
    display: block;
    position: relative;
    width: 100%;
    margin-top: 2px;
    padding-bottom: 4px;
  }
  /* Elliptical ring platform under the button. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__ctawrap::before {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 92%;
    height: 14px;
    transform: translateX(-50%);
    border-radius: 50%;
    background: radial-gradient(
      ellipse at 50% 50%,
      var(--arc-display-glow, rgba(255, 217, 61, 0.45)) 0%,
      transparent 70%
    );
    box-shadow: 0 0 0 1px var(--arc-glow-soft, rgba(255, 217, 61, 0.18)) inset;
    pointer-events: none;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__cta {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 4px 8px;
    border-radius: 8px;
    border: 1px solid var(--arc-display-deep, #b8860b);
    font-family: var(--arc-font-display);
    font-weight: var(--arc-font-display-weight, 900);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--arc-tint-ink, var(--arc-bg-deep, #15042e));
    background: linear-gradient(
      180deg,
      var(--arc-display-bright, #ffee5c),
      var(--arc-display, #ffd93d) 52%,
      var(--arc-display-deep, #e0b71b)
    );
    box-shadow:
      0 4px 12px var(--arc-display-glow, rgba(255, 217, 61, 0.45)),
      0 2px 0 var(--arc-display-deep, #b8860b),
      inset 0 1px 0 rgba(255, 255, 255, 0.55);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__cta-badge {
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.5), transparent 55%),
      var(--arc-display-deep, #b8860b);
    border: 1px solid rgba(0, 0, 0, 0.25);
    color: var(--arc-bg-elev, #3a1a5e);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__cta-badge svg {
    width: 11px;
    height: 11px;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__cta--off {
    background: var(--arc-bg-elev, #2a1454);
    border-color: var(--arc-hairline, rgba(160, 180, 215, 0.2));
    color: var(--arc-text-faint, #8b7aaa);
    box-shadow: none;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"])
    .promo__cta--off
    .promo__cta-badge {
    background: var(--arc-bg-deep, #15042e);
    color: var(--arc-text-faint, #8b7aaa);
  }
  /* Details column — three compact sections with gold headings, per the mock. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__info {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    padding: 4px 10px 4px 2px;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__sec + .promo__sec {
    border-top: 1px solid var(--arc-hairline-2, rgba(255, 217, 61, 0.28));
    padding-top: 5px;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__h {
    margin: 0 0 2px;
    font-family: var(--arc-font-display);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 8px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--arc-display, #ffd93d);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__p {
    margin: 0;
    font-family: var(--arc-font-body);
    font-size: 8.5px;
    line-height: 1.35;
    color: var(--arc-text-dim, #d0bfec);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__step {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--arc-font-body);
    font-size: 8.5px;
    line-height: 1.3;
    color: var(--arc-text-dim, #d0bfec);
    padding: 1px 0;
    min-width: 0;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__step span:last-child {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__step-ico {
    flex: 0 0 auto;
    width: 14px;
    height: 14px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    border: 1px solid var(--arc-hairline-2, rgba(255, 217, 61, 0.4));
    color: var(--arc-display, #ffd93d);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__step-ico svg {
    width: 8px;
    height: 8px;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .promo__ends {
    color: var(--arc-text-faint, #8b7aaa);
  }
  /* iVIEW (640×240): a touch more room everywhere. */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cmpd {
    grid-template-columns: 218px 1fr;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .promo__art {
    width: 58px;
    height: 58px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .promo__chip {
    font-size: 8.5px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .promo__cta-badge {
    width: 24px;
    height: 24px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .cmpd {
    /* 240px panel with the taller iVIEW header: 58 top + 168 + 14 dots = 240. */
    height: 168px;
    gap: 8px;
    padding: 7px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .promo__poster {
    gap: 5px;
    padding: 8px 12px 12px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .promo__info {
    gap: 6px;
    padding: 8px 14px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .promo__p {
    -webkit-line-clamp: 3;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .promo__ctawrap {
    margin-top: 4px;
    padding-bottom: 7px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .promo__name {
    font-size: 19px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .promo__cta {
    font-size: 14px;
    padding: 8px 0;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .promo__h {
    font-size: 10px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .promo__p,
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .promo__step {
    font-size: 10.5px;
  }
`;
