// <ttd-hub> — host-app vendor dashboard shown after the attract screen (480×234,
// casino-loud). Mirrors the SYNKROS "post-card dashboard" (SS1 · 01B): three system
// tiles (Account / Tier / Promos — vendor chrome, non-interactive in this demo) plus
// the two gold "ours" tiles (Orders + Prize Quest) that launch the embedded flow.
// NOT a @pq/widget; inherits --cl-* from :root. LIT 3, no decorators.
import { LitElement, css, html, type TemplateResult } from "lit";
import { navigate } from "@pq/router";
import { getActiveTenant } from "@pq/tenants";

// Arcade Pre-B tile icons (Lucide-style, copied from prize-quest-ttd-arcade.html).
const aUser = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  <circle cx="12" cy="7" r="4" />
</svg>`;
const aStar = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
</svg>`;
const aTag = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
  <line x1="7" y1="7" x2="7.01" y2="7" />
</svg>`;
const aPackage = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path
    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
  />
  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
  <line x1="12" y1="22.08" x2="12" y2="12" />
</svg>`;
const aAward = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="8" r="6" />
  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
</svg>`;
const aLogout = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
  <polyline points="16 17 21 12 16 7" />
  <line x1="21" y1="12" x2="9" y2="12" />
</svg>`;

/** Per-tile category tint inline-style strings (arcade Pre-B). */
const TILE_TINTS: Record<string, string> = {
  blue: "--tile-tint: var(--cat-blue, #3d8bf5); --tile-tint-bg: rgba(61,139,245,0.18); --tile-tint-bright: var(--cat-blue-bright, #6fb2ff);",
  pink: "--tile-tint: var(--cat-pink, #ff3fa4); --tile-tint-bg: rgba(255,63,164,0.22); --tile-tint-bright: var(--cat-pink-bright, #ff6fb5);",
  orange:
    "--tile-tint: var(--cat-orange, #ff8c2c); --tile-tint-bg: rgba(255,140,44,0.18); --tile-tint-bright: var(--cat-orange-bright, #ffb066);",
  purple:
    "--tile-tint: var(--cat-purple, #8e47e8); --tile-tint-bg: rgba(142,71,232,0.18); --tile-tint-bright: var(--cat-purple-bright, #b47bff);",
  display:
    "--tile-tint: var(--arc-display, #ffd93d); --tile-tint-bg: rgba(255,217,61,0.15); --tile-tint-bright: var(--arc-display-bright, #ffee5c);",
  green:
    "--tile-tint: var(--cat-green, #34d670); --tile-tint-bg: rgba(52,214,112,0.15); --tile-tint-bright: var(--cat-green-bright, #5be389);",
  teal: "--tile-tint: var(--cat-teal, #2dd4bf); --tile-tint-bg: rgba(45,212,191,0.15); --tile-tint-bright: var(--cat-teal-bright, #5eead4);",
  danger:
    "--tile-tint: var(--arc-danger, #ff4d6d); --tile-tint-bg: rgba(255,77,109,0.12); --tile-tint-bright: #ff8095; opacity: 0.85;",
};

const accountIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <circle cx="12" cy="8" r="4" />
  <path d="M4 21v-1a6 6 0 0 1 12 0v1" />
</svg>`;
const tierIcon = html`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <polygon
    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
  />
</svg>`;
const promosIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <path d="M3 11l16-5v12L3 14v-3z" />
  <path d="M7 18v2a1 1 0 0 1-2 0v-2" />
  <line x1="19" y1="9" x2="22" y2="9" />
</svg>`;
const ordersIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <path d="M6 9h12l-1 12H7L6 9z" />
  <path d="M9 9V6a3 3 0 0 1 6 0v3" />
</svg>`;
const giftIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <rect x="3" y="9" width="18" height="12" rx="1" />
  <path d="M12 9v12M3 13h18M12 9S10 4 7.5 5.5 9 9 12 9ZM12 9s2-5 4.5-3.5S15 9 12 9Z" />
</svg>`;
const powerIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <path d="M12 3v9" />
  <path d="M6.4 6.4a8 8 0 1 0 11.2 0" />
</svg>`;

export class TtdHub extends LitElement {
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
      background: linear-gradient(180deg, var(--cl-black, #06030a), var(--cl-noir, #100612));
      color: var(--cl-cream, #f5f1e8);
    }
    /* header bar — brand | player · points · sign-out */
    .top {
      flex: 0 0 auto;
      height: 34px;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      background: linear-gradient(180deg, rgba(255, 182, 39, 0.14), transparent);
      border-bottom: 1px solid var(--cl-burgundy, #4a152e);
      font-family: var(--cl-font-mono, monospace);
      font-size: 9px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
    .id {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }
    .wordmark {
      font-family: var(--cl-font-display, sans-serif);
      font-size: 13px;
      letter-spacing: 0.06em;
      color: var(--cl-cream, #f5f1e8);
    }
    .sep {
      color: var(--cl-text-faint, #7a7268);
    }
    .player {
      color: var(--cl-text-dim, #c5beb0);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 0 0 auto;
    }
    .pts {
      color: var(--cl-gold-bright, #ffd55c);
      font-weight: 700;
    }
    .signout-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      padding: 0;
      border: 1px solid var(--cl-burgundy, #4a152e);
      border-radius: 5px;
      background: transparent;
      color: var(--cl-text-dim, #c5beb0);
      cursor: pointer;
      transition:
        color 160ms ease,
        border-color 160ms ease;
    }
    .signout-btn:hover {
      color: var(--cl-gold-bright, #ffd55c);
      border-color: var(--cl-gold-deep, #c68a1a);
    }
    .signout-btn svg {
      width: 12px;
      height: 12px;
    }
    /* tile grid — system row (3) + ours row (Orders 1fr / Prize Quest 2fr) */
    .grid {
      flex: 1;
      min-height: 0;
      padding: 6px 8px;
      display: grid;
      grid-template-rows: 1fr 1fr;
      gap: 6px;
    }
    .row {
      display: grid;
      gap: 6px;
      min-height: 0;
    }
    .row--sys {
      grid-template-columns: 1fr 1fr 1fr;
    }
    .row--ours {
      grid-template-columns: 1fr 2fr;
    }
    .tile {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      border-radius: 6px;
      font: inherit;
      color: inherit;
      overflow: hidden;
    }
    .tile svg {
      width: 22px;
      height: 22px;
    }
    .tile-name {
      font-family: var(--cl-font-display, sans-serif);
      font-size: 13px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    /* system tiles — vendor chrome (muted, non-interactive in this demo) */
    .tile--sys {
      background: linear-gradient(180deg, var(--cl-wine-elev, #320e20), var(--cl-wine, #1f0815));
      border: 1px solid var(--cl-burgundy, #4a152e);
      color: var(--cl-cream, #f5f1e8);
      cursor: default;
    }
    .tile--sys .tile-name {
      color: var(--cl-cream, #f5f1e8);
    }
    /* "ours" tiles — gold marquee buttons that launch the embedded flow */
    .tile--ours {
      background: linear-gradient(
        180deg,
        var(--cl-gold-bright, #ffd55c) 0%,
        var(--cl-gold, #ffb627) 55%,
        var(--cl-gold-deep, #c68a1a) 100%
      );
      border: 1px solid var(--cl-gold, #ffb627);
      color: var(--cl-black, #06030a);
      cursor: pointer;
      box-shadow: 0 0 12px var(--cl-gold-glow, rgba(255, 182, 39, 0.45));
    }
    .tile--ours .tile-name {
      color: var(--cl-black, #06030a);
      font-weight: 400;
    }
    .badge {
      position: absolute;
      top: 6px;
      right: 6px;
      font-family: var(--cl-font-mono, monospace);
      font-size: 8px;
      letter-spacing: 0.08em;
      color: var(--cl-cream, #f5f1e8);
      background: var(--cl-red, #e63946);
      padding: 2px 6px;
      border-radius: 999px;
    }
    @media (prefers-reduced-motion: no-preference) {
      .tile--hero {
        animation: cl-tile-pulse 2.4s ease-in-out infinite;
      }
    }
    @keyframes cl-tile-pulse {
      0%,
      100% {
        box-shadow: 0 0 8px var(--cl-gold-glow, rgba(255, 182, 39, 0.45));
      }
      50% {
        box-shadow: 0 0 20px var(--cl-gold-glow, rgba(255, 182, 39, 0.55));
      }
    }

    /* ===================== ARCADE (Station Arcade · Pre-B) =====================
       8-tile 4×2 hub mirroring prize-quest-ttd-arcade.html stage Pre-B. */
    .aroot {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      color: var(--arc-text, #fff);
      font-family: var(--arc-font-body, "Inter", sans-serif);
      background:
        radial-gradient(ellipse at 20% 0%, rgba(142, 71, 232, 0.3), transparent 55%),
        radial-gradient(ellipse at 80% 100%, rgba(255, 63, 164, 0.18), transparent 60%),
        linear-gradient(
          160deg,
          var(--arc-bg-deep, #15042e) 0%,
          var(--arc-bg-base, #1f0b3e) 50%,
          var(--arc-bg-mid, #2a1454) 100%
        );
    }
    .scr-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 10px;
      border-bottom: 1px solid var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
      background: linear-gradient(180deg, rgba(15, 4, 46, 0.65), transparent);
      flex-shrink: 0;
      min-height: 26px;
    }
    .scr-head__brand {
      font-family: var(--arc-font-display, sans-serif);
      font-size: 11px;
      color: var(--arc-cream, #f5efe0);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .scr-head__pts {
      display: flex;
      align-items: center;
      gap: 4px;
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      color: var(--arc-display, #ffd93d);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .scr-head__pts strong {
      color: var(--arc-display-bright, #ffee5c);
      font-family: var(--arc-font-display, sans-serif);
      font-size: 10px;
    }
    .scr-body {
      flex: 1;
      min-height: 0;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .ahub-greet {
      font-family: var(--arc-font-display, sans-serif);
      font-size: 11px;
      color: var(--arc-cream, #f5efe0);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 1px 0;
    }
    .ahub-greet span {
      background: linear-gradient(
        135deg,
        var(--arc-display-bright, #ffee5c),
        var(--cat-pink, #ff3fa4)
      );
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hub-tiles {
      display: grid;
      /* 6 tiles in 3×2 (Comp $/Events dropped) — wider tiles give the name + sub
         room to read on the dense 480×234 panel. */
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1fr 1fr;
      gap: 5px;
      flex: 1;
      min-height: 0;
    }
    .hub-tile {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 4px 5px;
      /* Tile body flows from the tenant's elevated-surface tokens so it re-themes
         (navy on Resort, purple on arcade-demo) instead of a hardcoded violet. */
      background: linear-gradient(
        160deg,
        var(--arc-bg-glass, rgba(60, 25, 110, 0.55)),
        var(--arc-bg-glass-2, rgba(30, 10, 60, 0.85))
      );
      border: 1px solid var(--arc-hairline-2, rgba(180, 130, 240, 0.35));
      border-radius: var(--arc-r-md, 6px);
      cursor: pointer;
      text-align: center;
      overflow: hidden;
      font: inherit;
      color: inherit;
    }
    .hub-tile::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--tile-tint, var(--cat-purple, #8e47e8));
    }
    .hub-tile--hero {
      background: linear-gradient(160deg, rgba(255, 63, 164, 0.22), rgba(40, 15, 75, 0.92));
      border: 1.5px solid var(--cat-pink, #ff3fa4);
      box-shadow: 0 0 10px var(--cat-pink-glow, rgba(255, 63, 164, 0.55));
    }
    .hub-tile--hero::before {
      height: 3px;
      background: linear-gradient(90deg, var(--cat-pink, #ff3fa4), var(--arc-display, #ffd93d));
    }
    .hub-tile__icon {
      width: 26px;
      height: 26px;
      border-radius: 5px;
      display: grid;
      place-items: center;
      background: var(--tile-tint-bg, rgba(142, 71, 232, 0.18));
      border: 1px solid var(--tile-tint, var(--cat-purple, #8e47e8));
      color: var(--tile-tint-bright, var(--cat-purple-bright, #b47bff));
    }
    .hub-tile__icon svg {
      width: 16px;
      height: 16px;
    }
    .hub-tile__name {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 800);
      font-size: 11px;
      color: var(--arc-cream, #f5efe0);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      line-height: 1.05;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .hub-tile--hero .hub-tile__name {
      background: linear-gradient(
        135deg,
        var(--arc-display-bright, #ffee5c),
        var(--cat-pink-bright, #ff6fb5)
      );
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    /* tile subtitle (ref kiosk hub-tile__sub) — tiny dim line, clamped to 2 rows
       so the long copy never overflows the dense 480×234 tile. */
    .hub-tile__sub {
      font-family: var(--arc-font-body, "Inter", sans-serif);
      font-size: 9px;
      font-weight: 600;
      line-height: 1.3;
      color: var(--arc-cream, #f5efe0);
      letter-spacing: 0.01em;
      max-width: 100%;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .hub-tile--hero .hub-tile__sub {
      color: var(--arc-text-dim, #d0bfec);
    }
    .hub-tile__badge {
      position: absolute;
      top: 2px;
      right: 2px;
      padding: 1px 4px;
      background: var(--arc-success, #34d670);
      color: var(--arc-bg-deep, #15042e);
      font-family: var(--arc-font-display, sans-serif);
      font-size: 6px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border-radius: 999px;
      box-shadow: 0 0 4px rgba(52, 214, 112, 0.6);
      line-height: 1.2;
    }
    @media (prefers-reduced-motion: no-preference) {
      .hub-tile--hero {
        animation: pulse-glow-pink 2.4s ease-in-out infinite;
      }
    }
  `;

  static override properties = {
    claimableCount: { type: Number },
  };

  declare claimableCount: number;

  constructor() {
    super();
    // Demo default: one ready campaign (the VIP Game Day Quest hero).
    this.claimableCount = 1;
  }

  #go(path: string): void {
    navigate(`${path}${location.search}`);
  }

  #signOut = (): void => {
    this.dispatchEvent(new CustomEvent("ttd-session-end", { bubbles: true, composed: true }));
    this.#go("/attract");
  };

  /** Active tenant runs the arcade theme → render the arcade 8-tile Pre-B hub. */
  private get arcade(): boolean {
    return getActiveTenant()?.theme.mode === "arcade";
  }

  override render(): TemplateResult {
    return this.arcade ? this.renderArcade() : this.renderCasino();
  }

  /** Arcade hub (Station Arcade) — 8-tile 4×2 grid, mirrors ttd-arcade Pre-B. */
  private renderArcade(): TemplateResult {
    const brand = getActiveTenant()?.name ?? "Station Arcade";
    const tiles: Array<{
      name: string;
      sub: string;
      icon: TemplateResult;
      tint: string;
      hero?: boolean;
      go: () => void;
    }> = [
      {
        name: "My Account",
        sub: "Balance · statements · profile",
        icon: aUser,
        tint: "blue",
        go: () => {},
      },
      {
        name: "Prize Quest",
        sub: "Campaigns · prizes · claims",
        icon: aStar,
        tint: "pink",
        hero: true,
        go: () => this.#go("/"),
      },
      {
        name: "Promotions",
        sub: "Free play · multipliers · offers",
        icon: aTag,
        tint: "orange",
        go: () => {},
      },
      {
        name: "Order History",
        sub: "Past prizes · tracking · receipts",
        icon: aPackage,
        tint: "purple",
        go: () => this.#go("/orders"),
      },
      {
        name: "Tier Status",
        sub: "Platinum · benefits · next tier",
        icon: aAward,
        tint: "display",
        go: () => {},
      },
      {
        name: "Sign Out",
        sub: "End session · return to attract",
        icon: aLogout,
        tint: "danger",
        go: this.#signOut,
      },
    ];
    return html`
      <div class="aroot">
        <div class="scr-head">
          <div class="scr-head__brand">${brand}</div>
          <div class="scr-head__pts"><strong>142,580</strong> pts</div>
        </div>
        <div class="scr-body">
          <div class="ahub-greet">Hi <span>James</span> · what's next?</div>
          <div class="hub-tiles">
            ${tiles.map(
              (t) =>
                html`<button
                  class="hub-tile ${t.hero ? "hub-tile--hero" : ""}"
                  type="button"
                  style=${TILE_TINTS[t.tint]}
                  @click=${t.go}
                >
                  <div class="hub-tile__icon">${t.icon}</div>
                  <div class="hub-tile__name">${t.name}</div>
                  <div class="hub-tile__sub">${t.sub}</div>
                  ${t.hero && this.claimableCount > 0
                    ? html`<span class="hub-tile__badge">${this.claimableCount} Ready</span>`
                    : ""}
                </button>`,
            )}
          </div>
        </div>
      </div>
    `;
  }

  /** Casino-loud hub (Station Casinos) — unchanged from Session 24c. */
  private renderCasino(): TemplateResult {
    return html`
      <div class="root">
        <div class="top">
          <div class="id">
            <span class="wordmark">Station Casinos</span>
            <span class="sep">|</span>
            <span class="player">Jordan Vega</span>
          </div>
          <div class="right">
            <span class="pts">12,540 pts</span>
            <button
              class="signout-btn"
              type="button"
              title="Sign out"
              aria-label="Sign out"
              @click=${this.#signOut}
            >
              ${powerIcon}
            </button>
          </div>
        </div>
        <div class="grid">
          <div class="row row--sys">
            <button class="tile tile--sys" type="button" title="Vendor system (demo)">
              ${accountIcon}<span class="tile-name">Account</span>
            </button>
            <button class="tile tile--sys" type="button" title="Vendor system (demo)">
              ${tierIcon}<span class="tile-name">Tier</span>
            </button>
            <button class="tile tile--sys" type="button" title="Vendor system (demo)">
              ${promosIcon}<span class="tile-name">Promos</span>
            </button>
          </div>
          <div class="row row--ours">
            <button class="tile tile--ours" type="button" @click=${() => this.#go("/orders")}>
              ${ordersIcon}<span class="tile-name">Orders</span>
            </button>
            <button class="tile tile--ours tile--hero" type="button" @click=${() => this.#go("/")}>
              ${this.claimableCount > 0
                ? html`<span class="badge">${this.claimableCount} Ready</span>`
                : ""}
              ${giftIcon}<span class="tile-name">Prize Quest</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("ttd-hub")) {
  customElements.define("ttd-hub", TtdHub);
}

declare global {
  interface HTMLElementTagNameMap {
    "ttd-hub": TtdHub;
  }
}
