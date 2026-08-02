// <dm-window> — the Device Manager SERVICE WINDOW shell. When Tier Rewards is
// open, our content owns the LEFT 40% of the screen and the EGM game keeps the
// RIGHT 60% (untouchable — static art stands in for the live render, tagged
// "Your game · Live"). Whatever the route mounts (<dm-rewards-hub> or the
// embedded <pq-screen> flow) is slotted into the panel.
//
// Host chrome, themed by the tenant's --arc-* tokens (Casino Luxe default).
import { LitElement, css, html, type TemplateResult } from "lit";
import { navigate } from "@pq/router";
import { getActiveTenant } from "@pq/tenants";

/**
 * Narrowest width the embedded flow lays out cleanly at.
 *
 * Those screens are drawn by the `iview-4` compositions (1024×600 landscape). The
 * 1920×1080 panel is ~768 wide, which they handle; the 1024×768 panel is only ~410,
 * where headers collide and the reward card overflows. Below this threshold the flow
 * is scaled DOWN so it lays out at a width it was built for and is then drawn smaller
 * — never scaled UP, which starves it of width and is what broke the reward card.
 */
const FLOW_MIN_WIDTH = 520;

export class DmWindow extends LitElement {
  static override properties = {
    flow: { state: true },
  };

  /** True while the slotted screen is the embedded <pq-screen> flow (vs DM chrome). */
  declare flow: boolean;

  constructor() {
    super();
    this.flow = false;
  }

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .root {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      overflow: hidden;
      background: #000;
      color: var(--arc-text, #fff);
      font-family: var(--arc-font-body, "Inter", sans-serif);
    }
    /* LEFT 40% — the service window. */
    .panel {
      flex: 0 0 40%;
      min-width: 0;
      display: flex;
      flex-direction: column;
      background: linear-gradient(
        180deg,
        var(--arc-bg-base, #0a0a0a) 0%,
        var(--arc-bg-deep, #000) 100%
      );
      border-right: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      box-shadow: 18px 0 44px -18px rgba(0, 0, 0, 0.9);
      z-index: 1;
    }
    .head {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 48px;
      padding: 8px 16px;
      background: linear-gradient(
        180deg,
        var(--arc-glow-soft, rgba(212, 175, 55, 0.16)),
        transparent
      );
      border-bottom: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
    }
    .head__left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      font-family: var(--arc-font-mono, monospace);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
    .head__brand {
      color: var(--arc-cream, #fff);
      white-space: nowrap;
    }
    .head__sep {
      color: var(--arc-text-faint, #8a8a8a);
    }
    .head__product {
      color: var(--arc-display, #d4af37);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .close {
      flex: none;
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: var(--arc-r-md, 8px);
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      background: transparent;
      color: var(--arc-cream, #fff);
      font-size: 16px;
      line-height: 1;
      cursor: pointer;
      transition:
        border-color 160ms ease,
        background 160ms ease;
    }
    .close:hover {
      border-color: var(--arc-display, #d4af37);
      background: var(--arc-glow-soft, rgba(212, 175, 55, 0.16));
    }
    .content {
      flex: 1;
      min-height: 0;
      overflow: auto;
      /* Column so the slotted screen can stretch to the full panel height — its own
         layout then pins footers/CTAs to the bottom instead of stacking at the top.
         "safe center" vertically centres screens that DO NOT fill (the embedded flow,
         authored for a 1024x600 landscape iVIEW) and falls back to top-alignment when
         content is taller than the panel, so nothing is ever scrolled out of reach. */
      display: flex;
      flex-direction: column;
      justify-content: safe center;
      scrollbar-width: thin;
      scrollbar-color: var(--arc-hairline-2, rgba(212, 175, 55, 0.35)) transparent;
    }
    .content::-webkit-scrollbar {
      width: 6px;
    }
    .content::-webkit-scrollbar-thumb {
      background: var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      border-radius: 3px;
    }
    /* Wrapper around the slot so the embedded flow can be presented as a CARD without
       touching its light DOM. DM-native screens (which lay themselves out for the full
       column) pass straight through. */
    .card {
      display: flex;
      flex-direction: column;
      flex: 1 0 auto;
      min-height: 0;
    }
    /* The embedded flow (<pq-screen>) is authored for a landscape iVIEW, so in this
       tall column it is far shorter than the panel. Rather than strand it at the top,
       it becomes a centred card — its own screen header then reads as the card's title
       bar instead of a band floating mid-panel. */
    .card--flow {
      flex: 0 0 auto;
      margin: 20px;
      border-radius: var(--arc-r-md, 8px);
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      background: var(--arc-surface-1, rgba(38, 38, 38, 0.55));
      box-shadow: 0 22px 48px -26px rgba(0, 0, 0, 0.9);
      overflow: hidden;
    }
    /* display:flex here, not block — an outer ::slotted rule overrides the element's
       own :host display, and these screens need a column box for their footers to
       pin to the bottom of the panel. */
    ::slotted(dm-rewards-hub),
    ::slotted(dm-promo-detail) {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
    }
    ::slotted(pq-screen) {
      flex: 0 0 auto;
      display: block;
      width: 100%;
    }
    /* RIGHT 60% — EGM game area. Content never renders here. */
    .game {
      flex: 1;
      position: relative;
      background: #000;
      overflow: hidden;
    }
    .game img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .game__tag {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      align-items: center;
      gap: 7px;
      background: rgba(0, 0, 0, 0.78);
      border: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      border-radius: 999px;
      padding: 4px 12px;
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--arc-cream, #fff);
    }
    .game__dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--arc-danger, #ff4d6d);
      box-shadow: 0 0 8px var(--arc-danger, #ff4d6d);
    }
    .game__hint {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 8px 14px;
      text-align: center;
      background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.75));
      font-size: 11px;
      color: var(--arc-text-dim, #c0c0c0);
      pointer-events: none;
    }
    @media (prefers-reduced-motion: no-preference) {
      .game__dot {
        animation: dm-blink 1.6s ease-in-out infinite;
      }
    }
    @keyframes dm-blink {
      50% {
        opacity: 0.35;
      }
    }
    /* 1024×768 — tighter head. */
    :host-context([data-dm-ff="1024x768"]) .head {
      min-height: 40px;
      padding: 6px 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .head__left {
      font-size: 9px;
    }
    :host-context([data-dm-ff="1024x768"]) .close {
      width: 32px;
      height: 32px;
      font-size: 13px;
    }
    :host-context([data-dm-ff="1024x768"]) .game__hint {
      font-size: 10px;
    }
    :host-context([data-dm-ff="1024x768"]) .card--flow {
      /* Every pixel of width matters at 410px — keep the inset to a hairline. */
      margin: 8px;
    }
  `;

  #close = (): void => {
    this.dispatchEvent(new CustomEvent("dm-window-closed", { bubbles: true, composed: true }));
    navigate(`/hub${location.search}`);
  };

  // --- fit-to-panel -------------------------------------------------------
  // Scale-to-fit is the standard kiosk answer to "screens drawn for another size",
  // and it lives here rather than in ten widget packages. It is reversible in one
  // place once a real `device-manager` channel + widget tier exists.
  #frame?: number;
  #resize?: ResizeObserver;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#resize = new ResizeObserver(() => this.#scheduleFit());
    window.addEventListener("resize", this.#scheduleFit);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#resize?.disconnect();
    window.removeEventListener("resize", this.#scheduleFit);
    if (this.#frame) cancelAnimationFrame(this.#frame);
  }

  /** Re-observe whatever was just slotted in and refit. */
  #onSlotChange = (): void => {
    this.#resize?.disconnect();
    const screen = this.querySelector<HTMLElement>("pq-screen");
    this.flow = Boolean(screen);
    if (screen) screen.style.zoom = "1";
    const box = this.renderRoot.querySelector<HTMLElement>(".content");
    if (box) this.#resize?.observe(box);
    this.#scheduleFit();
  };

  #scheduleFit = (): void => {
    if (this.#frame) cancelAnimationFrame(this.#frame);
    this.#frame = requestAnimationFrame(() => this.#fit());
  };

  /**
   * Width-driven, so it converges in one pass — the panel width does not change
   * when the flow is scaled, unlike its height. Never returns more than 1.
   */
  #fit(): void {
    const screen = this.querySelector<HTMLElement>("pq-screen");
    const card = this.renderRoot.querySelector<HTMLElement>(".card");
    if (!screen || !card) return;
    const available = card.clientWidth;
    if (available <= 0) return;
    const zoom = Math.min(1, Math.max(0.6, available / FLOW_MIN_WIDTH));
    screen.style.zoom = zoom >= 0.999 ? "1" : String(Number(zoom.toFixed(3)));
  }

  override render(): TemplateResult {
    const brand = getActiveTenant()?.name ?? "Casino";
    const product = document.documentElement.dataset.pqProductName ?? "Tier Rewards Promotions";
    return html`
      <div class="root">
        <section class="panel" aria-label=${product}>
          <header class="head">
            <div class="head__left">
              <span class="head__brand">${brand}</span>
              <span class="head__sep">|</span>
              <span class="head__product">${product}</span>
            </div>
            <button
              class="close"
              type="button"
              aria-label="Close and return to game"
              title="Return to game"
              @click=${this.#close}
            >
              ✕
            </button>
          </header>
          <div class="content">
            <div class="card ${this.flow ? "card--flow" : ""}">
              <slot @slotchange=${this.#onSlotChange}></slot>
            </div>
          </div>
        </section>
        <div class="game" aria-hidden="true">
          <img src="/dm-game.jpg" alt="" />
          <span class="game__tag"><span class="game__dot"></span> Your game · Live</span>
          <div class="game__hint">
            Game play continues here — tap ✕ anytime to return full screen
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("dm-window")) {
  customElements.define("dm-window", DmWindow);
}

declare global {
  interface HTMLElementTagNameMap {
    "dm-window": DmWindow;
  }
}
