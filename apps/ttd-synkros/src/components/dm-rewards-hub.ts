// <dm-rewards-hub> — the Tier Rewards landing inside the Device Manager service
// window (route /rewards). TWO destinations, nothing else: PROMOTIONS and MY ORDERS.
//
// BUTTONS, NOT CARDS (customer direction). The previous version drew two large tiles
// with a jackpot numeral and a preview list of what sat behind each one. It looked
// good, but it read as CONTENT — two things to study — when this screen has exactly
// one job: send the patron down one of two paths. A card invites reading; a button
// invites pressing, and on a cabinet the second is what you want.
//
// So each destination is now a single full-width action bar: medallion, label, one
// line of live status, count, chevron. What makes it premium is not ornament but
// hierarchy — the bar that PAYS is gold and heavy, the bar that REPORTS is platinum
// and quiet, and the whole screen resolves in about a second.
//
// The counts survive the change because they are the reason to press: "3 prizes ready
// to collect" is the difference between a menu and an invitation. The per-item preview
// chips are gone; that detail belongs on the destination screen, which is one tap away.
//
// Identity (name, tier, points) lives in the stage's top band and is not repeated here.
//
// HOUSE RULE: no currency values anywhere, and no progress bars.
//
// Host chrome (NOT a @pq widget), themed by the tenant's --arc-* tokens.
import { LitElement, css, html, type TemplateResult } from "lit";
import { navigate } from "@pq/router";
import { $campaigns, $claims, bindAtom } from "@pq/store";
import type { Campaign, Order } from "@pq/mock-data";

const giftIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.7"
  aria-hidden="true"
>
  <rect x="3" y="9" width="18" height="12" rx="1" />
  <path d="M12 9v12M3 13h18M12 9S10 4 7.5 5.5 9 9 12 9ZM12 9s2-5 4.5-3.5S15 9 12 9Z" />
</svg>`;
const bagIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.7"
  aria-hidden="true"
>
  <path d="M6 9h12l-1 12H7L6 9z" />
  <path d="M9 9V6a3 3 0 0 1 6 0v3" />
</svg>`;
const arrowIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.4"
  aria-hidden="true"
>
  <path d="M5 12h13M12 5l7 7-7 7" />
</svg>`;

export class DmRewardsHub extends LitElement {
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
      gap: 30px;
      padding: 34px 34px 30px;
      color: var(--arc-text, #fff);
      font-family: var(--arc-font-body, "Inter", sans-serif);
    }

    /* ---------------- header ---------------- */
    .head {
      flex: none;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    .head img {
      display: block;
      height: 62px;
      max-width: 260px;
      object-fit: contain;
    }
    .head__wordmark {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 26px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--arc-display-bright, #ebd08a);
    }

    /* ---------------- the two buttons ---------------- */
    /* The buttons TAKE the column. Two small bars floating in a 768px rail was the
       "unused real estate" note all over again; a capped flex keeps them generous
       without letting them stretch into slabs on the 1080 cabinet. */
    .menu {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 20px;
    }
    .opt {
      position: relative;
      display: flex;
      align-items: center;
      gap: 24px;
      width: 100%;
      flex: 1 1 0;
      /* A button has to keep BUTTON proportions. Letting these stretch to fill a
         1080px column turned them back into the tall tiles the customer rejected —
         the giveaway is a thin row of content floating in a deep box. Generous for a
         cabinet touch target, capped before it becomes a card. */
      min-height: 132px;
      max-height: 216px;
      padding: 22px 30px;
      overflow: hidden;
      cursor: pointer;
      text-align: left;
      border-radius: 5px;
      font: inherit;
      /* These are <button>s: without an explicit background-color the UA buttonface
         shows through the semi-transparent gradients and washes them grey. */
      background-color: var(--arc-bg-base, #0a0a0a);
      transition:
        transform 160ms ease,
        box-shadow 160ms ease,
        border-color 160ms ease;
    }
    .opt:active {
      transform: translateY(1px);
    }

    /* The one that PAYS. Gold, heavy, and the only lit thing on the screen. */
    .opt--primary {
      border: 1px solid var(--arc-display-deep, #a8862a);
      background-image: linear-gradient(
        180deg,
        var(--arc-display-bright, #ebd08a),
        var(--arc-display, #d4af37) 52%,
        var(--arc-display-deep, #a8862a)
      );
      color: var(--arc-on-tint, rgba(0, 0, 0, 0.88));
      /* Bevelled like an engraved plaque: seated in a dark ring, lit along the top
         edge, cut away at the bottom. Flat gold reads as a web button. */
      box-shadow:
        0 0 0 1px var(--arc-display-deep, #a8862a),
        0 20px 46px -22px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        inset 0 2px 0 rgba(255, 255, 255, 0.55),
        inset 0 -4px 10px -3px rgba(0, 0, 0, 0.34);
    }
    /* Slow specular sweep — the one piece of motion on the screen, so it reads as
       "this is the live one" rather than as decoration. */
    .opt--primary::after {
      content: "";
      position: absolute;
      inset: -40% -120%;
      background: linear-gradient(
        104deg,
        transparent 42%,
        rgba(255, 255, 255, 0.42) 50%,
        transparent 58%
      );
      transform: translateX(-32%);
      animation: sweep 7s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes sweep {
      0%,
      66% {
        transform: translateX(-32%);
      }
      100% {
        transform: translateX(32%);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .opt--primary::after {
        animation: none;
      }
    }

    /* The one that REPORTS. Platinum, quiet, clearly secondary. */
    .opt--ghost {
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      background-image: linear-gradient(
        180deg,
        var(--arc-bg-glass, rgba(34, 34, 34, 0.6)),
        var(--arc-bg-glass-2, rgba(12, 12, 12, 0.94))
      );
      color: var(--arc-cream, #fff);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.11),
        inset 0 -4px 12px -4px rgba(0, 0, 0, 0.9),
        0 18px 40px -26px rgba(0, 0, 0, 0.9);
    }
    .opt--ghost:hover {
      border-color: var(--arc-display-deep, #a8862a);
    }

    /* Light thrown from behind the medallion. The promo poster uses the same burst,
       so the landing reads as the front door to that room rather than a menu bolted
       on. Masked to a soft ellipse so it never draws a hard edge. */
    .opt__rays {
      position: absolute;
      left: -4%;
      top: 50%;
      width: 46%;
      aspect-ratio: 1;
      transform: translateY(-50%);
      pointer-events: none;
      background: repeating-conic-gradient(
        from 0deg at 50% 50%,
        currentColor 0deg 2deg,
        transparent 2deg 16deg
      );
      /* Hollow centre: the rays emerge from BEHIND the medallion. Drawn across it they
         read as a scratch on the plaque, not as light. */
      -webkit-mask-image: radial-gradient(
        circle at 50% 50%,
        transparent 26%,
        #000 40%,
        transparent 72%
      );
      mask-image: radial-gradient(circle at 50% 50%, transparent 26%, #000 40%, transparent 72%);
    }
    .opt--primary .opt__rays {
      color: rgba(0, 0, 0, 0.42);
      opacity: 0.1;
    }
    .opt--ghost .opt__rays {
      color: var(--arc-display, #d4af37);
      opacity: 0.11;
    }
    /* Corner brackets — casino signage cue, and they make the plaque read as a framed
       object rather than a filled rectangle. */
    .opt__frame {
      position: absolute;
      inset: 8px;
      pointer-events: none;
    }
    .opt__frame::before,
    .opt__frame::after {
      content: "";
      position: absolute;
      width: 18px;
      height: 18px;
    }
    .opt__frame::before {
      top: 0;
      left: 0;
      border-top: 1px solid currentColor;
      border-left: 1px solid currentColor;
    }
    .opt__frame::after {
      bottom: 0;
      right: 0;
      border-bottom: 1px solid currentColor;
      border-right: 1px solid currentColor;
    }
    .opt--primary .opt__frame {
      color: rgba(0, 0, 0, 0.32);
    }
    .opt--ghost .opt__frame {
      color: var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
    }

    .opt__medal {
      position: relative;
      z-index: 1;
      flex: none;
      display: grid;
      place-items: center;
      width: 68px;
      height: 68px;
      border-radius: 4px;
    }
    .opt__medal svg {
      width: 34px;
      height: 34px;
    }
    .opt--primary .opt__medal {
      border: 1px solid rgba(0, 0, 0, 0.34);
      background: rgba(0, 0, 0, 0.16);
      color: var(--arc-on-tint, rgba(0, 0, 0, 0.88));
    }
    .opt--ghost .opt__medal {
      border: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      background: var(--arc-bg-deep, #000);
      color: var(--arc-display, #d4af37);
      box-shadow: inset 0 0 24px -8px var(--arc-display-glow, rgba(212, 175, 55, 0.5));
    }

    .opt__text {
      position: relative;
      z-index: 1;
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .opt__label {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 30px;
      line-height: 1;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    /* The status line is the REASON to press, and at 11px/0.18em in a faint grey it
       was unreadable from a seat. Bigger, tighter tracking, and taken up to a contrast
       that survives a bright casino floor. */
    .opt__sub {
      font-family: var(--arc-font-mono, monospace);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .opt--primary .opt__sub {
      color: rgba(0, 0, 0, 0.8);
    }
    .opt--ghost .opt__sub {
      color: var(--arc-display-bright, #ebd08a);
    }

    /* The count is the reason to press, so it stays — just at button scale now. */
    .opt__count {
      flex: none;
      display: grid;
      place-items: center;
      min-width: 76px;
      padding: 10px 14px;
      border-radius: 8px;
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 40px;
      line-height: 1;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }
    .opt--primary .opt__count {
      color: var(--arc-on-tint, rgba(0, 0, 0, 0.88));
      border: 1px solid rgba(0, 0, 0, 0.28);
      background: rgba(0, 0, 0, 0.12);
      box-shadow: inset 0 2px 5px -2px rgba(0, 0, 0, 0.45);
    }
    .opt--ghost .opt__count {
      color: var(--arc-display-bright, #ebd08a);
      border: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      background: var(--arc-surface-0, rgba(0, 0, 0, 0.7));
      box-shadow: inset 0 0 20px -8px var(--arc-display-glow, rgba(212, 175, 55, 0.5));
    }

    .opt__go {
      flex: none;
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
    }
    .opt__go svg {
      width: 20px;
      height: 20px;
    }
    .opt--primary .opt__go {
      border: 1px solid rgba(0, 0, 0, 0.3);
      color: var(--arc-on-tint, rgba(0, 0, 0, 0.88));
    }
    .opt--ghost .opt__go {
      border: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      color: var(--arc-display, #d4af37);
    }

    /* ---------------- 1024x768 ---------------- */
    :host-context([data-dm-ff="1024x768"]) .root {
      gap: 20px;
      padding: 20px 18px 18px;
    }
    :host-context([data-dm-ff="1024x768"]) .head {
      gap: 10px;
    }
    :host-context([data-dm-ff="1024x768"]) .head img {
      height: 44px;
      max-width: 180px;
    }
    :host-context([data-dm-ff="1024x768"]) .head__wordmark {
      font-size: 19px;
    }
    :host-context([data-dm-ff="1024x768"]) .menu {
      gap: 14px;
    }
    :host-context([data-dm-ff="1024x768"]) .opt {
      min-height: 96px;
      max-height: 172px;
      gap: 14px;
      padding: 16px 18px;
    }
    :host-context([data-dm-ff="1024x768"]) .opt__text {
      min-width: 0;
    }
    :host-context([data-dm-ff="1024x768"]) .opt__medal {
      width: 50px;
      height: 50px;
    }
    :host-context([data-dm-ff="1024x768"]) .opt__medal svg {
      width: 25px;
      height: 25px;
    }
    :host-context([data-dm-ff="1024x768"]) .opt__label {
      font-size: 21px;
      white-space: nowrap;
    }
    :host-context([data-dm-ff="1024x768"]) .opt__sub {
      font-size: 10.5px;
      letter-spacing: 0.04em;
    }
    :host-context([data-dm-ff="1024x768"]) .opt__frame {
      inset: 6px;
    }
    :host-context([data-dm-ff="1024x768"]) .opt__frame::before,
    :host-context([data-dm-ff="1024x768"]) .opt__frame::after {
      width: 13px;
      height: 13px;
    }
    :host-context([data-dm-ff="1024x768"]) .opt__count {
      min-width: 58px;
      padding: 7px 10px;
      border-radius: 6px;
      font-size: 28px;
    }
    :host-context([data-dm-ff="1024x768"]) .opt__go {
      width: 32px;
      height: 32px;
    }
    :host-context([data-dm-ff="1024x768"]) .opt__go svg {
      width: 15px;
      height: 15px;
    }
  `;

  static override properties = {
    campaigns: { attribute: false },
    orders: { attribute: false },
    logoBroken: { state: true },
  };

  declare campaigns: Campaign[] | null;
  declare orders: Order[] | null;
  declare logoBroken: boolean;

  constructor() {
    super();
    this.campaigns = null;
    this.orders = null;
    this.logoBroken = false;
    bindAtom(this, $campaigns, "campaigns");
    bindAtom(this, $claims, "orders");
  }

  #go(path: string): void {
    navigate(`${path}${location.search}`);
  }

  override render(): TemplateResult {
    const campaigns = this.campaigns ?? [];
    const ready = campaigns.filter((c) => c.status === "eligible");
    const orders = this.orders ?? [];
    const open = orders.filter((o) => o.status !== "delivered");

    // The count is whichever number gives the patron a reason to press.
    const promoN = ready.length > 0 ? ready.length : campaigns.length;
    const promoSub =
      ready.length > 0
        ? ready.length === 1
          ? "Prize ready to collect"
          : "Prizes ready to collect"
        : campaigns.length === 1
          ? "Promotion running now"
          : "Promotions running now";

    const orderN = open.length > 0 ? open.length : orders.length;
    const orderSub =
      open.length > 0
        ? open.length === 1
          ? "Reward on the way"
          : "Rewards on the way"
        : orders.length === 0
          ? "Nothing claimed yet"
          : "Rewards claimed";

    return html`
      <div class="root">
        <div class="head">${this.renderMark()}</div>

        <div class="menu">
          <button class="opt opt--primary" type="button" @click=${() => this.#go("/promotions")}>
            <span class="opt__rays"></span>
            <span class="opt__frame"></span>
            <span class="opt__medal">${giftIcon}</span>
            <span class="opt__text">
              <span class="opt__label">Promotions</span>
              <span class="opt__sub">${promoSub}</span>
            </span>
            <span class="opt__count">${promoN}</span>
            <span class="opt__go">${arrowIcon}</span>
          </button>

          <button class="opt opt--ghost" type="button" @click=${() => this.#go("/orders")}>
            <span class="opt__rays"></span>
            <span class="opt__frame"></span>
            <span class="opt__medal">${bagIcon}</span>
            <span class="opt__text">
              <span class="opt__label">My Orders</span>
              <span class="opt__sub">${orderSub}</span>
            </span>
            <span class="opt__count">${orderN}</span>
            <span class="opt__go">${arrowIcon}</span>
          </button>
        </div>
      </div>
    `;
  }

  /** The product mark — reads <html data-pq-product-*>; degrades to a wordmark. */
  private renderMark(): TemplateResult {
    const root = document.documentElement.dataset;
    const src = this.logoBroken ? null : root.pqProductLogo || null;
    if (!src) {
      return html`<div class="head__wordmark">${root.pqProductAlt ?? "Tier Rewards"}</div>`;
    }
    return html`<img
      src=${src}
      alt=${root.pqProductAlt ?? "Tier Rewards"}
      @error=${() => {
        this.logoBroken = true;
      }}
    />`;
  }
}

if (!customElements.get("dm-rewards-hub")) {
  customElements.define("dm-rewards-hub", DmRewardsHub);
}

declare global {
  interface HTMLElementTagNameMap {
    "dm-rewards-hub": DmRewardsHub;
  }
}
