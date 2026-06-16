import { css } from "lit";

/** Scoped styles for `<pq-success>`. Visual reference: `.success-*` (screen 08). */
export const styles = css`
  :host {
    display: block;
    color: var(--pq-text, #f1f5f9);
  }

  .wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 32px 24px;
  }

  .check {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 1px solid var(--pq-emerald-dim, #0b5c4a);
    color: var(--pq-emerald, #10b981);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }
  .check svg {
    width: 28px;
    height: 28px;
  }

  .eyebrow {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--pq-cream-muted, #c9b79c);
    font-weight: 500;
    margin: 0 0 12px;
  }
  .title {
    font-family: var(--pq-font-serif, serif);
    font-weight: 500;
    font-size: 32px;
    line-height: 1.1;
    letter-spacing: -0.005em;
    margin: 0 0 12px;
  }
  .title em {
    font-style: italic;
    color: var(--pq-cream-muted, #c9b79c);
  }
  .sub {
    font-size: 13px;
    color: var(--pq-text-muted, #94a3b8);
    margin: 0 0 24px;
    max-width: 280px;
    line-height: 1.55;
  }

  .ref {
    margin: 0 0 24px;
    padding: 10px 18px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 12px;
    letter-spacing: 0.08em;
    background: transparent;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    color: var(--pq-cream, #f5efe6);
    border-radius: var(--pq-r-md, 8px);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }
  .ref:hover {
    border-color: var(--pq-cream-muted, #c9b79c);
  }
  .ref svg {
    width: 13px;
    height: 13px;
  }

  .card {
    background: var(--pq-navy-base, #102a43);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-lg, 12px);
    padding: 16px 18px;
    margin-bottom: 24px;
    display: flex;
    gap: 14px;
    width: 100%;
    text-align: left;
  }
  .card__img {
    width: 52px;
    height: 52px;
    border-radius: var(--pq-r-md, 8px);
    background: linear-gradient(180deg, var(--pq-navy-mid, #1b3756), var(--pq-navy-low, #143352));
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    color: var(--pq-cream-muted, #c9b79c);
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }
  .card__img svg {
    width: 24px;
    height: 24px;
  }
  .card__name {
    font-family: var(--pq-font-serif, serif);
    font-weight: 500;
    font-size: 18px;
    margin: 0 0 3px;
    line-height: 1.2;
  }
  .card__meta {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    letter-spacing: 0.06em;
    color: var(--pq-text-muted, #94a3b8);
    margin: 0;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    max-width: 300px;
  }
  .cta {
    width: 100%;
    min-height: 48px;
    background: var(--pq-cream, #f5efe6);
    color: var(--pq-navy-deep, #0a1a2e);
    border: none;
    border-radius: var(--pq-r-md, 8px);
    font-family: var(--pq-font-body, sans-serif);
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
  }
  .cta--ghost {
    background: transparent;
    color: var(--pq-text-muted, #94a3b8);
    font-weight: 500;
  }

  /* ====================== COMPACT (ref .success-wrap) ====================== */
  :host([profile="compact"]) .wrap {
    padding: 6px;
    gap: 3px;
    justify-content: center;
    min-height: 100%;
  }
  :host([profile="compact"]) .check {
    width: 26px;
    height: 26px;
    margin: 0;
  }
  :host([profile="compact"]) .check svg {
    width: 15px;
    height: 15px;
  }
  /* trophy variant — larger, no disc, gold neon (fills the top of the screen) */
  :host([profile="compact"]) .check--trophy {
    width: 34px;
    height: 34px;
    background: none;
    border: none;
    color: var(--pq-gold, #fcbf49);
    filter: drop-shadow(0 0 8px rgba(252, 191, 73, 0.5));
  }
  :host([profile="compact"]) .check--trophy svg {
    width: 24px;
    height: 24px;
  }
  :host([profile="compact"]) .title {
    font-size: 17px;
    line-height: 1;
    margin: 0;
  }
  :host([profile="compact"]) .sub {
    font-family: var(--pq-font-mono, monospace);
    font-size: 8.5px;
    letter-spacing: 0.06em;
    margin: 0;
    max-width: 92%;
  }
  :host([profile="compact"]) .ref {
    margin: 3px 0 0;
    padding: 2px 8px;
    font-size: 10px;
    font-weight: 700;
    color: var(--cl-gold, var(--pq-cream, #f5efe6));
    border-color: var(--cl-gold-deep, var(--pq-navy-hairline, #2a4f7a));
  }

  /* compact celebration block + action row (renderCompact, ref ttd Screen 09):
     a centered column (trophy → title → sub → single inline order pill) over a
     small ghost+primary button row. */
  :host([profile="compact"]) .wrap--compact {
    padding: 4px;
    gap: 6px;
    justify-content: center;
  }
  /* single inline order pill (order # + code + copy), content-width + centered */
  :host([profile="compact"]) .sc-order {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    border: 1px solid var(--pq-gold-deep, var(--pq-navy-hairline, #2a4f7a));
    border-radius: var(--pq-r-md, 6px);
    background: var(--pq-navy-low, rgba(20, 51, 82, 0.5));
    cursor: pointer;
  }
  :host([profile="compact"]) .sc-order__label {
    font-family: var(--pq-font-mono, monospace);
    font-size: 7px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--pq-text-faint, #8b7aaa);
  }
  :host([profile="compact"]) .sc-order__code {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--pq-gold, var(--pq-cream, #f5efe6));
  }
  :host([profile="compact"]) .sc-order svg {
    width: 9px;
    height: 9px;
    color: var(--pq-gold, var(--pq-cream, #f5efe6));
  }
  /* small ghost + primary buttons (was oversized pills) — content-width, centered */
  :host([profile="compact"]) .actions--row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 6px;
    width: 100%;
    margin-top: 2px;
  }
  :host([profile="compact"]) .actions--row .cta {
    flex: 0 0 auto;
    width: auto;
    min-height: 0;
    white-space: nowrap;
    padding: 5px 12px;
    border: none;
    border-radius: var(--pq-r-md, 6px);
    font-family: var(--pq-font-body, sans-serif);
    font-size: 9.5px;
    font-weight: 700;
    cursor: pointer;
    background: var(--pq-gold, #fcbf49);
    color: var(--pq-navy-deep, #0a1a2e);
  }
  :host([profile="compact"]) .actions--row .cta--ghost {
    padding: 4px 10px;
    background: transparent;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    color: var(--pq-text-muted, #94a3b8);
  }

  /* ====================== EXPANDED (ref screen 09 kiosk) ====================== */
  .wrap--expanded {
    padding: 48px 56px;
    gap: 28px;
    justify-content: center;
  }

  .burst {
    position: relative;
    width: 100%;
    max-width: 1100px;
    height: 280px;
    display: grid;
    place-items: center;
  }
  .burst__glow {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(
      circle at 50% 50%,
      var(--pq-accent-glow, rgba(255, 217, 61, 0.4)),
      transparent 50%
    );
    filter: blur(20px);
  }
  .burst svg {
    position: relative;
  }
  @media (prefers-reduced-motion: no-preference) {
    .wrap--expanded .burst__rays {
      animation: burst-in 600ms ease-out;
    }
    .wrap--expanded .burst__trophy {
      animation: burst-in 700ms ease-out;
    }
  }

  .hero {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    text-align: center;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    padding: 10px 22px;
    border-radius: var(--pq-r-pill, 999px);
    border: 1px solid var(--pq-success, #34d670);
    color: var(--pq-success, #34d670);
    font-family: var(--pq-font-mono, monospace);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .pill svg {
    width: 14px;
    height: 14px;
  }
  .display {
    font-family: var(--pq-font-display, var(--pq-font-serif, serif));
    font-size: 96px;
    line-height: 0.95;
    margin: 0;
    color: var(--pq-accent, #ffd93d);
    text-transform: uppercase;
    letter-spacing: 0.02em;
    text-shadow:
      0 0 40px var(--pq-accent-glow, rgba(255, 217, 61, 0.55)),
      0 6px 0 var(--pq-accent-deep, #e0b71b);
  }
  .lede {
    font-size: 22px;
    color: var(--pq-text-muted, #d0bfec);
    margin: 0;
    max-width: 700px;
    line-height: 1.4;
  }

  .order {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 48px;
    align-items: center;
    max-width: 1000px;
    width: 100%;
    padding: 32px 40px;
    border-radius: var(--pq-r-xl, 28px);
    background: var(--pq-surface-elev, var(--pq-navy-base, #102a43));
    border: 1px solid var(--pq-accent, #ffd93d);
    box-shadow: 0 0 32px var(--pq-glow-soft, rgba(255, 217, 61, 0.18));
    text-align: left;
  }
  .order__img {
    width: 90px;
    height: 90px;
    border-radius: var(--pq-r-md, 8px);
    background: var(--pq-surface, rgba(15, 4, 46, 0.6));
    color: var(--pq-text-muted, #d0bfec);
    display: grid;
    place-items: center;
    flex: 0 0 auto;
  }
  .order__img svg {
    width: 44px;
    height: 44px;
  }
  .order__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .order__label {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--pq-accent, #ffd93d);
  }
  .order__ref {
    align-self: flex-start;
    padding: 4px 0;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: var(--pq-font-mono, monospace);
    font-size: 22px;
    letter-spacing: 0.04em;
    color: var(--pq-text, #f5efe0);
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .order__ref svg {
    width: 16px;
    height: 16px;
    opacity: 0.7;
  }
  .order__note {
    font-size: 14px;
    color: var(--pq-text-muted, #d0bfec);
  }
  .order__ships {
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: right;
    max-width: 260px;
  }
  .order__ships .order__label {
    color: var(--pq-text-faint, #8b7aaa);
    letter-spacing: 0.18em;
  }
  .order__shipline {
    font-size: 15px;
    line-height: 1.4;
    color: var(--pq-text, #f5efe0);
  }
  .order__shipline:first-of-type {
    font-family: var(--pq-font-display, var(--pq-font-serif, serif));
    font-size: 22px;
    letter-spacing: 0.02em;
  }

  .actions--row {
    flex-direction: row;
    max-width: none;
    width: auto;
    gap: 16px;
    margin-top: 8px;
  }
  .cta--xl {
    width: auto;
    min-height: 64px;
    padding: 0 36px;
    font-size: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .cta--xl svg {
    width: 22px;
    height: 22px;
  }

  /* ===== casino-loud — gold celebration ===== */
  :host-context([data-pq-mode="casino-loud"]) .check {
    background: linear-gradient(135deg, var(--cl-gold-bright, #ffd55c), var(--cl-gold, #ffb627));
    color: var(--cl-black, #06030a);
    border-color: var(--cl-gold, #ffb627);
    box-shadow: 0 0 14px var(--cl-gold-glow, rgba(255, 182, 39, 0.55));
  }
  :host-context([data-pq-mode="casino-loud"]) .title {
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--cl-gold-bright, #ffd55c);
    text-shadow: 0 0 8px var(--cl-gold-glow, rgba(255, 182, 39, 0.55));
  }
  :host-context([data-pq-mode="casino-loud"]) .cta:not(.cta--ghost) {
    background: linear-gradient(
      180deg,
      var(--cl-gold-bright, #ffd55c),
      var(--cl-gold, #ffb627),
      var(--cl-gold-deep, #c68a1a)
    );
    color: var(--cl-black, #06030a);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    box-shadow: 0 0 12px var(--cl-gold-glow, rgba(255, 182, 39, 0.55));
  }
  @media (prefers-reduced-motion: no-preference) {
    :host-context([data-pq-mode="casino-loud"]) .check {
      animation: cl-success-pulse 1.5s ease-in-out infinite;
    }
  }
  @keyframes cl-success-pulse {
    0%,
    100% {
      box-shadow: 0 0 12px var(--cl-gold-glow, rgba(255, 182, 39, 0.55));
    }
    50% {
      box-shadow:
        0 0 24px var(--cl-gold-glow, rgba(255, 182, 39, 0.55)),
        0 0 0 3px rgba(255, 182, 39, 0.25);
    }
  }

  /* ============================ ARCADE MODE ============================ */
  /* MODE axis: pure presentation. Layout/markup is shared with all modes;
     this only re-skins the expanded kiosk celebration with arcade tokens. */
  :host-context([data-pq-mode="arcade"]) .pill {
    background: rgba(52, 214, 112, 0.12);
    border-color: var(--arc-success, #34d670);
    color: var(--arc-success, #34d670);
  }
  :host-context([data-pq-mode="arcade"]) .display {
    color: var(--arc-display, #ffd93d);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);
  }
  :host-context([data-pq-mode="arcade"]) .lede {
    color: var(--arc-text-dim, #d0bfec);
  }
  :host-context([data-pq-mode="arcade"]) .burst__glow {
    background-image: radial-gradient(
      circle at 50% 50%,
      rgba(255, 217, 61, 0.4),
      transparent 50%
    );
  }
  :host-context([data-pq-mode="arcade"]) .order {
    background: linear-gradient(160deg, rgba(60, 25, 110, 0.5), rgba(40, 15, 75, 0.85));
    border-color: var(--arc-display, #ffd93d);
    box-shadow: 0 0 32px var(--arc-glow-soft, rgba(255, 217, 61, 0.18));
  }
  :host-context([data-pq-mode="arcade"]) .order__img {
    background: rgba(15, 4, 46, 0.6);
  }
  :host-context([data-pq-mode="arcade"]) .order__label {
    color: var(--arc-display, #ffd93d);
  }
  :host-context([data-pq-mode="arcade"]) .order__ships .order__label {
    color: var(--arc-text-faint, #8b7aaa);
  }
  :host-context([data-pq-mode="arcade"]) .order__ref,
  :host-context([data-pq-mode="arcade"]) .order__shipline {
    color: var(--arc-cream, #f5efe0);
  }
  :host-context([data-pq-mode="arcade"]) .order__note {
    color: var(--arc-text-dim, #d0bfec);
  }
  :host-context([data-pq-mode="arcade"]) .cta--xl:not(.cta--ghost) {
    background: linear-gradient(
      180deg,
      var(--arc-display-bright, #ffee5c),
      var(--arc-display, #ffd93d)
    );
    color: var(--arc-bg-deep, #15042e);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    box-shadow: 0 0 24px var(--arc-display-glow, rgba(255, 217, 61, 0.55));
  }
  :host-context([data-pq-mode="arcade"]) .cta--xl.cta--ghost {
    color: var(--arc-text-dim, #d0bfec);
    border: 1px solid var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
    background: transparent;
  }

  /* ===== ARCADE · COMPACT (TTD 480×234) — neon reskin of renderCompact ===== */
  /* Gated on arcade + compact so the shared .check/.title/.sub/.ref classes are
     only re-skinned in the TTD compact profile; standard/expanded untouched. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .check {
    border: none;
    background: radial-gradient(circle, var(--arc-display-glow, rgba(255, 217, 61, 0.55)), transparent 60%);
    color: var(--arc-display, #ffd93d);
    filter: drop-shadow(0 0 8px var(--arc-display-glow, rgba(255, 217, 61, 0.55)));
  }
  @media (prefers-reduced-motion: no-preference) {
    :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .check {
      animation: burst-in 600ms ease-out;
    }
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .title {
    font-family: var(--arc-font-display, var(--pq-font-serif, serif));
    font-weight: var(--arc-font-display-weight, 800);
    color: var(--arc-display, #ffd93d);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .sub {
    color: var(--arc-text-dim, #d0bfec);
    text-transform: none;
    letter-spacing: 0.02em;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .ref {
    background: rgba(60, 25, 110, 0.4);
    border: 1px solid var(--arc-display, #ffd93d);
    border-radius: var(--arc-r-sm, 6px);
    font-family: var(--arc-font-mono, monospace);
    color: var(--arc-display, #ffd93d);
    letter-spacing: 0.06em;
    box-shadow: 0 0 8px var(--arc-glow-soft, rgba(255, 217, 61, 0.18));
  }
  /* arcade order pill (gold border + code) + action row — ref preview .suc-order */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .sc-order {
    border-color: var(--arc-display, #ffd93d);
    background: rgba(60, 25, 110, 0.4);
    box-shadow: 0 0 8px var(--arc-glow-soft, rgba(255, 217, 61, 0.18));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .sc-order__code,
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .sc-order svg {
    color: var(--arc-display, #ffd93d);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .actions--row .cta {
    background: linear-gradient(135deg, var(--arc-display-bright, #ffee5c), var(--cat-orange, #ff8c2c));
    color: var(--arc-bg-deep, #15042e);
    font-family: var(--arc-font-display, sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    box-shadow: 0 0 10px var(--arc-display-glow, rgba(255, 217, 61, 0.45));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .actions--row .cta--ghost {
    background: rgba(60, 25, 110, 0.5);
    border-color: var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
    color: var(--arc-text-dim, #d0bfec);
  }

  /* ===== iVIEW (1024x600 + 800x480) — scale compact up for touch ===== */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .check {
    width: 80px;
    height: 80px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .check svg {
    width: 48px;
    height: 48px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .check--trophy {
    width: 80px;
    height: 80px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .check--trophy svg {
    width: 48px;
    height: 48px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .title {
    font-size: 32px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .sub {
    font-size: 13px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .sc-order {
    padding: 6px 12px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .sc-order__label {
    font-size: 9px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .sc-order__code {
    font-size: 12px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .sc-order svg {
    width: 12px;
    height: 12px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .actions--row .cta {
    padding: 9px 18px;
    font-size: 13px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .actions--row .cta--ghost {
    padding: 8px 14px;
  }
`;
