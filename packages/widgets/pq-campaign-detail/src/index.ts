import { LitElement, html, nothing, type TemplateResult } from "lit";
import type { Campaign, Prize } from "@pq/mock-data";
import { bindAtom, $activeCampaign, $prizes } from "@pq/store";
import { styles } from "./styles";
import type { DetailProfile } from "./types";
import "@pq/pq-prize-tile";
import "@pq/pq-progress-bar";
import "@pq/pq-status-pill";
import type { PrizeTileState } from "@pq/pq-prize-tile";
import type { StatusPillVariant } from "@pq/pq-status-pill";

const lockIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
  <rect x="3" y="11" width="18" height="11" rx="2" />
  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
</svg>`;

const chevronLeftIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
  <polyline points="15 18 9 12 15 6" />
</svg>`;

const calendarIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
  <rect x="3" y="4" width="18" height="18" rx="2" />
  <line x1="16" y1="2" x2="16" y2="6" />
  <line x1="8" y1="2" x2="8" y2="6" />
  <line x1="3" y1="10" x2="21" y2="10" />
</svg>`;

const sparkIcon = html`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
</svg>`;

const checkIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true">
  <polyline points="20 6 9 17 4 12" />
</svg>`;

const clockIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
  <circle cx="12" cy="12" r="10" />
  <polyline points="12 6 12 12 16 14" />
</svg>`;

const giftIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
  <rect x="3" y="8" width="18" height="13" rx="1" /><path d="M12 8v13M3 12h18" />
  <path d="M12 8S10 3 7.5 4.5 9 8 12 8ZM12 8s2-5 4.5-3.5S15 8 12 8Z" />
</svg>`;

/** Slot-machine illustration (eligible). Floats via the global `float` keyframe. */
const slotIllustration = html`<svg viewBox="0 0 240 240" width="320" height="320" aria-hidden="true">
  <defs>
    <linearGradient id="pqcd-slot-body" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF3FA4" /><stop offset="100%" stop-color="#8E47E8" />
    </linearGradient>
    <linearGradient id="pqcd-slot-top" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFEE5C" /><stop offset="100%" stop-color="#FFB627" />
    </linearGradient>
    <linearGradient id="pqcd-lever" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B1A" /><stop offset="100%" stop-color="#C73B0A" />
    </linearGradient>
  </defs>
  <ellipse cx="120" cy="220" rx="80" ry="10" fill="rgba(0,0,0,0.4)" />
  <rect x="40" y="60" width="160" height="160" rx="20" fill="url(#pqcd-slot-body)" stroke="#FFEE5C" stroke-width="3" />
  <ellipse cx="120" cy="60" rx="80" ry="40" fill="url(#pqcd-slot-top)" stroke="#FFEE5C" stroke-width="3" />
  <circle cx="120" cy="40" r="10" fill="#FFEE5C" stroke="#FF6B1A" stroke-width="2" />
  <circle cx="120" cy="40" r="5" fill="#FFF" />
  <rect x="58" y="110" width="124" height="60" rx="8" fill="#1F0B3E" stroke="#FFEE5C" stroke-width="2" />
  <text x="78" y="152" font-family="Manrope" font-size="34" fill="#FFEE5C" text-anchor="middle">7</text>
  <text x="120" y="152" font-family="Manrope" font-size="34" fill="#FF3FA4" text-anchor="middle">7</text>
  <text x="162" y="152" font-family="Manrope" font-size="34" fill="#34D670" text-anchor="middle">7</text>
  <rect x="195" y="100" width="14" height="80" rx="6" fill="url(#pqcd-lever)" />
  <circle cx="202" cy="98" r="14" fill="#FF6B1A" stroke="#FFEE5C" stroke-width="2" />
  <rect x="60" y="185" width="120" height="22" rx="6" fill="#15042E" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
  <circle cx="65" cy="80" r="10" fill="#FFEE5C" stroke="#E0B71B" stroke-width="2" />
  <text x="65" y="85" font-family="Manrope" font-size="12" fill="#E0B71B" text-anchor="middle">$</text>
  <circle cx="190" cy="70" r="8" fill="#FFEE5C" stroke="#E0B71B" stroke-width="2" />
  <circle cx="50" cy="180" r="7" fill="#FFEE5C" stroke="#E0B71B" stroke-width="2" />
</svg>`;

/** Tablet + lock illustration (locked). Floats via the global `float` keyframe. */
const tabletLockIllustration = html`<svg viewBox="0 0 240 240" width="320" height="320" aria-hidden="true">
  <defs>
    <linearGradient id="pqcd-tablet-body" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3D8BF5" /><stop offset="100%" stop-color="#2DD4BF" />
    </linearGradient>
  </defs>
  <ellipse cx="120" cy="220" rx="80" ry="10" fill="rgba(0,0,0,0.4)" />
  <rect x="50" y="40" width="140" height="180" rx="14" fill="#1F0B3E" stroke="#FFEE5C" stroke-width="3" />
  <rect x="60" y="55" width="120" height="140" rx="6" fill="url(#pqcd-tablet-body)" />
  <circle cx="120" cy="208" r="5" fill="#FFB627" />
  <text x="120" y="135" font-family="Manrope" font-size="36" fill="#FFEE5C" text-anchor="middle">TECH</text>
  <g transform="translate(120 120)">
    <circle r="42" fill="rgba(15, 4, 46, 0.85)" stroke="#FF4D6D" stroke-width="3" />
    <rect x="-16" y="-8" width="32" height="22" rx="3" fill="none" stroke="#FF4D6D" stroke-width="3" />
    <path d="M -10 -8 L -10 -18 a10 10 0 0 1 20 0 L 10 -8" fill="none" stroke="#FF4D6D" stroke-width="3" />
    <circle cx="0" cy="3" r="3" fill="#FF4D6D" />
  </g>
</svg>`;

/** Campaign fields that may not exist on the base type yet; read defensively. */
interface CampaignExtras {
  frequency?: string;
  description?: string;
}

const STATUS_PILL: Record<Campaign["status"], { variant: StatusPillVariant; label?: string }> = {
  eligible: { variant: "eligible", label: "Ready to claim" },
  "in-progress": { variant: "in-progress" },
  claimed: { variant: "claimed" },
  expired: { variant: "expired" },
  locked: { variant: "locked" },
};

/**
 * `<pq-campaign-detail>` — campaign hero (status eyebrow, serif title, progress, earn
 * note) plus a "Prize vault" grid of `<pq-prize-tile>`. Single-column (standard) or
 * two-column (expanded). Selecting a tile emits `pq-prize-select` and enables the claim
 * CTA, which fires `pq-claim-start` ({campaignId, prizeId}) when the campaign is eligible.
 *
 * Composes `<pq-status-pill>`, `<pq-progress-bar>`, `<pq-prize-tile>`.
 */
export class PqCampaignDetail extends LitElement {
  static override styles = styles;

  static override properties = {
    campaign: { attribute: false },
    prizes: { attribute: false },
    profile: { type: String, reflect: true },
    selectedPrizeId: { type: String },
    loading: { type: Boolean, reflect: true },
  };

  declare campaign?: Campaign;
  declare prizes: Prize[];
  declare profile: DetailProfile;
  declare selectedPrizeId?: string;
  declare loading: boolean;

  constructor() {
    super();
    this.prizes = [];
    this.profile = "standard";
    this.loading = false;
    // Store wins when populated; `campaign`/`prizes` props are the test fallback.
    bindAtom(this, $activeCampaign, "campaign");
    bindAtom(this, $prizes, "prizes");
  }

  /** Reflect campaign status to a host attribute so CSS can vary the expanded
   *  layout (eligible vs locked illustration/badge tint) without a TS branch. */
  protected override updated(): void {
    if (this.campaign) this.setAttribute("status", this.campaign.status);
    else this.removeAttribute("status");
  }

  private get eligible(): boolean {
    return this.campaign?.status === "eligible";
  }

  private get tileState(): PrizeTileState {
    return this.eligible ? "selectable" : "locked";
  }

  override render(): TemplateResult {
    if (this.loading || !this.campaign) return this.renderSkeleton();
    if (this.profile === "expanded") return this.renderExpanded(this.campaign);
    if (this.profile === "compact") {
      // iVIEW (1024×600 / 800×480) is a sub-axis of compact: it has room for a hero
      // block above the prizes (TTD 480×234 does not). Gate on <html data-formfactor>.
      const iview = document.documentElement.dataset.formfactor?.startsWith("iview");
      return iview ? this.renderCompactIview(this.campaign) : this.renderCompact(this.campaign);
    }
    return html`<div class="wrap">${this.renderHero(this.campaign)}${this.renderVault()}</div>`;
  }

  /**
   * Rich kiosk/arcade detail: ghost back link + frequency badge, a big neon hero
   * (display headline, description, date pill, progress + status pills, floating
   * illustration), then a 3-up `<pq-prize-tile profile="expanded">` reward grid.
   * Eligible shows the slot machine + "Choose Your Reward"; locked shows the
   * tablet/lock illustration + "Preview Your Rewards" with self-dimming tiles.
   */
  private renderExpanded(c: Campaign): TemplateResult {
    const extras = c as Campaign & CampaignExtras;
    const eligible = this.eligible;
    const frequency = extras.frequency ?? (eligible ? "Weekly Event" : "Seasonal Event");
    const description = extras.description ?? c.meta;
    const dateLabel = c.expiresAt ? `Valid through ${c.expiresAt}` : "Limited-time event";
    const remaining = Math.max(0, c.goal - c.progress);
    const statusPill = eligible
      ? html`<span class="arc-pill arc-pill--success">${checkIcon} Ready to claim</span>`
      : html`<span class="arc-pill arc-pill--danger"
          >${lockIcon} Locked · $${remaining.toLocaleString()} to go</span
        >`;

    return html`
      <div class="wrap-expanded" @pq-prize-select=${this.handlePrizeSelect}>
        <div class="exp-topbar">
          <button class="exp-back" @click=${this.handleBack}>
            ${chevronLeftIcon}<span>Back to campaigns</span>
          </button>
          <div class="exp-freq">${sparkIcon}<span>${frequency}</span></div>
        </div>

        <div class="exp-hero">
          <div class="exp-hero__text">
            <h1 class="exp-display">${c.name}</h1>
            <p class="exp-desc">${description}</p>
            <div class="exp-datepill">${calendarIcon}<span>${dateLabel}</span></div>
            <div class="exp-progress">
              <div class="exp-progress__head">
                <span class="exp-progress__label">Progress</span>
                <span class="exp-progress__val"
                  ><strong>$${c.progress.toLocaleString()}</strong> / $${c.goal.toLocaleString()}</span
                >
              </div>
              <pq-progress-bar
                profile="expanded"
                .value=${c.progress}
                .max=${c.goal}
                .variant=${eligible ? "complete" : "default"}
              ></pq-progress-bar>
              <div class="exp-pillrow">
                ${statusPill}
                <span class="arc-pill arc-pill--ghost">${clockIcon} ${c.pct}% complete</span>
              </div>
            </div>
          </div>
          <div class="exp-illus">
            <div class="exp-illus__glow"></div>
            <div class="exp-illus__art">
              ${eligible ? slotIllustration : tabletLockIllustration}
            </div>
          </div>
        </div>

        <div class="exp-rewards">
          <h2 class="exp-rewards__title">
            ${eligible ? "Choose Your Reward" : "Preview Your Rewards"}
          </h2>
          <div class="exp-grid">
            ${this.prizes.map(
              (p) => html`<pq-prize-tile
                profile="expanded"
                .prize=${p}
                .state=${this.tileState}
                .category=${p.category}
                .selected=${this.selectedPrizeId === p.id}
              ></pq-prize-tile>`,
            )}
          </div>
        </div>
      </div>
    `;
  }

  /** Dense casino detail: hero strip + 2×2 prize grid (eligible) or 3-across locked grid. */
  private renderCompact(c: Campaign): TemplateResult {
    const heroTitle = `$${c.progress.toLocaleString()} / $${c.goal.toLocaleString()}`;
    return html`
      <div class="wrap-compact" @pq-prize-select=${this.handlePrizeSelect}>
        <div class="det-hero">
          <span class="det-hero__label">Progress</span>
          <span class="det-hero__title">${heroTitle}</span>
          <span class="det-hero__pct">${c.pct}%</span>
        </div>
        <pq-progress-bar
          class="det-progress"
          profile="compact"
          .value=${c.progress}
          .max=${c.goal}
          .variant=${this.eligible ? "complete" : "default"}
        ></pq-progress-bar>
        ${this.eligible
          ? document.documentElement.dataset.pqMode === "arcade"
            ? this.renderRewardsCta()
            : html`<div class="prize-grid">
                ${this.prizes.map(
                  (p) => html`<pq-prize-tile
                    profile="compact"
                    .prize=${p}
                    .state=${this.tileState}
                    .selected=${this.selectedPrizeId === p.id}
                  ></pq-prize-tile>`,
                )}
              </div>`
          : html`
              <div class="locked-banner">${lockIcon}<span>Locked · Complete to unlock</span></div>
              <div class="prize-grid prize-grid--locked">
                ${this.prizes.map(
                  (p) => html`<pq-prize-tile
                    profile="compact"
                    .prize=${p}
                    .state=${this.tileState}
                  ></pq-prize-tile>`,
                )}
              </div>`}
      </div>
    `;
  }

  /**
   * iVIEW compact-with-hero (1024×600 / 800×480). Unlike the TTD 480×234 compact
   * (which only has room for a label row + prizes), iVIEW shows a real hero —
   * campaign name, description, date pill, progress bar + status pill — then a
   * single-column reward list with per-row Claim CTAs. Styling lives in the
   * `.wrap-iview` / `.iv-*` CSS block (only rendered at iVIEW, so unconditional).
   */
  private renderCompactIview(c: Campaign): TemplateResult {
    const extras = c as Campaign & CampaignExtras;
    const eligible = this.eligible;
    const description = extras.description ?? c.meta;
    const dateLabel = c.expiresAt ? `Valid through ${c.expiresAt}` : "Limited-time event";
    const remaining = Math.max(0, c.goal - c.progress);
    const statusPill = eligible
      ? html`<span class="iv-pill iv-pill--success">${checkIcon} Ready to claim</span>`
      : html`<span class="iv-pill iv-pill--danger"
          >${lockIcon} Locked · $${remaining.toLocaleString()} to unlock</span
        >`;
    return html`
      <div class="wrap-iview">
        <button class="iv-back" type="button" @click=${this.handleBack}>
          ${chevronLeftIcon}<span>Back to campaigns</span>
        </button>
        <div class="iv-hero">
          <h2 class="iv-hero__name">${c.name}</h2>
          <p class="iv-hero__desc">${description}</p>
          <div class="iv-hero__datepill">${calendarIcon}<span>${dateLabel}</span></div>
          <div class="iv-progress">
            <div class="iv-progress__head">
              <span class="iv-progress__label">Progress</span>
              <span class="iv-progress__val"
                ><strong>$${c.progress.toLocaleString()}</strong> / $${c.goal.toLocaleString()}</span
              >
            </div>
            <pq-progress-bar
              profile="compact"
              .value=${c.progress}
              .max=${c.goal}
              .variant=${eligible ? "complete" : "default"}
            ></pq-progress-bar>
          </div>
          <div class="iv-pillrow">${statusPill}</div>
        </div>
        <h3 class="iv-rewards-title">${eligible ? "Choose Your Reward" : "Preview Your Rewards"}</h3>
        ${eligible
          ? this.renderRewardsCta()
          : html`<div class="iv-grid iv-grid--locked">
              ${this.prizes.map((p) => this.renderIviewPrize(p, false))}
            </div>`}
      </div>
    `;
  }

  private renderIviewPrize(p: Prize, eligible: boolean): TemplateResult {
    return html`
      <button
        class="iv-prize ${eligible ? "" : "iv-prize--locked"}"
        ?disabled=${!eligible}
        @click=${() => this.selectIviewPrize(p.id)}
      >
        <span class="iv-prize__img">${eligible ? giftIcon : lockIcon}</span>
        <span class="iv-prize__body">
          <span class="iv-prize__name">${p.name}</span>
          <span class="iv-prize__value">$${p.value.toLocaleString()}</span>
        </span>
        ${eligible
          ? html`<span class="iv-prize__cta">Claim</span>`
          : html`<span class="iv-prize__locked">Locked</span>`}
      </button>
    `;
  }

  /** iVIEW prize tap = select + start claim (mirrors the compact tile behaviour). */
  private selectIviewPrize(id: string): void {
    if (!this.eligible || !this.campaign) return;
    this.selectedPrizeId = id;
    // Notify the host (selectPrize) first; defer the claim start a microtask so the
    // store has the selected prize before startClaim reads it.
    this.dispatchEvent(
      new CustomEvent("pq-prize-select", { detail: { id }, bubbles: true, composed: true }),
    );
    const campaignId = this.campaign.id;
    queueMicrotask(() => {
      this.dispatchEvent(
        new CustomEvent("pq-claim-start", {
          detail: { campaignId, prizeId: id },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }

  /** Arcade compact eligible → a CTA that opens the dedicated reward-selection screen. */
  private renderRewardsCta(): TemplateResult {
    return html`<button class="rewards-cta" type="button" @click=${this.#viewRewards}>
      ${giftIcon}<span>Pick your prize</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
    </button>`;
  }

  #viewRewards = (): void => {
    if (!this.campaign) return;
    this.dispatchEvent(
      new CustomEvent("pq-view-rewards", {
        detail: { campaignId: this.campaign.id },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private renderHero(c: Campaign): TemplateResult {
    const pill = STATUS_PILL[c.status];
    return html`
      <section class="hero">
        <div class="eyebrow-row">
          <pq-status-pill .variant=${pill.variant} .label=${pill.label}></pq-status-pill>
          ${c.expiresAt ? html`<span class="timer">Expires ${c.expiresAt}</span>` : nothing}
        </div>
        <h2 class="title">${c.name}</h2>
        <p class="sub">${c.meta}</p>
        <div class="progress-head">
          <span class="progress-label">Progress</span>
          <span class="progress-value">${c.pct}%</span>
        </div>
        <pq-progress-bar
          .value=${c.progress}
          .max=${c.goal}
          .variant=${this.eligible ? "complete" : "default"}
        ></pq-progress-bar>
        <p class="earn">
          <strong>How to earn:</strong> reach $${c.goal.toLocaleString()} in tracked play to
          unlock every prize in the vault.
        </p>
      </section>
    `;
  }

  private renderVault(): TemplateResult {
    const prizes = this.prizes;
    const claimReady = this.eligible && Boolean(this.selectedPrizeId);
    return html`
      <section class="vault" @pq-prize-select=${this.handlePrizeSelect}>
        <div class="vault-head">
          <h3 class="vault-title">Prize vault</h3>
          <span class="vault-count">${prizes.length} ${this.eligible ? "available" : "locked"}</span>
        </div>
        <div class="grid">
          ${prizes.map(
            (p) => html`<pq-prize-tile
              .prize=${p}
              .state=${this.tileState}
              .selected=${this.selectedPrizeId === p.id}
            ></pq-prize-tile>`,
          )}
        </div>
        <button class="claim" ?disabled=${!claimReady} @click=${this.handleClaim}>
          ${claimReady ? "Claim your prize" : this.eligible ? "Select a prize" : "Keep playing to unlock"}
        </button>
      </section>
    `;
  }

  private renderSkeleton(): TemplateResult {
    return html`<div class="wrap">
      <section class="hero">
        <span class="sk" style="height:12px;width:35%;margin-bottom:12px"></span>
        <span class="sk" style="height:26px;width:65%;margin-bottom:12px"></span>
        <span class="sk" style="height:2px;width:100%;margin-bottom:16px"></span>
        <span class="sk" style="height:44px;width:100%"></span>
      </section>
    </div>`;
  }

  private handlePrizeSelect = (event: Event): void => {
    const { id } = (event as CustomEvent<{ id: string }>).detail;
    this.selectedPrizeId = id;
    // event already bubbles (composed) to consumers; nothing else to do for standard/expanded.
    // Compact (TTD) has no separate claim CTA — tapping a prize selects AND starts the claim.
    // Deferred to a microtask so the host's `pq-prize-select` handler (selectPrize) runs first.
    if (this.profile === "compact" && this.eligible && this.campaign) {
      const campaignId = this.campaign.id;
      queueMicrotask(() => {
        this.dispatchEvent(
          new CustomEvent("pq-claim-start", {
            detail: { campaignId, prizeId: id },
            bubbles: true,
            composed: true,
          }),
        );
      });
    }
  };

  private handleBack = (): void => {
    this.dispatchEvent(new CustomEvent("pq-back", { bubbles: true, composed: true }));
  };

  private handleClaim = (): void => {
    if (!this.campaign || !this.eligible || !this.selectedPrizeId) return;
    this.dispatchEvent(
      new CustomEvent("pq-claim-start", {
        detail: { campaignId: this.campaign.id, prizeId: this.selectedPrizeId },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

if (!customElements.get("pq-campaign-detail")) {
  customElements.define("pq-campaign-detail", PqCampaignDetail);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-campaign-detail": PqCampaignDetail;
  }
}

export type { DetailProfile, ClaimStartDetail } from "./types";
