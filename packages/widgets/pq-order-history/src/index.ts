import { LitElement, html, nothing, type TemplateResult } from "lit";
import type { ClaimStatus, Order } from "@pq/mock-data";
import { bindAtom, $claims } from "@pq/store";
import { styles } from "./styles";
import type { OrderHistoryProfile } from "./types";
import "@pq/pq-status-pill";
import "@pq/pq-list-carousel";
import type { StatusPillVariant } from "@pq/pq-status-pill";

/** Map fulfillment status → status-pill variant + label. */
const STATUS: Record<ClaimStatus, { variant: StatusPillVariant; label: string }> = {
  processing: { variant: "in-progress", label: "Processing" },
  shipped: { variant: "shipped", label: "Shipped" },
  "in-transit": { variant: "shipped", label: "In transit" },
  delivered: { variant: "delivered", label: "Delivered" },
};

const giftIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="1" /><path d="M12 8v13M3 12h18M12 8S10 3 7.5 4.5 9 8 12 8ZM12 8s2-5 4.5-3.5S15 8 12 8Z" /></svg>`;
const backIcon = html`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>`;
const chevronDown = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>`;

/** Expanded order-history filter pills (Section 6.13). `all` shows everything. */
const FILTERS = [
  { key: "all", label: "All" },
  { key: "delivered", label: "Delivered" },
  { key: "in-transit", label: "In Transit" },
  { key: "shipped", label: "Shipped" },
  { key: "cancelled", label: "Cancelled" },
] as const;
type OrderFilter = (typeof FILTERS)[number]["key"];

/** Orders revealed per "Load 6 more" click (page size). */
const PAGE_SIZE = 6;

/**
 * `<pq-order-history>` — the player's claim history. Standard = stacked rows;
 * Expanded = a header + 3-column grid of rich order cards (arcade kiosk).
 * Composes `<pq-status-pill>` for fulfillment status. Rows fire
 * `pq-order-click` (detail.id).
 *
 * Props: `orders` (Order[]), `profile` (standard|expanded), `loading`.
 */
export class PqOrderHistory extends LitElement {
  static override styles = styles;

  static override properties = {
    orders: { attribute: false },
    profile: { type: String, reflect: true },
    loading: { type: Boolean, reflect: true },
    _filter: { state: true },
    _shown: { state: true },
  };

  declare orders: Order[];
  declare profile: OrderHistoryProfile;
  declare loading: boolean;
  /** Active filter pill (expanded only). */
  private declare _filter: OrderFilter;
  /** Number of orders revealed so far (expanded pagination). */
  private declare _shown: number;

  constructor() {
    super();
    this.orders = [];
    this.profile = "standard";
    this.loading = false;
    this._filter = "all";
    this._shown = PAGE_SIZE;
    // Store wins when populated; the `orders` prop is the test fallback.
    bindAtom(this, $claims, "orders");
  }

  override render(): TemplateResult {
    if (this.loading) {
      return html`<div class="stack">${[0, 1, 2].map(() => html`<div class="sk"></div>`)}</div>`;
    }
    if (this.orders.length === 0) {
      return html`<div class="empty">No orders yet — claim a prize to see it here.</div>`;
    }
    if (this.profile === "compact") return this.renderGrid();
    return this.profile === "expanded" ? this.renderExpanded() : this.renderStack();
  }

  /** Dense 2-column grid of order cards with status badges (ref `.ord-list`). */
  private renderGrid(): TemplateResult {
    const cards = this.orders.map((o) => this.#orderCard(o));
    // Arcade compact pages the order cards through the shared carousel, one full-width
    // card per page so each order reads cleanly (2-up clipped the right card on the
    // narrow TTD frame); casino-loud / premium compact keep the 2-col grid.
    if (document.documentElement.dataset.pqMode === "arcade") {
      return html`<pq-list-carousel
        class="carousel"
        .itemsPerPage=${1}
        aria-label="Your orders"
      >
        ${cards}
      </pq-list-carousel>`;
    }
    return html`<div class="ord-list">${cards}</div>`;
  }

  #orderCard(o: Order): TemplateResult {
    const s = STATUS[o.status];
    const kind =
      o.status === "delivered" ? "delivered" : o.status === "processing" ? "processing" : "shipped";
    // Only show real tracking/carrier info here — the status itself is the footer
    // badge, so repeating it as a line read as a duplicate ("Processing" twice).
    const meta = o.tracking ?? o.carrier;
    return html`<div
      class="ord-card"
      role="button"
      tabindex="0"
      @click=${() => this.open(o.id)}
      @keydown=${(e: KeyboardEvent) => this.onKey(e, o.id)}
    >
      <span class="ord-card__thumb">${giftIcon}</span>
      <div class="ord-card__main">
        <h4 class="ord-card__name">${o.prizeName}</h4>
        ${o.confirmation ? html`<p class="ord-card__conf">${o.confirmation}</p>` : nothing}
        ${meta
          ? html`<p class="ord-card__delivered ord-card__delivered--${kind}">${meta}</p>`
          : nothing}
        <p class="ord-card__date">Claimed ${o.claimedAt}</p>
      </div>
      <span class="ord-card__badge ord-card__badge--${kind}">${s.label}</span>
    </div>`;
  }

  private renderStack(): TemplateResult {
    return html`<div class="stack">
      ${this.orders.map((o) => {
        const s = STATUS[o.status];
        return html`<div class="row" role="button" tabindex="0" @click=${() => this.open(o.id)} @keydown=${(e: KeyboardEvent) => this.onKey(e, o.id)}>
          <span class="thumb">${giftIcon}</span>
          <div>
            <h4 class="name">${o.prizeName}</h4>
            <p class="cam">${o.campaignName} · ${o.claimedAt}</p>
          </div>
          <pq-status-pill .variant=${s.variant} .label=${s.label}></pq-status-pill>
        </div>`;
      })}
    </div>`;
  }

  /** Filter predicate for the active pill. */
  private matchesFilter(o: Order): boolean {
    return this._filter === "all" || o.status === this._filter;
  }

  /** Orders derived from the active filter (full set; pagination slices this). */
  private get filteredOrders(): Order[] {
    return this.orders.filter((o) => this.matchesFilter(o));
  }

  /** Derived stats for the strip (computed from the orders prop, mode-agnostic). */
  private get stats(): {
    delivered: number;
    inTransit: number;
    totalValue: number;
    favoriteCategory: string | null;
    favoriteCount: number;
    totalOrders: number;
  } {
    const o = this.orders;
    const byCategory: Record<string, number> = {};
    for (const ord of o) {
      if (ord.category) byCategory[ord.category] = (byCategory[ord.category] ?? 0) + 1;
    }
    const favorite = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    return {
      delivered: o.filter((x) => x.status === "delivered").length,
      inTransit: o.filter((x) => x.status === "in-transit" || x.status === "shipped").length,
      totalValue: o.reduce((sum, x) => sum + (x.value ?? 0), 0),
      favoriteCategory: favorite?.[0] ?? null,
      favoriteCount: favorite?.[1] ?? 0,
      totalOrders: o.length,
    };
  }

  private setFilter(key: OrderFilter): void {
    if (this._filter === key) return;
    this._filter = key;
    this._shown = PAGE_SIZE; // reset pagination when the filter changes
  }

  private loadMore(): void {
    this._shown += PAGE_SIZE;
  }

  private goBack(): void {
    this.dispatchEvent(new CustomEvent("pq-back", { bubbles: true, composed: true }));
  }

  /**
   * Expanded / arcade-kiosk layout (Section 6.13): title row + back · stats strip
   * (delivered / in-transit / total value / favorite) · filter pills · the 3-up
   * order card grid · "Load 6 more" pagination footer. Filter + pagination are
   * live local state; the arcade *mode* skin is layered on in CSS only.
   */
  private renderExpanded(): TemplateResult {
    const s = this.stats;
    const filtered = this.filteredOrders;
    const visible = filtered.slice(0, this._shown);
    const fav = s.favoriteCategory
      ? s.favoriteCategory.charAt(0).toUpperCase() + s.favoriteCategory.slice(1)
      : "—";

    return html`<div class="exp">
      <div class="oh-titlerow">
        <div class="oh-titlerow__left">
          <button class="oh-back" type="button" @click=${this.goBack}>${backIcon}<span>Back to hub</span></button>
          <div>
            <p class="exp-eyebrow">Your account</p>
            <h3 class="exp-title">Order History</h3>
          </div>
        </div>
        <div class="oh-titlerow__right">
          <span class="oh-showing">Showing ${visible.length} of ${filtered.length}</span>
          <button class="oh-dropdown" type="button">Last 12 months ${chevronDown}</button>
        </div>
      </div>

      <div class="stats-strip">
        <div class="stat-card stat-card--delivered">
          <div class="stat-card__eyebrow">Delivered</div>
          <div class="stat-card__num">${s.delivered}</div>
          <div class="stat-card__sub">Past 12 months</div>
        </div>
        <div class="stat-card stat-card--transit">
          <div class="stat-card__eyebrow">In Transit</div>
          <div class="stat-card__num">${s.inTransit}</div>
          <div class="stat-card__sub">Tracking active</div>
        </div>
        <div class="stat-card stat-card--value">
          <div class="stat-card__eyebrow">Total Value</div>
          <div class="stat-card__num">$${s.totalValue.toLocaleString()}</div>
          <div class="stat-card__sub">Lifetime rewards</div>
        </div>
        <div class="stat-card stat-card--favorite">
          <div class="stat-card__eyebrow">Favorite</div>
          <div class="stat-card__num stat-card__num--sm">${fav}</div>
          <div class="stat-card__sub">${s.favoriteCount} of ${s.totalOrders} claims</div>
        </div>
      </div>

      <div class="filter-row">
        <span class="filter-label">Filter</span>
        ${FILTERS.map(
          (f) => html`<button
            class="filter-pill ${this._filter === f.key ? "filter-pill--active" : ""}"
            type="button"
            @click=${() => this.setFilter(f.key)}
          >
            ${f.label}
          </button>`,
        )}
      </div>

      <div class="exp-grid">
        ${visible.map((o) => {
          const st = STATUS[o.status];
          const meta = o.tracking ?? o.carrier ?? o.confirmation;
          return html`<div
            class="exp-card"
            role="button"
            tabindex="0"
            @click=${() => this.open(o.id)}
            @keydown=${(e: KeyboardEvent) => this.onKey(e, o.id)}
          >
            <span class="exp-thumb">${giftIcon}</span>
            <div class="exp-body">
              <h4 class="exp-name">${o.prizeName}</h4>
              <p class="exp-ord">#${o.id} · ${o.campaignName}</p>
              <pq-status-pill .variant=${st.variant} .label=${st.label}></pq-status-pill>
              <p class="exp-dates">
                Claimed ${o.claimedAt}${meta ? html` · ${meta}` : nothing}
              </p>
            </div>
          </div>`;
        })}
      </div>

      ${this._shown < filtered.length
        ? html`<div class="oh-pagination">
            <button class="oh-loadmore" type="button" @click=${this.loadMore}>
              Load ${PAGE_SIZE} more orders ${chevronDown}
            </button>
          </div>`
        : nothing}
    </div>`;
  }

  private open(id: string): void {
    this.dispatchEvent(new CustomEvent("pq-order-click", { detail: { id }, bubbles: true, composed: true }));
  }

  private onKey(event: KeyboardEvent, id: string): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.open(id);
    }
  }
}

if (!customElements.get("pq-order-history")) {
  customElements.define("pq-order-history", PqOrderHistory);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-order-history": PqOrderHistory;
  }
}

export type { OrderHistoryProfile, OrderClickDetail } from "./types";
