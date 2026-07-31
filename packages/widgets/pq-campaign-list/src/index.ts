import { LitElement, html, nothing, type TemplateResult } from "lit";
import type { Campaign, Player } from "@pq/mock-data";
import { bindAtom, $campaigns, $player } from "@pq/store";
import { styles } from "./styles";
import type { CampaignListVariant } from "./types";
import "@pq/pq-campaign-card";
import "@pq/pq-promo-hero";
import "@pq/pq-list-carousel";

const chevronLeft = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.5"
  aria-hidden="true"
>
  <polyline points="15 18 9 12 15 6" />
</svg>`;
const chevronRight = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.5"
  aria-hidden="true"
>
  <polyline points="9 18 15 12 9 6" />
</svg>`;

/** Expanded campaign-list filter pills (Section 01 chrome). `all` shows everything. */
const LIST_FILTERS = [
  { key: "all", label: "All Campaigns" },
  { key: "ready", label: "Ready" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
] as const;
type ListFilter = (typeof LIST_FILTERS)[number]["key"];

/**
 * `<pq-campaign-list>` — renders a set of campaigns as a vertical stack of standard
 * `<pq-campaign-card>`s, a responsive grid of expanded ones (kiosk "All campaigns"),
 * or — when explicitly opted into via `variant="carousel"` — a horizontal rail.
 * Optionally features one campaign as a `<pq-promo-hero>` at the top. Child
 * `pq-card-click` events bubble (composed) through this element unchanged.
 *
 * Props: `campaigns`, `variant` (stack|carousel|grid), `loading`, `featuredId?`, `heading?`.
 */
export class PqCampaignList extends LitElement {
  static override styles = styles;

  static override properties = {
    campaigns: { attribute: false },
    variant: { type: String, reflect: true },
    profile: { type: String, reflect: true },
    loading: { type: Boolean, reflect: true },
    featuredId: { type: String },
    heading: { type: String },
    ordersCard: { type: Boolean, attribute: "orders-card" },
    _player: { state: true },
    _filter: { state: true },
  };

  declare campaigns: Campaign[];
  /** Explicit layout override. When unset, derived from `profile`. */
  declare variant?: CampaignListVariant;
  /** Surface density (pushed by `<pq-screen>` from the channel). */
  declare profile: "compact" | "standard" | "expanded";
  declare loading: boolean;
  declare featuredId?: string;
  declare heading?: string;
  /**
   * Append a trailing "Order History" card to the compact carousel. Off by default;
   * the TTD / iVIEW home compositions opt in so the screen is never empty for a patron
   * with no live promotions.
   */
  declare ordersCard: boolean;
  /** Drives the expanded greeting headline ("Good afternoon, {firstName}"). */
  declare private _player: Player | null;
  /** Active filter pill (expanded grid only). */
  declare private _filter: ListFilter;

  constructor() {
    super();
    this.ordersCard = false;
    this.campaigns = [];
    this.profile = "standard";
    this.loading = false;
    this._player = null;
    this._filter = "all";
    // Store wins when populated; the `campaigns` prop is the Storybook/test fallback.
    bindAtom(this, $campaigns, "campaigns");
    bindAtom(this, $player, "_player");
  }

  /** Layout to render: explicit `variant` wins, else expanded surfaces get the grid. */
  private get effectiveVariant(): CampaignListVariant {
    return this.variant ?? (this.profile === "expanded" ? "grid" : "stack");
  }

  override render(): TemplateResult {
    if (this.loading) return this.renderLoading();

    const featured = this.featuredId
      ? this.campaigns.find((c) => c.id === this.featuredId)
      : undefined;
    const rest = featured ? this.campaigns.filter((c) => c.id !== featured.id) : this.campaigns;

    if (!featured && rest.length === 0) {
      return html`<div class="empty"><p>No campaigns available right now.</p></div>`;
    }

    return html`
      ${featured
        ? html`<div class="featured">
            <pq-promo-hero .campaign=${featured} profile="standard"></pq-promo-hero>
          </div>`
        : nothing}
      ${this.renderBody(rest)}
    `;
  }

  /** Dispatch the layout body by effective variant (no mode branching). */
  private renderBody(campaigns: Campaign[]): TemplateResult {
    const layouts: Record<CampaignListVariant, (c: Campaign[]) => TemplateResult> = {
      stack: (c) => this.renderStack(c),
      carousel: (c) => this.renderCarousel(c),
      grid: (c) => this.renderGrid(c),
    };
    return layouts[this.effectiveVariant](campaigns);
  }

  private renderStack(campaigns: Campaign[]): TemplateResult {
    // Arcade compact gets the Session 33 paged carousel of hero cards (one per
    // page). Casino-loud / premium compact + standard keep the vertical stack.
    if (this.profile === "compact" && document.documentElement.dataset.pqMode === "arcade") {
      return html`<pq-list-carousel
        class="carousel"
        .itemsPerPage=${1}
        aria-label=${this.heading ?? "Your campaigns"}
      >
        ${campaigns.map(
          (c) => html`<pq-campaign-card .campaign=${c} profile="compact"></pq-campaign-card>`,
        )}
        ${this.ordersCard ? this.renderOrdersCard() : nothing}
      </pq-list-carousel>`;
    }
    return html`<div class="stack">
      ${campaigns.map(
        (c) => html`<pq-campaign-card .campaign=${c} .profile=${this.profile}></pq-campaign-card>`,
      )}
    </div>`;
  }

  /**
   * The always-last card in the compact carousel: a ghost "Order History" card.
   *
   * It exists so the screen is never empty — a patron with no live promotions would
   * otherwise land on a blank carousel. It is deliberately styled as a UTILITY card
   * (dashed border, hollow surface, no prize pool / countdown / status pill) so it
   * never reads as something you can win. Firing `pq-view-orders` keeps the widget
   * free of routing knowledge; the host app decides what it means.
   */
  private renderOrdersCard(): TemplateResult {
    return html`
      <button
        class="orders-card"
        type="button"
        @click=${() =>
          this.dispatchEvent(new CustomEvent("pq-view-orders", { bubbles: true, composed: true }))}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          aria-hidden="true"
        >
          <path
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
          />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
        <span class="orders-card__name">Order History</span>
        <span class="orders-card__sub">Past prizes · tracking · receipts</span>
        <span class="orders-card__go">View orders →</span>
      </button>
    `;
  }

  private renderCarousel(campaigns: Campaign[]): TemplateResult {
    return html`
      <div class="rail-head">
        <h3 class="rail-title">${this.heading ?? "Campaigns"}</h3>
        <div class="rail-controls">
          <button class="rail-ctl" aria-label="Previous" @click=${() => this.scrollRail(-1)}>
            ${chevronLeft}
          </button>
          <button class="rail-ctl" aria-label="Next" @click=${() => this.scrollRail(1)}>
            ${chevronRight}
          </button>
        </div>
      </div>
      <div class="rail">
        ${campaigns.map(
          (c) => html`<pq-campaign-card .campaign=${c} profile="expanded"></pq-campaign-card>`,
        )}
      </div>
    `;
  }

  /** Filter predicate for the active pill (ready→eligible, completed→claimed). */
  private matchesFilter(c: Campaign): boolean {
    switch (this._filter) {
      case "ready":
        return c.status === "eligible";
      case "in-progress":
        return c.status === "in-progress";
      case "completed":
        return c.status === "claimed";
      default:
        return true;
    }
  }

  private setFilter(key: ListFilter): void {
    this._filter = key;
  }

  private goBack(): void {
    this.dispatchEvent(new CustomEvent("pq-back", { bubbles: true, composed: true }));
  }

  /**
   * Kiosk "All campaigns" (reference Screen 01): a back-to-hub affordance, a
   * greeting block (welcome + quick-stats), filter pills, and a responsive
   * multi-up grid of expanded cards. Greeting counts derive from the full
   * campaign set; the grid honours the active filter pill.
   */
  private renderGrid(campaigns: Campaign[]): TemplateResult {
    const filtered = campaigns.filter((c) => this.matchesFilter(c));
    const ready = this.campaigns.filter((c) => c.status === "eligible").length;
    // "Quests in progress" counts every non-claimable, non-terminal campaign —
    // both `in-progress` and `locked` (still accruing) — matching the reference
    // greeting ("…and N quests in progress").
    const active = this.campaigns.filter(
      (c) => c.status === "in-progress" || c.status === "locked",
    ).length;
    const firstName = this._player?.name?.split(" ")[0] ?? "there";

    return html`
      <button class="cl-back" type="button" @click=${this.goBack}>
        ${chevronLeft}<span>Back to hub</span>
      </button>
      <div class="greeting">
        <div class="greeting__intro">
          <span class="greeting__eyebrow">Welcome back</span>
          <h1 class="greeting__headline">
            Good afternoon, <span class="greeting__name">${firstName}</span>
          </h1>
          <p class="greeting__sub">
            You've got <strong>${ready} reward${ready === 1 ? "" : "s"} ready to claim</strong>
            and ${active} quest${active === 1 ? "" : "s"} in progress. Tap any campaign to explore.
          </p>
        </div>
        <div class="stats-2col">
          <div class="stat-card stat-card--ready">
            <div class="stat-card__eyebrow">Ready</div>
            <div class="stat-card__num">${ready}</div>
            <div class="stat-card__sub">Reward to claim</div>
          </div>
          <div class="stat-card stat-card--active">
            <div class="stat-card__eyebrow">Active</div>
            <div class="stat-card__num">${active}</div>
            <div class="stat-card__sub">Quests in progress</div>
          </div>
        </div>
      </div>

      <div class="filter-row">
        <span class="filter-label">Filter</span>
        ${LIST_FILTERS.map(
          (f) =>
            html`<button
              class="filter-pill ${this._filter === f.key ? "filter-pill--active" : ""}"
              type="button"
              @click=${() => this.setFilter(f.key)}
            >
              ${f.label}
            </button>`,
        )}
        <span class="cl-showing">Showing ${filtered.length} of ${campaigns.length}</span>
      </div>

      <div class="grid">
        ${filtered.map(
          (c) => html`<pq-campaign-card .campaign=${c} profile="expanded"></pq-campaign-card>`,
        )}
      </div>
    `;
  }

  private renderLoading(): TemplateResult {
    const skeletons = [0, 1, 2];
    if (this.effectiveVariant === "carousel") {
      return html`<div class="rail">
        ${skeletons.map(
          () => html`<pq-campaign-card profile="expanded" .loading=${true}></pq-campaign-card>`,
        )}
      </div>`;
    }
    if (this.effectiveVariant === "grid") {
      return html`<div class="grid">
        ${skeletons.map(
          () => html`<pq-campaign-card profile="expanded" .loading=${true}></pq-campaign-card>`,
        )}
      </div>`;
    }
    return html`<div class="stack">
      ${skeletons.map(
        () => html`<pq-campaign-card profile="standard" .loading=${true}></pq-campaign-card>`,
      )}
    </div>`;
  }

  private scrollRail(direction: 1 | -1): void {
    const rail = this.shadowRoot?.querySelector<HTMLElement>(".rail");
    if (rail) rail.scrollBy({ left: direction * 316, behavior: "smooth" });
  }
}

if (!customElements.get("pq-campaign-list")) {
  customElements.define("pq-campaign-list", PqCampaignList);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-campaign-list": PqCampaignList;
  }
}

export type { CampaignListVariant } from "./types";
