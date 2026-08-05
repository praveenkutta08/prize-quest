// <dm-prize-list> — prize selection inside the Device Manager service window
// (route /campaign/:id/rewards).
//
// DESIGN NOTE — why this does NOT look like <dm-promo-list>.
//
// A promotion and a prize are different kinds of thing, and the cards say so.
//
//   PROMOTION = an offer. Abstract, time-bound, aspirational. dm-promo-list draws it as
//   a POSTER: gold frame, radial sunburst, a headline, and instructional bullets. It is
//   advertising something that has not happened yet.
//
//   PRIZE = an object. Concrete, singular, about to be yours. This draws it as a
//   VITRINE — a lit display case in a jeweller's counter. Top-down beam instead of
//   fanfare rays, the product standing on a glass shelf with its own reflection, a
//   platinum frame instead of a gold one (gold is reserved for the object and the
//   action), a lot plate, and a spec table instead of bullets. Retail language, not
//   promotional language.
//
// The other tell is the carousel itself: promotions are BROWSED (one poster per page,
// dot indicators), prizes are CHOSEN (cases peek in from both sides, and the indicators
// are thumbnails of the actual goods, because you are picking one of a set).
//
// It replaces the embedded <pq-reward-select> on THIS surface only. That widget is
// built around a landscape iVIEW panel and cannot lay out in a 400px rail — its art
// well starves the body column until the prize name breaks to single characters. TTD,
// iVIEW and SYNKROS keep using it untouched.
//
// The claim contract is unchanged, so nothing downstream moves: collecting fires
// `pq-prize-select` and then `pq-claim-start`, exactly as pq-reward-select does, and
// main.ts routes on into confirm → PIN → address → success.
//
// A campaign that is not eligible shows its prizes as a PREVIEW with Collect disabled —
// the same rule the promotions list sets up.
//
// HOUSE RULE: no currency values anywhere, and no progress bars. A prize is earned,
// never priced.
//
// Host chrome (NOT a @pq widget), themed by the tenant's --arc-* tokens.
import { LitElement, css, html, type TemplateResult } from "lit";
import { $activeCampaign, $prizes, bindAtom } from "@pq/store";
import type { Campaign, Prize } from "@pq/mock-data";

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

/**
 * Placeholder prize art — the same product-level mapping pq-reward-select ships, so a
 * prize looks the same on every surface. Production swaps these for the operator's
 * product shots.
 */
const NAME_ART: ReadonlyArray<readonly [string, string]> = [
  ["airpod", "🎧"],
  ["headphone", "🎧"],
  ["earbud", "🎧"],
  ["speaker", "🔊"],
  ["echo", "🔊"],
  ["ipad", "📱"],
  ["tablet", "📱"],
  ["tab ", "📱"],
  ["iphone", "📱"],
  ["macbook", "💻"],
  ["laptop", "💻"],
  ["watch", "⌚"],
  ["tv", "📺"],
  ["camera", "📷"],
  ["console", "🎮"],
  ["backpack", "🎒"],
  ["bag", "🎒"],
  ["rambler", "🥤"],
  ["tumbler", "🥤"],
  ["cooler", "🧊"],
  ["golf", "⛳"],
  ["trip", "✈️"],
  ["vegas", "🎰"],
  ["hotel", "🏨"],
  ["spa", "💆"],
  ["dinner", "🍽️"],
  ["dining", "🍽️"],
  ["gift card", "💳"],
  ["amazon", "📦"],
  ["credit", "💳"],
];
const CATEGORY_ART: Record<string, string> = {
  electronics: "📱",
  audio: "🎧",
  outdoor: "🏕️",
  "smart-home": "🏠",
  "gift-cards": "🎁",
  wellness: "💆",
  food: "🍽️",
  dining: "🍽️",
  travel: "✈️",
  sports: "⛳",
};

function artFor(p: Prize): string {
  const name = (p.name ?? "").toLowerCase();
  for (const [pattern, art] of NAME_ART) if (name.includes(pattern)) return art;
  return CATEGORY_ART[(p.category ?? "").toLowerCase()] ?? "🎁";
}

/** "smart-home" → "Smart Home". */
function categoryLabel(category: string | undefined): string {
  if (!category) return "Reward";
  return category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Gift cards and vouchers arrive instantly; everything else ships. `prizeType` is the
 * source of truth when the catalogue sets it, but a lot of gift-card rows only carry a
 * category, and telling a patron their e-gift card "arrives in 5-7 days" is a support
 * call waiting to happen — so category and name are checked as a fallback.
 */
function isDigital(p: Prize): boolean {
  if (p.prizeType) return p.prizeType === "digital";
  const category = (p.category ?? "").toLowerCase();
  if (category.includes("gift-card") || category.includes("gift card") || category === "digital") {
    return true;
  }
  const name = (p.name ?? "").toLowerCase();
  return name.includes("gift card") || name.includes("e-gift") || name.includes("voucher");
}

const pad2 = (n: number): string => String(n).padStart(2, "0");

export class DmPrizeList extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      /* Pinned to the rail both ways: fill it, never exceed it. Without the max a long
         promotion pushed the host past the region and the rail grew a scrollbar. */
      min-height: 100%;
      max-height: 100%;
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
      gap: 14px;
      padding: 22px 24px 18px;
      color: var(--arc-text, #fff);
      font-family: var(--arc-font-body, "Inter", sans-serif);
    }

    /* ---------------- the counter ---------------- */
    .stage {
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      gap: 10px;
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
      transition: transform 180ms ease;
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

    /* The neighbouring cases peek in. A promotion is browsed one poster at a time; a
       prize is CHOSEN, and seeing the next case at the edge is what says so. */
    .track {
      flex: 1;
      min-width: 0;
      height: 100%;
      /* Uncapped. This was 620px, set when the content column was 840 wide and the
         case was tall enough to fill a 1080 column at that cap. At 672 it is not, and
         the cap left ~400px of dead black under the card. The 1024 profile has always
         run uncapped (see the override below) — this makes the two agree. ".box" is
         "flex: 1 1 auto", so the extra height goes to the lit display, not the type. */
      max-height: none;
      display: flex;
      gap: 18px;
      /* The peek is PADDING, and the case is flex-basis 100% of the resulting content
         box — so the active case centres exactly at scroll 0 and at every snap point.
         A percentage width here would leave card 01 stuck against the left rail. */
      padding: 0 72px;
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

    /* ---------------- the vitrine ---------------- */
    .case {
      flex: 0 0 100%;
      scroll-snap-align: center;
      scroll-snap-stop: always;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-radius: 4px;
      /* PLATINUM, not gold. The gold in this card belongs to the object inside it and
         to the button that takes it — a gold frame as well would flatten both. */
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      background-color: var(--arc-bg-base, #0a0a0a);
      background-image: linear-gradient(
        180deg,
        var(--arc-bg-glass, rgba(34, 34, 34, 0.6)),
        var(--arc-bg-glass-2, rgba(12, 12, 12, 0.94)) 62%
      );
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.09),
        0 30px 60px -34px rgba(0, 0, 0, 0.95);
      transition:
        border-color 220ms ease,
        box-shadow 220ms ease;
    }
    .case--out {
      opacity: 0.72;
    }

    /* Lot plate — auction-house bookkeeping, the opposite register to a promo headline. */
    .plate {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 11px 16px;
      border-bottom: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      background: rgba(0, 0, 0, 0.42);
      font-family: var(--arc-font-mono, monospace);
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--arc-text-faint, #8a8a8a);
    }
    .plate b {
      color: var(--arc-display, #d4af37);
      font-weight: 700;
    }
    .plate__cat {
      color: var(--arc-text-dim, #c0c0c0);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* The lit box. A single beam from the case ceiling — no sunburst, that is the
       promotion's gesture. */
    .box {
      position: relative;
      flex: 1 1 auto;
      min-height: 0;
      display: grid;
      place-items: end center;
      overflow: hidden;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.05),
        rgba(0, 0, 0, 0.5) 58%,
        rgba(0, 0, 0, 0.86)
      );
      border-bottom: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
    }
    /* The beam is clipped on the CHILD and blurred on the PARENT. Blurring the clipped
       element instead leaves the polygon's hard diagonal edges intact, which reads as a
       grey wedge painted on the glass rather than as light falling through it. */
    .beam {
      position: absolute;
      inset: 0;
      filter: blur(22px);
      opacity: 0.34;
      pointer-events: none;
    }
    .beam i {
      position: absolute;
      top: -12%;
      left: 50%;
      width: 78%;
      height: 96%;
      transform: translateX(-50%);
      clip-path: polygon(34% 0, 66% 0, 100% 100%, 0 100%);
      background: linear-gradient(
        180deg,
        var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        transparent 78%
      );
    }
    /* Case floor — stops the interior reading as an empty black rectangle. */
    .box::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 38%;
      background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.55));
      pointer-events: none;
    }
    /* Specular sweep across the case glass. Slow enough to read as glass, not as a
       loading shimmer. */
    .box::after {
      content: "";
      position: absolute;
      inset: -40% -120%;
      background: linear-gradient(
        104deg,
        transparent 42%,
        rgba(255, 255, 255, 0.07) 50%,
        transparent 58%
      );
      transform: translateX(-30%);
      animation: sweep 9s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes sweep {
      0%,
      68% {
        transform: translateX(-32%);
      }
      100% {
        transform: translateX(32%);
      }
    }

    .plinth {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-bottom: 26px;
    }
    .obj {
      display: block;
      font-size: 172px;
      line-height: 1;
      filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.8))
        drop-shadow(0 0 30px var(--arc-display-glow, rgba(212, 175, 55, 0.5)));
    }
    /* Glass shelf the object stands on. */
    .shelf {
      position: relative;
      width: 216px;
      height: 1px;
      margin-top: 14px;
      background: linear-gradient(90deg, transparent, var(--arc-display, #d4af37), transparent);
      opacity: 0.5;
    }
    .shelf::after {
      content: "";
      position: absolute;
      left: 50%;
      top: -3px;
      width: 120px;
      height: 12px;
      transform: translateX(-50%);
      border-radius: 50%;
      background: radial-gradient(
        ellipse at 50% 50%,
        var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        transparent 70%
      );
      filter: blur(5px);
    }
    /* The reflection. This one detail is what makes it merchandise rather than an icon. */
    .mirror {
      height: 54px;
      overflow: hidden;
      pointer-events: none;
    }
    .mirror span {
      display: block;
      font-size: 172px;
      line-height: 1;
      transform-origin: top center;
      transform: translateY(128px) scaleY(-1);
      opacity: 0.22;
      -webkit-mask-image: linear-gradient(to top, transparent 6%, rgba(0, 0, 0, 0.9) 78%);
      mask-image: linear-gradient(to top, transparent 6%, rgba(0, 0, 0, 0.9) 78%);
    }
    /* The detail pane. NOTE: this rule was destroyed once by a bulk edit that matched
       CSS selectors by SUBSTRING — stripping the shared header's ".label" also stripped
       this one, and the card's text went flush to its edges. */
    .label {
      flex: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px 18px 18px;
    }
    .name {
      margin: 0;
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 25px;
      line-height: 1.08;
      letter-spacing: 0.01em;
      text-transform: uppercase;
      color: var(--arc-display-bright, #ebd08a);
      /* Long product names wrap; they never truncate to initials. */
      overflow-wrap: anywhere;
    }
    .lede {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      color: var(--arc-text-dim, #c0c0c0);
    }

    /* Spec table. A promotion explains a process in steps; a prize declares facts in
       rows, the way a price tag does. */
    .spec {
      margin: 2px 0 0;
      display: flex;
      flex-direction: column;
    }
    .spec > div {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 14px;
      padding: 9px 0;
      border-top: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
    }
    .spec dt {
      flex: none;
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--arc-text-faint, #8a8a8a);
    }
    .spec dd {
      margin: 0;
      text-align: right;
      font-size: 13.5px;
      line-height: 1.35;
      color: var(--arc-cream, #fff);
    }
    .spec dd.is-off {
      color: var(--arc-text-dim, #c0c0c0);
    }

    .take {
      margin-top: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 15px 18px;
      border-radius: 3px;
      cursor: pointer;
      border: 1px solid var(--arc-display-deep, #a8862a);
      background: linear-gradient(
        180deg,
        var(--arc-display-bright, #ebd08a),
        var(--arc-display, #d4af37) 55%,
        var(--arc-display-deep, #a8862a)
      );
      color: var(--arc-on-tint, rgba(0, 0, 0, 0.88));
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 16px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      box-shadow: 0 10px 26px -14px var(--arc-display-glow, rgba(212, 175, 55, 0.5));
    }
    .take svg {
      width: 17px;
      height: 17px;
      flex: none;
    }
    .take:disabled {
      cursor: default;
      background: transparent;
      color: var(--arc-text-faint, #8a8a8a);
      border-color: var(--arc-hairline, rgba(192, 192, 192, 0.18));
      box-shadow: none;
    }

    /* Locked = a case you can look into but not open. */
    .case--locked .beam {
      opacity: 0.08;
    }
    .case--locked .obj {
      filter: grayscale(0.72) brightness(0.78) drop-shadow(0 14px 22px rgba(0, 0, 0, 0.8));
    }
    .case--locked .mirror span {
      filter: grayscale(0.72) brightness(0.78);
      opacity: 0.1;
    }
    .case--locked .shelf {
      background: linear-gradient(90deg, transparent, var(--arc-text-dim, #c0c0c0), transparent);
      opacity: 0.24;
    }
    .case--locked .shelf::after {
      display: none;
    }
    .case--locked .name {
      color: var(--arc-cream, #fff);
    }
    .case--locked .plate b {
      color: var(--arc-text-dim, #c0c0c0);
    }
    .case--locked .box::after {
      display: none;
    }

    /* ---------------- pick strip ---------------- */
    /* Thumbnails, not dots. The patron is choosing one of these, and the strip is the
       only place the whole set is visible at once. */
    .picks {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
    }
    .pick {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      background: var(--arc-surface-0, rgba(0, 0, 0, 0.7));
      font-size: 22px;
      line-height: 1;
      opacity: 0.5;
      transition:
        opacity 180ms ease,
        border-color 180ms ease,
        transform 180ms ease;
    }
    .pick:hover {
      opacity: 0.85;
    }
    .pick--on {
      opacity: 1;
      transform: translateY(-2px);
      border-color: var(--arc-display, #d4af37);
      box-shadow:
        0 8px 20px -12px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        inset 0 0 18px -8px var(--arc-display-glow, rgba(212, 175, 55, 0.5));
    }
    .pick--out {
      filter: grayscale(0.8);
    }

    .foot {
      flex: none;
      margin: 0;
      text-align: center;
      font-family: var(--arc-font-mono, monospace);
      font-size: 10px;
      letter-spacing: 0.14em;
      color: var(--arc-text-mute, #5a5a5a);
    }
    .empty {
      margin: auto;
      color: var(--arc-text-dim, #c0c0c0);
      font-size: 15px;
    }

    /* ---------------- 1024×768 ---------------- */
    :host-context([data-dm-ff="1024x768"]) .root {
      gap: 10px;
      padding: 14px 14px 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .stage {
      gap: 6px;
    }
    :host-context([data-dm-ff="1024x768"]) .nav {
      width: 32px;
      height: 32px;
      font-size: 15px;
    }
    /* No peek at 1024 — the case would be starved to buy a sliver of its neighbour. */
    :host-context([data-dm-ff="1024x768"]) .track {
      max-height: none;
      gap: 10px;
      padding: 0;
    }
    :host-context([data-dm-ff="1024x768"]) .case {
      flex: 0 0 100%;
    }
    :host-context([data-dm-ff="1024x768"]) .plate {
      padding: 8px 12px;
      font-size: 8.5px;
      letter-spacing: 0.18em;
    }
    :host-context([data-dm-ff="1024x768"]) .plinth {
      padding-bottom: 16px;
    }
    :host-context([data-dm-ff="1024x768"]) .obj,
    :host-context([data-dm-ff="1024x768"]) .mirror span {
      font-size: 96px;
    }
    :host-context([data-dm-ff="1024x768"]) .mirror {
      height: 40px;
    }
    :host-context([data-dm-ff="1024x768"]) .mirror span {
      transform: translateY(96px) scaleY(-1);
    }
    :host-context([data-dm-ff="1024x768"]) .shelf {
      width: 168px;
      margin-top: 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .label {
      gap: 9px;
      padding: 12px 14px 14px;
    }
    :host-context([data-dm-ff="1024x768"]) .name {
      font-size: 19px;
    }
    :host-context([data-dm-ff="1024x768"]) .lede {
      font-size: 12px;
      line-height: 1.45;
    }
    :host-context([data-dm-ff="1024x768"]) .spec > div {
      padding: 7px 0;
    }
    :host-context([data-dm-ff="1024x768"]) .spec dt {
      font-size: 8px;
      letter-spacing: 0.16em;
    }
    :host-context([data-dm-ff="1024x768"]) .spec dd {
      font-size: 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .take {
      padding: 12px 14px;
      font-size: 14px;
    }
    :host-context([data-dm-ff="1024x768"]) .pick {
      width: 38px;
      height: 38px;
      font-size: 18px;
    }
    :host-context([data-dm-ff="1024x768"]) .foot {
      font-size: 9px;
    }
  `;

  static override properties = {
    campaign: { attribute: false },
    prizes: { attribute: false },
    index: { type: Number },
  };

  declare campaign: Campaign | null;
  declare prizes: Prize[] | null;
  declare index: number;

  constructor() {
    super();
    this.campaign = null;
    this.prizes = null;
    this.index = 0;
    bindAtom(this, $activeCampaign, "campaign");
    bindAtom(this, $prizes, "prizes");
  }

  /** A campaign that is not eligible previews its prizes with Collect disabled. */
  private get locked(): boolean {
    return (this.campaign?.status ?? "locked") !== "eligible";
  }

  private get list(): Prize[] {
    return this.prizes ?? [];
  }

  private get track(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(".track");
  }

  /**
   * ENDLESS CARRY — the track never runs out in either direction.
   *
   * The DOM holds one clone of the LAST case before the first and one clone of the
   * FIRST case after the last, so paging past either end lands on a real-looking case
   * and animates normally. Once the scroll settles on a clone we jump — with no
   * animation, so it is invisible — to the matching real case, which puts a full set of
   * neighbours back on both sides. The patron only ever experiences a ring.
   *
   * Doing it by clone rather than by "snap back to the start" matters here: a carousel
   * that rewinds 4 cases in front of a seated patron reads as an error, and on a
   * cabinet where the attendant may be watching over a shoulder that costs trust.
   */
  private get loops(): boolean {
    return this.list.length > 1;
  }

  /** Slot = DOM position in the track, which is the real index shifted by the clone. */
  private slotFor(real: number): number {
    return this.loops ? real + 1 : real;
  }

  private realFor(slot: number): number {
    const n = this.list.length;
    if (n === 0) return 0;
    if (!this.loops) return Math.max(0, Math.min(n - 1, slot));
    return (((slot - 1) % n) + n) % n;
  }

  /**
   * How far a slot's centre sits from the viewport centre, in px.
   *
   * Measured from bounding rects, NOT offsetLeft: the track is not a positioned
   * element, so offsetLeft is reported against whatever ancestor happens to be
   * positioned (here the outer stage) and carries that ancestor's offset with it.
   * Scroll maths built on it is silently wrong by the width of the surrounding chrome.
   */
  private slotDelta(slot: number): number | null {
    const track = this.track;
    const card = track?.children[slot] as HTMLElement | undefined;
    if (!track || !card) return null;
    const t = track.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    return c.left + c.width / 2 - (t.left + t.width / 2);
  }

  /** The slot currently closest to the centre of the viewport. */
  private nearestSlot(): number {
    const track = this.track;
    if (!track || track.clientWidth === 0) return this.slotFor(this.index);
    let best = 0;
    let bestDist = Infinity;
    for (let n = 0; n < track.children.length; n += 1) {
      const dist = Math.abs(this.slotDelta(n) ?? Infinity);
      if (dist < bestDist) {
        bestDist = dist;
        best = n;
      }
    }
    return best;
  }

  /**
   * Centre a slot. Measured from the card rather than assumed to be one track-width per
   * page, because the peek layout makes a page narrower than the track.
   */
  private scrollToSlot(slot: number, behavior: ScrollBehavior): void {
    const track = this.track;
    const delta = this.slotDelta(slot);
    if (!track || delta == null) return;
    track.scrollTo({ left: track.scrollLeft + delta, behavior });
  }

  /** One case left or right, wrapping through the clones. */
  #step(dir: -1 | 1): void {
    const n = this.list.length;
    if (n === 0) return;
    const slot = this.nearestSlot() + dir;
    if (!this.loops) {
      const i = Math.max(0, Math.min(n - 1, slot));
      this.scrollToSlot(i, "smooth");
      this.index = i;
      return;
    }
    this.scrollToSlot(slot, "smooth");
    this.index = this.realFor(slot);
  }

  /** Jump straight to a prize from the pick strip. */
  #goto(real: number): void {
    this.scrollToSlot(this.slotFor(real), "smooth");
    this.index = real;
  }

  #settle = 0;

  #onScroll = (): void => {
    const track = this.track;
    if (!track || track.clientWidth === 0) return;
    const slot = this.nearestSlot();
    const real = this.realFor(slot);
    if (real !== this.index) this.index = real;

    // Rebase off a clone only once the scroll has stopped — moving scrollLeft mid-glide
    // would abort the animation and show the seam.
    window.clearTimeout(this.#settle);
    this.#settle = window.setTimeout(() => this.#rebase(), 160);
  };

  #rebase(): void {
    if (!this.loops) return;
    const n = this.list.length;
    const slot = this.nearestSlot();
    if (slot !== 0 && slot !== n + 1) return;
    this.scrollToSlot(slot === 0 ? n : 1, "instant");
  }

  override disconnectedCallback(): void {
    window.clearTimeout(this.#settle);
    super.disconnectedCallback();
  }

  /** Park on the first REAL case once the clones exist and the track has a width. */
  override updated(changed: Map<string, unknown>): void {
    if (!changed.has("prizes")) return;
    requestAnimationFrame(() => this.scrollToSlot(this.slotFor(this.index), "instant"));
  }

  /**
   * Collect — the same two-event handshake pq-reward-select performs, so the claim
   * flow downstream is untouched. The microtask defer lets the app's prize-select
   * handler set $selectedPrize before the claim starts.
   */
  #collect(p: Prize): void {
    if (this.locked || p.inStock === false) return;
    this.dispatchEvent(
      new CustomEvent("pq-prize-select", { detail: { id: p.id }, bubbles: true, composed: true }),
    );
    const campaignId = this.campaign?.id;
    if (!campaignId) return;
    queueMicrotask(() => {
      this.dispatchEvent(
        new CustomEvent("pq-claim-start", {
          detail: { campaignId, prizeId: p.id },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }

  override render(): TemplateResult {
    const list = this.list;
    const i = Math.min(this.index, Math.max(0, list.length - 1));
    const name = this.campaign?.name ?? "Your rewards";

    return html`
      <div class="root">
        <dm-screen-head .eyebrow=${name} label="Prizes"></dm-screen-head>

        ${list.length
          ? html`
              <div class="stage">
                <button
                  class="nav"
                  type="button"
                  aria-label="Previous prize"
                  ?disabled=${!this.loops}
                  @click=${() => this.#step(-1)}
                >
                  ‹
                </button>
                <div class="track" @scroll=${this.#onScroll} role="list">
                  ${this.loops
                    ? this.renderCase(list[list.length - 1], list.length - 1, list.length, true)
                    : null}
                  ${list.map((p, n) => this.renderCase(p, n, list.length, false))}
                  ${this.loops ? this.renderCase(list[0], 0, list.length, true) : null}
                </div>
                <button
                  class="nav"
                  type="button"
                  aria-label="Next prize"
                  ?disabled=${!this.loops}
                  @click=${() => this.#step(1)}
                >
                  ›
                </button>
              </div>

              <div class="picks">
                ${list.map(
                  (p, n) =>
                    html`<button
                      class="pick ${n === i ? "pick--on" : ""} ${p.inStock === false
                        ? "pick--out"
                        : ""}"
                      type="button"
                      aria-label=${p.name}
                      aria-current=${n === i ? "true" : "false"}
                      @click=${() => this.#goto(n)}
                    >
                      ${artFor(p)}
                    </button>`,
                )}
              </div>
              <p class="foot">
                ${this.locked
                  ? "Preview — keep playing to unlock these prizes."
                  : `Pick one of ${list.length} — your choice, your name on it.`}
              </p>
            `
          : html`<p class="empty">No prizes are listed for this promotion yet.</p>`}
      </div>
    `;
  }

  /**
   * `clone` marks the two carry cases that make the ring work. They are visually
   * identical — that is the whole point — but they are hidden from assistive tech and
   * taken out of the tab order so the set is announced once, not three times.
   */
  private renderCase(p: Prize, n: number, total: number, clone: boolean): TemplateResult {
    const locked = this.locked;
    const out = p.inStock === false;
    const digital = isDigital(p);
    const art = artFor(p);

    const lede = locked
      ? "Preview only — reach the goal and this becomes yours to pick."
      : out
        ? "Claimed out for now — pick another prize, or check back later."
        : digital
          ? "Yours to keep. Choose it and the voucher lands in your account straight away."
          : "Yours to keep. Choose it and we ship it free to the address on your account.";

    return html`
      <article
        class="case ${locked ? "case--locked" : ""} ${out ? "case--out" : ""}"
        role=${clone ? "presentation" : "listitem"}
        aria-hidden=${clone ? "true" : "false"}
      >
        <div class="plate">
          <span>Lot <b>${pad2(n + 1)}</b> / ${pad2(total)}</span>
          <span class="plate__cat">${categoryLabel(p.category)}</span>
        </div>

        <div class="box">
          <span class="beam"><i></i></span>
          <div class="plinth">
            <span class="obj">${art}</span>
            <span class="shelf"></span>
            <span class="mirror" aria-hidden="true"><span>${art}</span></span>
          </div>
        </div>

        <div class="label">
          <h3 class="name">${p.name}</h3>
          <p class="lede">${lede}</p>

          <dl class="spec">
            <div>
              <dt>Delivery</dt>
              <dd>${digital ? "Instant · digital voucher" : "Ships free · 5–7 days"}</dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd class=${out || locked ? "is-off" : ""}>
                ${out ? "Out of stock" : locked ? "Locked" : "Ready to claim"}
              </dd>
            </div>
            <div>
              <dt>To claim</dt>
              <dd class=${locked ? "is-off" : ""}>
                ${locked ? "Qualify first" : "Confirm with your PIN"}
              </dd>
            </div>
            <div>
              <dt>${digital ? "Delivered to" : "Ships to"}</dt>
              <dd>${digital ? "Your account" : "Address on file"}</dd>
            </div>
          </dl>

          <button
            class="take"
            type="button"
            tabindex=${clone ? "-1" : "0"}
            ?disabled=${locked || out}
            @click=${() => this.#collect(p)}
          >
            ${locked
              ? html`${lockIcon}Locked`
              : out
                ? html`${lockIcon}Out of stock`
                : html`${giftIcon}Collect`}
          </button>
        </div>
      </article>
    `;
  }
}

if (!customElements.get("dm-prize-list")) {
  customElements.define("dm-prize-list", DmPrizeList);
}

declare global {
  interface HTMLElementTagNameMap {
    "dm-prize-list": DmPrizeList;
  }
}
