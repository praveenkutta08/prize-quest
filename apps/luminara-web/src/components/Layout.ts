import { LitElement, css, html, type TemplateResult } from "lit";
import { getCurrentRoute, navigate, onRouteChange } from "@pq/router";
import { $session } from "@pq/store";
import "./Sidebar";
import "../screens/SignIn";
import "../screens/Home";
import "../screens/Promotions";
import "../screens/Rewards";
import "../screens/Activity";
import "../screens/Account";

/**
 * `<lum-layout>` — the top-level host shell. Subscribes to `@pq/router` (history
 * mode), enforces the session guard (any route but `/signin` requires `$session`),
 * and dispatches to the active screen. `/signin` renders full-bleed with no chrome;
 * every other route shows the sidebar + a centered main column.
 *
 * Prize Quest's embedded flow never reaches this router — Promotions manages it in
 * memory — so the host URL stays `/promotions` throughout, and browser Back from the
 * claim flow lands on the previous host route (`/home`).
 */
export class Layout extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    .shell {
      display: grid;
      grid-template-columns: 240px minmax(0, 1fr);
      min-height: 100vh;
    }
    main {
      min-width: 0;
    }
    .content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 48px;
    }
    @media (max-width: 1023px) {
      .shell {
        grid-template-columns: 1fr;
      }
      .content {
        padding: 32px 24px;
      }
    }
    @media (max-width: 640px) {
      .content {
        padding: 24px 16px;
      }
    }
  `;

  #unsubscribe?: () => void;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#unsubscribe = onRouteChange(() => this.#onRoute());
    this.#guard();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unsubscribe?.();
  }

  #onRoute(): void {
    this.#guard();
    this.requestUpdate();
  }

  /** Redirect to a sensible route, returning true if a redirect was issued. */
  #guard(): boolean {
    const { path } = getCurrentRoute();
    const authed = $session.get() != null;

    if (path === "/" || path === "") {
      navigate(authed ? "/home" : "/signin");
      return true;
    }
    if (!authed && path !== "/signin") {
      navigate("/signin");
      return true;
    }
    return false;
  }

  #screen(path: string): TemplateResult {
    switch (path) {
      case "/promotions":
        return html`<lum-promotions></lum-promotions>`;
      case "/rewards":
        return html`<lum-rewards></lum-rewards>`;
      case "/activity":
        return html`<lum-activity></lum-activity>`;
      case "/account":
        return html`<lum-account></lum-account>`;
      case "/home":
      default:
        return html`<lum-home></lum-home>`;
    }
  }

  override render(): TemplateResult {
    const { path } = getCurrentRoute();

    if (path === "/signin") {
      return html`<lum-signin></lum-signin>`;
    }

    return html`
      <div class="shell">
        <lum-sidebar .activePath=${path}></lum-sidebar>
        <main><div class="content">${this.#screen(path)}</div></main>
      </div>
    `;
  }
}

if (!customElements.get("lum-layout")) {
  customElements.define("lum-layout", Layout);
}

declare global {
  interface HTMLElementTagNameMap {
    "lum-layout": Layout;
  }
}
