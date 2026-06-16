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
// Register the composed child widgets.
import "@pq/pq-progress-bar";
import "@pq/pq-status-pill";
import type { ProgressBarVariant } from "@pq/pq-progress-bar";
import type { StatusPillVariant } from "@pq/pq-status-pill";

/** Trophy used on the arcade hero panel (swap for operator artwork in prod). */
const HERO_ICON = "🏆";

/** Whole-dollar money label, e.g. "$1,920". */
function money(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/** "2 days 14 hours left" / "14 hours left" / "Ended" from an ISO date. */
function countdownLabel(expiresAt: string | undefined): string {
  if (!expiresAt) return "";
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return "Ended";
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (days > 0)
    return `${days} day${days === 1 ? "" : "s"} ${remHours} hour${remHours === 1 ? "" : "s"} left`;
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} left`;
  return "Ends soon";
}

/** 5-segment states from a 0–100 percentage (done / current / upcoming). */
function segmentStates(pct: number): ("done" | "current" | "")[] {
  const p = Math.max(0, Math.min(100, pct));
  return Array.from({ length: 5 }, (_, i) => {
    if ((i + 1) * 20 <= p) return "done";
    if (i * 20 < p && p < (i + 1) * 20) return "current";
    return "";
  });
}

interface StatusPresentation {
  pill: StatusPillVariant;
  pillLabel?: string;
  /** Short status-chip label for the expanded image overlay. */
  chip: string;
  /** Status-chip background token kind: success / info / danger. */
  chipKind: "ready" | "active" | "locked";
  progress: ProgressBarVariant;
  ready: boolean;
  dimmed: boolean;
  clickable: boolean;
}

/** How each campaign status presents: pill, progress fill, and interactivity. */
const STATUS: Record<CampaignStatus, StatusPresentation> = {
  eligible: { pill: "eligible", pillLabel: "Ready", chip: "Ready", chipKind: "ready", progress: "complete", ready: true, dimmed: false, clickable: true },
  "in-progress": { pill: "in-progress", chip: "In Progress", chipKind: "active", progress: "default", ready: false, dimmed: false, clickable: true },
  claimed: { pill: "claimed", chip: "Claimed", chipKind: "active", progress: "default", ready: false, dimmed: false, clickable: true },
  expired: { pill: "expired", chip: "Expired", chipKind: "locked", progress: "default", ready: false, dimmed: true, clickable: false },
  locked: { pill: "locked", chip: "Locked", chipKind: "locked", progress: "default", ready: false, dimmed: true, clickable: false },
};

const trophyIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
  <path d="M6 4h12v3a6 6 0 0 1-12 0V4Z" />
  <path d="M6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3M9 15h6M12 13v2M8 20h8" />
</svg>`;

const chevronIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
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
    const pres = STATUS[c.status];
    return html`
      <div class="card" @click=${this.handleActivate} @keydown=${this.handleKeydown}>
        <div class="body">
          <h3 class="title">${c.name}</h3>
          <p class="meta">${c.meta}</p>
          <pq-progress-bar
            .value=${c.progress}
            .max=${c.goal}
            .variant=${pres.progress}
          ></pq-progress-bar>
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
          ${c.frequency
            ? html`<span class="chip chip--freq">${c.frequency}</span>`
            : nothing}
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
          <pq-progress-bar
            profile="expanded"
            label="Progress"
            .value=${c.progress}
            .max=${c.goal}
            .variant=${pres.progress}
          ></pq-progress-bar>
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
    const width = Math.max(0, Math.min(100, c.pct));
    // The CTA is a visual affordance; clicks bubble to the card's @click handler.
    return html`
      <div class="card" @click=${this.handleActivate} @keydown=${this.handleKeydown}>
        <div class="row">
          <h3 class="title">${c.name}</h3>
          <span class="pill">${pres.ready ? "Ready" : `${c.pct}%`}</span>
        </div>
        <p class="meta">${c.meta}</p>
        <div class="bar">
          <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
          <span class="bar-pct">${c.pct}%</span>
        </div>
        <button class="cta" type="button" tabindex="-1">${pres.ready ? "Claim →" : "View"}</button>
      </div>
    `;
  }

  /** Arcade compact hero-art card (.cmpd) — Session 33 carousel layout. */
  private renderCompactArcade(c: Campaign): TemplateResult {
    const pres = STATUS[c.status];
    const pool = c.prizePool ?? c.goal;
    return html`
      <div
        class="cmpd"
        style=${catTintStyle(c.category)}
        @click=${this.handleActivate}
        @keydown=${this.handleKeydown}
      >
        <div class="cmpd__hero">
          <div class="cmpd__hero-icon">${HERO_ICON}</div>
          <div class="cmpd__hero-value">${money(pool)}</div>
          <div class="cmpd__hero-label">Prize Pool</div>
          <div class="cmpd__hero-pool">${c.prizeIds.length} prizes</div>
        </div>
        <div class="cmpd__main">
          <div class="cmpd__head">
            <div class="cmpd__chips">
              ${c.frequency
                ? html`<span class="cmpd__cat">${c.frequency}</span>`
                : nothing}
            </div>
            <span class="cmpd__pill cmpd__pill--${pres.chipKind}"
              >${pres.pillLabel ?? pres.chip}</span
            >
          </div>
          <h3 class="cmpd__name">${c.name}</h3>
          ${this.renderProgressBlock(c)}
          <p class="cmpd__desc">${c.description ?? c.meta}</p>
        </div>
        <div class="cmpd__foot">
          <span class="cmpd__expires">${countdownLabel(c.expiresAt)}</span>
        </div>
      </div>
    `;
  }

  /** Progress block — segmented (default) or shimmer per `<html data-pq-progress-style>`. */
  private renderProgressBlock(c: Campaign): TemplateResult {
    return document.documentElement.dataset.pqProgressStyle === "shimmer"
      ? this.renderShimmer(c)
      : this.renderSegmented(c);
  }

  private renderSegmented(c: Campaign): TemplateResult {
    const remain = Math.max(0, c.goal - c.progress);
    return html`
      <div class="cmpd__progblock cmpd__progblock--segmented">
        <div class="cmpd__progblock-row">
          <span class="cmpd__progblock-label">Wager Progress</span>
          <span class="cmpd__progblock-val"
            ><strong>${money(c.progress)}</strong> / ${money(c.goal)}</span
          >
          <span class="cmpd__progblock-remain"
            >${remain > 0 ? `${money(remain)} to go` : "Complete"}</span
          >
        </div>
        <div class="cmpd__progblock-segs">
          ${segmentStates(c.pct).map(
            (s) =>
              html`<div class="cmpd__seg ${s ? `cmpd__seg--${s}` : ""}"></div>`,
          )}
        </div>
      </div>
    `;
  }

  private renderShimmer(c: Campaign): TemplateResult {
    const width = Math.max(0, Math.min(100, c.pct));
    return html`
      <div class="cmpd__progblock cmpd__progblock--shimmer">
        <div class="cmpd__progblock-row">
          <span class="cmpd__progblock-label">Wager Progress</span>
          <span class="cmpd__progblock-val"
            ><strong>${money(c.progress)}</strong> / ${money(c.goal)}</span
          >
          <span class="cmpd__shim-pct">${c.pct}%</span>
        </div>
        <div class="cmpd__shim-bar">
          <div class="cmpd__shim-fill" style="width:${width}%"></div>
        </div>
      </div>
    `;
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
