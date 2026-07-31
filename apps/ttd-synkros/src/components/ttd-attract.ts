// <ttd-attract> — host-app idle "Insert Card" attract screen for the SYNKROS TTD
// demo (480×234, casino-loud aesthetic). NOT a @pq/widget — it's app chrome that
// wraps the embedded Prize Quest flow. Inherits the --cl-* palette from :root.
//
// LIT 3, no decorators (static properties + declare + constructor) to match the
// rest of the codebase / WTR + esbuild parity.
import { LitElement, css, html, type TemplateResult } from "lit";
import { navigate } from "@pq/router";
import { getActiveTenant } from "@pq/tenants";

// Mock attract teasers (the campaign list itself lives behind the flow). Hardcoded
// per the demo spec — keeps the attract screen dependency-free.
const TEASERS = [
  "✦  Sunday Slot Sprint · $500 → AirPods",
  "✦  VIP Game Day · trip + gear",
  "✦  VIP Electronics · tablet bundle",
];

export class TtdAttract extends LitElement {
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
      background:
        radial-gradient(ellipse at 50% 0%, rgba(255, 182, 39, 0.18), transparent 60%),
        linear-gradient(180deg, var(--cl-black, #06030a), var(--cl-noir, #100612));
      color: var(--cl-cream, #f5f1e8);
      cursor: pointer;
      overflow: hidden;
    }
    .corner {
      position: absolute;
      top: 8px;
      font-family: var(--cl-font-mono, monospace);
      font-size: 9px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      line-height: 1.3;
    }
    .brand {
      left: 8px;
      font-family: var(--cl-font-display, sans-serif);
      font-size: 12px;
      color: var(--cl-cream, #f5f1e8);
    }
    .clock {
      right: 8px;
      text-align: right;
      color: var(--cl-text-faint, #7a7268);
    }
    .center {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .eyebrow {
      margin: 0;
      font-family: var(--cl-font-mono, monospace);
      font-size: 10px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--cl-gold, #ffb627);
    }
    .headline {
      margin: 0;
      font-family: var(--cl-font-display, sans-serif);
      font-size: 32px;
      line-height: 1;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--cl-gold, #ffb627);
      text-shadow: 0 0 16px var(--cl-gold-glow, rgba(255, 182, 39, 0.55));
    }
    .card-icon {
      position: relative;
      width: 60px;
      height: 40px;
      border-radius: 6px;
      border: 1px solid var(--cl-gold, #ffb627);
      background: linear-gradient(135deg, var(--cl-burgundy, #4a152e), var(--cl-red-deep, #a8131a));
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.45);
    }
    .card-chip {
      position: absolute;
      top: 7px;
      left: 8px;
      width: 8px;
      height: 6px;
      border-radius: 1px;
      background: var(--cl-gold, #ffb627);
    }
    .tagline {
      margin: 0;
      font-family: var(--cl-font-body, sans-serif);
      font-size: 11px;
      letter-spacing: 0.04em;
      color: var(--cl-text-dim, #c5beb0);
    }
    .teaser {
      flex: 0 0 auto;
      height: 24px;
      padding: 4px 12px;
      border-top: 1px solid var(--cl-burgundy, #4a152e);
      font-family: var(--cl-font-mono, monospace);
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--cl-text-dim, #c5beb0);
      display: flex;
      align-items: center;
      transition: opacity 200ms ease;
    }
    @media (prefers-reduced-motion: no-preference) {
      .card-icon {
        animation: float 2.4s ease-in-out infinite;
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

    /* ===================== ARCADE (Station Arcade · Pre-A) =====================
       Mirrors prize-quest-ttd-arcade.html stage Pre-A. Deep-purple gradient
       canvas + neon Manrope headline + floating member card (float-sm). */
    .aroot {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      overflow: hidden;
      color: var(--arc-text, #fff);
      font-family: var(--arc-font-body, "Inter", sans-serif);
      /* Tenant-driven — hardcoded arcade purple made Tier Rewards (black + gold) glow
         violet at the corners. */
      background:
        radial-gradient(
          ellipse at 20% 0%,
          var(--arc-bg-glass, rgba(142, 71, 232, 0.3)),
          transparent 55%
        ),
        radial-gradient(
          ellipse at 80% 100%,
          var(--arc-glow-soft, rgba(255, 63, 164, 0.18)),
          transparent 60%
        ),
        linear-gradient(
          160deg,
          var(--arc-bg-deep, #15042e) 0%,
          var(--arc-bg-base, #1f0b3e) 50%,
          var(--arc-bg-mid, #2a1454) 100%
        );
    }
    .attract-brand {
      position: absolute;
      top: 6px;
      left: 8px;
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 9px;
      color: var(--arc-cream, #f5efe0);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      z-index: 3;
    }
    .attract-time {
      position: absolute;
      top: 6px;
      right: 8px;
      text-align: right;
      font-family: var(--arc-font-mono, monospace);
      font-size: 8px;
      color: var(--arc-text-faint, #8b7aaa);
      letter-spacing: 0.14em;
      text-transform: uppercase;
      z-index: 3;
    }
    .attract-time strong {
      display: block;
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 11px;
      color: var(--arc-cream, #f5efe0);
      letter-spacing: 0.04em;
    }
    .attract-hero {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      position: relative;
      z-index: 2;
    }
    .attract-eyebrow {
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      color: var(--arc-display, #ffd93d);
      letter-spacing: 0.32em;
      text-transform: uppercase;
      font-weight: 700;
    }
    .attract-headline {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 28px;
      color: var(--arc-display, #ffd93d);
      text-transform: uppercase;
      letter-spacing: 0.02em;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
      margin: 0;
      line-height: 0.95;
    }
    .attract-card {
      position: relative;
      width: 80px;
      height: 50px;
      border-radius: 6px;
      background: linear-gradient(
        135deg,
        var(--cat-purple-deep, #6b2dd0),
        var(--cat-pink-deep, #e91e63),
        var(--cat-purple, #8e47e8)
      );
      border: 1px solid var(--arc-display, #ffd93d);
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.25);
    }
    .attract-card__chip {
      position: absolute;
      top: 4px;
      left: 4px;
      width: 14px;
      height: 10px;
      background: linear-gradient(
        135deg,
        var(--arc-display-bright, #ffee5c),
        var(--arc-display-deep, #e0b71b)
      );
      border-radius: 2px;
    }
    .attract-card__name {
      position: absolute;
      bottom: 4px;
      left: 4px;
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 8px;
      color: var(--arc-cream, #f5efe0);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .attract-card__num {
      position: absolute;
      bottom: 4px;
      right: 4px;
      font-family: var(--arc-font-mono, monospace);
      font-size: 6px;
      color: rgba(255, 255, 255, 0.7);
      letter-spacing: 0.12em;
    }
    .attract-cta {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 11px;
      color: var(--arc-cream, #f5efe0);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .attract-tease {
      flex: 0 0 auto;
      border-top: 1px solid var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
      background: linear-gradient(180deg, transparent, var(--arc-bg-glass-2, rgba(15, 4, 46, 0.6)));
      padding: 5px 10px;
      font-family: var(--arc-font-mono, monospace);
      font-size: 8px;
      color: var(--arc-text-dim, #d0bfec);
      letter-spacing: 0.14em;
      text-transform: uppercase;
      text-align: center;
      position: relative;
      z-index: 2;
      transition: opacity 200ms ease;
    }
    @media (prefers-reduced-motion: no-preference) {
      .attract-card {
        animation: float-sm 2.4s ease-in-out infinite;
      }
    }
  `;

  static override properties = {
    _teaserIndex: { state: true },
    _teaserVisible: { state: true },
  };

  declare private _teaserIndex: number;
  declare private _teaserVisible: boolean;
  #teaserTimer?: number;

  constructor() {
    super();
    this._teaserIndex = 0;
    this._teaserVisible = true;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("pointerdown", this.#dismiss, { passive: true });
    window.addEventListener("keydown", this.#dismiss);
    // Future vendor adapter hook: a real card insert fires this global event.
    if ((window as unknown as { __SYNKROS_CARD_TAP__?: unknown }).__SYNKROS_CARD_TAP__) {
      window.addEventListener("synkros-card-tap", this.#dismiss);
    }
    this.#teaserTimer = window.setInterval(() => {
      this._teaserVisible = false;
      window.setTimeout(() => {
        this._teaserIndex = (this._teaserIndex + 1) % TEASERS.length;
        this._teaserVisible = true;
      }, 200);
    }, 3000);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("pointerdown", this.#dismiss);
    window.removeEventListener("keydown", this.#dismiss);
    window.removeEventListener("synkros-card-tap", this.#dismiss);
    if (this.#teaserTimer) clearInterval(this.#teaserTimer);
  }

  #dismiss = (e?: Event): void => {
    // The listener is window-wide (any tap on the cabinet starts a session), which on
    // the demo page also caught the DEV CHROME: opening the form-factor or tenant
    // <select> fired pointerdown — and arrowing through its options fired keydown —
    // dismissing the attract screen behind the dropdown. Ignore anything that
    // originates in the .ff-bar; a real TTD has no chrome, so this is demo-only.
    if (e) {
      const inDevChrome = e
        .composedPath()
        .some(
          (t) =>
            t instanceof HTMLElement &&
            (t.classList?.contains("ff-bar") || t.closest?.(".ff-bar") !== null),
        );
      if (inDevChrome) return;
    }
    this.dispatchEvent(new CustomEvent("ttd-attract-dismissed", { bubbles: true, composed: true }));
    navigate(`/hub${location.search}`);
  };

  /** Active tenant runs the arcade theme → render the arcade Pre-A attract. */
  private get arcade(): boolean {
    return getActiveTenant()?.theme.mode === "arcade";
  }

  override render(): TemplateResult {
    return this.arcade ? this.renderArcade() : this.renderCasino();
  }

  /** Casino-loud attract (Station Casinos) — unchanged from Session 24c. */
  private renderCasino(): TemplateResult {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const date = now
      .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
      .toUpperCase()
      .replace(",", "")
      .replace(/ (\w+) (\d+)$/, " $1 · $2");
    return html`
      <div class="root">
        <span class="corner brand">STATION CASINOS</span>
        <span class="corner clock">${time}<br />${date}</span>
        <div class="center">
          <p class="eyebrow">Player Rewards</p>
          <h1 class="headline">Insert Card</h1>
          <div class="card-icon"><span class="card-chip"></span></div>
          <p class="tagline">Tap your member card to begin</p>
        </div>
        <div class="teaser" style="opacity:${this._teaserVisible ? 1 : 0}">
          ${TEASERS[this._teaserIndex]}
        </div>
      </div>
    `;
  }

  /** Arcade attract (Station Arcade) — mirrors prize-quest-ttd-arcade.html Pre-A. */
  private renderArcade(): TemplateResult {
    // Pre-session marquee — entirely CASINO chrome. The corner carries the operator's
    // name and the headline their own loyalty-programme name. Nothing about Tier Rewards
    // appears until the patron taps into our widget from the hub.
    const tenant = getActiveTenant();
    const brand = tenant?.name ?? "Casino";
    const headline = tenant?.brand.productName ?? brand;
    const now = new Date();
    const time = now
      .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      .replace(/\s/g, " ");
    const date = now
      .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
      .toUpperCase()
      .replace(",", "")
      .replace(/ (\w+) (\d+)$/, " $1 · $2");
    return html`
      <div class="aroot">
        <div class="attract-brand">${brand}</div>
        <div class="attract-time"><strong>${time}</strong>${date}</div>
        <div class="attract-hero">
          <span class="attract-eyebrow">Welcome to</span>
          <h1 class="attract-headline">${headline}</h1>
          <div class="attract-card">
            <div class="attract-card__chip"></div>
            <div class="attract-card__name">Platinum</div>
            <div class="attract-card__num">•••• 7842</div>
          </div>
          <div class="attract-cta">Tap card to start</div>
        </div>
        <div class="attract-tease" style="opacity:${this._teaserVisible ? 1 : 0}">
          ${TEASERS[this._teaserIndex]}
        </div>
      </div>
    `;
  }
}

if (!customElements.get("ttd-attract")) {
  customElements.define("ttd-attract", TtdAttract);
}

declare global {
  interface HTMLElementTagNameMap {
    "ttd-attract": TtdAttract;
  }
}
