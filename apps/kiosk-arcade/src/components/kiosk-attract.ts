// <kiosk-attract> — host-app "Insert/Tap Card" attract screen for the Kiosk Arcade
// demo (1920×1080 native, arcade aesthetic). NOT a @pq/widget — it's app chrome that
// fronts the embedded Prize Quest flow. Arcade tokens (--arc-*, --cat-*) cascade in
// from <html data-pq-mode="arcade"> (custom properties inherit through shadow DOM).
//
// LIT 3, no decorators (static properties + declare + constructor) for WTR/esbuild
// parity with the rest of the codebase. Spec: Section 7 + reference stage Pre-A.
import { LitElement, css, html, type TemplateResult } from "lit";
import { navigate } from "@pq/router";

interface Teaser {
  name: string;
  sub: string;
  emoji: string;
  tint: string;
}

const TEASERS: Teaser[] = [
  { name: "Sunday Slot Sprint", sub: "$500 wager → premium prizes", emoji: "🎰", tint: "var(--cat-pink, #ff3fa4)" },
  { name: "VIP Game Day", sub: "$5K play → trip + gear", emoji: "🏆", tint: "var(--cat-purple, #8e47e8)" },
  { name: "VIP Electronics", sub: "$1K table play → tech", emoji: "📱", tint: "var(--cat-blue, #3d8bf5)" },
];

const chevronIcon = html`<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="var(--arc-display, #ffd93d)" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>`;

export class KioskAttract extends LitElement {
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
      align-items: stretch;
      color: var(--arc-text, #e8ddff);
      font-family: var(--arc-font-body, "Inter", sans-serif);
      cursor: pointer;
      overflow: hidden;
    }
    .clock {
      position: absolute;
      top: 32px;
      right: 56px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      z-index: 3;
    }
    /* EGM: the "Return to Game" affordance takes the top-right; the clock drops below. */
    .clock--egm {
      top: 96px;
    }
    .return-game {
      position: absolute;
      top: 32px;
      right: 56px;
      z-index: 4;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 22px;
      border-radius: var(--arc-r-pill, 999px);
      border: 1px solid var(--arc-display, #ffd93d);
      background: rgba(255, 217, 61, 0.14);
      color: var(--arc-display, #ffd93d);
      font-family: var(--arc-font-display, "Manrope", sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 16px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
    }
    .return-game:hover {
      background: rgba(255, 217, 61, 0.22);
      box-shadow: 0 0 18px var(--arc-display-glow, rgba(255, 217, 61, 0.4));
    }
    .clock__big {
      font-family: var(--arc-font-display, "Manrope", sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 28px;
      color: var(--arc-cream, #f5efe0);
      letter-spacing: 0.02em;
    }
    .clock__sub {
      font-family: var(--arc-font-mono, monospace);
      font-size: 12px;
      color: var(--arc-text-faint, #9a86c9);
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
    .brand {
      position: absolute;
      top: 32px;
      left: 56px;
      display: flex;
      align-items: center;
      gap: 14px;
      z-index: 3;
    }
    .logo {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--arc-display, #ffd93d), var(--cat-orange, #ff8c2c));
      display: grid;
      place-items: center;
      font-family: var(--arc-font-display, "Manrope", sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 28px;
      color: var(--arc-bg-deep, #15042e);
      box-shadow: 0 0 24px var(--arc-display-glow, rgba(255, 217, 61, 0.5));
    }
    .brand__name {
      font-family: var(--arc-font-display, "Manrope", sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 24px;
      letter-spacing: 0.04em;
      color: var(--arc-cream, #f5efe0);
      text-transform: uppercase;
    }
    .brand__sub {
      font-family: var(--arc-font-mono, monospace);
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--arc-text-faint, #9a86c9);
      margin-top: 2px;
    }
    .center {
      flex: 1;
      padding: 56px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 40px;
      position: relative;
      z-index: 2;
    }
    .display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      text-align: center;
    }
    .eyebrow {
      font-family: var(--arc-font-mono, monospace);
      font-size: 16px;
      color: var(--arc-display, #ffd93d);
      letter-spacing: 0.32em;
      text-transform: uppercase;
      font-weight: 700;
    }
    .headline {
      font-family: var(--arc-font-display, "Manrope", sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 144px;
      line-height: 0.9;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);
    }
    .headline__l1 {
      color: var(--arc-display, #ffd93d);
    }
    .headline__l2 {
      color: var(--arc-display, #ffd93d);
    }
    .prompt {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      margin-top: 12px;
    }
    .card {
      position: relative;
      width: 380px;
      height: 240px;
    }
    .card__halo {
      position: absolute;
      inset: -40px;
      border-radius: 50%;
      background: radial-gradient(ellipse, var(--arc-display-glow, rgba(255, 217, 61, 0.5)), transparent 60%);
      filter: blur(20px);
    }
    .card__body {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 20px;
      background: linear-gradient(
        135deg,
        var(--cat-purple-deep, #4d1f8c),
        var(--cat-pink-deep, #a3126b),
        var(--cat-purple, #8e47e8)
      );
      border: 2px solid var(--arc-display, #ffd93d);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.25);
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card__chip {
      width: 48px;
      height: 36px;
      background: linear-gradient(135deg, var(--arc-display-bright, #ffee5c), var(--arc-display-deep, #e0b71b));
      border-radius: 6px;
      border: 1px solid var(--arc-display-deep, #e0b71b);
    }
    .card__type {
      font-family: var(--arc-font-mono, monospace);
      font-size: 12px;
      color: var(--arc-cream, #f5efe0);
      letter-spacing: 0.18em;
      text-transform: uppercase;
      font-weight: 700;
    }
    .card__tier {
      font-family: var(--arc-font-display, "Manrope", sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 36px;
      color: var(--arc-cream, #f5efe0);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }
    .card__num {
      font-family: var(--arc-font-mono, monospace);
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
      letter-spacing: 0.22em;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .card__tap {
      position: absolute;
      right: -80px;
      top: 50%;
      transform: translateY(-50%);
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(255, 217, 61, 0.18);
      border: 2px solid var(--arc-display, #ffd93d);
      display: grid;
      place-items: center;
    }
    .cta {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
    }
    .cta__head {
      font-family: var(--arc-font-display, "Manrope", sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 64px;
      line-height: 1;
      margin: 0;
      color: var(--arc-display, #ffd93d);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);
    }
    .cta__sub {
      font-size: 22px;
      color: var(--arc-text-dim, #c8b6e2);
      margin: 0;
      letter-spacing: 0.04em;
    }
    .strip {
      position: relative;
      z-index: 2;
      padding: 24px 56px 36px;
      border-top: 1px solid var(--arc-hairline-2, rgba(140, 100, 200, 0.35));
      background: linear-gradient(180deg, transparent, rgba(15, 4, 46, 0.6));
    }
    .strip__head {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 14px;
    }
    .strip__label {
      font-family: var(--arc-font-mono, monospace);
      font-size: 12px;
      color: var(--arc-display, #ffd93d);
      letter-spacing: 0.22em;
      text-transform: uppercase;
      font-weight: 700;
    }
    .strip__rule {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, var(--arc-display, #ffd93d), transparent);
    }
    .teasers {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .teaser {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      background: var(--arc-bg-glass, rgba(60, 25, 110, 0.4));
      border: 1px solid var(--teaser-tint, var(--cat-purple, #8e47e8));
      border-radius: var(--arc-r-lg, 20px);
      transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
    }
    .teaser--active {
      transform: scale(1.02);
      box-shadow: 0 0 22px var(--teaser-tint, var(--cat-purple, #8e47e8));
    }
    .teaser__icon {
      width: 44px;
      height: 44px;
      border-radius: var(--arc-r-md, 12px);
      background: linear-gradient(135deg, var(--teaser-tint, #8e47e8), var(--cat-purple, #8e47e8));
      display: grid;
      place-items: center;
      font-size: 24px;
      flex: 0 0 auto;
    }
    .teaser__name {
      font-family: var(--arc-font-display, "Manrope", sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 16px;
      color: var(--arc-cream, #f5efe0);
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .teaser__sub {
      font-family: var(--arc-font-mono, monospace);
      font-size: 11px;
      color: var(--arc-text-faint, #9a86c9);
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    @media (prefers-reduced-motion: no-preference) {
      .eyebrow {
        animation: pulse-glow 3s ease-in-out infinite;
      }
      .card {
        animation: float 3s ease-in-out infinite;
      }
      .card__tap {
        animation: pulse-glow 1.4s ease-in-out infinite;
      }
    }
    @keyframes float {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-8px);
      }
    }
    @keyframes pulse-glow {
      0%,
      100% {
        box-shadow: 0 0 24px var(--arc-display-glow, rgba(255, 217, 61, 0.5));
      }
      50% {
        box-shadow: 0 0 48px var(--arc-display-glow, rgba(255, 217, 61, 0.5));
      }
    }

    /* ===== iVIEW (1024x600 + 800x480) — scale attract down for small touchscreens ===== */
    :host-context([data-formfactor^="iview"]) .center {
      padding: 16px;
      gap: 8px;
    }
    :host-context([data-formfactor^="iview"]) .brand {
      gap: 8px;
    }
    :host-context([data-formfactor^="iview"]) .logo {
      width: 24px;
      height: 24px;
      font-size: 14px;
    }
    :host-context([data-formfactor^="iview"]) .brand__name {
      font-size: 12px;
    }
    :host-context([data-formfactor^="iview"]) .clock__big {
      font-size: 11px;
    }
    :host-context([data-formfactor^="iview"]) .clock__sub {
      font-size: 9px;
    }
    :host-context([data-formfactor^="iview"]) .eyebrow {
      font-size: 10px;
      letter-spacing: 0.18em;
    }
    :host-context([data-formfactor^="iview"]) .headline {
      font-size: 48px;
      line-height: 0.95;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);
    }
    :host-context([data-formfactor^="iview"]) .card {
      width: 200px;
      height: 130px;
    }
    :host-context([data-formfactor^="iview"]) .card__body {
      padding: 12px;
    }
    :host-context([data-formfactor^="iview"]) .card__chip {
      width: 28px;
      height: 20px;
    }
    :host-context([data-formfactor^="iview"]) .card__tier {
      font-size: 18px;
    }
    :host-context([data-formfactor^="iview"]) .card__num {
      font-size: 9px;
    }
    :host-context([data-formfactor^="iview"]) .card__tap {
      width: 32px;
      height: 32px;
      right: -36px;
    }
    :host-context([data-formfactor^="iview"]) .cta__head {
      font-size: 28px;
    }
    :host-context([data-formfactor^="iview"]) .cta__sub {
      font-size: 12px;
    }
    :host-context([data-formfactor^="iview"]) .strip {
      padding: 8px 16px;
    }
    :host-context([data-formfactor^="iview"]) .strip__label {
      font-size: 10px;
    }
    :host-context([data-formfactor^="iview"]) .teaser__icon {
      width: 28px;
      height: 28px;
    }
    :host-context([data-formfactor^="iview"]) .teaser__name {
      font-size: 12px;
    }
    :host-context([data-formfactor^="iview"]) .teaser__sub {
      display: none;
    }
  `;

  static override properties = {
    teaserIndex: { state: true },
  };

  declare teaserIndex: number;
  #rotateTimer?: number;

  constructor() {
    super();
    this.teaserIndex = 0;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Rotate the highlighted teaser every 4s (visual emphasis cycles).
    this.#rotateTimer = window.setInterval(() => {
      this.teaserIndex = (this.teaserIndex + 1) % TEASERS.length;
    }, 4000);
    (["click", "touchstart", "keydown", "pointerdown"] as const).forEach((evt) =>
      window.addEventListener(evt, this.#advance, { passive: true }),
    );
    // Vendor card-tap hook (future SDK integration).
    if ((window as unknown as { __SYNKROS_CARD_TAP__?: unknown }).__SYNKROS_CARD_TAP__) {
      window.addEventListener("synkros-card-tap", this.#advance);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.#rotateTimer) clearInterval(this.#rotateTimer);
    (["click", "touchstart", "keydown", "pointerdown"] as const).forEach((evt) =>
      window.removeEventListener(evt, this.#advance),
    );
    window.removeEventListener("synkros-card-tap", this.#advance);
  }

  #advance = (): void => {
    this.dispatchEvent(new CustomEvent("kiosk-attract-dismissed", { bubbles: true, composed: true }));
    navigate(`/hub${location.search}`);
  };

  /** EGM deployments front a "Return to Game" affordance (channel-aware, option a). */
  private get isEgm(): boolean {
    return new URLSearchParams(location.search).get("channel") === "egm";
  }

  #returnToGame = (e: Event): void => {
    e.stopPropagation();
    // Stub for the demo — a real EGM integration hands control back to the game host.
    this.dispatchEvent(new CustomEvent("egm-return-to-game", { bubbles: true, composed: true }));
  };

  override render(): TemplateResult {
    const egm = this.isEgm;
    return html`
      <div class="root">
        ${egm
          ? html`<button class="return-game" @click=${this.#returnToGame}>↩ Return to Game</button>`
          : ""}
        <div class="clock ${egm ? "clock--egm" : ""}">
          <div class="clock__big">2:48 PM</div>
          <div class="clock__sub">Sun · Jun 7 · 2026</div>
        </div>
        <div class="brand">
          <div class="logo">A</div>
          <div>
            <div class="brand__name">Arcade Rewards</div>
            <div class="brand__sub">Las Vegas · Floor 2 · Kiosk #14</div>
          </div>
        </div>

        <div class="center">
          <div class="display">
            <span class="eyebrow">Welcome to</span>
            <h1 class="headline">
              <span class="headline__l1">Arcade</span><br />
              <span class="headline__l2">Rewards</span>
            </h1>
          </div>

          <div class="prompt">
            <div class="card">
              <div class="card__halo"></div>
              <div class="card__body">
                <div class="card__top">
                  <div class="card__chip"></div>
                  <span class="card__type">Member Card</span>
                </div>
                <div>
                  <div class="card__tier">Platinum</div>
                  <div class="card__num">•••• •••• •••• 7842</div>
                </div>
              </div>
              <div class="card__tap">${chevronIcon}</div>
            </div>

            <div class="cta">
              <h2 class="cta__head">Tap to Start</h2>
              <p class="cta__sub">Earn rewards · Claim prizes · Have fun</p>
            </div>
          </div>
        </div>

        <div class="strip">
          <div class="strip__head">
            <span class="strip__label">Active This Week</span>
            <div class="strip__rule"></div>
          </div>
          <div class="teasers">
            ${TEASERS.map(
              (t, i) => html`<div
                class="teaser ${i === this.teaserIndex ? "teaser--active" : ""}"
                style="--teaser-tint:${t.tint}"
              >
                <div class="teaser__icon">${t.emoji}</div>
                <div>
                  <div class="teaser__name">${t.name}</div>
                  <div class="teaser__sub">${t.sub}</div>
                </div>
              </div>`,
            )}
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("kiosk-attract")) {
  customElements.define("kiosk-attract", KioskAttract);
}

declare global {
  interface HTMLElementTagNameMap {
    "kiosk-attract": KioskAttract;
  }
}
