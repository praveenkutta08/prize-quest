import { LitElement, css, html, nothing, svg, type TemplateResult } from "lit";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import { setActiveTenant } from "@pq/tenants";
import { loadComposition, type CompositionDoc } from "@pq/compositions";
import {
  $address,
  $selectedPrize,
  selectCampaign,
  selectPrize,
  startClaim,
  submitPin,
  submitAddress,
  loadAddress,
  finalizeClaim,
} from "@pq/store";
import "@pq/pq-screen";
import type { PqScreen } from "@pq/pq-screen";

const TENANT_ID = "luminara";

/** The Prize Quest internal screens this host drives — composition file names. */
type EmbedRoute =
  | "home"
  | "campaign-detail"
  | "confirm"
  | "pin"
  | "address"
  | "submit"
  | "success"
  | "voucher"
  | "orders";

const chevronLeft = svg`<polyline points="15 18 9 12 15 6"/>`;

/**
 * `<lum-promotions>` — the embed manager. Mounts a host-driven `<pq-screen>` (no
 * `route` attribute → it never touches window.history) and swaps its `.composition`
 * in response to bubbling, composed Prize Quest widget events. The host URL stays at
 * `/promotions` for the entire claim flow; internal screen state lives in memory here.
 *
 * Event → embed transition map mirrors the live widget contract (the same events the
 * playground wires to router.navigate). We deliberately do NOT call the host router
 * for any of them.
 */
export class Promotions extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    h1 {
      margin: 0 0 6px;
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(28px, 3.5vw, 40px);
      line-height: 1.05;
      letter-spacing: -0.035em;
      color: var(--cream);
    }
    .sub {
      margin: 0 0 28px;
      font: 400 16px/1.55 var(--font-body);
      color: var(--cream-dim);
    }
    .back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 20px;
      padding: 8px 12px 8px 8px;
      border: 1px solid var(--mist);
      border-radius: var(--r-sm);
      background: transparent;
      color: var(--cream-dim);
      font: 500 14px/1 var(--font-body);
      cursor: pointer;
      transition: color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
    }
    .back:hover {
      color: var(--cream);
      background: var(--hover-tint);
    }
    .back:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }
    .back svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .embed {
      margin-top: 4px;
    }
  `;

  static override properties = {
    _embedRoute: { state: true },
  };

  declare _embedRoute: EmbedRoute;

  #screenRef: Ref<PqScreen> = createRef();
  #embedParams: Record<string, unknown> = {};
  #listeners: Array<[string, EventListener]> = [];

  constructor() {
    super();
    this._embedRoute = "home";
  }

  override async firstUpdated(): Promise<void> {
    // Idempotent: ensures Luminara --pq-* tokens are live even on a deep-link/refresh
    // straight to /promotions.
    try {
      await setActiveTenant(TENANT_ID);
    } catch (error) {
      console.error(`[luminara] failed to activate tenant "${TENANT_ID}"`, error);
    }
    this.#bindEvents();
    await this.#setEmbedRoute("home");
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    const el = this.#screenRef.value;
    if (el) for (const [type, fn] of this.#listeners) el.removeEventListener(type, fn);
    this.#listeners = [];
  }

  // --- Embed routing (in memory; never touches the host router) ---------------
  async #setEmbedRoute(name: EmbedRoute, params: Record<string, unknown> = {}): Promise<void> {
    this._embedRoute = name;
    this.#embedParams = params;
    // The address step's widget renders nothing until $address is populated (the
    // playground does this on the /address route; the embed has no route to hook).
    if (name === "address") void loadAddress();
    const doc: CompositionDoc | null = await loadComposition("mobile-web", name);
    const el = this.#screenRef.value;
    if (!el) return;
    el.composition = doc ?? undefined;
    // Different routes are distinct module objects so Lit repaints, but force it in
    // case a route resolves to an already-mounted cached composition.
    el.requestUpdate();
    // Surface the in-memory embed state on the DOM (debugging + acceptance checks):
    // the host URL never changes, so these attributes are the only outward signal.
    this.dataset.embedRoute = name;
    el.dataset.embedParams = JSON.stringify(this.#embedParams);
  }

  // --- Widget events → embed transitions --------------------------------------
  #bindEvents(): void {
    const el = this.#screenRef.value;
    if (!el) return;

    const idOf = (e: Event) => (e as CustomEvent<{ id: string }>).detail?.id;
    const on = (type: string, fn: EventListener): void => {
      el.addEventListener(type, fn);
      this.#listeners.push([type, fn]);
    };

    on("pq-card-click", (e) => {
      const id = idOf(e);
      void selectCampaign(id);
      void this.#setEmbedRoute("campaign-detail", { id });
    });
    on("pq-hero-cta", (e) => {
      const id = idOf(e);
      void selectCampaign(id);
      void this.#setEmbedRoute("campaign-detail", { id });
    });
    on("pq-prize-select", (e) => selectPrize(idOf(e))); // no route change
    on("pq-claim-start", () => {
      startClaim();
      void this.#setEmbedRoute("confirm");
    });
    on("pq-claim-confirm", () => void this.#setEmbedRoute("pin"));
    on("pq-pin-complete", (e) => {
      submitPin((e as CustomEvent<{ value: string }>).detail.value);
      void this.#setEmbedRoute("address");
    });
    on("pq-address-confirm", () => {
      const addr = $address.get();
      if (addr) submitAddress(addr);
      void this.#setEmbedRoute("submit");
    });
    on("pq-claim-submit", () => {
      const digital = $selectedPrize.get()?.prizeType === "digital";
      void finalizeClaim().then((claimId) => {
        if (!claimId) return;
        void this.#setEmbedRoute(digital ? "voucher" : "success", { claimId });
      });
    });
    on("pq-success-dismiss", () => void this.#setEmbedRoute("home"));
    on("pq-success-cta", () => void this.#setEmbedRoute("orders"));
    on("pq-voucher-action", (e) => {
      if ((e as CustomEvent<{ action: string }>).detail.action === "done") {
        void this.#setEmbedRoute("home");
      }
    });
    on("pq-order-click", () => void this.#setEmbedRoute("orders"));
  }

  override render(): TemplateResult {
    return html`
      <h1>Promotions</h1>
      <p class="sub">Active campaigns and unclaimed rewards.</p>

      ${this._embedRoute !== "home"
        ? html`<button class="back" @click=${() => void this.#setEmbedRoute("home")}>
            <svg viewBox="0 0 24 24">${chevronLeft}</svg>
            <span>Back to Promotions</span>
          </button>`
        : nothing}

      <div class="embed">
        <pq-screen ${ref(this.#screenRef)}></pq-screen>
      </div>
    `;
  }
}

if (!customElements.get("lum-promotions")) {
  customElements.define("lum-promotions", Promotions);
}

declare global {
  interface HTMLElementTagNameMap {
    "lum-promotions": Promotions;
  }
}
