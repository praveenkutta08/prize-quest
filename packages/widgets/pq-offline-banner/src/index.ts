import { LitElement, html, nothing, type TemplateResult } from "lit";
import { bindAtom, $isOnline } from "@pq/store";
import { styles } from "./styles";
import type { OfflineState } from "./types";

const wifiOff = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 1l22 22M16.7 11.1A6 6 0 0 1 19 13M5 13a10 10 0 0 1 4-2.5M2 8.8a16 16 0 0 1 4.5-2.7M12 20h.01" /></svg>`;
const wifiOn = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M2 8.8a16 16 0 0 1 20 0M12 20h.01" /></svg>`;

const DEFAULT_TEXT: Record<OfflineState, TemplateResult> = {
  offline: html`<strong>You're offline</strong> · showing cached data`,
  reconnected: html`<strong>Back online</strong> · syncing your progress…`,
};

/**
 * `<pq-offline-banner>` — connection-state banner. `offline` is a gold warning with a
 * Retry button (fires `pq-retry`); `reconnected` is an emerald confirmation that slides
 * in. `role="status"` for assistive tech.
 *
 * Props: `state` (offline|reconnected), `message?`, `showRetry` (default true).
 */
export class PqOfflineBanner extends LitElement {
  static override styles = styles;

  static override properties = {
    state: { type: String, reflect: true },
    message: { type: String },
    showRetry: { type: Boolean },
    online: { attribute: false },
  };

  declare state: OfflineState;
  declare message?: string;
  declare showRetry: boolean;
  /** Store-driven connection state. `undefined` = store untouched → use props only. */
  declare online?: boolean;

  constructor() {
    super();
    this.state = "offline";
    this.showRetry = true;
    // Listen for *changes* only (not the initial value) so Storybook/tests, which
    // never touch the store, keep rendering from the `state` prop. A drop to offline
    // and the recovery back to online both drive `state` here.
    bindAtom(
      this,
      $isOnline,
      (value, host) => {
        const self = host as PqOfflineBanner;
        if (self.online === false && value === true) self.state = "reconnected";
        else if (value === false) self.state = "offline";
        self.online = value;
      },
      { immediate: false },
    );
  }

  override render(): TemplateResult {
    // When the store says we're online, hide — unless we're showing the brief
    // "back online" confirmation. (No store opinion yet → render from props.)
    if (this.online === true && this.state !== "reconnected") return html``;

    const offline = this.state === "offline";
    return html`
      <div class="banner">
        <span class="icon">${offline ? wifiOff : wifiOn}</span>
        <span class="text">${this.message ?? DEFAULT_TEXT[this.state]}</span>
        ${offline && this.showRetry
          ? html`<button class="retry" @click=${this.handleRetry}>Retry</button>`
          : nothing}
      </div>
    `;
  }

  private handleRetry = (): void => {
    this.dispatchEvent(new CustomEvent("pq-retry", { bubbles: true, composed: true }));
  };

  protected override updated(): void {
    this.setAttribute("role", "status");
    this.setAttribute("aria-live", this.state === "offline" ? "assertive" : "polite");
  }
}

if (!customElements.get("pq-offline-banner")) {
  customElements.define("pq-offline-banner", PqOfflineBanner);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-offline-banner": PqOfflineBanner;
  }
}

export type { OfflineState } from "./types";
