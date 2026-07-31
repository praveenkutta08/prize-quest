import { LitElement, html, nothing, type TemplateResult } from "lit";
import type { Campaign, CampaignStatus } from "@pq/mock-data";
/**
 * Inline style resolving the per-category accent ramp from the `--pq-cat-{category}`
 * custom properties applyTokens writes from the active tenant's categoryMap, falling
 * back to purple. Pure CSS-var driven — no @pq/tenants import in the widget.
 */
function catTintStyle(category: string | undefined): string {
  const k = (category ?? "").trim();
  const v = (suffix: string) =>
    k ? `var(--pq-cat-${k}${suffix}, var(--cat-purple${suffix}))` : `var(--cat-purple${suffix})`;
  return `--cat-tint:${v("")};--cat-tint-deep:${v("-deep")};--cat-tint-bright:${v("-bright")};--cat-tint-bg:${v("-glow")};--cat-tint-glow:${v("-glow")}`;
}
import { styles } from "./styles";
import type { CardProfile } from "./types";
// Register the composed child widgets. Progress is no longer part of the patron-facing
// card on any surface, so <pq-progress-bar> is deliberately NOT composed here.
import "@pq/pq-status-pill";
import type { StatusPillVariant } from "@pq/pq-status-pill";

/* Detail-pane icons for the two-pane arcade card (customer design): calendar (when),
   chip (what to do), gift (what you win). */
const stepIcons = [
  html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>`,
  html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>`,
  html`<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <rect x="3" y="9" width="18" height="12" rx="1" />
    <path d="M12 9v12M3 13h18M12 9S10 4 7.5 5.5 9 9 12 9ZM12 9s2-5 4.5-3.5S15 9 12 9Z" />
  </svg>`,
];

/** "Jun 30" from an ISO date; falls back to the raw string for non-ISO values. */
function endsLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* 3-D gold trophy matching the customer mock: gradient cup with a star emblem on a
   dark plinth. Gradient stops resolve through tenant tokens (with gold fallbacks) so
   the art re-themes per tenant; IDs are safe because each card owns its shadow root. */
const trophyArt = html`<svg viewBox="0 0 64 64" aria-hidden="true">
  <defs>
    <linearGradient id="tro-cup" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color: var(--arc-display-bright, #ffee5c)" />
      <stop offset="0.45" style="stop-color: var(--arc-display, #ffd93d)" />
      <stop offset="1" style="stop-color: var(--arc-display-deep, #b8860b)" />
    </linearGradient>
    <linearGradient id="tro-stem" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color: var(--arc-display, #ffd93d)" />
      <stop offset="1" style="stop-color: var(--arc-display-deep, #b8860b)" />
    </linearGradient>
  </defs>
  <path
    d="M13 14h-7v6a10 10 0 0 0 10 10"
    fill="none"
    stroke="url(#tro-cup)"
    stroke-width="3.6"
    stroke-linecap="round"
  />
  <path
    d="M51 14h7v6a10 10 0 0 1-10 10"
    fill="none"
    stroke="url(#tro-cup)"
    stroke-width="3.6"
    stroke-linecap="round"
  />
  <path d="M14 10h36v12a18 15 0 0 1-36 0Z" fill="url(#tro-cup)" />
  <ellipse cx="32" cy="10" rx="18" ry="3.4" fill="var(--arc-display-bright, #ffee5c)" />
  <path
    d="M32 17l2.2 4.6 5 .6-3.7 3.4 1 4.9-4.5-2.5-4.5 2.5 1-4.9-3.7-3.4 5-.6z"
    fill="var(--arc-tint-ink, rgba(0,0,0,0.55))"
    opacity="0.75"
  />
  <path d="M28 39h8l1.6 7h-11.2z" fill="url(#tro-stem)" />
  <rect x="21" y="47" width="22" height="5" rx="1.6" fill="var(--arc-bg-elev, #3a1a5e)" />
  <rect x="17" y="52" width="30" height="7" rx="2" fill="var(--arc-bg-elev, #3a1a5e)" />
  <path
    d="M32 53l1.3 2.6 2.9.4-2.1 2 .5 2.8-2.6-1.4-2.6 1.4.5-2.8-2.1-2 2.9-.4z"
    fill="var(--arc-display, #ffd93d)"
  />
</svg>`;

const giftGlyph = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <rect x="3" y="9" width="18" height="12" rx="1" />
  <path d="M12 9v12M3 13h18M12 9S10 4 7.5 5.5 9 9 12 9ZM12 9s2-5 4.5-3.5S15 9 12 9Z" />
</svg>`;

interface StatusPresentation {
  pill: StatusPillVariant;
  pillLabel?: string;
  /** Short status-chip label for the expanded image overlay. */
  chip: string;
  /** Status-chip background token kind: success / info / danger. */
  chipKind: "ready" | "active" | "locked";
  ready: boolean;
  dimmed: boolean;
  clickable: boolean;
}

/** How each campaign status presents: pill and interactivity. */
const STATUS: Record<CampaignStatus, StatusPresentation> = {
  eligible: {
    pill: "eligible",
    pillLabel: "Ready",
    chip: "Ready",
    chipKind: "ready",
    ready: true,
    dimmed: false,
    clickable: true,
  },
  "in-progress": {
    pill: "in-progress",
    chip: "In Progress",
    chipKind: "active",
    ready: false,
    dimmed: false,
    clickable: true,
  },
  claimed: {
    pill: "claimed",
    chip: "Claimed",
    chipKind: "active",
    ready: false,
    dimmed: false,
    clickable: true,
  },
  expired: {
    pill: "expired",
    chip: "Expired",
    chipKind: "locked",
    ready: false,
    dimmed: true,
    clickable: false,
  },
  locked: {
    pill: "locked",
    chip: "Locked",
    chipKind: "locked",
    ready: false,
    dimmed: true,
    clickable: false,
  },
};

const trophyIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.6"
  aria-hidden="true"
>
  <path d="M6 4h12v3a6 6 0 0 1-12 0V4Z" />
  <path d="M6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3M9 15h6M12 13v2M8 20h8" />
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

/**
 * `<pq-campaign-card>` — renders a campaign in one of three profiles, composing
 * `<pq-progress-bar>` and `<pq-status-pill>`. Fires `pq-card-click` (detail.id)
 * when an interactive card is activated; expired/locked cards don't fire.
 *
 * Props:
 * - `campaign` Campaign (set as a property, not an attribute)
 * - `profile`  'compact' | 'standard' | 'expanded' (default 'standard')
 * - `loading`  boolean — render a skeleton matching the profile layout
 */
export class PqCampaignCard extends LitElement {
  static override styles = styles;

  static override properties = {
    campaign: { attribute: false },
    profile: { type: String, reflect: true },
    loading: { type: Boolean, reflect: true },
  };

  declare campaign?: Campaign;
  declare profile: CardProfile;
  declare loading: boolean;

  constructor() {
    super();
    this.profile = "standard";
    this.loading = false;
  }

  private get pres(): StatusPresentation | null {
    return this.campaign ? STATUS[this.campaign.status] : null;
  }

  private get clickable(): boolean {
    return !this.loading && Boolean(this.pres?.clickable) && Boolean(this.campaign);
  }

  override render(): TemplateResult {
    if (this.loading || !this.campaign) return this.renderSkeleton();
    switch (this.profile) {
      case "compact":
        return this.renderCompact(this.campaign);
      case "expanded":
        return this.renderExpanded(this.campaign);
      default:
        return this.renderStandard(this.campaign);
    }
  }

  private renderStandard(c: Campaign): TemplateResult {
    return html`
      <div class="card" @click=${this.handleActivate} @keydown=${this.handleKeydown}>
        <div class="body">
          <h3 class="title">${c.name}</h3>
          <p class="meta">${c.meta}</p>
        </div>
        <span class="arrow">${chevronIcon}</span>
      </div>
    `;
  }

  private renderExpanded(c: Campaign): TemplateResult {
    const pres = STATUS[c.status];
    // Per-category accent resolved from --pq-cat-{category} (set by applyTokens from the
    // tenant categoryMap); CSS reads the --cat-tint vars set inline here.
    return html`
      <div
        class="card card--cat"
        style=${catTintStyle(c.category)}
        @click=${this.handleActivate}
        @keydown=${this.handleKeydown}
      >
        <div class="img">
          <span class="img-glow"></span>
          <span class="icon">${trophyIcon}</span>
          ${c.frequency ? html`<span class="chip chip--freq">${c.frequency}</span>` : nothing}
          <pq-status-pill
            class="chip chip--status"
            profile="expanded"
            .variant=${pres.pill}
            .label=${pres.pillLabel ?? pres.chip}
          ></pq-status-pill>
        </div>
        <div class="body">
          <div class="head">
            <h3 class="title">${c.name}</h3>
            <p class="sub">${c.description ?? c.meta}</p>
          </div>
          <button class="cta" type="button" tabindex="-1">
            ${pres.ready ? "Claim Reward" : "View Campaign"}
          </button>
        </div>
      </div>
    `;
  }

  private renderCompact(c: Campaign): TemplateResult {
    // Arcade compact gets the diagonal hero-art layout (Session 33). Casino-loud
    // and premium compact keep the dense bar layout below — mode is read from the
    // global <html data-pq-mode> (same pattern as pq-campaign-detail's formfactor).
    if (document.documentElement.dataset.pqMode === "arcade") {
      return this.renderCompactArcade(c);
    }
    const pres = STATUS[c.status];
    // The CTA is a visual affordance; clicks bubble to the card's @click handler.
    return html`
      <div class="card" @click=${this.handleActivate} @keydown=${this.handleKeydown}>
        <div class="row">
          <h3 class="title">${c.name}</h3>
          <span class="pill">${pres.chip}</span>
        </div>
        <p class="meta">${c.meta}</p>
        <button class="cta" type="button" tabindex="-1">${pres.ready ? "Claim →" : "View"}</button>
      </div>
    `;
  }

  /**
   * Arcade compact card — customer-approved TWO-PANE layout (mirrors the supplied
   * mock): a poster on the left (trophy art over a gold glow, campaign name, prize
   * count chip, big COLLECT button) and a detail column on the right (Promotion
   * Overview / How It Works / Prizes). Deliberately NO currency anywhere — amounts in
   * the copy are plain numbers ("Wager 500"), per the customer.
   *
   * The whole card stays one tap target: the COLLECT button is a visual affordance
   * (rendered as a span) whose click bubbles to the card's handler, exactly like the
   * old CTA. Content comes from the campaign's overview/steps/prizesNote fields with
   * fallbacks derived from fields every campaign already has, so campaigns that
   * predate the fields still render a complete card.
   */
  private renderCompactArcade(c: Campaign): TemplateResult {
    const pres = STATUS[c.status];
    const count = c.prizeIds.length;
    const overview = c.overview ?? c.description ?? c.meta;
    const steps = (c.steps ?? []).slice(0, 3);
    const prizesNote =
      c.prizesNote ?? (count > 0 ? `${count} prize${count === 1 ? "" : "s"} to choose from.` : "");
    const cta = pres.ready
      ? "Collect"
      : c.status === "claimed"
        ? "View prize"
        : c.status === "in-progress"
          ? "View details"
          : pres.chip;
    return html`
      <div
        class="cmpd"
        style=${catTintStyle(c.category)}
        @click=${this.handleActivate}
        @keydown=${this.handleKeydown}
      >
        <div class="promo__poster">
          <div class="promo__art">${trophyArt}</div>
          ${this.renderSplitName(c.name)}
          <span class="promo__chip">${giftGlyph} ${count} ${count === 1 ? "Prize" : "Prizes"}</span>
          <span class="promo__ctawrap">
            <span class="promo__cta ${pres.clickable ? "" : "promo__cta--off"}">
              <span class="promo__cta-badge">${giftGlyph}</span>
              <span class="promo__cta-label">${cta}</span>
            </span>
          </span>
        </div>
        <div class="promo__info">
          <section class="promo__sec">
            <h4 class="promo__h">Promotion Overview</h4>
            <p class="promo__p">${overview}</p>
          </section>
          ${steps.length
            ? html`<section class="promo__sec">
                <h4 class="promo__h">How It Works</h4>
                ${steps.map(
                  (step, i) =>
                    html`<div class="promo__step">
                      <span class="promo__step-ico">${stepIcons[i % stepIcons.length]}</span>
                      <span>${step}</span>
                    </div>`,
                )}
              </section>`
            : nothing}
          ${prizesNote
            ? html`<section class="promo__sec">
                <h4 class="promo__h">Prizes</h4>
                <p class="promo__p">
                  ${prizesNote}${c.expiresAt
                    ? html` <span class="promo__ends">· Ends ${endsLabel(c.expiresAt)}</span>`
                    : nothing}
                </p>
              </section>`
            : nothing}
        </div>
      </div>
    `;
  }

  /**
   * Two-tone poster name per the mock: everything but the last word in white on the
   * first line, the last word in gold flanked by em-dashes ("SUNDAY SLOT" / "— SPRINT —").
   * Single-word names render entirely in the gold treatment.
   */
  private renderSplitName(name: string): TemplateResult {
    const words = name.trim().split(/\s+/);
    const last = words.pop() ?? "";
    return html`<h3 class="promo__name">
      ${words.length ? html`<span class="promo__name-top">${words.join(" ")}</span>` : nothing}
      <span class="promo__name-gold"><i>—</i> ${last} <i>—</i></span>
    </h3>`;
  }

  private renderSkeleton(): TemplateResult {
    if (this.profile === "compact") {
      return html`<div class="card">
        <span class="sk sk--line" style="width:60%"></span>
        <span class="sk sk--line" style="width:32px"></span>
      </div>`;
    }
    if (this.profile === "expanded") {
      return html`<div class="card">
        <div class="img"><span class="sk sk--icon"></span></div>
        <div class="body">
          <span class="sk sk--title"></span>
          <span class="sk sk--meta"></span>
          <span class="sk sk--bar"></span>
          <span class="sk sk--meta" style="margin:0"></span>
        </div>
      </div>`;
    }
    return html`<div class="card">
      <div class="body">
        <span class="sk sk--title"></span>
        <span class="sk sk--meta"></span>
        <span class="sk sk--bar"></span>
      </div>
      <span class="arrow"></span>
    </div>`;
  }

  private handleActivate = (): void => {
    if (!this.clickable || !this.campaign) return;
    this.dispatchEvent(
      new CustomEvent("pq-card-click", {
        detail: { id: this.campaign.id },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.handleActivate();
    }
  };

  protected override updated(): void {
    const pres = this.pres;
    this.toggleAttribute("ready", !this.loading && Boolean(pres?.ready));
    this.toggleAttribute("dimmed", !this.loading && Boolean(pres?.dimmed));

    if (this.clickable) {
      this.setAttribute("role", "button");
      this.setAttribute("tabindex", "0");
      if (this.campaign) this.setAttribute("aria-label", this.campaign.name);
    } else {
      this.removeAttribute("role");
      this.removeAttribute("tabindex");
    }
  }
}

if (!customElements.get("pq-campaign-card")) {
  customElements.define("pq-campaign-card", PqCampaignCard);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-campaign-card": PqCampaignCard;
  }
}

export type { CardProfile, CardClickDetail } from "./types";
