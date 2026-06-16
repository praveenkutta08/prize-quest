import { LitElement, html, nothing, type TemplateResult } from "lit";
import type { Address, Campaign, Prize } from "@pq/mock-data";
import { getPatronShippingAddress } from "@pq/mock-data";
import type { AddressData } from "@pq/contracts";
import {
  bindAtom,
  $activeCampaign,
  $selectedPrize,
  $pendingClaim,
  $address,
  $shippingAddress,
  type PendingClaim,
} from "@pq/store";
import { styles } from "./styles";

const giftIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
  <rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18" />
  <path d="M12 8S9 3 6.5 4.5 9 8 12 8zM12 8s3-5 5.5-3.5S15 8 12 8z" />
</svg>`;
const arrowIcon = html`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true">
  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
</svg>`;
const checkGlyph = html`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3.5" aria-hidden="true">
  <polyline points="20 6 9 17 4 12" />
</svg>`;

/**
 * `<pq-claim-summary>` — read-only final review before submitting a claim. Pulls the
 * prize, campaign, PIN status, and shipping address from the store (props are the
 * Storybook/test fallback). The submit button fires `pq-claim-submit` (the host calls
 * `finalizeClaim()` and routes to success / voucher).
 */
export class PqClaimSummary extends LitElement {
  static override styles = styles;

  static override properties = {
    campaign: { attribute: false },
    prize: { attribute: false },
    pending: { attribute: false },
    address: { attribute: false },
    shipping: { attribute: false },
    showTerms: { type: Boolean },
    profile: { type: String, reflect: true },
    termsChecked: { state: true },
  };

  declare campaign?: Campaign;
  declare prize?: Prize;
  declare pending?: PendingClaim;
  declare address?: Address;
  /** The address the player entered/edited on <pq-address-form> (Session 30). */
  declare shipping?: AddressData | null;
  /** Show a pre-ticked "Agree terms" gate (TTD final confirm). Default false (premium). */
  declare showTerms: boolean;
  declare profile: "compact" | "standard" | "expanded";
  private declare termsChecked: boolean;

  constructor() {
    super();
    this.showTerms = false;
    this.profile = "standard";
    // Terms start UNCHECKED so the patron must actively agree before submitting
    // (the Submit CTA is disabled until this flips true).
    this.termsChecked = false;
    bindAtom(this, $activeCampaign, "campaign");
    bindAtom(this, $selectedPrize, "prize");
    bindAtom(this, $pendingClaim, "pending");
    bindAtom(this, $address, "address");
    bindAtom(this, $shippingAddress, "shipping");
  }

  /**
   * The shipping address to display + whether it's a fallback. Prefers the address the
   * player entered on the form ($shippingAddress); if absent (edge case — reached confirm
   * without the form), falls back to the patron's CMS address and flags it so the UI can
   * warn. `name` falls back to the player name (compact/standard forms omit a name field).
   */
  private get shipInfo(): { addr: AddressData; fallback: boolean } {
    if (this.shipping) return { addr: this.shipping, fallback: false };
    return { addr: getPatronShippingAddress(), fallback: true };
  }

  /** One-line "street · City, ST ZIP" from an AddressData. */
  private formatShip(a: AddressData): string {
    const street = a.line2 ? `${a.line1}, ${a.line2}` : a.line1;
    return `${street} · ${a.city}, ${a.state} ${a.postalCode}`;
  }

  override render(): TemplateResult {
    if (this.profile === "expanded") return this.renderExpanded();
    const p = this.prize;
    const digital = p?.prizeType === "digital";
    const ship = this.shipInfo;
    const pinLen = this.pending?.pin?.length ?? 0;
    return html`
      <section class="wrap">
        <p class="eyebrow">Final review</p>
        <h2 class="title">Submit your claim</h2>
        <dl class="rows">
          <div class="row"><dt>Prize</dt><dd>${p ? `${p.name} · $${p.value.toLocaleString()}` : "—"}</dd></div>
          <div class="row"><dt>Campaign</dt><dd>${this.campaign?.name ?? "—"}</dd></div>
          <div class="row">
            <dt>Delivery</dt>
            <dd>${digital ? "Digital voucher (instant)" : "Ships to the address below"}</dd>
          </div>
          <div class="row">
            <dt>Verification</dt>
            <dd>${pinLen ? `${"•".repeat(pinLen)} PIN confirmed` : "PIN not set"}</dd>
          </div>
          ${!digital
            ? html`<div class="row">
                <dt>Ship to <span class="ship-confirmed">${checkGlyph} Confirmed</span></dt>
                <dd>${this.formatShip(ship.addr)}</dd>
              </div>`
            : nothing}
        </dl>
        ${!digital && ship.fallback
          ? html`<p class="ship-warning">Using default address — go back to edit.</p>`
          : nothing}
        ${this.showTerms
          ? html`<label class="tnc">
              <span class="tnc__box" ?data-checked=${this.termsChecked}>
                <input type="checkbox" .checked=${this.termsChecked} @change=${this.toggleTerms} />
                ${this.termsChecked
                  ? html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>`
                  : nothing}
              </span>
              <span>
                I agree to the
                <a href="#" @click=${(e: Event) => e.preventDefault()}>reward terms &amp; conditions</a>.
                Reward is non-transferable, non-refundable for cash. Allow 5–7 business days for shipping.
              </span>
            </label>`
          : nothing}
        <button
          class="cta"
          ?disabled=${!p || (this.showTerms && !this.termsChecked)}
          @click=${this.handleSubmit}
        >
          Submit claim
        </button>
      </section>
    `;
  }

  /**
   * Kiosk/arcade big-screen final confirm (ref stage 08). Centered eyebrow + headline,
   * two-column grid: left = prize summary card, right = read-only address + pre-ticked
   * T&C gate + "Place Reward". Reuses the same store data, `termsChecked` gate, and
   * `pq-claim-submit` event as the standard layout.
   */
  private renderExpanded(): TemplateResult {
    const p = this.prize;
    const ship = this.shipInfo;
    const a = ship.addr;
    const digital = p?.prizeType === "digital";
    const delivery = digital ? "Instant · email" : "5–7 business days";
    return html`
      <section class="wrap wrap--xl">
        <div class="xl-head">
          <p class="eyebrow">Step 4 of 4 · Review &amp; place</p>
          <h2 class="xl-title">Place Your Reward</h2>
        </div>
        <div class="xl-grid xl-grid--final">
          <div class="summary-card">
            <span class="summary-card__eyebrow">Your Reward</span>
            <div class="summary-card__main">
              <div class="summary-card__thumb">${giftIcon}</div>
              <div class="summary-card__body">
                ${p?.category ? html`<span class="prize-card__cat">${p.category}</span>` : nothing}
                <div class="summary-card__name">${p?.name ?? "No prize selected"}</div>
                <div class="summary-card__value">
                  ${p ? `$${p.value.toLocaleString()}` : "—"}${digital ? "" : " · Free ship"}
                </div>
              </div>
            </div>
            <div class="summary-card__meta">
              <div><strong>Delivery</strong>${delivery}</div>
              <div><strong>Tracking</strong>Email + text</div>
            </div>
          </div>
          <div class="xl-detail">
            <div class="address-card">
              <div class="address-card__head">
                <span class="address-card__label">Ship to</span>
                <span class="address-card__pill address-card__pill--confirmed">${checkGlyph} Confirmed</span>
              </div>
              <div class="address-card__body">
                ${a.name ? html`${a.name}<br />` : nothing}${a.line1}${a.line2 ? html`, ${a.line2}` : nothing}<br />${a.city},
                ${a.state} ${a.postalCode}
              </div>
              ${ship.fallback
                ? html`<p class="address-card__warning">Using default address — go back to edit.</p>`
                : nothing}
            </div>
            <label class="terms terms--xl">
              <span class="terms__box" data-checked=${this.termsChecked ? "true" : "false"}>
                ${this.termsChecked ? checkGlyph : nothing}
              </span>
              <input type="checkbox" class="terms__input" .checked=${this.termsChecked} @change=${this.toggleTerms} />
              <span>
                I agree to the
                <a href="#" @click=${(e: Event) => e.preventDefault()}>reward terms &amp; conditions</a>.
                Reward is non-transferable, non-refundable for cash. Allow 5–7 business days for shipping.
              </span>
            </label>
            <div class="xl-actions xl-actions--row">
              <button class="cta cta--xl" ?disabled=${!p || !this.termsChecked} @click=${this.handleSubmit}>
                Place Reward ${arrowIcon}
              </button>
              <button class="ghost" type="button" @click=${this.handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  private handleCancel = (): void => {
    this.dispatchEvent(new CustomEvent("pq-claim-cancel", { bubbles: true, composed: true }));
  };

  private toggleTerms = (e: Event): void => {
    this.termsChecked = (e.target as HTMLInputElement).checked;
  };

  private handleSubmit = (): void => {
    if (!this.prize) return;
    const gateTerms = this.showTerms || this.profile === "expanded";
    if (gateTerms && !this.termsChecked) return;
    this.dispatchEvent(new CustomEvent("pq-claim-submit", { bubbles: true, composed: true }));
  };
}

if (!customElements.get("pq-claim-summary")) {
  customElements.define("pq-claim-summary", PqClaimSummary);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-claim-summary": PqClaimSummary;
  }
}
