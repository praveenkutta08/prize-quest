// <dm-rewards-hub> — the Tier Rewards landing inside the Device Manager service
// window (route /rewards). TWO destinations, nothing else: PROMOTIONS and ORDERS.
//
// Treated as a pair of casino cards rather than menu buttons: gold for the one that
// pays, brushed steel for the one that reports. Each carries a headline NUMERAL — the
// count is the reason to tap, so it is set at display size the way a casino sets a
// jackpot — and a short preview of what is behind the card, so the space earns its
// keep with real content instead of padding.
//
// Identity (name, tier, points) lives in the stage's top band and is not repeated here.
//
// HOUSE RULE: no currency values anywhere, and no progress bars.
//
// Host chrome (NOT a @pq widget), themed by the tenant's --arc-* tokens.
import { LitElement, css, html, nothing, type TemplateResult } from "lit";
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

/** Short status word for an order chip. */
const ORDER_STATUS: Record<string, string> = {
  processing: "Processing",
  shipped: "Shipped",
  "in-transit": "On the way",
  delivered: "Delivered",
};

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
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 26px 28px 28px;
      color: var(--arc-text, #fff);
      font-family: var(--arc-font-body, "Inter", sans-serif);
    }

    /* ---------- product lockup ---------- */
    .head {
      flex: none;
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
    }
    .head img {
      display: block;
      height: 44px;
      max-width: 200px;
      object-fit: contain;
    }
    .head__wordmark {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 26px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: var(--arc-display-bright, #ebd08a);
      line-height: 1;
    }
    .head__sub {
      margin-left: auto;
      text-align: right;
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: var(--arc-text-faint, #8a8a8a);
      line-height: 1.7;
    }

    /* ================= the pair ================= */
    .cards {
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-rows: 1fr 1fr;
      gap: 18px;
    }

    .card {
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 26px 28px;
      min-height: 200px;
      text-align: left;
      cursor: pointer;
      font: inherit;
      color: var(--arc-cream, #fff);
      border-radius: 16px;
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.2));
      /* A button element carries the UA "buttonface" background; the layers below are
         semi-transparent, so without an explicit base it washes the whole card light. */
      background-color: var(--arc-bg-base, #0a0a0a);
      /* Layered: a spotlight from the top-left, a fine diagonal weave for print-like
         texture, then the surface ramp. Depth without ornament. */
      background-image:
        radial-gradient(62% 48% at 14% 0%, rgba(255, 255, 255, 0.05), transparent 72%),
        repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.022) 0 2px, transparent 2px 7px),
        linear-gradient(
          155deg,
          var(--arc-bg-glass, rgba(34, 34, 34, 0.6)),
          var(--arc-bg-glass-2, rgba(12, 12, 12, 0.94))
        );
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.05),
        0 22px 44px -28px rgba(0, 0, 0, 0.9);
      transition:
        transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
        border-color 240ms ease;
    }
    .card:hover {
      transform: translateY(-2px);
    }
    .card:focus-visible {
      outline: 2px solid var(--arc-display, #d4af37);
      outline-offset: 3px;
    }
    /* Corner brackets — the card-table motif, drawn once on opposite corners so it
       reads as framing rather than a box. */
    .card__frame {
      position: absolute;
      inset: 11px;
      pointer-events: none;
    }
    .card__frame::before,
    .card__frame::after {
      content: "";
      position: absolute;
      width: 26px;
      height: 26px;
      border-color: var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      opacity: 0.75;
    }
    .card__frame::before {
      top: 0;
      left: 0;
      border-top: 1px solid;
      border-left: 1px solid;
      border-top-left-radius: 6px;
    }
    .card__frame::after {
      right: 0;
      bottom: 0;
      border-right: 1px solid;
      border-bottom: 1px solid;
      border-bottom-right-radius: 6px;
    }
    /* Oversized glyph bleeding off the edge — atmosphere, never content. */
    .card__ghost {
      position: absolute;
      right: -40px;
      bottom: -52px;
      width: 208px;
      height: 208px;
      opacity: 0.06;
      pointer-events: none;
      color: currentColor;
    }
    .card__ghost svg {
      width: 100%;
      height: 100%;
    }

    /* ---------- GOLD · the card that pays ---------- */
    .card--gold {
      border-color: var(--arc-display, #d4af37);
      background-image:
        radial-gradient(
          64% 50% at 14% 0%,
          var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
          transparent 74%
        ),
        repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0 2px, transparent 2px 7px),
        linear-gradient(
          155deg,
          var(--arc-glow-soft, rgba(212, 175, 55, 0.16)),
          var(--arc-bg-glass-2, rgba(12, 12, 12, 0.94)) 72%
        );
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.08),
        0 0 26px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        0 22px 44px -28px rgba(0, 0, 0, 0.9);
    }
    .card--gold .card__frame::before,
    .card--gold .card__frame::after {
      border-color: var(--arc-display, #d4af37);
      opacity: 1;
    }
    .card--gold .card__ghost {
      color: var(--arc-display, #d4af37);
      opacity: 0.11;
    }
    /* A single slow sheen — the only motion, and it stays on the card. */
    .card--gold::after {
      content: "";
      position: absolute;
      top: -20%;
      bottom: -20%;
      left: -55%;
      width: 30%;
      transform: skewX(-16deg);
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
      pointer-events: none;
    }

    /* ---------- STEEL · the card that reports ---------- */
    .card--steel .card__ghost {
      color: var(--arc-text-dim, #c0c0c0);
    }
    .card--steel .card__frame::before,
    .card--steel .card__frame::after {
      border-color: var(--arc-hairline, rgba(192, 192, 192, 0.2));
    }

    /* ---------- head row ---------- */
    .card__top {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .card__icon {
      flex: none;
      display: grid;
      place-items: center;
      width: 52px;
      height: 52px;
      border-radius: 12px;
      background: var(--arc-surface-0, rgba(0, 0, 0, 0.7));
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.2));
      color: var(--arc-text-dim, #c0c0c0);
    }
    .card__icon svg {
      width: 26px;
      height: 26px;
    }
    .card--gold .card__icon {
      background: linear-gradient(
        180deg,
        var(--arc-display-bright, #ebd08a),
        var(--arc-display, #d4af37) 55%,
        var(--arc-display-deep, #a8862a)
      );
      border-color: var(--arc-display, #d4af37);
      color: var(--arc-on-tint, rgba(0, 0, 0, 0.88));
      box-shadow:
        0 8px 20px -10px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        inset 0 1px 0 rgba(255, 255, 255, 0.45);
    }
    .card__name {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 30px;
      line-height: 1;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: var(--arc-cream, #fff);
    }
    .card--gold .card__name {
      color: var(--arc-display-bright, #ebd08a);
    }
    .card__eyebrow {
      margin-top: 7px;
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--arc-text-faint, #8a8a8a);
    }

    /* ---------- the numeral — the reason to tap ---------- */
    /* The middle group centres in whatever height is left, so the card never reads as
       top-loaded with a pool of dead space above the CTA. */
    .card__body {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 14px;
    }
    .stat {
      display: flex;
      align-items: baseline;
      gap: 14px;
      min-width: 0;
    }
    .stat__n {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 72px;
      line-height: 1;
      letter-spacing: -0.02em;
      padding-right: 2px;
      color: var(--arc-cream, #fff);
    }
    .card--gold .stat__n {
      background: linear-gradient(
        170deg,
        var(--arc-display-bright, #ebd08a),
        var(--arc-display, #d4af37) 55%,
        var(--arc-display-deep, #a8862a)
      );
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 18px var(--arc-display-glow, rgba(212, 175, 55, 0.5)));
    }
    .card--steel .stat__n {
      background: linear-gradient(170deg, #ffffff, var(--arc-text-dim, #c0c0c0) 60%, #6f6f6f);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .stat__l {
      font-family: var(--arc-font-mono, monospace);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--arc-text-dim, #c0c0c0);
      line-height: 1.6;
      max-width: 15ch;
    }
    .card--gold .stat__l {
      color: var(--arc-display-bright, #ebd08a);
    }

    /* ---------- preview chips — what is actually behind the card ---------- */
    .chips {
      display: flex;
      flex-direction: column;
      gap: 7px;
      min-width: 0;
    }
    .chip {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 8px 12px;
      border-radius: 999px;
      background: var(--arc-surface-0, rgba(0, 0, 0, 0.55));
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.14));
      font-size: 12px;
      line-height: 1.2;
      color: var(--arc-text-dim, #c0c0c0);
      min-width: 0;
    }
    .chip b {
      font-weight: 600;
      color: var(--arc-cream, #fff);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chip i {
      flex: none;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--arc-text-faint, #8a8a8a);
    }
    .card--gold .chip {
      border-color: var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
    }
    .card--gold .chip i {
      background: var(--arc-success, #34d670);
      box-shadow: 0 0 8px var(--arc-success, #34d670);
    }
    .chip__tail {
      margin-left: auto;
      flex: none;
      font-family: var(--arc-font-mono, monospace);
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--arc-text-faint, #8a8a8a);
      white-space: nowrap;
    }

    /* ---------- CTA ---------- */
    .card__go {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-top: 4px;
      font-family: var(--arc-font-mono, monospace);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--arc-text-dim, #c0c0c0);
    }
    .card--gold .card__go {
      color: var(--arc-display-bright, #ebd08a);
    }
    .card__go svg {
      width: 17px;
      height: 17px;
      transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .card:hover .card__go svg {
      transform: translateX(5px);
    }

    @media (prefers-reduced-motion: no-preference) {
      .card--gold {
        animation: dm-card-glow 3.4s ease-in-out infinite;
      }
      .card--gold::after {
        animation: dm-sheen 5.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      }
    }
    @keyframes dm-card-glow {
      0%,
      100% {
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          0 0 20px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
          0 22px 44px -28px rgba(0, 0, 0, 0.9);
      }
      50% {
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          0 0 38px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
          0 22px 44px -28px rgba(0, 0, 0, 0.9);
      }
    }
    @keyframes dm-sheen {
      0%,
      62% {
        left: -55%;
      }
      100% {
        left: 125%;
      }
    }

    /* ---------- 1024×768 · the rail is ~400px ---------- */
    :host-context([data-dm-ff="1024x768"]) .root {
      gap: 12px;
      padding: 14px 16px 16px;
    }
    :host-context([data-dm-ff="1024x768"]) .head {
      padding-bottom: 10px;
      gap: 10px;
    }
    :host-context([data-dm-ff="1024x768"]) .head img {
      height: 28px;
      max-width: 130px;
    }
    :host-context([data-dm-ff="1024x768"]) .head__wordmark {
      font-size: 18px;
    }
    :host-context([data-dm-ff="1024x768"]) .head__sub {
      font-size: 8px;
    }
    :host-context([data-dm-ff="1024x768"]) .cards {
      gap: 11px;
    }
    :host-context([data-dm-ff="1024x768"]) .card {
      padding: 15px 16px;
      min-height: 140px;
      gap: 10px;
      border-radius: 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .card__frame {
      inset: 8px;
    }
    :host-context([data-dm-ff="1024x768"]) .card__icon {
      width: 40px;
      height: 40px;
      border-radius: 9px;
    }
    :host-context([data-dm-ff="1024x768"]) .card__icon svg {
      width: 20px;
      height: 20px;
    }
    :host-context([data-dm-ff="1024x768"]) .card__name {
      font-size: 21px;
    }
    :host-context([data-dm-ff="1024x768"]) .card__eyebrow {
      font-size: 8px;
      margin-top: 5px;
    }
    :host-context([data-dm-ff="1024x768"]) .stat__n {
      font-size: 46px;
    }
    :host-context([data-dm-ff="1024x768"]) .stat__l {
      font-size: 8px;
    }
    :host-context([data-dm-ff="1024x768"]) .card__body {
      gap: 9px;
    }
    :host-context([data-dm-ff="1024x768"]) .chip {
      padding: 6px 10px;
      font-size: 10px;
    }
    :host-context([data-dm-ff="1024x768"]) .chip__tail {
      display: none;
    }
    :host-context([data-dm-ff="1024x768"]) .card__ghost {
      width: 130px;
      height: 130px;
      right: -26px;
      bottom: -32px;
    }
    :host-context([data-dm-ff="1024x768"]) .card__go {
      font-size: 9px;
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

    // The numeral is whichever count gives the patron a reason to tap.
    const promoN = ready.length > 0 ? ready.length : campaigns.length;
    const promoLabel =
      ready.length > 0
        ? ready.length === 1
          ? "Prize ready to collect"
          : "Prizes ready to collect"
        : "Promotions running now";
    const promoPreview = (ready.length > 0 ? ready : campaigns).slice(0, 3);

    const orderN = open.length > 0 ? open.length : orders.length;
    const orderLabel =
      open.length > 0
        ? open.length === 1
          ? "Reward on the way"
          : "Rewards on the way"
        : "Rewards claimed";
    const orderPreview = orders.slice(0, 3);

    return html`
      <div class="root">
        <div class="head">
          ${this.renderMark()}
          <div class="head__sub">Where would you<br />like to go?</div>
        </div>

        <div class="cards">
          <button class="card card--gold" type="button" @click=${() => this.#go("/promotions")}>
            <span class="card__frame"></span>
            <span class="card__ghost">${giftIcon}</span>
            <span class="card__top">
              <span class="card__icon">${giftIcon}</span>
              <span>
                <span class="card__name">Promotions</span>
                <div class="card__eyebrow">Tier Rewards</div>
              </span>
            </span>
            <span class="card__body">
              ${promoN > 0
                ? html`<span class="stat">
                    <span class="stat__n">${promoN}</span>
                    <span class="stat__l">${promoLabel}</span>
                  </span>`
                : nothing}
              ${promoPreview.length
                ? html`<span class="chips">
                    ${promoPreview.map(
                      (c) =>
                        html`<span class="chip">
                          <i></i><b>${c.name}</b>
                          <span class="chip__tail">
                            ${c.prizeIds.length} prize${c.prizeIds.length === 1 ? "" : "s"}
                          </span>
                        </span>`,
                    )}
                  </span>`
                : nothing}
            </span>
            <span class="card__go">View promotions ${arrowIcon}</span>
          </button>

          <button class="card card--steel" type="button" @click=${() => this.#go("/orders")}>
            <span class="card__frame"></span>
            <span class="card__ghost">${bagIcon}</span>
            <span class="card__top">
              <span class="card__icon">${bagIcon}</span>
              <span>
                <span class="card__name">Orders</span>
                <div class="card__eyebrow">Claims &amp; delivery</div>
              </span>
            </span>
            <span class="card__body">
              ${orderN > 0
                ? html`<span class="stat">
                    <span class="stat__n">${orderN}</span>
                    <span class="stat__l">${orderLabel}</span>
                  </span>`
                : nothing}
              ${orderPreview.length
                ? html`<span class="chips">
                    ${orderPreview.map(
                      (o) =>
                        html`<span class="chip">
                          <i></i><b>${o.prizeName}</b>
                          <span class="chip__tail">${ORDER_STATUS[o.status] ?? o.status}</span>
                        </span>`,
                    )}
                  </span>`
                : nothing}
            </span>
            <span class="card__go">View orders ${arrowIcon}</span>
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
