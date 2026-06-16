// <kiosk-hub> — host-app Account Hub shown after the attract screen (1920×1080,
// arcade). 8 tiles in a 4×2 grid (2×4 in portrait via [data-orientation]); Prize
// Quest is the glowing hero tile. NOT a @pq/widget — app chrome. Arcade tokens
// cascade in from <html data-pq-mode="arcade">. Spec: Section 8 + reference Pre-B.
import { LitElement, css, html, type TemplateResult } from "lit";
import { navigate } from "@pq/router";
import { getClaimableCount, patron } from "@pq/mock-data";
// The hub header reuses the kiosk screen-header chrome (brand · tier · points · time).
import "@pq/pq-screen-header";

const icons = {
  account: html`<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>`,
  star: html`<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" /></svg>`,
  tag: html`<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>`,
  package: html`<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>`,
  award: html`<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>`,
  dollar: html`<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>`,
  calendar: html`<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>`,
  logout: html`<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>`,
};

const chevron = html`<svg class="hub-tile__chev" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>`;
const check = html`<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>`;

interface Tile {
  name: string;
  sub: string;
  icon: TemplateResult;
  tint: string;
  tintBg: string;
  tintBright: string;
  target: string;
  hero?: boolean;
  exit?: boolean;
  ghostBadge?: string;
}

export class KioskHub extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .root {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      color: var(--arc-cream, #f5efe0);
      font-family: var(--arc-font-body, "Inter", sans-serif);
    }
    .body {
      flex: 1;
      min-height: 0;
      padding: 44px 56px;
      display: flex;
      flex-direction: column;
      gap: 36px;
      position: relative;
      z-index: 2;
    }
    .greeting {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .greeting__eyebrow {
      font-family: var(--arc-font-mono, monospace);
      font-size: 13px;
      color: var(--arc-display, #ffd93d);
      letter-spacing: 0.22em;
      text-transform: uppercase;
      font-weight: 700;
    }
    .greeting__title {
      font-family: var(--arc-font-display, "Manrope", sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 72px;
      line-height: 0.95;
      margin: 0;
      color: var(--arc-cream, #f5efe0);
      text-transform: uppercase;
      letter-spacing: 0.01em;
    }
    .greeting__name {
      color: var(--arc-display, #ffd93d);
    }
    .greeting__sub {
      font-size: 18px;
      color: var(--arc-cream, #f5efe0);
      font-weight: 500;
      margin: 0;
    }
    .hub-tile-grid {
      display: grid;
      /* 6 tiles in a 3×2 grid (Comp$/Events removed) — wider tiles give the name +
         sub label more room, which fixes the cramped/illegible sub text. */
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      flex: 1;
    }
    .hub-tile {
      position: relative;
      /* Tenant-aware surface (was hardcoded purple): darker tile = stronger contrast for
         the tile name + sub text, and it tracks the active tenant palette. */
      background: linear-gradient(160deg, var(--arc-bg-mid, #2a1454), var(--arc-bg-deep, #15042e));
      border: 1px solid var(--arc-hairline-2, rgba(140, 100, 200, 0.35));
      border-radius: var(--arc-r-2xl, 36px);
      padding: 28px 24px 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      cursor: pointer;
      text-align: left;
      color: var(--arc-cream, #f5efe0);
      font-family: var(--arc-font-body, "Inter", sans-serif);
      overflow: hidden;
      min-height: 220px;
      transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
    }
    .hub-tile::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: var(--tile-tint, var(--cat-purple, #8e47e8));
    }
    .hub-tile:hover {
      transform: translateY(-3px);
      border-color: var(--tile-tint, var(--cat-purple, #8e47e8));
      box-shadow: 0 0 24px var(--tile-tint-bg, rgba(142, 71, 232, 0.2)), 0 18px 40px rgba(0, 0, 0, 0.5);
    }
    .hub-tile__icon {
      width: 64px;
      height: 64px;
      border-radius: var(--arc-r-md, 12px);
      background: var(--tile-tint-bg, rgba(142, 71, 232, 0.18));
      border: 1px solid var(--tile-tint, var(--cat-purple, #8e47e8));
      display: grid;
      place-items: center;
      color: var(--tile-tint-bright, var(--cat-purple-bright, #b47bff));
    }
    .hub-tile__body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .hub-tile__name {
      font-family: var(--arc-font-display, "Manrope", sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 26px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: var(--arc-cream, #f5efe0);
      line-height: 1.1;
    }
    .hub-tile__sub {
      /* Bigger + bolder + brightest so it survives the 0.5 device scale (15px → ~7px
         rendered thin/gray was the real readability issue). */
      font-size: 18px;
      color: var(--arc-cream, #f5efe0);
      font-weight: 700;
      line-height: 1.45;
      letter-spacing: 0.01em;
    }
    .hub-tile__chev {
      position: absolute;
      bottom: 24px;
      right: 24px;
      color: var(--tile-tint-bright, var(--cat-purple-bright, #b47bff));
      opacity: 0.6;
      transition: transform 160ms ease, opacity 160ms ease;
    }
    .hub-tile:hover .hub-tile__chev {
      opacity: 1;
      transform: translateX(4px);
    }
    .hub-tile__badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      align-self: flex-start;
      padding: 6px 14px;
      border-radius: var(--arc-r-pill, 999px);
      background: var(--arc-success, #34d670);
      color: var(--arc-bg-deep, #15042e);
      font-family: var(--arc-font-display, "Manrope", sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 13px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      box-shadow: 0 0 16px rgba(52, 214, 112, 0.5);
    }
    .hub-tile__badge--ghost {
      background: var(--tile-tint-bg, rgba(142, 71, 232, 0.18));
      color: var(--tile-tint-bright, var(--cat-purple-bright, #b47bff));
      border: 1px solid var(--tile-tint, var(--cat-purple, #8e47e8));
      box-shadow: none;
      font-family: var(--arc-font-mono, monospace);
      font-size: 11px;
      letter-spacing: 0.16em;
      font-weight: 700;
    }
    .hub-tile--hero {
      background: linear-gradient(160deg, rgba(255, 63, 164, 0.2), rgba(40, 15, 75, 0.92));
      border: 2px solid var(--cat-pink, #ff3fa4);
      box-shadow: 0 0 32px var(--cat-pink-glow, rgba(255, 63, 164, 0.4)), 0 18px 40px rgba(0, 0, 0, 0.5);
    }
    .hub-tile--hero::before {
      height: 6px;
      background: linear-gradient(90deg, var(--cat-pink, #ff3fa4), var(--arc-display, #ffd93d));
    }
    .hub-tile--hero .hub-tile__name {
      background: linear-gradient(135deg, var(--arc-display-bright, #ffee5c), var(--cat-pink-bright, #ff6fb5));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hub-tile--hero:hover {
      transform: translateY(-4px);
      box-shadow: 0 0 48px var(--cat-pink-glow, rgba(255, 63, 164, 0.4)), 0 24px 50px rgba(0, 0, 0, 0.6);
    }
    .hub-tile--exit {
      opacity: 0.85;
    }

    /* Portrait (1080×1920): 2×4 grid; tiles size to content, no infinite stretch. */
    :host-context([data-orientation="portrait"]) .hub-tile-grid {
      grid-template-columns: 1fr 1fr;
      grid-auto-rows: minmax(220px, 1fr);
      align-content: start;
      flex: none;
      gap: 20px;
    }
    :host-context([data-orientation="portrait"]) .hub-tile {
      min-height: 220px;
      max-height: 280px;
    }

    @media (prefers-reduced-motion: no-preference) {
      .hub-tile--hero {
        animation: pulse-glow 3s ease-in-out infinite;
      }
    }
    @keyframes pulse-glow {
      0%,
      100% {
        box-shadow: 0 0 32px var(--cat-pink-glow, rgba(255, 63, 164, 0.4)), 0 18px 40px rgba(0, 0, 0, 0.5);
      }
      50% {
        box-shadow: 0 0 56px var(--cat-pink-glow, rgba(255, 63, 164, 0.4)), 0 18px 40px rgba(0, 0, 0, 0.5);
      }
    }

    /* ===== iVIEW (1024x600 + 800x480) — 4-col x 2-row tile grid, compact greeting =====
       DEVIATION from the spec's "2-col" grid: iVIEW panels are LANDSCAPE and short
       (600 / 480 tall), so a 2-col x 4-row grid runs taller than the screen and clips
       the bottom 2 tiles. A 4-col x 2-row grid fits all 8 tiles in both heights and
       uses the available width. (Acceptance: all 8 tiles visible, no cutoff.) */
    :host-context([data-formfactor^="iview"]) .body {
      padding: 16px;
      gap: 16px;
    }
    :host-context([data-formfactor^="iview"]) .greeting {
      gap: 4px;
    }
    :host-context([data-formfactor^="iview"]) .greeting__eyebrow {
      font-size: 10px;
    }
    :host-context([data-formfactor^="iview"]) .greeting__title {
      font-size: 32px;
      line-height: 1;
    }
    :host-context([data-formfactor^="iview"]) .greeting__sub {
      font-size: 11px;
    }
    :host-context([data-formfactor^="iview"]) .hub-tile-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    :host-context([data-formfactor^="iview"]) .hub-tile {
      padding: 12px 14px;
      gap: 8px;
      min-height: 100px;
      max-height: 140px;
    }
    :host-context([data-formfactor^="iview"]) .hub-tile::before {
      height: 3px;
    }
    :host-context([data-formfactor^="iview"]) .hub-tile__icon {
      width: 36px;
      height: 36px;
    }
    :host-context([data-formfactor^="iview"]) .hub-tile__icon svg {
      width: 22px;
      height: 22px;
    }
    :host-context([data-formfactor^="iview"]) .hub-tile__name {
      font-size: 14px;
    }
    :host-context([data-formfactor^="iview"]) .hub-tile__sub {
      font-size: 12px;
      line-height: 1.25;
      font-weight: 700;
    }
    :host-context([data-formfactor^="iview"]) .hub-tile__chev {
      width: 16px;
      height: 16px;
      bottom: 8px;
      right: 8px;
    }
    :host-context([data-formfactor^="iview"]) .hub-tile__badge {
      font-size: 10px;
      padding: 4px 8px;
    }
    /* TASK 7: iview-3 (800x480) shares iview-4 styling, with one small greeting
       trim — the shorter 480px panel keeps the 4-col x 2-row grid clearing the
       height once the expanded header is shrunk (see pq-screen-header iVIEW block).
       Tiles are NOT cramped here, so their content (icon · name · sub · badge) is
       not crowded. */
    :host-context([data-formfactor="iview-3"]) .greeting__title {
      font-size: 26px;
    }
  `;

  static override properties = {
    claimableCount: { state: true },
  };

  declare claimableCount: number;

  constructor() {
    super();
    this.claimableCount = 0;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.claimableCount = getClaimableCount();
  }

  #go(target: string): void {
    if (target === "stub") return; // operator-owned territory (no-op in the demo)
    navigate(`${target}${location.search}`);
  }

  private get tiles(): Tile[] {
    return [
      { name: "My Account", sub: "Balance · statements · profile", icon: icons.account, tint: "var(--cat-blue, #3d8bf5)", tintBg: "rgba(61, 139, 245, 0.18)", tintBright: "var(--cat-blue-bright, #6fb2ff)", target: "stub" },
      { name: "Prize Quest", sub: "Campaigns · prizes · claims", icon: icons.star, tint: "var(--cat-pink, #ff3fa4)", tintBg: "rgba(255, 63, 164, 0.22)", tintBright: "var(--cat-pink-bright, #ff6fb5)", target: "/campaigns", hero: true },
      { name: "Promotions", sub: "Free play · multipliers · offers", icon: icons.tag, tint: "var(--cat-orange, #ff8c2c)", tintBg: "rgba(255, 140, 44, 0.18)", tintBright: "var(--cat-orange-bright, #ffae66)", target: "stub", ghostBadge: "3 Active" },
      { name: "Order History", sub: "Past prizes · tracking · receipts", icon: icons.package, tint: "var(--cat-purple, #8e47e8)", tintBg: "rgba(142, 71, 232, 0.18)", tintBright: "var(--cat-purple-bright, #b47bff)", target: "/orders" },
      { name: "Tier Status", sub: "Platinum · benefits · next tier", icon: icons.award, tint: "var(--arc-display, #ffd93d)", tintBg: "rgba(255, 217, 61, 0.15)", tintBright: "var(--arc-display-bright, #ffee5c)", target: "stub" },
      { name: "Sign Out", sub: "End session · return to attract", icon: icons.logout, tint: "var(--arc-danger, #ff4d6d)", tintBg: "rgba(255, 77, 109, 0.12)", tintBright: "#ff8095", target: "/attract", exit: true },
    ];
  }

  override render(): TemplateResult {
    return html`
      <div class="root">
        <pq-screen-header profile="expanded" title="Arcade Rewards"></pq-screen-header>
        <div class="body">
          <div class="greeting">
            <span class="greeting__eyebrow">Welcome back</span>
            <h1 class="greeting__title">
              Hi <span class="greeting__name">${patron.firstName}</span> · what's next?
            </h1>
            <p class="greeting__sub">
              Choose where you want to go. Session ends after 60 seconds of inactivity.
            </p>
          </div>
          <div class="hub-tile-grid">
            ${this.tiles.map((t) => this.renderTile(t))}
          </div>
        </div>
      </div>
    `;
  }

  private renderTile(t: Tile): TemplateResult {
    const showHeroBadge = t.hero && this.claimableCount > 0;
    return html`
      <button
        class="hub-tile ${t.hero ? "hub-tile--hero" : ""} ${t.exit ? "hub-tile--exit" : ""}"
        type="button"
        style="--tile-tint:${t.tint};--tile-tint-bg:${t.tintBg};--tile-tint-bright:${t.tintBright}"
        @click=${() => this.#go(t.target)}
      >
        <div class="hub-tile__icon">${t.icon}</div>
        <div class="hub-tile__body">
          <div class="hub-tile__name">${t.name}</div>
          <div class="hub-tile__sub">${t.sub}</div>
        </div>
        ${showHeroBadge
          ? html`<span class="hub-tile__badge">${check} ${this.claimableCount} Reward Ready</span>`
          : t.ghostBadge
            ? html`<span class="hub-tile__badge hub-tile__badge--ghost">${t.ghostBadge}</span>`
            : chevron}
      </button>
    `;
  }
}

if (!customElements.get("kiosk-hub")) {
  customElements.define("kiosk-hub", KioskHub);
}

declare global {
  interface HTMLElementTagNameMap {
    "kiosk-hub": KioskHub;
  }
}
