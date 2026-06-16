import { LitElement, html, nothing, type TemplateResult } from "lit";
import type { Notification, NotificationType } from "@pq/mock-data";
import { bindAtom, $notifications } from "@pq/store";
import { styles } from "./styles";

const bellIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>`;

const TYPE_ICONS: Record<NotificationType, TemplateResult> = {
  campaign: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 11l18-5v12L3 14v-3Z" /><path d="M11.6 16.8a3 3 0 0 1-5.8-1.1V14" /></svg>`,
  time: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></svg>`,
  shipping: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>`,
  alert: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>`,
};

/**
 * `<pq-notifications>` — header bell with an unread dot and a dropdown tray. Items show
 * a type icon, title, body, time, optional CTA, and an unread emerald rail. "Mark all
 * read" fires `pq-notifications-read`; an item CTA fires `pq-notification-action`
 * (detail.id).
 *
 * Props: `notifications` (Notification[]), `open` (boolean).
 */
export class PqNotifications extends LitElement {
  static override styles = styles;

  static override properties = {
    notifications: { attribute: false },
    open: { type: Boolean, reflect: true },
  };

  declare notifications: Notification[];
  declare open: boolean;

  constructor() {
    super();
    this.notifications = [];
    this.open = false;
    // Store wins when populated; the `notifications` prop is the test fallback.
    bindAtom(this, $notifications, "notifications");
  }

  private get unreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  override render(): TemplateResult {
    return html`
      <button
        class="bell"
        aria-label=${`Notifications${this.unreadCount ? ` · ${this.unreadCount} unread` : ""}`}
        aria-expanded=${this.open}
        @click=${this.toggle}
      >
        ${bellIcon}
        ${this.unreadCount > 0 ? html`<span class="bell__dot"></span>` : nothing}
      </button>
      ${this.open ? this.renderTray() : nothing}
    `;
  }

  private renderTray(): TemplateResult {
    return html`
      <div class="tray" role="dialog" aria-label="Notifications">
        <div class="head">
          <h3 class="head__title">Notifications</h3>
          ${this.unreadCount > 0
            ? html`<button class="head__action" @click=${this.markAllRead}>Mark all read</button>`
            : nothing}
        </div>
        <div class="list">
          ${this.notifications.length === 0
            ? html`<p class="empty">You're all caught up.</p>`
            : this.notifications.map((n) => this.renderItem(n))}
        </div>
      </div>
    `;
  }

  private renderItem(n: Notification): TemplateResult {
    return html`
      <div class="item ${n.read ? "" : "item--unread"}">
        <span class="item__icon icon--${n.type}">${TYPE_ICONS[n.type]}</span>
        <div>
          <h4 class="item__title">${n.title}</h4>
          <p class="item__body">${n.body}</p>
          <span class="item__time">${n.time}</span>
          ${n.ctaLabel
            ? html`<button class="item__cta" @click=${() => this.action(n.id)}>${n.ctaLabel}</button>`
            : nothing}
        </div>
      </div>
    `;
  }

  private toggle = (): void => {
    this.open = !this.open;
  };

  private markAllRead = (): void => {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.dispatchEvent(new CustomEvent("pq-notifications-read", { bubbles: true, composed: true }));
  };

  private action(id: string): void {
    this.dispatchEvent(
      new CustomEvent("pq-notification-action", { detail: { id }, bubbles: true, composed: true }),
    );
  }
}

if (!customElements.get("pq-notifications")) {
  customElements.define("pq-notifications", PqNotifications);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-notifications": PqNotifications;
  }
}

export type { NotificationActionDetail } from "./types";
