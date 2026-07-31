import { LitElement, html, nothing, type TemplateResult } from "lit";
import type { Address } from "@pq/mock-data";
import { bindAtom, $address } from "@pq/store";
import { styles } from "./styles";

const pinIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
  <circle cx="12" cy="9" r="2.5" />
</svg>`;
const checkIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="3"
  aria-hidden="true"
>
  <polyline points="20 6 9 17 4 12" />
</svg>`;
const phoneIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <path
    d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.6 2Z"
  />
</svg>`;
const mailIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <rect x="2" y="4" width="20" height="16" rx="2" />
  <path d="m2 6 10 7 10-7" />
</svg>`;
const chevronIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.5"
  aria-hidden="true"
>
  <polyline points="9 18 15 12 9 6" />
</svg>`;
const arrowIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="3"
  aria-hidden="true"
>
  <line x1="5" y1="12" x2="19" y2="12" />
  <polyline points="12 5 19 12 12 19" />
</svg>`;
const infoIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.4"
  aria-hidden="true"
>
  <circle cx="12" cy="12" r="10" />
  <line x1="12" y1="11" x2="12" y2="16" />
  <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
</svg>`;
const lockIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <rect x="3" y="11" width="18" height="11" rx="2" />
  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
</svg>`;

/** "What happens next" fulfillment steps shown beside the verified address (expanded). */
const NEXT_STEPS = [
  { title: "Packed & verified", sub: "We confirm stock and prep your reward." },
  { title: "Ships free", sub: "No cost to you — on its way in 1 business day." },
  { title: "Arrives in 5–7 days", sub: "Delivered to the address on file." },
] as const;

/**
 * `<pq-address-block>` — read-only shipping address with an optional "Verified" badge.
 * The "Visit Player Services" link fires `pq-address-edit` (editing happens off-widget).
 *
 * Props: `address` (Address), `verified` (boolean), `allowEdit` (boolean, default true),
 * `profile` (`"compact" | "standard" | "expanded"`). `compact` and `standard` render the
 * identical premium card; `expanded` renders the kiosk/arcade big-screen card.
 *
 * `allowEdit: false` hides every edit affordance (and the copy that points at Player
 * Services), leaving a pure confirm step. The TTD / iVIEW compositions set it: the
 * address on those surfaces is whatever the CMS holds, full stop — the compact layout
 * instead tells the patron to see the cage, which is the only place it can be changed.
 */
export class PqAddressBlock extends LitElement {
  static override styles = styles;

  static override properties = {
    address: { attribute: false },
    verified: { type: Boolean, reflect: true },
    showConfirm: { type: Boolean },
    allowEdit: { type: Boolean },
    profile: { type: String, reflect: true },
  };

  declare address?: Address;
  declare verified: boolean;
  /** When set (claim flow), render a "Confirm & continue" CTA firing `pq-address-confirm`. */
  declare showConfirm: boolean;
  /** When false, no edit affordance is rendered at all — confirm-only. */
  declare allowEdit: boolean;
  /** Channel layout. `compact`/`standard` share one card; `expanded` is kiosk. */
  declare profile: "compact" | "standard" | "expanded";

  constructor() {
    super();
    this.verified = false;
    this.showConfirm = false;
    this.allowEdit = true;
    this.profile = "standard";
    // Store wins when loaded; the `address` prop is the Storybook/test fallback.
    bindAtom(this, $address, "address");
  }

  override render(): TemplateResult {
    if (this.profile === "expanded") return this.renderExpanded();
    if (this.profile === "compact") return this.renderCompact();
    return this.renderStandard();
  }

  /**
   * Dense TTD address-verified screen (480×234, ref ttd-arcade Screen 07): a small
   * verified check, a condensed address card (Ships to + Verified pill + name + 2
   * lines, no contact block / no verbose edit paragraph), and a bottom action row —
   * "Edit · ask staff" (ghost, fires `pq-address-edit`) + "Continue" (primary, fires
   * `pq-address-confirm`). Themed via tenant tokens so it reads arcade or casino.
   */
  private renderCompact(): TemplateResult {
    const a = this.address;
    if (!a) return html``;
    const street = a.line2 ? `${a.line1}, ${a.line2}` : a.line1;
    return html`
      <div class="wrap-compact">
        <div class="card cm-card">
          <div class="header">
            <span class="source">${pinIcon} Ships to</span>
            ${this.verified ? html`<span class="verified">${checkIcon} Verified</span>` : nothing}
          </div>
          <h3 class="name">${a.name}</h3>
          <p class="line">${street}</p>
          <p class="line">${a.city}, ${a.state} ${a.zip}</p>
        </div>
        <p class="cm-note">
          ${infoIcon}<span>If the address is incorrect, please contact cage.</span>
        </p>
        ${this.showConfirm
          ? html`<div class="cm-actions">
              ${this.allowEdit
                ? html`<button class="cm-edit" @click=${this.handleEdit}>Edit · ask staff</button>`
                : nothing}
              <button class="cm-go" @click=${this.handleConfirm}>Continue ${arrowIcon}</button>
            </div>`
          : nothing}
      </div>
    `;
  }

  /** Original premium card — shared by the compact + standard channel profiles. */
  private renderStandard(): TemplateResult {
    const a = this.address;
    if (!a) return html``;
    return html`
      <div class="card">
        <div class="header">
          <span class="source">${pinIcon} Ships to</span>
          ${this.verified ? html`<span class="verified">${checkIcon} Verified</span>` : nothing}
        </div>
        <h3 class="name">${a.name}</h3>
        <p class="line">${a.line1}</p>
        ${a.line2 ? html`<p class="line">${a.line2}</p>` : nothing}
        <p class="line">${a.city}, ${a.state} ${a.zip}</p>
        ${a.phone || a.email
          ? html`<div class="contact">
              ${a.phone ? html`<span>${phoneIcon} ${a.phone}</span>` : nothing}
              ${a.email ? html`<span>${mailIcon} ${a.email}</span>` : nothing}
            </div>`
          : nothing}
        ${this.allowEdit
          ? html`<div class="edit">
              <p>
                Wrong address? Updating requires Player Services and releases your inventory hold.
              </p>
              <button @click=${this.handleEdit}>Visit Player Services ${chevronIcon}</button>
            </div>`
          : nothing}
        ${this.showConfirm
          ? html`<button
              class="confirm"
              style="margin-top:16px;width:100%;padding:14px;border:none;border-radius:var(--pq-r-md,8px);background:var(--pq-cream,#f5efe6);color:var(--pq-navy-deep,#0a1a2e);font-family:var(--pq-font-body,sans-serif);font-size:14px;font-weight:600;cursor:pointer"
              @click=${this.handleConfirm}
            >
              Confirm &amp; continue
            </button>`
          : nothing}
      </div>
    `;
  }

  /**
   * Kiosk/arcade big-screen layout (ref stage 07, extended to fill the frame):
   * a celebratory hero (big verified ✓ + headline) over a two-column grid —
   * the shipping-address card on the left, a "what happens next" fulfillment
   * panel on the right — with a strong Continue + ghost Edit row beneath.
   * The two columns stack in portrait. Same `$address` binding, `verified` /
   * `showConfirm` props and `pq-address-confirm` / `pq-address-edit` events as
   * standard — only the layout differs. Arcade flourish is CSS-only.
   */
  private renderExpanded(): TemplateResult {
    const a = this.address;
    if (!a) return html``;
    return html`
      <div class="flow">
        ${this.verified
          ? html`<div class="hero">
              <div class="hero__disc">${checkIcon}</div>
              <p class="hero__eyebrow">Shipping</p>
              <h2 class="hero__title">Address on File</h2>
              <p class="hero__sub">Pulled from your member profile · ships free.</p>
            </div>`
          : nothing}
        <div class="addr-2col">
          <div class="card card--xl">
            <div class="header header--xl">
              <span class="source source--xl">${pinIcon} Shipping address</span>
              ${this.verified
                ? html`<span class="verified verified--xl">${checkIcon} Verified · USPS</span>`
                : nothing}
            </div>
            <div class="addr--xl">
              <p class="name name--xl">${a.name}</p>
              <p class="line line--xl">${a.line1}</p>
              ${a.line2 ? html`<p class="line line--xl">${a.line2}</p>` : nothing}
              <p class="line line--xl">${a.city}, ${a.state} ${a.zip}</p>
            </div>
            ${a.phone || a.email
              ? html`<div class="contact contact--xl">
                  ${a.phone ? html`<span>${phoneIcon} ${a.phone}</span>` : nothing}
                  ${a.email ? html`<span>${mailIcon} ${a.email}</span>` : nothing}
                </div>`
              : nothing}
          </div>
          <div class="next-panel">
            <h3 class="next-panel__title">What happens next</h3>
            ${NEXT_STEPS.map(
              (s, i) =>
                html`<div class="next-step">
                  <span class="next-step__num">${i + 1}</span>
                  <div>
                    <p class="next-step__name">${s.title}</p>
                    <p class="next-step__sub">${s.sub}</p>
                  </div>
                </div>`,
            )}
            <div class="trust-line">${lockIcon} Insured · tracked · updates by email + text</div>
          </div>
        </div>
        <div class="actions--xl">
          ${this.showConfirm
            ? html`<button class="confirm--xl" @click=${this.handleConfirm}>
                Continue ${arrowIcon}
              </button>`
            : nothing}
          ${this.allowEdit
            ? html`<button class="ghost-btn" @click=${this.handleEdit}>
                Edit address · ask staff ${chevronIcon}
              </button>`
            : nothing}
        </div>
      </div>
    `;
  }

  private handleEdit = (): void => {
    this.dispatchEvent(new CustomEvent("pq-address-edit", { bubbles: true, composed: true }));
  };

  private handleConfirm = (): void => {
    this.dispatchEvent(new CustomEvent("pq-address-confirm", { bubbles: true, composed: true }));
  };
}

if (!customElements.get("pq-address-block")) {
  customElements.define("pq-address-block", PqAddressBlock);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-address-block": PqAddressBlock;
  }
}
