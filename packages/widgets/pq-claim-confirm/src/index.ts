import { LitElement, html, nothing, type TemplateResult } from "lit";
import type { Address, Campaign, Prize } from "@pq/mock-data";
import { bindAtom, $activeCampaign, $address, $selectedPrize } from "@pq/store";
import { styles } from "./styles";

const giftIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
  <rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18" />
  <path d="M12 8S9 3 6.5 4.5 9 8 12 8zM12 8s3-5 5.5-3.5S15 8 12 8z" />
</svg>`;
const arrowIcon = html`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true">
  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
</svg>`;
const backIcon = html`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
  <polyline points="15 18 9 12 15 6" />
</svg>`;
const lockGlyph = html`<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
</svg>`;
const checkGlyph = html`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3.5" aria-hidden="true">
  <polyline points="20 6 9 17 4 12" />
</svg>`;

/**
 * `<pq-claim-confirm>` — review step of the claim flow. Shows the selected prize (from
 * `$selectedPrize` / `$activeCampaign`, with `prize`/`campaign` props as the fallback).
 *
 * Two modes:
 * - `showTerms` (default true, premium): card + terms checkbox gate → "Continue".
 * - `showTerms=false` (TTD pre-PIN): lighter Promo/Prize rows + optional `warning`
 *   ("Cannot change"), no T&C — gated only on a prize being selected.
 * Continuing fires `pq-claim-confirm` (the host routes to the PIN step).
 */
export class PqClaimConfirm extends LitElement {
  static override styles = styles;

  static override properties = {
    campaign: { attribute: false },
    prize: { attribute: false },
    address: { attribute: false },
    showTerms: { type: Boolean },
    warning: { type: String },
    profile: { type: String, reflect: true },
    accepted: { state: true },
  };

  declare campaign?: Campaign;
  declare prize?: Prize;
  /** Verified shipping address (expanded final step). */
  declare address?: Address;
  /** Whether to show the T&C checkbox gate. Default true (premium). */
  declare showTerms: boolean;
  /** Optional "cannot change" notice for the pre-PIN step. */
  declare warning?: string;
  declare profile: "compact" | "standard" | "expanded";
  private declare accepted: boolean;

  constructor() {
    super();
    this.showTerms = true;
    this.profile = "standard";
    this.accepted = false;
    bindAtom(this, $activeCampaign, "campaign");
    bindAtom(this, $selectedPrize, "prize");
    bindAtom(this, $address, "address");
  }

  override render(): TemplateResult {
    if (this.profile === "expanded") return this.renderExpanded();
    return this.showTerms ? this.renderWithTerms() : this.renderPrePin();
  }

  /**
   * Kiosk/arcade big-screen layout (ref stages 04 + 08). Two variants gated on
   * `showTerms`: pre-PIN confirm (false) and final review + T&C (true). Honors the
   * same prize/address store bindings and fires the same confirm/continue event.
   */
  private renderExpanded(): TemplateResult {
    return this.showTerms ? this.renderExpandedFinal() : this.renderExpandedPrePin();
  }

  /** Expanded pre-PIN — big prize card + "What you get" + Confirm Selection. */
  private renderExpandedPrePin(): TemplateResult {
    const p = this.prize;
    const deliveryNote =
      p?.prizeType === "digital" ? "Delivered instantly to your email" : "Ships free to your address on file";
    return html`
      <section class="wrap wrap--xl">
        <div class="xl-head">
          <p class="eyebrow">Step 1 of 4 · Confirm Selection</p>
          <h2 class="xl-title">Confirm Your Reward</h2>
          <p class="xl-sub">Make sure this is the prize you want. You can swap before you continue.</p>
        </div>
        <div class="xl-grid xl-grid--prepin">
          <div class="prize-card">
            <span class="prize-card__accent"></span>
            <div class="prize-card__img">${giftIcon}</div>
            ${p?.category ? html`<span class="prize-card__cat">${p.category}</span>` : nothing}
            <h3 class="prize-card__name">${p?.name ?? "No prize selected"}</h3>
            <div class="prize-card__foot">
              <span class="prize-card__value">${p ? `$${p.value.toLocaleString()}` : "—"}</span>
              <span class="prize-card__stock"><span class="dot"></span>In Stock · Ships Free</span>
            </div>
          </div>
          <div class="xl-detail">
            <div class="detail-card">
              <h4 class="detail-card__title">What you get</h4>
              <ul class="detail-card__list">
                <li>1 × ${p?.name ?? "your selected reward"}</li>
                <li>${deliveryNote}</li>
                <li>Tracking info sent via email + text</li>
                <li>Delivers in 5–7 business days</li>
              </ul>
            </div>
            <div class="xl-actions">
              <button class="cta cta--xl" ?disabled=${!p} @click=${this.handleContinue}>
                Confirm Selection ${arrowIcon}
              </button>
              <button class="ghost" type="button" @click=${this.handleBack}>
                ${backIcon} Back · Pick a different reward
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /** Expanded final — prize summary + read-only address + T&C gate + Place Reward. */
  private renderExpandedFinal(): TemplateResult {
    const p = this.prize;
    const a = this.address;
    const delivery = p?.prizeType === "digital" ? "Instant · email" : "5–7 business days";
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
                  ${p ? `$${p.value.toLocaleString()}` : "—"} · Free ship
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
                <span class="address-card__pill">${lockGlyph} Cannot change at kiosk</span>
              </div>
              <div class="address-card__body">
                ${a
                  ? html`${a.name}<br />${a.line1}${a.line2 ? html`, ${a.line2}` : nothing}<br />${a.city},
                      ${a.state} ${a.zip}`
                  : html`No address on file.`}
              </div>
            </div>
            <label class="terms terms--xl">
              <span class="terms__box" data-checked=${this.accepted ? "true" : "false"}>
                ${this.accepted ? checkGlyph : nothing}
              </span>
              <input type="checkbox" class="terms__input" .checked=${this.accepted} @change=${this.toggle} />
              <span>
                I agree to the
                <a href="#" @click=${(e: Event) => e.preventDefault()}>reward terms &amp; conditions</a>.
                Reward is non-transferable, non-refundable for cash. Allow 5–7 business days for shipping.
              </span>
            </label>
            <div class="xl-actions xl-actions--row">
              <button class="cta cta--xl" ?disabled=${!this.accepted || !p} @click=${this.handleContinue}>
                Place Reward ${arrowIcon}
              </button>
              <button class="ghost" type="button" @click=${this.handleBack}>Cancel</button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /** Premium default — prize card + terms checkbox + "Continue". */
  private renderWithTerms(): TemplateResult {
    const p = this.prize;
    return html`
      <section class="wrap">
        <p class="eyebrow">Step 1 of 4 · Review</p>
        <h2 class="title">Confirm your claim</h2>
        ${p
          ? html`<div class="card">
              <div>
                <h3 class="card__name">${p.name}</h3>
                <p class="card__meta">
                  ${p.category} · ${p.prizeType === "digital" ? "Digital voucher" : "Ships to you"}
                </p>
                ${this.campaign ? html`<p class="card__camp">from ${this.campaign.name}</p>` : nothing}
              </div>
              <span class="card__value">$${p.value.toLocaleString()}</span>
            </div>`
          : html`<p class="empty">No prize selected yet.</p>`}
        <label class="terms">
          <input type="checkbox" .checked=${this.accepted} @change=${this.toggle} />
          <span>
            I accept the
            <a href="#" @click=${(e: Event) => e.preventDefault()}>promotion terms &amp; conditions</a>
            and confirm I'm the eligible account holder.
          </span>
        </label>
        <button class="cta" ?disabled=${!this.accepted || !p} @click=${this.handleContinue}>
          Continue to verification
        </button>
      </section>
    `;
  }

  /** TTD pre-PIN — Promo/Prize rows + Confirm + a "pick a different reward" back. */
  private renderPrePin(): TemplateResult {
    const p = this.prize;
    return html`
      <section class="wrap">
        <div class="cc">
          <div class="cc-row">
            <p class="cc-row__label">Promo</p>
            <p class="cc-row__value">${this.campaign?.name ?? "—"}</p>
          </div>
          <div class="cc-divider"></div>
          <div class="cc-row">
            <p class="cc-row__label">Prize</p>
            <p class="cc-row__value cc-row__value--prize">${p?.name ?? "No prize selected"}</p>
          </div>
        </div>
        <button class="cta" ?disabled=${!p} @click=${this.handleContinue}>
          Confirm Selection ${arrowIcon}
        </button>
        <button class="ghost ghost--pick" type="button" @click=${this.handleBack}>
          ${backIcon} Back · Pick a different reward
        </button>
      </section>
    `;
  }

  private toggle = (e: Event): void => {
    this.accepted = (e.target as HTMLInputElement).checked;
  };

  private handleContinue = (): void => {
    if (!this.prize) return;
    if (this.showTerms && !this.accepted) return;
    this.dispatchEvent(new CustomEvent("pq-claim-confirm", { bubbles: true, composed: true }));
  };

  private handleBack = (): void => {
    this.dispatchEvent(new CustomEvent("pq-back", { bubbles: true, composed: true }));
  };
}

if (!customElements.get("pq-claim-confirm")) {
  customElements.define("pq-claim-confirm", PqClaimConfirm);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-claim-confirm": PqClaimConfirm;
  }
}
