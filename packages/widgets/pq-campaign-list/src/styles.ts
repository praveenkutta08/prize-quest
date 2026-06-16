import { css } from "lit";

/**
 * Scoped styles for `<pq-campaign-list>`. Variant via reflected `variant` attr.
 * Visual reference: `.camp` stack (screen 01) and `.x01-rail` carousel (screen 01x).
 */
export const styles = css`
  :host {
    display: block;
    color: var(--pq-text, #f1f5f9);
  }

  .featured {
    margin-bottom: 20px;
  }

  /* ---------------- stack ---------------- */
  .stack {
    display: flex;
    flex-direction: column;
  }
  /* Compact surfaces (e.g. ttd) render a dense 2-column grid of rich cards
     (ref .camp-list). The cards themselves get profile="compact". */
  :host([profile="compact"]) .stack {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    align-content: start;
  }

  /* ---------------- carousel ---------------- */
  .rail-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 0 0 16px;
  }
  .rail-title {
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 18px;
    margin: 0;
  }
  .rail-controls {
    display: flex;
    gap: 6px;
  }
  .rail-ctl {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--pq-navy-low, #143352);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    color: var(--pq-text, #f1f5f9);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 200ms var(--pq-ease, ease);
  }
  .rail-ctl:hover {
    border-color: var(--pq-emerald, #10b981);
  }
  .rail-ctl svg {
    width: 16px;
    height: 16px;
  }
  .rail {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    padding-bottom: 8px;
  }
  .rail::-webkit-scrollbar {
    height: 6px;
  }
  .rail::-webkit-scrollbar-thumb {
    background: var(--pq-navy-hairline, #2a4f7a);
    border-radius: 3px;
  }
  .rail pq-campaign-card {
    flex: 0 0 300px;
    scroll-snap-align: start;
  }

  /* ---------------- grid (expanded "All campaigns") ---------------- */
  .grid-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 0 0 16px;
  }
  .grid-title {
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 18px;
    margin: 0;
  }
  /* Responsive multi-up: auto-fills toward a 3-up at kiosk widths, collapses
     to fewer columns on narrower surfaces (ref: kiosk-arcade screen 01). */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 28px;
    align-content: start;
  }

  /* ---------------- empty ---------------- */
  .empty {
    padding: 36px 24px;
    text-align: center;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-2xl, 20px);
    background: linear-gradient(180deg, var(--pq-navy-low, #143352) 0%, var(--pq-navy-base, #102a43) 100%);
  }
  .empty p {
    margin: 0;
    color: var(--pq-text-muted, #94a3b8);
    font-size: 13px;
  }

  /* ===== casino-loud — marquee rail title + gold carousel controls ===== */
  :host-context([data-pq-mode="casino-loud"]) .rail-title {
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--cl-gold-bright, #ffd55c);
  }
  :host-context([data-pq-mode="casino-loud"]) .rail-ctl:hover {
    border-color: var(--cl-gold, #ffb627);
    color: var(--cl-gold-bright, #ffd55c);
    box-shadow: 0 0 6px var(--cl-gold-glow, rgba(255, 182, 39, 0.55));
  }

  /* ===== arcade — kiosk "All campaigns" grid: roomier gaps, neon-display
     section heading (ref: prize-quest-kiosk-arcade screen 01). ===== */
  :host-context([data-pq-mode="arcade"]) .grid {
    gap: 28px;
  }
  :host-context([data-pq-mode="arcade"]) .grid-head {
    margin-bottom: 24px;
  }
  :host-context([data-pq-mode="arcade"]) .grid-title,
  :host-context([data-pq-mode="arcade"]) .rail-title {
    font-family: var(--arc-font-display, "Manrope", sans-serif);
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 28px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--arc-cream, #f5efe0);
  }
  /* Arcade cabinets are wide kiosks — lock to a true 3-up at the floor. */
  :host-context([data-pq-mode="arcade"]) .grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }

  /* ====================== EXPANDED CHROME (reference Screen 01) ======================
     Back-to-hub · greeting (welcome + quick stats) · filter pills above the grid.
     Premium-safe var(--arc-*, <fallback>) colors; the arcade host supplies the
     neon --arc-*/--cat-* tokens. */
  .cl-back {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    border: 1px solid var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    color: var(--arc-text-dim, var(--pq-text-muted, #94a3b8));
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 13px;
    letter-spacing: 0.04em;
    border-radius: var(--arc-r-pill, 999px);
    padding: 9px 16px;
    margin: 0 0 8px;
    cursor: pointer;
    transition: border-color 200ms var(--pq-ease, ease);
  }
  .cl-back:hover {
    border-color: var(--arc-display, var(--pq-emerald, #10b981));
  }
  .cl-back svg {
    width: 16px;
    height: 16px;
  }

  .greeting {
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: 56px;
    align-items: end;
    margin: 0 0 32px;
  }
  .greeting__intro {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .greeting__eyebrow {
    font-family: var(--arc-font-mono, var(--pq-font-mono, monospace));
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
  }
  .greeting__headline {
    margin: 0;
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-size: 80px;
    line-height: 0.95;
    letter-spacing: 0.01em;
    text-transform: uppercase;
    font-weight: var(--arc-font-display-weight, 800);
    color: var(--arc-cream, var(--pq-text, #f1f5f9));
  }
  .greeting__name {
    background: linear-gradient(135deg, var(--arc-display-bright, #ffee5c), var(--cat-pink, #ff3fa4));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: var(--cat-pink, #ff3fa4);
  }
  .greeting__sub {
    margin: 0;
    font-size: 20px;
    line-height: 1.5;
    max-width: 700px;
    color: var(--arc-text-dim, var(--pq-text-muted, #94a3b8));
  }
  .greeting__sub strong {
    color: var(--arc-display, var(--pq-gold-bright, #fcbf49));
    font-weight: 700;
  }

  .stats-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .stat-card {
    padding: 20px;
    border: 1px solid var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    border-radius: var(--arc-r-lg, var(--pq-r-lg, 16px));
  }
  .stat-card__eyebrow {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .stat-card__num {
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 48px;
    line-height: 1;
    color: var(--arc-cream, var(--pq-text, #f1f5f9));
  }
  .stat-card__sub {
    font-size: 12px;
    color: var(--arc-text-dim, var(--pq-text-muted, #94a3b8));
    margin-top: 4px;
  }
  .stat-card--ready {
    background: linear-gradient(160deg, rgba(52, 214, 112, 0.2), rgba(22, 163, 74, 0.12));
    border-color: var(--arc-success, #34d670);
  }
  .stat-card--ready .stat-card__eyebrow {
    color: var(--arc-success, #34d670);
  }
  .stat-card--active {
    background: linear-gradient(160deg, rgba(61, 139, 245, 0.2), rgba(31, 111, 230, 0.12));
    border-color: var(--arc-info, #4a8fe6);
  }
  .stat-card--active .stat-card__eyebrow {
    color: var(--arc-info, #4a8fe6);
  }

  .filter-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin: 0 0 24px;
  }
  .filter-label {
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--arc-text-faint, var(--pq-text-faint, #64748b));
    margin-right: 8px;
  }
  .filter-pill {
    padding: 10px 22px;
    border-radius: var(--arc-r-pill, 999px);
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 14px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    background: rgba(60, 25, 110, 0.5);
    border: 1px solid var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    color: var(--arc-text-dim, var(--pq-text-muted, #94a3b8));
    transition: border-color 200ms var(--pq-ease, ease);
  }
  .filter-pill:hover {
    border-color: var(--arc-display, var(--pq-emerald, #10b981));
  }
  .filter-pill--active,
  .filter-pill--active:hover {
    background: linear-gradient(135deg, var(--arc-display, #ffd93d), var(--cat-orange, #ff8c2c));
    color: var(--arc-bg-deep, #15042e);
    border-color: transparent;
    box-shadow: 0 4px 12px var(--arc-display-glow, rgba(255, 217, 61, 0.45));
  }
  .cl-showing {
    margin-left: auto;
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--arc-text-faint, var(--pq-text-faint, #64748b));
  }

  /* ===== portrait orientation (kiosk-portrait 1080×1920) — Section 10.6 =====
     Taller-than-wide cabinets: drop the campaign grid to a true 2-up and let
     cards size to content instead of stretching to fill the column height. The
     greeting stacks (intro over stats); the quick-stats stay a tight 2-up. */
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .grid {
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: max-content;
    align-content: start;
    flex: none;
    gap: 28px;
  }
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .greeting {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .stats-2col {
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  /* ===== iVIEW (compact profile) — single-column stack, not the TTD 2-up grid. ===== */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .stack {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  /* ===== iVIEW (1024x600 + 800x480) — scale compact up for touch ===== */
  /* List-level sizing only; card chrome lives in pq-campaign-card. The
     single-column .stack grid above already sets columns + gap, so here we
     only roomy-up the inter-card gap further for finger targets. The compact
     render has no list-level heading; .rail-title / .grid-title are
     expanded-only. */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .stack {
    gap: 14px;
  }
`;
