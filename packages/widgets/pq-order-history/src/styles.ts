import { css } from "lit";

/** Scoped styles for `<pq-order-history>`. Reference: `.history-*` / `.order__*`. */
export const styles = css`
  :host {
    display: block;
    color: var(--pq-text, #f1f5f9);
  }

  /* ---------------- stack ---------------- */
  .stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .row {
    display: grid;
    grid-template-columns: 48px 1fr auto;
    align-items: center;
    gap: 14px;
    padding: 14px;
    background: linear-gradient(180deg, var(--pq-navy-low, #143352) 0%, rgba(20, 51, 82, 0.6) 100%);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-lg, 12px);
    cursor: pointer;
    transition: border-color 200ms var(--pq-ease, ease);
  }
  .row:hover {
    border-color: var(--pq-emerald, #10b981);
  }
  .thumb {
    width: 48px;
    height: 48px;
    border-radius: var(--pq-r-md, 8px);
    background: rgba(10, 26, 46, 0.6);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    color: var(--pq-gold-bright, #fcbf49);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .thumb svg {
    width: 22px;
    height: 22px;
  }
  .name {
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 14px;
    margin: 0;
  }
  .cam {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    color: var(--pq-text-faint, #64748b);
    margin: 2px 0 0;
    letter-spacing: 0.04em;
  }

  /* ---------------- expanded (header + 3-col card grid) ---------------- */
  .exp-head {
    margin: 0 0 24px;
  }
  .exp-eyebrow {
    margin: 0 0 6px;
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--pq-gold-bright, #fcbf49);
  }
  .exp-title {
    margin: 0;
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 28px;
    line-height: 1.1;
    color: var(--pq-text, #f1f5f9);
  }
  .exp-sub {
    margin: 6px 0 0;
    font-family: var(--pq-font-mono, monospace);
    font-size: 12px;
    letter-spacing: 0.06em;
    color: var(--pq-text-muted, #94a3b8);
  }
  .exp-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    align-content: start;
  }
  .exp-card {
    display: grid;
    grid-template-columns: 72px 1fr;
    gap: 16px;
    padding: 18px;
    background: linear-gradient(180deg, var(--pq-navy-low, #143352) 0%, rgba(20, 51, 82, 0.6) 100%);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-lg, 12px);
    cursor: pointer;
    transition: border-color 200ms var(--pq-ease, ease), transform 200ms var(--pq-ease, ease);
  }
  .exp-card:hover {
    border-color: var(--pq-emerald, #10b981);
  }
  .exp-thumb {
    width: 72px;
    height: 72px;
    border-radius: var(--pq-r-md, 8px);
    background: rgba(10, 26, 46, 0.6);
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    color: var(--pq-gold-bright, #fcbf49);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .exp-thumb svg {
    width: 34px;
    height: 34px;
  }
  .exp-body {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
  }
  .exp-name {
    margin: 0;
    font-family: var(--pq-font-display, sans-serif);
    font-weight: 700;
    font-size: 16px;
    line-height: 1.2;
    color: var(--pq-text, #f1f5f9);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
  .exp-ord {
    margin: 0;
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    letter-spacing: 0.06em;
    color: var(--pq-text-faint, #64748b);
  }
  .exp-dates {
    margin: 2px 0 0;
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    color: var(--pq-text-muted, #94a3b8);
  }

  /* ---------------- empty / loading ---------------- */
  .empty {
    padding: 32px;
    text-align: center;
    color: var(--pq-text-muted, #94a3b8);
    font-size: 13px;
    border: 1px solid var(--pq-navy-hairline, #2a4f7a);
    border-radius: var(--pq-r-lg, 12px);
  }
  .sk {
    height: 72px;
    border-radius: var(--pq-r-lg, 12px);
    background: var(--pq-navy-hairline, #2a4f7a);
    opacity: 0.3;
  }

  /* ====================== COMPACT (ref .ord-list / .ord-card) ====================== */
  .ord-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    align-content: start;
  }
  .ord-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 9px 10px;
    min-height: 96px;
    /* border-box so the carousel flex-basis (which is the OUTER width budget) includes
       padding + border — without it the card overflowed its slot by 22px and the
       carousel clipped the right edge (status badge). min-width:0 lets it hold basis. */
    box-sizing: border-box;
    min-width: 0;
    border-radius: var(--cl-r-md, var(--pq-r-md, 6px));
    border: 1px solid var(--cl-burgundy, var(--pq-navy-hairline, #2a4f7a));
    background: linear-gradient(
      180deg,
      var(--cl-wine-elev, var(--pq-navy-low, #143352)),
      var(--cl-wine, var(--pq-navy-base, #102a43))
    );
    cursor: pointer;
    overflow: hidden;
  }
  .ord-card__thumb {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    border-radius: var(--pq-r-sm, 4px);
    background: rgba(255, 255, 255, 0.06);
    color: var(--pq-cream-muted, #c9b79c);
  }
  .ord-card__thumb svg {
    width: 60%;
    height: 60%;
  }
  .ord-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
  }
  .ord-card__main {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
    flex: 1;
  }
  .ord-card__name {
    margin: 0;
    font-family: var(--pq-font-display, sans-serif);
    font-size: 12px;
    line-height: 1.15;
    letter-spacing: 0.04em;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: var(--cl-gold-bright, var(--pq-text, #f1f5f9));
  }
  .ord-card__badge {
    flex: 0 0 auto;
    align-self: flex-start;
    font-family: var(--pq-font-mono, monospace);
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 1.5px 5px;
    border-radius: 8px;
    color: var(--cl-black, #0a1a2e);
    background: var(--pq-text-muted, #94a3b8);
  }
  .ord-card__badge--delivered {
    background: var(--cl-success, #38d27d);
  }
  .ord-card__badge--shipped {
    background: var(--cl-cyan, #3dd6f5);
  }
  .ord-card__badge--processing {
    background: var(--cl-gold-bright, #ffd55c);
  }
  .ord-card__conf,
  .ord-card__date {
    margin: 0;
    font-family: var(--pq-font-mono, monospace);
    font-size: 8px;
    letter-spacing: 0.04em;
    color: var(--pq-text-muted, #94a3b8);
  }
  .ord-card__conf {
    color: var(--cl-cream, var(--pq-text, #f1f5f9));
  }
  .ord-card__delivered {
    margin: 1px 0 0;
    font-family: var(--pq-font-mono, monospace);
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--cl-gold, var(--pq-gold-bright, #fcbf49));
    /* Long tracking numbers must not stretch / clip the card. */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ord-card__delivered--shipped {
    color: var(--cl-cyan, #3dd6f5);
  }
  @media (prefers-reduced-motion: no-preference) {
    :host-context([data-pq-mode="casino-loud"]) .ord-card__badge--processing {
      animation: cl-ord-pulse 2s ease-in-out infinite;
    }
  }
  @keyframes cl-ord-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 var(--cl-gold-glow, transparent);
    }
    50% {
      box-shadow: 0 0 8px 0 var(--cl-gold-glow, transparent);
    }
  }

  /* ===== casino-loud — gold-framed rows + marquee names ===== */
  :host-context([data-pq-mode="casino-loud"]) .row {
    border-color: var(--cl-gold-deep, #c68a1a);
  }
  :host-context([data-pq-mode="casino-loud"]) .name {
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--cl-gold-bright, #ffd55c);
  }

  /* ====================== ARCADE MODE (CSS-only) ======================
     Neon-purple kiosk skin layered over the expanded card grid. Color / font /
     glow only — structure is identical to the base expanded layout (no TS mode
     branching). Arcade tokens (--arc-*) only exist under the arcade host. */
  :host-context([data-pq-mode="arcade"]) .exp-eyebrow {
    color: var(--arc-display, #ffd93d);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }
  :host-context([data-pq-mode="arcade"]) .exp-title {
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 48px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--arc-cream, var(--pq-text, #f1f5f9));
  }
  :host-context([data-pq-mode="arcade"]) .exp-sub,
  :host-context([data-pq-mode="arcade"]) .exp-dates {
    color: var(--arc-text-dim, var(--pq-text-muted, #94a3b8));
  }
  :host-context([data-pq-mode="arcade"]) .exp-ord {
    color: var(--arc-text-faint, var(--pq-text-faint, #64748b));
  }
  :host-context([data-pq-mode="arcade"]) .exp-card {
    background: var(--arc-bg-glass, rgba(60, 25, 110, 0.45));
    border-color: var(--arc-hairline-2, #2a4f7a);
    border-radius: var(--arc-r-lg, 20px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  }
  :host-context([data-pq-mode="arcade"]) .exp-card:hover {
    border-color: var(--arc-display, #ffd93d);
    box-shadow: 0 0 28px var(--arc-glow-soft, transparent), 0 16px 40px rgba(0, 0, 0, 0.45);
  }
  :host-context([data-pq-mode="arcade"]) .exp-thumb {
    background: var(--arc-bg-deep, rgba(10, 26, 46, 0.6));
    border-color: var(--arc-hairline-2, #2a4f7a);
    border-radius: var(--arc-r-md, 12px);
    color: var(--arc-display, #fcbf49);
  }
  :host-context([data-pq-mode="arcade"]) .exp-name {
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--arc-text, var(--pq-text, #f1f5f9));
  }

  @media (prefers-reduced-motion: no-preference) {
    /* Cards lift toward the player on hover on the arcade floor. */
    :host-context([data-pq-mode="arcade"]) .exp-card:hover {
      transform: translateY(-3px);
    }
  }

  /* ====================== EXPANDED CHROME (Section 6.13) ======================
     Title row + back · stats strip · filter pills · pagination footer. Colors use
     the premium-safe var(--arc-*, <fallback>) trick so non-arcade expanded
     surfaces still resolve sane navy/gold values; the arcade host supplies the
     neon --arc-*/--cat-* tokens. */
  .oh-titlerow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin: 0 0 28px;
  }
  .oh-titlerow__left {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .oh-titlerow__right {
    display: flex;
    align-items: center;
    gap: 18px;
  }
  .oh-back,
  .oh-dropdown {
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
    cursor: pointer;
    transition: border-color 200ms var(--pq-ease, ease);
  }
  .oh-back:hover,
  .oh-dropdown:hover {
    border-color: var(--arc-display, var(--pq-emerald, #10b981));
  }
  .oh-back svg,
  .oh-dropdown svg {
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
  }
  .oh-showing {
    font-family: var(--pq-font-mono, monospace);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--arc-text-faint, var(--pq-text-faint, #64748b));
  }

  .stats-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    margin: 0 0 28px;
  }
  .stat-card {
    padding: 18px;
    border: 1px solid var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    border-radius: var(--arc-r-lg, var(--pq-r-lg, 16px));
  }
  .stat-card__eyebrow {
    font-family: var(--pq-font-mono, monospace);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .stat-card__num {
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 36px;
    line-height: 1;
    color: var(--arc-cream, var(--pq-text, #f1f5f9));
  }
  .stat-card__num--sm {
    font-size: 22px;
    line-height: 1.1;
    padding-top: 8px;
  }
  .stat-card__sub {
    font-size: 12px;
    color: var(--arc-text-dim, var(--pq-text-muted, #94a3b8));
    margin-top: 4px;
  }
  .stat-card--delivered {
    background: linear-gradient(160deg, rgba(52, 214, 112, 0.2), rgba(22, 163, 74, 0.1));
    border-color: var(--arc-success, #34d670);
  }
  .stat-card--delivered .stat-card__eyebrow {
    color: var(--arc-success, #34d670);
  }
  .stat-card--transit {
    background: linear-gradient(160deg, rgba(61, 139, 245, 0.2), rgba(31, 111, 230, 0.1));
    border-color: var(--arc-info, #4a8fe6);
  }
  .stat-card--transit .stat-card__eyebrow {
    color: var(--arc-info, #4a8fe6);
  }
  .stat-card--value {
    background: linear-gradient(160deg, rgba(255, 217, 61, 0.18), rgba(255, 140, 44, 0.08));
    border-color: var(--arc-display, #ffd93d);
  }
  .stat-card--value .stat-card__eyebrow,
  .stat-card--value .stat-card__num {
    color: var(--arc-display, #ffd93d);
  }
  .stat-card--favorite {
    background: linear-gradient(160deg, rgba(255, 63, 164, 0.18), rgba(142, 71, 232, 0.1));
    border-color: var(--cat-pink, #ff3fa4);
  }
  .stat-card--favorite .stat-card__eyebrow {
    color: var(--cat-pink-bright, var(--cat-pink, #ff3fa4));
  }

  .filter-row {
    display: flex;
    align-items: center;
    gap: 10px;
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
    padding: 9px 20px;
    border-radius: var(--arc-r-pill, 999px);
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 13px;
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
    box-shadow: 0 3px 10px var(--arc-display-glow, rgba(255, 217, 61, 0.45));
  }

  .oh-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 8px;
  }
  .oh-loadmore {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: 1px solid var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    color: var(--arc-text-dim, var(--pq-text-muted, #94a3b8));
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    font-size: 14px;
    letter-spacing: 0.04em;
    border-radius: var(--arc-r-pill, 999px);
    padding: 12px 22px;
    cursor: pointer;
    transition: border-color 200ms var(--pq-ease, ease);
  }
  .oh-loadmore:hover {
    border-color: var(--arc-display, var(--pq-emerald, #10b981));
  }
  .oh-loadmore svg {
    width: 14px;
    height: 14px;
  }

  /* ===== portrait orientation (kiosk-portrait 1080×1920) — Section 10.6 =====
     Drop the 3-col order grid to a 2-up; size rows to content. The stats strip
     drops to a 2×2; the filter row wraps. */
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .exp-grid {
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: max-content;
    align-content: start;
  }
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .stats-strip {
    grid-template-columns: 1fr 1fr;
  }
  :host-context([data-orientation="portrait"]):host([profile="expanded"]) .filter-row {
    flex-wrap: wrap;
  }

  /* ===== iVIEW (compact profile) — single-column order stack, not the TTD 2-up. ===== */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .ord-list {
    grid-template-columns: 1fr;
  }

  /* ====================== ARCADE MODE · COMPACT (TTD 480×234, Session 29) ===
     The compact render (renderGrid) is the dense 2-col grid: .ord-list of
     .ord-card, each with .ord-card__head > .ord-card__name + .ord-card__badge,
     then .ord-card__conf / .ord-card__date / .ord-card__delivered. Base + the
     casino-loud skin above stay untouched; here we promote the compact grid to
     the arcade neon-purple skin. Spec map: 2-col grid → .ord-list, order card →
     .ord-card (glass gradient + 2px category accent ::before), prize name →
     .ord-card__name (display uppercase cream), status badge → .ord-card__badge
     variants (delivered→success, shipped→info, processing→warning), date/meta →
     .ord-card__date / .ord-card__conf. Append-only; gated on arcade + compact.
     GAP: compact (renderGrid) renders NO filter pills, so .ord-filter /
     .ord-filter--active have no markup to target — left unstyled (no render
     change per constraints). Filter pills exist only in the expanded chrome
     (.filter-pill, already arcade-styled above). */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .ord-card {
    position: relative;
    /* One full-width card per page → lay it out horizontally: art · details · badge. */
    flex-direction: row;
    align-items: center;
    gap: 12px;
    border-radius: var(--arc-r-sm, var(--pq-r-md, 6px));
    border: 1px solid var(--arc-hairline-2, var(--pq-navy-hairline, #2a4f7a));
    background: linear-gradient(
      160deg,
      rgba(60, 25, 110, 0.55),
      rgba(30, 10, 60, 0.75)
    );
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .ord-card__thumb {
    width: 44px;
    height: 44px;
    flex: 0 0 auto;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .ord-card__badge {
    align-self: center;
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .ord-card__name {
    font-size: 14px;
  }
  /* 2px category accent strip — no per-order category data in compact, so we
     read an optional --cat-tint var (falls back to the arcade purple accent). */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .ord-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--cat-tint, var(--cat-purple, #8e47e8));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .ord-card__name {
    font-family: var(--arc-font-display, var(--pq-font-display, sans-serif));
    font-weight: var(--arc-font-display-weight, 800);
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--arc-cream, var(--pq-text, #f5efe0));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .ord-card__thumb {
    background: var(--cat-tint-glow, rgba(142, 71, 232, 0.18));
    color: var(--cat-tint-bright, var(--cat-purple-bright, #b47bff));
    border: 1px solid var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .ord-card__conf {
    color: var(--arc-text-dim, var(--pq-text-muted, #d0bfec));
    font-family: var(--arc-font-mono, var(--pq-font-mono, monospace));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .ord-card__date {
    color: var(--arc-text-faint, var(--pq-text-faint, #8b7aaa));
    font-family: var(--arc-font-mono, var(--pq-font-mono, monospace));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .ord-card__delivered {
    color: var(--arc-display, var(--pq-gold-bright, #ffd93d));
    font-family: var(--arc-font-mono, var(--pq-font-mono, monospace));
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .ord-card__delivered--shipped {
    color: var(--arc-info, #4a8fe6);
  }
  /* status badges → arc status palette (delivered→success, shipped→info,
     processing→warning), matching renderGrid's status→class map. */
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .ord-card__badge--delivered {
    background: var(--arc-success, #34d670);
    color: var(--arc-bg-deep, #15042e);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .ord-card__badge--shipped {
    background: var(--arc-info, #4a8fe6);
    color: var(--arc-text, #ffffff);
  }
  :host-context([data-pq-mode="arcade"]):host([profile="compact"]) .ord-card__badge--processing {
    background: var(--arc-warning, #ffb627);
    color: var(--arc-bg-deep, #15042e);
  }

  /* ===== iVIEW (1024x600 + 800x480) — scale compact up for touch ===== */
  /* Compact order cards (renderGrid: .ord-list > .ord-card). The single-column
     .ord-list override above is untouched; here we only size the card chrome.
     CSS sizes only; colors kept. NOTE: the compact card has no thumb image
     (the .thumb 48x48 belongs to the standard .row render, not compact), so
     the thumb-size spec has nothing to target here. */
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .ord-card {
    gap: 5px;
    padding: 10px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .ord-card__name {
    font-size: 14px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .ord-card__badge {
    font-size: 10px;
    padding: 3px 8px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .ord-card__conf,
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .ord-card__date {
    font-size: 11px;
  }
  :host-context([data-formfactor^="iview"]):host([profile="compact"]) .ord-card__delivered {
    font-size: 11px;
  }
`;
