// <dm-attract> — Device Manager idle/attract state. The game owns the whole display;
// Tier Rewards is only the service strip the stage hands us in the bottom band: brand,
// "Tap Card to Start" CTA, clock, and a rotating campaign teaser. The game layer is
// drawn by <dm-stage>, never here — we do not render the game. NOT a @pq widget — host chrome, themed by the tenant's --arc-*
// tokens (Casino Luxe black + gold on the tier-rewards default).
//
// LIT 3, no decorators (static properties + declare + constructor) to match the
// rest of the codebase.
import { LitElement, css, html, type TemplateResult } from "lit";
import { navigate } from "@pq/router";
import { getActiveTenant } from "@pq/tenants";
import { $campaigns, bindAtom } from "@pq/store";
import type { Campaign } from "@pq/mock-data";

/** Fallback teasers shown until campaigns load. No currency values — house rule. */
const FALLBACK_TEASERS = [
  "✦  Sunday Slot Sprint · prizes every Sunday",
  "✦  VIP Game Day Quest · trip + gear",
  "✦  VIP Electronics Quest · premium tech",
];

export class DmAttract extends LitElement {
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
      flex-direction: column;
      overflow: hidden;
      color: var(--arc-text, #fff);
      font-family: var(--arc-font-body, "Inter", sans-serif);
    }
    /* Rotating teaser sits just above the strip, inside the band we were given. */
    .teaser {
      flex: none;
      padding: 5px 14px;
      text-align: center;
      background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.72));
      font-family: var(--arc-font-mono, "JetBrains Mono", monospace);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--arc-display-bright, #ebd08a);
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
      transition: opacity 200ms ease;
      pointer-events: none;
    }
    /* SERVICE STRIP — the only zone Tier Rewards owns while the game plays. */
    .strip {
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      gap: 28px;
      padding: 0 36px;
      cursor: pointer;
      background: linear-gradient(180deg, rgba(10, 10, 10, 0.92), rgba(0, 0, 0, 0.99));
      border-top: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      box-shadow: 0 -18px 40px -18px rgba(0, 0, 0, 0.85);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: none;
    }
    .brand__name {
      font-family: var(--arc-font-display, "Inter", sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 22px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--arc-cream, #fff);
      line-height: 1;
    }
    .brand__sub {
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      color: var(--arc-display, #d4af37);
      margin-top: 4px;
    }
    .tapwrap {
      display: flex;
      align-items: center;
      gap: 24px;
      margin: 0 auto;
    }
    .card-icon {
      position: relative;
      width: 62px;
      height: 41px;
      border-radius: 6px;
      flex: none;
      border: 1px solid var(--arc-display, #d4af37);
      background: linear-gradient(135deg, var(--arc-bg-elev, #1f1f1f), var(--arc-bg-mid, #141414));
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.45);
    }
    .card-icon::after {
      content: "";
      position: absolute;
      top: 8px;
      left: 9px;
      width: 12px;
      height: 9px;
      border-radius: 1px;
      background: var(--arc-display, #d4af37);
    }
    .tap-cta {
      border: 1px solid var(--arc-display, #d4af37);
      border-radius: var(--arc-r-md, 8px);
      cursor: pointer;
      padding: 14px 40px;
      background: linear-gradient(
        180deg,
        var(--arc-display-bright, #ebd08a),
        var(--arc-display, #d4af37) 55%,
        var(--arc-display-deep, #a8862a)
      );
      color: var(--arc-on-tint, rgba(0, 0, 0, 0.88));
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 20px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      box-shadow:
        0 0 16px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        inset 0 1px 0 rgba(255, 255, 255, 0.35);
      position: relative;
      overflow: hidden;
    }
    .tap-cta::after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: -100%;
      width: 50%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
    }
    .clockbox {
      text-align: right;
      flex: none;
      font-family: var(--arc-font-mono, monospace);
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--arc-text-faint, #8a8a8a);
    }
    .clockbox strong {
      display: block;
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 19px;
      letter-spacing: 0.04em;
      color: var(--arc-cream, #fff);
    }
    @media (prefers-reduced-motion: no-preference) {
      .card-icon {
        animation: float 2.4s ease-in-out infinite;
      }
      .tap-cta {
        animation: dm-hot-pulse 1.8s ease-in-out infinite;
      }
      .tap-cta::after {
        animation: dm-sweep 3.2s linear infinite;
      }
    }
    @keyframes float {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-4px);
      }
    }
    @keyframes dm-hot-pulse {
      0%,
      100% {
        box-shadow:
          0 0 14px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
          inset 0 1px 0 rgba(255, 255, 255, 0.35);
      }
      50% {
        box-shadow:
          0 0 26px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
          0 0 0 2px rgba(212, 175, 55, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.35);
      }
    }
    @keyframes dm-sweep {
      to {
        left: 200%;
      }
    }
    /* 1024×768 — tighter strip. */
    :host-context([data-dm-ff="1024x768"]) .strip {
      gap: 14px;
      padding: 0 18px;
    }
    :host-context([data-dm-ff="1024x768"]) .teaser {
      font-size: 9px;
    }
    :host-context([data-dm-ff="1024x768"]) .brand__name {
      font-size: 17px;
    }
    :host-context([data-dm-ff="1024x768"]) .brand__sub {
      display: none;
    }
    :host-context([data-dm-ff="1024x768"]) .card-icon {
      width: 48px;
      height: 32px;
    }
    :host-context([data-dm-ff="1024x768"]) .tap-cta {
      padding: 10px 26px;
      font-size: 15px;
    }
    :host-context([data-dm-ff="1024x768"]) .clockbox strong {
      font-size: 15px;
    }
  `;

  static override properties = {
    campaigns: { attribute: false },
    _teaserIndex: { state: true },
    _teaserVisible: { state: true },
    _now: { state: true },
  };

  declare campaigns: Campaign[] | null;
  declare private _teaserIndex: number;
  declare private _teaserVisible: boolean;
  declare private _now: Date;

  #teaserTimer?: number;
  #clockTimer?: number;

  constructor() {
    super();
    this.campaigns = null;
    this._teaserIndex = 0;
    this._teaserVisible = true;
    this._now = new Date();
    bindAtom(this, $campaigns, "campaigns");
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#teaserTimer = window.setInterval(() => {
      this._teaserVisible = false;
      window.setTimeout(() => {
        this._teaserIndex = this._teaserIndex + 1;
        this._teaserVisible = true;
      }, 200);
    }, 3000);
    this.#clockTimer = window.setInterval(() => {
      this._now = new Date();
    }, 15000);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.#teaserTimer) clearInterval(this.#teaserTimer);
    if (this.#clockTimer) clearInterval(this.#clockTimer);
  }

  #dismiss = (): void => {
    this.dispatchEvent(new CustomEvent("dm-attract-dismissed", { bubbles: true, composed: true }));
    navigate(`/hub${location.search}`);
  };

  /** Teaser strings — live campaign names once the store loads, fallbacks before. */
  private get teasers(): string[] {
    const live = (this.campaigns ?? [])
      .filter((c) => c.status === "eligible" || c.status === "in-progress")
      .map((c) => `✦  ${c.name}`);
    return live.length > 0 ? live : FALLBACK_TEASERS;
  }

  override render(): TemplateResult {
    const brand = getActiveTenant()?.name ?? "Casino";
    const teasers = this.teasers;
    const teaser = teasers[this._teaserIndex % teasers.length];
    const time = this._now
      .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      .replace(/\s/g, " ");
    const date = this._now
      .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
      .toUpperCase()
      .replace(",", "")
      .replace(/ (\w+) (\d+)$/, " $1 · $2");
    return html`
      <div
        class="root"
        @click=${this.#dismiss}
        @keydown=${this.#onKeydown}
        tabindex="0"
        role="button"
        aria-label="Tap card to start"
      >
        <div class="teaser" style="opacity:${this._teaserVisible ? 1 : 0}">${teaser}</div>
        <div class="strip">
          <!-- The attract screen belongs to the CASINO — operator name only. The Tier
               Rewards mark appears once the patron is carded in and enters our surface
               (same rule ttd-hub follows: the vendor mark starts at the hero tile). -->
          <div class="brand">
            <div>
              <div class="brand__name">${brand}</div>
              <div class="brand__sub">Player Rewards</div>
            </div>
          </div>
          <div class="tapwrap">
            <div class="card-icon"></div>
            <button class="tap-cta" type="button">Tap Card to Start</button>
          </div>
          <div class="clockbox"><strong>${time}</strong>${date}</div>
        </div>
      </div>
    `;
  }

  #onKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.#dismiss();
    }
  };
}

if (!customElements.get("dm-attract")) {
  customElements.define("dm-attract", DmAttract);
}

declare global {
  interface HTMLElementTagNameMap {
    "dm-attract": DmAttract;
  }
}
