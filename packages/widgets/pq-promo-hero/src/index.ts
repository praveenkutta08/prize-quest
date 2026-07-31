import { LitElement, html, nothing, type TemplateResult } from "lit";
import type { Campaign, CampaignStatus, Prize } from "@pq/mock-data";
import { styles } from "./styles";
import type { HeroProfile } from "./types";
import "@pq/pq-status-pill";
import type { StatusPillVariant } from "@pq/pq-status-pill";

interface StatusPresentation {
  pill: StatusPillVariant;
  pillLabel?: string;
  cta: string;
  ready: boolean;
  dimmed: boolean;
  enabled: boolean;
}

const STATUS: Record<CampaignStatus, StatusPresentation> = {
  eligible: {
    pill: "eligible",
    pillLabel: "Ready to claim",
    cta: "Pick your prize",
    ready: true,
    dimmed: false,
    enabled: true,
  },
  "in-progress": {
    pill: "in-progress",
    cta: "View details",
    ready: false,
    dimmed: false,
    enabled: true,
  },
  claimed: { pill: "claimed", cta: "View prize", ready: false, dimmed: false, enabled: true },
  expired: { pill: "expired", cta: "Campaign ended", ready: false, dimmed: true, enabled: false },
  locked: { pill: "locked", cta: "Locked", ready: false, dimmed: true, enabled: false },
};

const giftIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.4"
  aria-hidden="true"
>
  <rect x="3" y="8" width="18" height="13" rx="1" />
  <path d="M12 8v13M3 12h18M12 8S10 3 7.5 4.5 9 8 12 8ZM12 8s2-5 4.5-3.5S15 8 12 8Z" />
</svg>`;
const chevronIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="3"
  aria-hidden="true"
>
  <polyline points="9 18 15 12 9 6" />
</svg>`;

/**
 * `<pq-promo-hero>` — the featured campaign hero. Composes `<pq-status-pill>` as the
 * eyebrow. Three profiles; compact is glanceable (no CTA/thumbs). The CTA fires
 * `pq-hero-cta` (detail.id); disabled when expired/locked.
 *
 * NO PROGRESS UI — the progress block was removed from the whole patron flow, so the
 * campaign name carries the hero.
 */
export class PqPromoHero extends LitElement {
  static override styles = styles;

  static override properties = {
    campaign: { attribute: false },
    prizes: { attribute: false },
    profile: { type: String, reflect: true },
    ctaLabel: { type: String },
    maxThumbs: { type: Number },
    loading: { type: Boolean, reflect: true },
  };

  declare campaign?: Campaign;
  declare prizes: Prize[];
  declare profile: HeroProfile;
  declare ctaLabel?: string;
  declare maxThumbs?: number;
  declare loading: boolean;

  constructor() {
    super();
    this.prizes = [];
    this.profile = "standard";
    this.loading = false;
  }

  private get pres(): StatusPresentation | null {
    return this.campaign ? STATUS[this.campaign.status] : null;
  }

  private get thumbCount(): number {
    return this.maxThumbs ?? (this.profile === "expanded" ? 4 : 3);
  }

  override render(): TemplateResult {
    if (this.loading || !this.campaign) return this.renderSkeleton();
    const c = this.campaign;
    const pres = STATUS[c.status];
    const showFlow = this.profile !== "compact";

    return html`
      <div class="hero">
        <div class="content">
          <div class="row1">
            <pq-status-pill .variant=${pres.pill} .label=${pres.pillLabel}></pq-status-pill>
            ${c.expiresAt ? html`<span class="timer">Expires ${c.expiresAt}</span>` : nothing}
          </div>
          <h2 class="title">${c.name}</h2>
          ${showFlow ? html`<p class="sub">${c.meta}</p>` : nothing}
          ${showFlow
            ? html`<button class="cta" ?disabled=${!pres.enabled} @click=${this.handleCta}>
                ${this.ctaLabel ?? pres.cta}${chevronIcon}
              </button>`
            : nothing}
        </div>
        ${this.profile === "expanded" ? this.renderThumbs(true) : nothing}
        ${this.profile === "standard" ? this.renderThumbs(false) : nothing}
      </div>
    `;
  }

  private renderThumbs(expanded: boolean): TemplateResult {
    const ids = this.campaign?.prizeIds ?? [];
    const count = this.prizes.length || ids.length;
    if (count === 0) return html``;
    const max = this.thumbCount;
    const shown = this.prizes.length ? this.prizes.slice(0, max) : ids.slice(0, max);
    const overflow = count - Math.min(count, max);

    if (expanded) {
      return html`<div class="thumbs">
        ${(shown as Prize[]).map(
          (p) =>
            html`<div class="thumb">
              <div class="thumb__img">
                ${giftIcon}<span class="thumb__val">$${p.value ?? ""}</span>
              </div>
              <h4 class="thumb__name">${p.name ?? "Prize"}</h4>
              <p class="thumb__cat">${p.category ?? ""}</p>
            </div>`,
        )}
      </div>`;
    }

    return html`<div class="thumbs">
      ${shown.map(() => html`<div class="thumb">${giftIcon}</div>`)}
      ${overflow > 0 ? html`<div class="thumb thumb--more">+${overflow}</div>` : nothing}
    </div>`;
  }

  private renderSkeleton(): TemplateResult {
    return html`<div class="hero">
      <div class="content">
        <span class="sk" style="display:block;height:12px;width:30%;margin-bottom:14px"></span>
        <span class="sk" style="display:block;height:28px;width:70%;margin-bottom:12px"></span>
        <span class="sk" style="display:block;height:2px;width:100%;margin-bottom:18px"></span>
        <span class="sk" style="display:block;height:48px;width:100%"></span>
      </div>
    </div>`;
  }

  private handleCta = (): void => {
    if (!this.campaign || !this.pres?.enabled) return;
    this.dispatchEvent(
      new CustomEvent("pq-hero-cta", {
        detail: { id: this.campaign.id },
        bubbles: true,
        composed: true,
      }),
    );
  };

  protected override updated(): void {
    this.toggleAttribute("dimmed", !this.loading && Boolean(this.pres?.dimmed));
  }
}

if (!customElements.get("pq-promo-hero")) {
  customElements.define("pq-promo-hero", PqPromoHero);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-promo-hero": PqPromoHero;
  }
}

export type { HeroProfile, HeroCtaDetail } from "./types";
