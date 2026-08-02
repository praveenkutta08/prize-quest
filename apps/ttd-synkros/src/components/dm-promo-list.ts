// <dm-promo-list> — the promotions browser inside the Device Manager service window
// (route /promotions). A HORIZONTALLY scrollable carousel, one promotion per page,
// matching the iVIEW/Konami campaign card: an art pane on the left carrying the name,
// prize count and the action, and a detail pane on the right carrying the overview,
// how it works, and the prizes.
//
// TWO STATES ONLY, per the customer decision:
//   COLLECT — the patron has qualified (campaign status `eligible`)
//   LOCKED  — everything else
//
// The whole card is the target, including LOCKED ones: tapping opens that promotion's
// prize list as a PREVIEW, where Collect on each prize is disabled. That is the same
// contract TTD/iVIEW/SYNKROS already run, so the card just fires `pq-card-click` and
// main.ts routes it. The state button is presentational (pointer-events: none) so a
// button reading LOCKED never behaves like a live control.
//
// HOUSE RULE: no currency values anywhere, and no progress bars.
//
// Host chrome (NOT a @pq widget), themed by the tenant's --arc-* tokens.
import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { $campaigns, bindAtom } from "@pq/store";
import type { Campaign } from "@pq/mock-data";

const trophyIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.6"
  aria-hidden="true"
>
  <path d="M6 4h12v3a6 6 0 0 1-12 0V4Z" />
  <path d="M6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3M9 15h6M12 13v2M8 20h8" />
</svg>`;
const lockIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.7"
  aria-hidden="true"
>
  <rect x="4" y="10" width="16" height="11" rx="2" />
  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
</svg>`;
const giftIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.9"
  aria-hidden="true"
>
  <rect x="3" y="9" width="18" height="12" rx="1" />
  <path d="M12 9v12M3 13h18M12 9S10 4 7.5 5.5 9 9 12 9ZM12 9s2-5 4.5-3.5S15 9 12 9Z" />
</svg>`;
const calendarIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  aria-hidden="true"
>
  <rect x="3" y="5" width="18" height="16" rx="2" />
  <path d="M3 10h18M8 3v4M16 3v4" />
</svg>`;
const chipIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  aria-hidden="true"
>
  <rect x="2" y="6" width="20" height="12" rx="2" />
  <path d="M2 10h20M6 15h4" />
</svg>`;
const targetIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  aria-hidden="true"
>
  <circle cx="12" cy="12" r="9" />
  <circle cx="12" cy="12" r="5" />
  <circle cx="12" cy="12" r="1.5" />
</svg>`;
const STEP_ICONS = [calendarIcon, chipIcon, targetIcon];

/** The only two states a promotion presents on this surface. */
function isCollectable(c: Campaign): boolean {
  return c.status === "eligible";
}

export class DmPromoList extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100%;
    }
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    .root {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 22px 24px 20px;
      color: var(--arc-text, #fff);
      font-family: var(--arc-font-body, "Inter", sans-serif);
    }

    /* ---------------- header ---------------- */
    .head {
      flex: none;
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
    }
    .back {
      flex: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 15px;
      border-radius: 999px;
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.2));
      background: var(--arc-surface-0, rgba(0, 0, 0, 0.6));
      color: var(--arc-text-dim, #c0c0c0);
      font-family: var(--arc-font-mono, monospace);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      cursor: pointer;
    }
    .back:hover {
      color: var(--arc-display-bright, #ebd08a);
      border-color: var(--arc-display-deep, #a8862a);
    }
    .head__mid {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 auto;
      min-width: 0;
    }
    .head__mid svg {
      width: 20px;
      height: 20px;
      flex: none;
      color: var(--arc-display, #d4af37);
    }
    .head__eyebrow {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 17px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--arc-cream, #fff);
      white-space: nowrap;
    }
    .head__title {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 17px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--arc-display, #d4af37);
      white-space: nowrap;
    }
    /* The product mark — this screen is ours, so it signs it. */
    .head__mark {
      flex: none;
      display: grid;
      place-items: center;
      padding: 5px 11px;
      border-radius: 6px;
      background: var(--arc-bg-deep, #000);
      border: 1px solid rgba(255, 255, 255, 0.14);
    }
    .head__mark img {
      display: block;
      height: 26px;
      max-width: 128px;
      object-fit: contain;
    }
    .head__wordmark {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 14px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--arc-display-bright, #ebd08a);
    }

    /* ---------------- carousel ---------------- */
    .stage {
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .nav {
      flex: none;
      display: grid;
      place-items: center;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      cursor: pointer;
      border: 1px solid var(--arc-display-deep, #a8862a);
      background: linear-gradient(
        180deg,
        var(--arc-display-bright, #ebd08a),
        var(--arc-display, #d4af37) 60%,
        var(--arc-display-deep, #a8862a)
      );
      color: var(--arc-on-tint, rgba(0, 0, 0, 0.88));
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 20px;
      line-height: 1;
      box-shadow: 0 6px 16px -8px var(--arc-display-glow, rgba(212, 175, 55, 0.5));
      transition:
        transform 180ms ease,
        opacity 180ms ease;
    }
    .nav:hover:not(:disabled) {
      transform: scale(1.06);
    }
    .nav:disabled {
      opacity: 0.28;
      cursor: default;
      background: var(--arc-surface-1, rgba(38, 38, 38, 0.55));
      color: var(--arc-text-faint, #8a8a8a);
      border-color: var(--arc-hairline, rgba(192, 192, 192, 0.18));
      box-shadow: none;
    }

    .track {
      flex: 1;
      min-width: 0;
      height: 100%;
      /* The card is a landscape object; letting it stretch the full column height
         strands both panes in space. Cap it and let the stage centre it. */
      max-height: 620px;
      display: flex;
      gap: 0;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .track::-webkit-scrollbar {
      display: none;
    }

    /* ---------------- the campaign card ---------------- */
    .card {
      flex: 0 0 100%;
      scroll-snap-align: center;
      scroll-snap-stop: always;
      height: 100%;
      display: flex;
      overflow: hidden;
      cursor: pointer;
      border-radius: 14px;
      border: 1.5px solid var(--arc-display, #d4af37);
      background-color: var(--arc-bg-base, #0a0a0a);
      background-image:
        radial-gradient(
          80% 60% at 18% 0%,
          var(--arc-glow-soft, rgba(212, 175, 55, 0.16)),
          transparent 70%
        ),
        linear-gradient(
          150deg,
          var(--arc-bg-glass, rgba(34, 34, 34, 0.6)),
          var(--arc-bg-glass-2, rgba(12, 12, 12, 0.94)) 70%
        );
      box-shadow:
        0 0 22px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
    .card--locked {
      border-color: var(--arc-hairline, rgba(192, 192, 192, 0.2));
      background-image: linear-gradient(
        150deg,
        var(--arc-bg-glass, rgba(34, 34, 34, 0.6)),
        var(--arc-bg-glass-2, rgba(12, 12, 12, 0.94)) 70%
      );
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }
    .card:focus-visible {
      outline: 2px solid var(--arc-display, #d4af37);
      outline-offset: 3px;
    }

    /* ---- left: the art pane ---- */
    /* The art pane is the poster: a gold bloom behind the trophy, a fan of light rays
       masked to fade out, and a vignette pulling the edges down so the name and the
       action sit in a pool of light. */
    .art {
      position: relative;
      flex: 0 0 42%;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 30px 24px;
      text-align: center;
      overflow: hidden;
      background:
        radial-gradient(
          circle at 50% 34%,
          var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
          transparent 46%
        ),
        radial-gradient(
          circle at 50% 34%,
          var(--arc-glow-soft, rgba(212, 175, 55, 0.16)),
          transparent 72%
        ),
        linear-gradient(180deg, rgba(0, 0, 0, 0.42), rgba(0, 0, 0, 0.82));
      border-right: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
    }
    .art::before {
      content: "";
      position: absolute;
      inset: -30%;
      background: repeating-conic-gradient(
        from 0deg at 50% 42%,
        rgba(255, 255, 255, 0.055) 0deg 3deg,
        transparent 3deg 13deg
      );
      -webkit-mask-image: radial-gradient(circle at 50% 42%, #000 6%, transparent 58%);
      mask-image: radial-gradient(circle at 50% 42%, #000 6%, transparent 58%);
      pointer-events: none;
    }
    .art::after {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 50% 42%, transparent 42%, rgba(0, 0, 0, 0.62) 100%);
      pointer-events: none;
    }
    .art > * {
      position: relative;
      z-index: 1;
    }
    .card--locked .art {
      background:
        radial-gradient(circle at 50% 34%, rgba(192, 192, 192, 0.12), transparent 52%),
        linear-gradient(180deg, rgba(0, 0, 0, 0.42), rgba(0, 0, 0, 0.86));
    }
    .card--locked .art::before {
      opacity: 0.35;
    }
    /* Ornamental rule under the name — the flourish the reference card carries. */
    .art__orn {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 78%;
    }
    .art__orn::before,
    .art__orn::after {
      content: "";
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--arc-display-deep, #a8862a));
    }
    .art__orn::after {
      background: linear-gradient(270deg, transparent, var(--arc-display-deep, #a8862a));
    }
    .art__orn i {
      width: 6px;
      height: 6px;
      flex: none;
      transform: rotate(45deg);
      background: var(--arc-display, #d4af37);
    }
    .card--locked .art__orn::before,
    .card--locked .art__orn::after {
      background: linear-gradient(
        90deg,
        transparent,
        var(--arc-hairline, rgba(192, 192, 192, 0.3))
      );
    }
    .card--locked .art__orn i {
      background: var(--arc-text-faint, #8a8a8a);
    }
    .card--locked .art {
      border-right-color: var(--arc-hairline, rgba(192, 192, 192, 0.18));
    }
    .art__icon {
      display: grid;
      place-items: center;
      width: 96px;
      height: 96px;
      border-radius: 50%;
      color: var(--arc-display, #d4af37);
      background: radial-gradient(
        circle at 40% 32%,
        var(--arc-glow-soft, rgba(212, 175, 55, 0.16)),
        transparent 70%
      );
      border: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      filter: drop-shadow(0 0 14px var(--arc-display-glow, rgba(212, 175, 55, 0.5)));
    }
    .card--locked .art__icon {
      color: var(--arc-text-faint, #8a8a8a);
      border-color: var(--arc-hairline, rgba(192, 192, 192, 0.18));
      filter: none;
    }
    .art__icon svg {
      width: 52px;
      height: 52px;
    }
    .art__name {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 30px;
      line-height: 1.04;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: var(--arc-display-bright, #ebd08a);
    }
    .card--locked .art__name {
      color: var(--arc-text-dim, #c0c0c0);
    }
    .art__pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      background: var(--arc-surface-0, rgba(0, 0, 0, 0.6));
      font-family: var(--arc-font-mono, monospace);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--arc-display-bright, #ebd08a);
      white-space: nowrap;
    }
    .art__pill svg {
      width: 13px;
      height: 13px;
    }
    .card--locked .art__pill {
      color: var(--arc-text-dim, #c0c0c0);
      border-color: var(--arc-hairline, rgba(192, 192, 192, 0.18));
    }
    /* Presentational: the card is the target, so this never eats the tap. */
    .art__cta {
      pointer-events: none;
      width: 100%;
      max-width: 240px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      padding: 14px 20px;
      border-radius: 10px;
      border: 1px solid var(--arc-display, #d4af37);
      background: linear-gradient(
        180deg,
        var(--arc-display-bright, #ebd08a),
        var(--arc-display, #d4af37) 55%,
        var(--arc-display-deep, #a8862a)
      );
      color: var(--arc-on-tint, rgba(0, 0, 0, 0.88));
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 19px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      box-shadow:
        0 0 16px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
    }
    .art__cta svg {
      width: 19px;
      height: 19px;
    }
    .art__cta--locked {
      background: var(--arc-surface-0, rgba(0, 0, 0, 0.7));
      border-color: var(--arc-hairline, rgba(192, 192, 192, 0.2));
      color: var(--arc-text-faint, #8a8a8a);
      box-shadow: none;
    }

    /* ---- right: the detail pane ---- */
    .body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      /* Spread the three blocks across the pane rather than clustering them in the
         middle — on a cabinet the slack reads as an unfinished screen. */
      justify-content: space-between;
      gap: 18px;
      padding: 30px 28px;
      overflow-y: auto;
      scrollbar-width: none;
    }
    .body::-webkit-scrollbar {
      display: none;
    }
    /* A hairline above each block turns three paragraphs into a spec sheet. */
    .body section + section {
      padding-top: 22px;
      border-top: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.12));
    }
    .sec__t {
      font-family: var(--arc-font-mono, monospace);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      color: var(--arc-display, #d4af37);
      margin-bottom: 11px;
    }
    /* 15px, not 13: an EGM is read at arm's length, not desk distance. */
    .sec__p {
      font-size: 15px;
      line-height: 1.55;
      color: var(--arc-text-dim, #c0c0c0);
    }
    .steps {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 13px;
      font-size: 15px;
      line-height: 1.3;
      color: var(--arc-cream, #fff);
    }
    .step span {
      flex: none;
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--arc-glow-soft, rgba(212, 175, 55, 0.16));
      border: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      color: var(--arc-display, #d4af37);
    }
    .step span svg {
      width: 19px;
      height: 19px;
    }
    .card--locked .step span {
      color: var(--arc-text-faint, #8a8a8a);
      background: var(--arc-surface-0, rgba(0, 0, 0, 0.6));
      border-color: var(--arc-hairline, rgba(192, 192, 192, 0.18));
    }
    .ends {
      color: var(--arc-text-faint, #8a8a8a);
    }

    /* ---------------- dots ---------------- */
    .dots {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding-top: 2px;
    }
    .dot {
      width: 8px;
      height: 8px;
      padding: 0;
      border: none;
      border-radius: 999px;
      cursor: pointer;
      background: var(--arc-hairline, rgba(192, 192, 192, 0.25));
      transition:
        width 200ms ease,
        background 200ms ease;
    }
    .dot--on {
      width: 26px;
      background: var(--arc-display, #d4af37);
      box-shadow: 0 0 8px var(--arc-display-glow, rgba(212, 175, 55, 0.5));
    }
    .foot {
      flex: none;
      text-align: center;
      font-size: 11px;
      color: var(--arc-text-mute, #5a5a5a);
    }
    .empty {
      margin: auto;
      text-align: center;
      font-size: 14px;
      line-height: 1.5;
      color: var(--arc-text-dim, #c0c0c0);
      max-width: 34ch;
    }

    @media (prefers-reduced-motion: no-preference) {
      .card:not(.card--locked) {
        animation: dm-ready-pulse 3s ease-in-out infinite;
      }
    }
    @keyframes dm-ready-pulse {
      0%,
      100% {
        box-shadow:
          0 0 18px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
          inset 0 1px 0 rgba(255, 255, 255, 0.05);
      }
      50% {
        box-shadow:
          0 0 32px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
          inset 0 1px 0 rgba(255, 255, 255, 0.05);
      }
    }

    /* ---------- 1024×768 · the rail is ~400px: stack the two panes ---------- */
    :host-context([data-dm-ff="1024x768"]) .root {
      gap: 10px;
      padding: 13px 14px 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .head {
      padding-bottom: 10px;
      gap: 8px;
    }
    :host-context([data-dm-ff="1024x768"]) .back {
      padding: 7px 11px;
      font-size: 9px;
    }
    :host-context([data-dm-ff="1024x768"]) .head__mid svg,
    :host-context([data-dm-ff="1024x768"]) .head__eyebrow {
      display: none;
    }
    :host-context([data-dm-ff="1024x768"]) .head__title {
      font-size: 14px;
    }
    :host-context([data-dm-ff="1024x768"]) .head__mark img {
      height: 20px;
      max-width: 96px;
    }
    :host-context([data-dm-ff="1024x768"]) .stage {
      gap: 7px;
    }
    /* Stacked at 1024 — the card is portrait there, so it may use the whole column. */
    :host-context([data-dm-ff="1024x768"]) .track {
      max-height: none;
    }
    :host-context([data-dm-ff="1024x768"]) .nav {
      width: 34px;
      height: 34px;
      font-size: 15px;
    }
    :host-context([data-dm-ff="1024x768"]) .card {
      flex-direction: column;
      border-radius: 11px;
    }
    :host-context([data-dm-ff="1024x768"]) .art {
      flex: none;
      gap: 9px;
      padding: 14px 14px 16px;
      border-right: none;
      border-bottom: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
    }
    :host-context([data-dm-ff="1024x768"]) .card--locked .art {
      border-bottom-color: var(--arc-hairline, rgba(192, 192, 192, 0.18));
    }
    :host-context([data-dm-ff="1024x768"]) .art {
      padding: 16px 14px 18px;
    }
    :host-context([data-dm-ff="1024x768"]) .art__icon {
      width: 62px;
      height: 62px;
    }
    :host-context([data-dm-ff="1024x768"]) .art__icon svg {
      width: 32px;
      height: 32px;
    }
    :host-context([data-dm-ff="1024x768"]) .art__orn {
      width: 62%;
    }
    :host-context([data-dm-ff="1024x768"]) .art__name {
      font-size: 21px;
    }
    :host-context([data-dm-ff="1024x768"]) .art__pill {
      font-size: 9px;
      padding: 5px 11px;
    }
    :host-context([data-dm-ff="1024x768"]) .art__cta {
      padding: 11px 16px;
      font-size: 14px;
    }
    :host-context([data-dm-ff="1024x768"]) .body {
      gap: 14px;
      padding: 16px 16px 18px;
    }
    :host-context([data-dm-ff="1024x768"]) .body section + section {
      padding-top: 13px;
    }
    :host-context([data-dm-ff="1024x768"]) .sec__t {
      font-size: 9px;
      margin-bottom: 6px;
    }
    :host-context([data-dm-ff="1024x768"]) .sec__p,
    :host-context([data-dm-ff="1024x768"]) .step {
      font-size: 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .step span {
      width: 27px;
      height: 27px;
      border-radius: 7px;
    }
    :host-context([data-dm-ff="1024x768"]) .step span svg {
      width: 14px;
      height: 14px;
    }
    :host-context([data-dm-ff="1024x768"]) .foot {
      font-size: 9px;
    }
  `;

  static override properties = {
    campaigns: { attribute: false },
    index: { type: Number },
    logoBroken: { state: true },
  };

  declare campaigns: Campaign[] | null;
  declare index: number;
  declare logoBroken: boolean;

  constructor() {
    super();
    this.campaigns = null;
    this.index = 0;
    this.logoBroken = false;
    bindAtom(this, $campaigns, "campaigns");
  }

  /** Collectable promotions lead — nobody should scroll to find what they've won. */
  private get list(): Campaign[] {
    return [...(this.campaigns ?? [])].sort(
      (a, b) => Number(isCollectable(b)) - Number(isCollectable(a)),
    );
  }

  private get track(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(".track");
  }

  /** Open a promotion. Locked ones open too — as a prize preview. */
  #open(id: string): void {
    this.dispatchEvent(
      new CustomEvent("pq-card-click", { detail: { id }, bubbles: true, composed: true }),
    );
  }

  #back = (): void => {
    this.dispatchEvent(new CustomEvent("pq-back", { bubbles: true, composed: true }));
  };

  #page(next: number): void {
    const track = this.track;
    if (!track) return;
    const max = this.list.length - 1;
    const i = Math.max(0, Math.min(max, next));
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
    this.index = i;
  }

  /** Keep the dots honest when the patron swipes rather than tapping an arrow. */
  #onScroll = (): void => {
    const track = this.track;
    if (!track || track.clientWidth === 0) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== this.index) this.index = i;
  };

  #onKey = (e: KeyboardEvent, id: string): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.#open(id);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      this.#page(this.index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      this.#page(this.index - 1);
    }
  };

  override render(): TemplateResult {
    const list = this.list;
    const i = Math.min(this.index, Math.max(0, list.length - 1));

    return html`
      <div class="root">
        <div class="head">
          <button class="back" type="button" @click=${this.#back}>‹ Back</button>
          <div class="head__mid">
            ${trophyIcon}
            <span class="head__eyebrow">Tier Rewards</span>
            <span class="head__title">Promotions</span>
          </div>
          ${this.renderMark()}
        </div>

        ${list.length
          ? html`
              <div class="stage">
                <button
                  class="nav"
                  type="button"
                  aria-label="Previous promotion"
                  ?disabled=${i === 0}
                  @click=${() => this.#page(i - 1)}
                >
                  ‹
                </button>
                <div class="track" @scroll=${this.#onScroll} role="list">
                  ${list.map((c) => this.renderCard(c))}
                </div>
                <button
                  class="nav"
                  type="button"
                  aria-label="Next promotion"
                  ?disabled=${i >= list.length - 1}
                  @click=${() => this.#page(i + 1)}
                >
                  ›
                </button>
              </div>

              <div class="dots">
                ${list.map(
                  (c, n) =>
                    html`<button
                      class="dot ${n === i ? "dot--on" : ""}"
                      type="button"
                      aria-label=${c.name}
                      @click=${() => this.#page(n)}
                    ></button>`,
                )}
              </div>
              <p class="foot">Locked promotions open too — see the prizes you're playing for.</p>
            `
          : html`<p class="empty">
              No promotions are running right now. Keep playing — new ones arrive every week.
            </p>`}
      </div>
    `;
  }

  private renderCard(c: Campaign): TemplateResult {
    const collect = isCollectable(c);
    const prizes = c.prizeIds.length;
    const steps = c.steps ?? [];
    return html`
      <article
        class="card ${collect ? "" : "card--locked"}"
        role="listitem"
        tabindex="0"
        aria-label="${c.name} — ${collect ? "ready to collect" : "locked, preview prizes"}"
        @click=${() => this.#open(c.id)}
        @keydown=${(e: KeyboardEvent) => this.#onKey(e, c.id)}
      >
        <div class="art">
          <div class="art__icon">${collect ? trophyIcon : lockIcon}</div>
          <div class="art__name">${c.name}</div>
          <div class="art__orn"><i></i></div>
          <div class="art__pill">${giftIcon}${prizes} prize${prizes === 1 ? "" : "s"}</div>
          <div class="art__cta ${collect ? "" : "art__cta--locked"}">
            ${collect ? html`${giftIcon}Collect` : html`${lockIcon}Locked`}
          </div>
        </div>

        <div class="body">
          <section>
            <div class="sec__t">Promotion overview</div>
            <p class="sec__p">${c.overview ?? c.description ?? c.meta}</p>
          </section>
          ${steps.length
            ? html`<section>
                <div class="sec__t">How it works</div>
                <div class="steps">
                  ${steps.map(
                    (t, n) =>
                      html`<div class="step"><span>${STEP_ICONS[n] ?? targetIcon}</span>${t}</div>`,
                  )}
                </div>
              </section>`
            : nothing}
          <section>
            <div class="sec__t">Prizes</div>
            <p class="sec__p">
              ${c.prizesNote ?? `${prizes} prize${prizes === 1 ? "" : "s"} to choose from.`}
              <span class="ends"> · ${c.meta}</span>
            </p>
          </section>
        </div>
      </article>
    `;
  }

  /** The product mark — reads <html data-pq-product-*>; degrades to a wordmark. */
  private renderMark(): TemplateResult {
    const root = document.documentElement.dataset;
    const src = this.logoBroken ? null : root.pqProductLogo || null;
    if (!src) {
      return html`<span class="head__mark">
        <span class="head__wordmark">${root.pqProductAlt ?? "Tier Rewards"}</span>
      </span>`;
    }
    return html`<span class="head__mark">
      <img
        src=${src}
        alt=${root.pqProductAlt ?? "Tier Rewards"}
        @error=${() => {
          this.logoBroken = true;
        }}
      />
    </span>`;
  }
}

if (!customElements.get("dm-promo-list")) {
  customElements.define("dm-promo-list", DmPromoList);
}

declare global {
  interface HTMLElementTagNameMap {
    "dm-promo-list": DmPromoList;
  }
}
