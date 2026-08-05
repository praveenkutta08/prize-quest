import { css } from "lit";

/**
 * Scoped styles for `<pq-screen-header>`. Reference: `.scr-head` (every TTD screen).
 * Colors use the premium-safe var(--cl-*, <fallback>) trick: in casino-loud mode the
 * bar is the gold marquee strip; outside it falls back to navy chrome.
 */
export const styles = css`
  :host {
    display: block;
  }
  .bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--cl-gold, var(--pq-cream-muted, #c9b79c));
    background: linear-gradient(180deg, var(--cl-gold-glow, rgba(20, 51, 82, 0.6)), transparent);
    border-bottom: 1px solid var(--cl-gold-deep, var(--pq-navy-hairline, #2a4f7a));
  }
  .left,
  .right {
    flex: 1 1 0;
    display: flex;
    align-items: center;
    /* NO "min-width: 0" here, deliberately. These two tracks are "flex-basis: 0" so
       they grow evenly and keep .brand optically centred — but with the automatic
       minimum size switched off they also shrink BELOW their own content. In a narrow
       rail (the Device Manager service window gives the flow ~400px) .left collapses
       under the Back button and .right collapses under the brandmark, and since neither
       track clips, both children spill inward and paint on top of the title. Letting
       the automatic minimum apply keeps the children inside their tracks; .brand
       already carries its own overflow/ellipsis, so it is the one that yields when
       space runs out — which is the correct thing to sacrifice. */
  }
  /* Brandmark hard right. NOTE: this rule was deleted once by a range-based edit that
     replaced everything between ".left,.right" and ".brand" — the logo then packed to
     the START of its track and floated mid-header on the 480px TTD panel. */
  .right {
    justify-content: flex-end;
  }
  .brand {
    flex: 0 1 auto;
    text-align: center;
    color: var(--cl-cream, var(--pq-text, #f1f5f9));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pts {
    color: var(--cl-gold-bright, var(--pq-gold-bright, #fcbf49));
    font-weight: 700;
    white-space: nowrap;
  }
  /* Tenant logo — occupies the slot the points readout used to. Height-constrained so a
     tall stacked lockup (Tier Rewards) and a wide horizontal one both sit on the bar. */
  .brandmark {
    display: block;
    height: 18px;
    width: auto;
    max-width: 96px;
    object-fit: contain;
    flex: 0 0 auto;
  }
  /* Fallback when a tenant has no logo asset on disk. */
  .wordmark {
    color: var(--cl-cream, var(--pq-text, #f1f5f9));
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 110px;
    font-size: 8px;
    letter-spacing: 0.14em;
  }
  .back {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--cl-cream, var(--pq-text, #f1f5f9));
    font: inherit;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .back svg {
    width: 8px;
    height: 8px;
  }
  .spacer {
    display: inline-block;
    width: 24px;
  }

  /* =========================================================
     EXPANDED PROFILE — kiosk arc-header (ref .arc-header).
     Base styling is premium-safe (var(--pq-*, fallback)); the
     arcade-mode block at the end layers neon gradients + glow.
     ========================================================= */
  .arc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32px 56px;
    background: linear-gradient(180deg, var(--arc-surface-0, rgba(15, 4, 46, 0.65)), transparent);
    border-bottom: 1px solid var(--arc-hairline, var(--pq-navy-hairline, rgba(140, 100, 200, 0.22)));
    font-family: var(--pq-font-body, "Inter", system-ui, sans-serif);
  }
  .arc-brand {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
  }
  .arc-logo {
    width: 56px;
    height: 56px;
    flex: 0 0 auto;
    border-radius: 12px;
    background: linear-gradient(
      135deg,
      var(--arc-display, var(--pq-gold-bright, #ffd93d)),
      var(--cat-orange, var(--pq-gold, #ff8c2c))
    );
    display: grid;
    place-items: center;
    font-family: var(--pq-font-display, "Manrope", sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 28px;
    color: var(--arc-bg-deep, var(--pq-navy, #15042e));
    box-shadow: 0 0 24px var(--arc-display-glow, rgba(255, 217, 61, 0.55));
  }
  .arc-brand__name {
    font-family: var(--pq-font-display, "Manrope", sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 24px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--arc-cream, var(--pq-text, #f5efe0));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .arc-brand__sub {
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--arc-text-faint, var(--pq-cream-muted, #8b7aaa));
    margin-top: 2px;
  }
  .arc-back {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--arc-cream, var(--pq-text, #f5efe0));
    font: inherit;
  }
  .arc-back svg {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
  }
  .arc-back__label {
    font-family: var(--pq-font-display, "Manrope", sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 20px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .arc-brandmark {
    display: flex;
    align-items: center;
  }
  .arc-brandmark .brandmark {
    height: 34px;
    max-width: 180px;
  }
  .arc-header__right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .arc-tier-pill {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 18px 8px 12px;
    background: var(--arc-bg-glass, var(--arc-surface-1, rgba(60, 25, 110, 0.6)));
    border: 1px solid var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
    border-radius: 999px;
  }
  .arc-tier-pill__icon {
    width: 32px;
    height: 32px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      var(--arc-display, var(--pq-gold-bright, #ffd93d)),
      var(--cat-orange, var(--pq-gold, #ff8c2c))
    );
    display: grid;
    place-items: center;
    color: var(--arc-bg-deep, var(--pq-navy, #15042e));
    font-weight: 800;
    font-size: 14px;
  }
  .arc-tier-pill__label {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    color: var(--arc-text-faint, var(--pq-cream-muted, #8b7aaa));
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .arc-tier-pill__name {
    font-family: var(--pq-font-display, "Manrope", sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 14px;
    color: var(--arc-cream, var(--pq-text, #f5efe0));
    letter-spacing: 0.04em;
  }
  .arc-points {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }
  .arc-points__label {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    color: var(--arc-text-faint, var(--pq-cream-muted, #8b7aaa));
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .arc-points__val {
    font-family: var(--pq-font-display, "Manrope", sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 24px;
    color: var(--arc-display, var(--pq-gold-bright, #ffd93d));
    letter-spacing: 0.02em;
  }
  .arc-time {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    padding-left: 20px;
    border-left: 1px solid var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
  }
  .arc-time__big {
    font-family: var(--pq-font-display, "Manrope", sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 24px;
    color: var(--arc-cream, var(--pq-text, #f5efe0));
  }
  .arc-time__sub {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    color: var(--arc-text-faint, var(--pq-cream-muted, #8b7aaa));
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  /* =========================================================
     ARCADE MODE (gated on <html data-pq-mode="arcade">) — CSS
     only. Layers the full neon look onto the expanded header;
     compact/standard are deliberately left untouched here.
     ========================================================= */
  :host-context([data-pq-mode="arcade"]) .arc-header {
    background: linear-gradient(180deg, var(--arc-surface-0, rgba(15, 4, 46, 0.65)), transparent);
    border-bottom-color: var(--arc-hairline, rgba(140, 100, 200, 0.22));
  }
  :host-context([data-pq-mode="arcade"]) .arc-logo,
  :host-context([data-pq-mode="arcade"]) .arc-tier-pill__icon {
    background: linear-gradient(135deg, var(--arc-display, #ffd93d), var(--cat-orange, #ff8c2c));
  }
  :host-context([data-pq-mode="arcade"]) .arc-logo {
    box-shadow: 0 0 24px var(--arc-display-glow, rgba(255, 217, 61, 0.55));
  }
  :host-context([data-pq-mode="arcade"]) .arc-points__val {
    color: var(--arc-display, #ffd93d);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }

  /* =========================================================
     ARCADE MODE — COMPACT (TTD 480×234). CSS-only, gated on
     [data-pq-mode="arcade"] + [profile="compact"]. Re-skins the
     legacy .bar chrome as the reference .scr-head: thin
     (min-height 26px) gradient strip with a hairline-2 bottom
     border. Maps scr-head__brand to .brand, scr-head__back to
     .back, scr-head__pts to .pts. Append-only; the base .bar
     (casino-loud via --cl-* fallbacks) is left untouched.
     ========================================================= */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .bar {
    gap: 4px;
    padding: 5px 10px;
    min-height: 26px;
    background: linear-gradient(
      180deg,
      var(--arc-bg-glass-2, var(--arc-surface-0, rgba(15, 4, 46, 0.65))),
      transparent
    );
    /* Mock divider: a gold gradient line brightest at center, not a flat hairline. */
    border-bottom: 1px solid transparent;
    border-image: linear-gradient(
        90deg,
        transparent,
        var(--arc-display, #ffd93d) 35%,
        var(--arc-display-bright, #ffee5c) 50%,
        var(--arc-display, #ffd93d) 65%,
        transparent
      )
      1;
    font-family: var(--arc-font-body, var(--pq-font-body, "Inter", system-ui, sans-serif));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .brand {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-family: var(--arc-font-display, var(--pq-font-display, "Manrope", sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--arc-cream, var(--pq-text, #f5efe0));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .brand-ico {
    display: inline-grid;
    place-items: center;
    width: 13px;
    height: 13px;
    color: var(--arc-display, #ffd93d);
    filter: drop-shadow(0 0 4px var(--arc-display-glow, rgba(255, 217, 61, 0.5)));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .brand-ico svg {
    width: 100%;
    height: 100%;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .brand-gold {
    background: linear-gradient(
      180deg,
      var(--arc-display-bright, #ffee5c),
      var(--arc-display, #ffd93d) 60%,
      var(--arc-display-deep, #e0b71b)
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .back {
    gap: 4px;
    padding: 2.5px 9px;
    border: 1px solid var(--arc-hairline-2, rgba(255, 217, 61, 0.4));
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.04);
    font-family: var(--arc-font-body, var(--pq-font-body, "Inter", system-ui, sans-serif));
    font-size: 9px;
    letter-spacing: 0.04em;
    text-transform: none;
    color: var(--arc-cream, var(--pq-text, #f5efe0));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .back svg {
    width: 9px;
    height: 9px;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .brandmark {
    height: 20px;
    max-width: 104px;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .wordmark {
    font-family: var(--arc-font-display, var(--pq-font-display, "Manrope", sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--arc-cream, var(--pq-text, #f5efe0));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .pts {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: var(--arc-font-mono, var(--pq-font-mono, monospace));
    font-weight: 400;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--arc-display, var(--pq-gold-bright, #ffd93d));
  }

  /* ===== iVIEW (1024x600 + 800x480) — scale compact up for touch ===== */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .bar {
    min-height: 44px;
    padding: 10px 18px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .brand {
    font-size: 14px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .pts {
    font-size: 12px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .brandmark {
    height: 32px;
    max-width: 170px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .wordmark {
    font-size: 13px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .back {
    font-size: 12px;
    padding: 6px 10px;
  }

  /* ===== iVIEW (1024x600 + 800x480) — EXPANDED header shrunk for the short panels.
     The kiosk-hub renders profile="expanded" (the rich arc-header). At 1920 it is
     ~120px tall, which crowds the hub tiles on the 600/480 panels. Scale the whole
     arc-header down to ~56px while keeping the brand + tier + points + time. Only the
     hub uses the expanded header at iVIEW, so this is targeted. ===== */
  :host-context([data-formfactor^="iview"]):host([profile="expanded"]) .arc-header {
    padding: 10px 16px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="expanded"]) .arc-brand {
    gap: 10px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="expanded"]) .arc-logo {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    font-size: 17px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="expanded"]) .arc-brand__name {
    font-size: 16px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="expanded"]) .arc-brand__sub {
    font-size: 9px;
    letter-spacing: 0.12em;
  }
  :host-context([data-formfactor^="iview"]):host([profile="expanded"]) .arc-header__right {
    gap: 12px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="expanded"]) .arc-tier-pill {
    gap: 8px;
    padding: 4px 12px 4px 6px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="expanded"]) .arc-tier-pill__icon {
    width: 22px;
    height: 22px;
    font-size: 11px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="expanded"]) .arc-tier-pill__label,
  :host-context([data-formfactor^="iview"]):host([profile="expanded"]) .arc-points__label,
  :host-context([data-formfactor^="iview"]):host([profile="expanded"]) .arc-time__sub {
    font-size: 8px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="expanded"]) .arc-tier-pill__name {
    font-size: 11px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="expanded"]) .arc-points__val,
  :host-context([data-formfactor^="iview"]):host([profile="expanded"]) .arc-time__big {
    font-size: 16px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="expanded"]) .arc-time {
    padding-left: 12px;
  }
`;
