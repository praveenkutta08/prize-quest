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
  "Sunday Slot Sprint · prizes every Sunday",
  "VIP Game Day Quest · trip + gear",
  "VIP Electronics Quest · premium tech",
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
    /* OFFER BAND. Was a 11px mono line that nobody reads from two metres away. It is
       the only thing on the attract screen that says WHY to card in, so it now reads
       as a live marquee: a pulsing dot, the campaign in display type, gold rules
       running out to both edges. */
    .teaser {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 7px 24px;
      background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.72));
      transition: opacity 200ms ease;
      pointer-events: none;
    }
    .teaser::before,
    .teaser::after {
      content: "";
      flex: 1 1 0;
      max-width: 190px;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        var(--arc-hairline-2, rgba(212, 175, 55, 0.35))
      );
    }
    .teaser::after {
      background: linear-gradient(
        270deg,
        transparent,
        var(--arc-hairline-2, rgba(212, 175, 55, 0.35))
      );
    }
    .teaser__dot {
      flex: none;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--arc-display, #d4af37);
      box-shadow: 0 0 10px var(--arc-display-glow, rgba(212, 175, 55, 0.5));
    }
    .teaser__txt {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 15px;
      line-height: 1;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      white-space: nowrap;
      color: var(--arc-display-bright, #ebd08a);
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
    }
    /* SERVICE STRIP — the only zone Tier Rewards owns while the game plays. */
    /* THE MARQUEE. A flat black bar under a lit game reads as the screen having run
       out; a cabinet marquee is a LIT sign. Hence the gold edge light with a bloom
       under it, a centre glow behind the CTA, and a vignette at the ends. */
    .strip {
      position: relative;
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      gap: 28px;
      padding: 0 36px;
      cursor: pointer;
      overflow: hidden;
      background-color: var(--arc-bg-deep, #000);
      background-image:
        radial-gradient(
          62% 150% at 50% 100%,
          var(--arc-glow-soft, rgba(212, 175, 55, 0.16)),
          transparent 70%
        ),
        linear-gradient(180deg, var(--arc-bg-mid, #141414), rgba(0, 0, 0, 0.99));
      box-shadow: 0 -18px 40px -18px rgba(0, 0, 0, 0.85);
    }
    /* The light bar itself, and the bloom it throws down onto the sign face. */
    .strip::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        var(--arc-display-deep, #a8862a) 12%,
        var(--arc-display-bright, #ebd08a) 50%,
        var(--arc-display-deep, #a8862a) 88%,
        transparent
      );
      box-shadow: 0 6px 26px -2px var(--arc-display-glow, rgba(212, 175, 55, 0.5));
      pointer-events: none;
    }
    /* Ends fall off into the dark so the sign reads as lit from the centre. */
    .strip::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.75),
        transparent 22%,
        transparent 78%,
        rgba(0, 0, 0, 0.75)
      );
      pointer-events: none;
    }
    .strip > * {
      position: relative;
      z-index: 1;
    }
    /* The three zones are 1 / auto / 1 so the CTA sits on the strip's true centre.
       With the sides sized to their own content it drifted 85px right of centre. */
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1 1 0;
      min-width: 0;
    }
    .brand__name {
      font-family: var(--arc-font-display, "Inter", sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 30px;
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
      flex: none;
    }
    /* THE CARD. It was a dead grey rectangle; a patron has to recognise it instantly
       as "the thing in my pocket". Card proportions, a gold chip, a magnetic stripe,
       tilted off-axis so it reads as an object being offered rather than an icon —
       and a pulse ring behind it marking the reader. */
    .cardwrap {
      position: relative;
      flex: none;
      display: grid;
      place-items: center;
      width: 132px;
      height: 108px;
    }
    .cardwrap::before {
      content: "";
      position: absolute;
      width: 104px;
      height: 104px;
      border-radius: 50%;
      border: 1px solid var(--arc-hairline-2, rgba(212, 175, 55, 0.35));
      opacity: 0;
    }
    .card-icon {
      position: relative;
      width: 112px;
      height: 72px;
      border-radius: 8px;
      transform: rotate(-9deg);
      border: 1px solid var(--arc-display-deep, #a8862a);
      background: linear-gradient(135deg, var(--arc-bg-elev, #1f1f1f), var(--arc-bg-deep, #000));
      box-shadow:
        0 10px 22px -8px rgba(0, 0, 0, 0.9),
        inset 0 1px 0 rgba(255, 255, 255, 0.12),
        0 0 22px -6px var(--arc-display-glow, rgba(212, 175, 55, 0.5));
    }
    /* Chip. */
    .card-icon::before {
      content: "";
      position: absolute;
      top: 15px;
      left: 14px;
      width: 22px;
      height: 17px;
      border-radius: 3px;
      background: linear-gradient(
        150deg,
        var(--arc-display-bright, #ebd08a),
        var(--arc-display-deep, #a8862a)
      );
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.28);
    }
    /* Stripe. */
    .card-icon::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 15px;
      height: 12px;
      background: linear-gradient(
        90deg,
        rgba(212, 175, 55, 0.16),
        rgba(212, 175, 55, 0.42),
        rgba(212, 175, 55, 0.16)
      );
    }
    /* A cabinet button, not a web button: a dark bezel the gold face is seated INTO,
       a lit top edge, and an engraved shadow along the bottom. */
    .tap-cta {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      padding: 54px 68px;
      border: 3px solid var(--arc-bg-deep, #000);
      border-radius: 10px;
      background: linear-gradient(
        180deg,
        var(--arc-display-bright, #ebd08a),
        var(--arc-display, #d4af37) 52%,
        var(--arc-display-deep, #a8862a)
      );
      color: var(--arc-on-tint, rgba(0, 0, 0, 0.88));
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 30px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-shadow: 0 1px 0 rgba(255, 255, 255, 0.34);
      box-shadow:
        0 0 0 1px var(--arc-display-deep, #a8862a),
        0 0 28px -4px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        inset 0 2px 0 rgba(255, 255, 255, 0.5),
        inset 0 -3px 8px -2px rgba(0, 0, 0, 0.45);
    }
    .tap-cta::after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: -100%;
      width: 34%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    }
    .clockbox {
      text-align: right;
      flex: 1 1 0;
      min-width: 0;
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
      font-size: 23px;
      letter-spacing: 0.04em;
      color: var(--arc-cream, #fff);
    }
    @media (prefers-reduced-motion: no-preference) {
      .cardwrap::before {
        animation: dm-reader-pulse 2.6s ease-out infinite;
      }
      .teaser__dot {
        animation: dm-live-dot 1.6s ease-in-out infinite;
      }
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
    /* The reader ring: a slow ripple outward from the card, the way a contactless
       reader signals it is armed. */
    @keyframes dm-reader-pulse {
      0% {
        transform: scale(0.72);
        opacity: 0;
      }
      35% {
        opacity: 0.75;
      }
      100% {
        transform: scale(1.28);
        opacity: 0;
      }
    }
    @keyframes dm-live-dot {
      0%,
      100% {
        opacity: 1;
        box-shadow: 0 0 10px var(--arc-display-glow, rgba(212, 175, 55, 0.5));
      }
      50% {
        opacity: 0.45;
        box-shadow: 0 0 3px var(--arc-display-glow, rgba(212, 175, 55, 0.5));
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
      gap: 10px;
      padding: 6px 16px;
    }
    :host-context([data-dm-ff="1024x768"]) .teaser__txt {
      font-size: 12px;
      letter-spacing: 0.08em;
    }
    :host-context([data-dm-ff="1024x768"]) .teaser::before,
    :host-context([data-dm-ff="1024x768"]) .teaser::after {
      max-width: 90px;
    }
    :host-context([data-dm-ff="1024x768"]) .brand__name {
      font-size: 24px;
    }
    :host-context([data-dm-ff="1024x768"]) .brand__sub {
      display: none;
    }
    /* Card proportions hold at 1024 — 86x55 is still a credit card; 82x72 was a box. */
    :host-context([data-dm-ff="1024x768"]) .cardwrap {
      width: 104px;
      height: 84px;
    }
    :host-context([data-dm-ff="1024x768"]) .cardwrap::before {
      width: 80px;
      height: 80px;
    }
    :host-context([data-dm-ff="1024x768"]) .card-icon {
      width: 86px;
      height: 55px;
      border-radius: 6px;
    }
    :host-context([data-dm-ff="1024x768"]) .card-icon::before {
      top: 11px;
      left: 11px;
      width: 17px;
      height: 13px;
    }
    :host-context([data-dm-ff="1024x768"]) .card-icon::after {
      bottom: 11px;
      height: 9px;
    }
    :host-context([data-dm-ff="1024x768"]) .tap-cta {
      padding: 43px 50px;
      font-size: 22px;
    }
    :host-context([data-dm-ff="1024x768"]) .clockbox strong {
      font-size: 19px;
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
      .map((c) => c.name);
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
        <div class="teaser" style="opacity:${this._teaserVisible ? 1 : 0}">
          <span class="teaser__dot"></span>
          <span class="teaser__txt">${teaser}</span>
        </div>
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
            <div class="cardwrap"><div class="card-icon"></div></div>
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
