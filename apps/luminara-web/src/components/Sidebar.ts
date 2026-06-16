import { LitElement, css, html, nothing, svg, type TemplateResult } from "lit";
import { navigate } from "@pq/router";
import { $session } from "@pq/store";
import "./AuroraOrb";
import "./Avatar";

/** Inline Lucide-style stroke icons (no external dep — matches the widget convention). */
const icon = (paths: TemplateResult): TemplateResult => svg`
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const ICONS: Record<string, TemplateResult> = {
  home: icon(svg`<path d="M3 9.5 12 3l9 6.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>`),
  promotions: icon(svg`<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18"/><path d="M12 8v13"/><path d="M12 8S9 3 6.5 4.5 9 8 12 8Zm0 0s3-5 5.5-3.5S15 8 12 8Z"/>`),
  rewards: icon(svg`<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M17 5h3v2a3 3 0 0 1-3 3"/><path d="M7 5H4v2a3 3 0 0 0 3 3"/>`),
  activity: icon(svg`<path d="M3 12h4l3 8 4-16 3 8h4"/>`),
  account: icon(svg`<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`),
};

const MENU = icon(svg`<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>`);
const CLOSE = icon(svg`<path d="M6 6l12 12"/><path d="M18 6 6 18"/>`);

interface NavItem {
  path: string;
  label: string;
  key: keyof typeof ICONS;
}

const NAV: NavItem[] = [
  { path: "/home", label: "Home", key: "home" },
  { path: "/promotions", label: "Promotions", key: "promotions" },
  { path: "/rewards", label: "Rewards", key: "rewards" },
  { path: "/activity", label: "Activity", key: "activity" },
  { path: "/account", label: "Account", key: "account" },
];

const COLLAPSE_QUERY = "(max-width: 1023px)";

/**
 * `<lum-sidebar>` — Luminara navigation (§6.5). Aurora orb + wordmark on top, nav in
 * the middle (active item carries the 3px amber accent bar), monogram avatar + Sign
 * out at the bottom. ≥1024px: a 240px vertical rail. <1024px: collapses to a top app
 * bar (orb left, hamburger right) with a slide-in drawer. Set `activePath`.
 */
export class Sidebar extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    /* ---------------- vertical rail (≥1024px) ---------------- */
    .rail {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 100vh;
      width: 240px;
      padding: 24px 16px;
      background: var(--night);
      border-right: 1px solid var(--mist);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 8px 24px;
    }
    .wordmark {
      font-family: var(--font-display);
      font-weight: 500;
      font-size: 20px;
      letter-spacing: -0.02em;
      color: var(--cream);
    }
    nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border: none;
      background: transparent;
      border-radius: var(--r-sm);
      color: var(--cream-dim);
      font: 500 14px/1 var(--font-body);
      text-align: left;
      cursor: pointer;
      position: relative;
      transition: color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
    }
    .nav-item:hover {
      color: var(--cream);
      background: var(--hover-tint);
    }
    .nav-item.is-active {
      color: var(--amber);
    }
    .nav-item.is-active::before {
      content: "";
      position: absolute;
      left: 0;
      top: 12px;
      bottom: 12px;
      width: 3px;
      border-radius: 2px;
      background: var(--amber);
    }
    .nav-item:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }
    .nav-item svg {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
    }
    .footer {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 8px 4px;
      border-top: 1px solid var(--mist);
      margin-top: 16px;
    }
    .who {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .who .name {
      font: 500 13px/1.2 var(--font-body);
      color: var(--cream);
    }
    .signout {
      border: none;
      background: transparent;
      padding: 0;
      color: var(--cream-mute);
      font: 500 12px/1.3 var(--font-body);
      cursor: pointer;
      text-align: left;
      transition: color var(--dur-fast) var(--ease);
    }
    .signout:hover {
      color: var(--rose);
    }
    .signout:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
      border-radius: var(--r-xs);
    }

    /* ---------------- top app bar + drawer (<1024px) ---------------- */
    .appbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 16px;
      background: var(--night);
      border-bottom: 1px solid var(--mist);
      position: sticky;
      top: 0;
      z-index: 30;
    }
    .appbar .brand {
      padding: 0;
    }
    .hamburger {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border: 1px solid var(--mist);
      border-radius: var(--r-sm);
      background: transparent;
      color: var(--cream);
      cursor: pointer;
    }
    .hamburger svg {
      width: 20px;
      height: 20px;
    }
    .hamburger:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }
    .backdrop {
      position: fixed;
      inset: 0;
      background: var(--backdrop);
      z-index: 40;
      animation: fade var(--dur-base) var(--ease);
    }
    .drawer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 260px;
      max-width: 80vw;
      z-index: 41;
      animation: slide-in var(--dur-base) var(--ease);
    }
    .drawer .rail {
      min-height: 100vh;
      border-right: 1px solid var(--mist);
      box-shadow: var(--shadow-lg);
    }
    @keyframes fade {
      from {
        opacity: 0;
      }
    }
    @keyframes slide-in {
      from {
        transform: translateX(-100%);
      }
    }
  `;

  static override properties = {
    activePath: { type: String },
    _collapsed: { state: true },
    _drawerOpen: { state: true },
  };

  declare activePath: string;
  declare _collapsed: boolean;
  declare _drawerOpen: boolean;

  #mql?: MediaQueryList;
  #onMedia = (e: MediaQueryListEvent | MediaQueryList): void => {
    this._collapsed = e.matches;
    if (!this._collapsed) this._drawerOpen = false;
  };

  constructor() {
    super();
    this.activePath = "/home";
    this._collapsed = false;
    this._drawerOpen = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#mql = window.matchMedia(COLLAPSE_QUERY);
    this._collapsed = this.#mql.matches;
    this.#mql.addEventListener("change", this.#onMedia);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#mql?.removeEventListener("change", this.#onMedia);
  }

  #go(path: string): void {
    this._drawerOpen = false;
    navigate(path);
  }

  #signOut(): void {
    this._drawerOpen = false;
    $session.set(null);
    navigate("/signin");
  }

  #renderRail(): TemplateResult {
    return html`
      <div class="rail">
        <div class="brand">
          <lum-aurora-orb .size=${32}></lum-aurora-orb>
          <span class="wordmark">Luminara</span>
        </div>

        <nav aria-label="Primary">
          ${NAV.map(
            (item) => html`<button
              class="nav-item ${this.activePath === item.path ? "is-active" : ""}"
              aria-current=${this.activePath === item.path ? "page" : "false"}
              @click=${() => this.#go(item.path)}
            >
              ${ICONS[item.key]}<span>${item.label}</span>
            </button>`,
          )}
        </nav>

        <div class="footer">
          <lum-avatar monogram="M" .size=${40}></lum-avatar>
          <div class="who">
            <span class="name">Marcus</span>
            <button class="signout" @click=${() => this.#signOut()}>Sign out</button>
          </div>
        </div>
      </div>
    `;
  }

  override render(): TemplateResult {
    if (!this._collapsed) return this.#renderRail();

    return html`
      <div class="appbar">
        <div class="brand">
          <lum-aurora-orb .size=${32}></lum-aurora-orb>
          <span class="wordmark">Luminara</span>
        </div>
        <button
          class="hamburger"
          aria-label="Open navigation"
          aria-expanded=${this._drawerOpen ? "true" : "false"}
          @click=${() => (this._drawerOpen = true)}
        >
          ${MENU}
        </button>
      </div>
      ${this._drawerOpen
        ? html`<div class="backdrop" @click=${() => (this._drawerOpen = false)}></div>
            <div class="drawer" role="dialog" aria-label="Navigation">
              <button
                class="hamburger"
                style="position:absolute;top:16px;right:-56px"
                aria-label="Close navigation"
                @click=${() => (this._drawerOpen = false)}
              >
                ${CLOSE}
              </button>
              ${this.#renderRail()}
            </div>`
        : nothing}
    `;
  }
}

if (!customElements.get("lum-sidebar")) {
  customElements.define("lum-sidebar", Sidebar);
}

declare global {
  interface HTMLElementTagNameMap {
    "lum-sidebar": Sidebar;
  }
}
