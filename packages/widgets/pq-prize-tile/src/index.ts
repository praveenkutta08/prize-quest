import { LitElement, html, nothing, type TemplateResult } from "lit";
import type { Prize } from "@pq/mock-data";
/**
 * Inline style resolving the per-category accent ramp from the `--pq-cat-{category}`
 * custom properties applyTokens writes from the active tenant's categoryMap, falling
 * back to purple. Pure CSS-var driven — the widget needs no @pq/tenants import, so its
 * test bundle stays free of the tokens CSS side-effect imports.
 */
function catTintStyle(category: string | undefined): string {
  const k = (category ?? "").trim();
  const v = (suffix: string) =>
    k ? `var(--pq-cat-${k}${suffix}, var(--cat-purple${suffix}))` : `var(--cat-purple${suffix})`;
  return `--cat-tint:${v("")};--cat-tint-deep:${v("-deep")};--cat-tint-bright:${v("-bright")};--cat-tint-bg:${v("-glow")};--cat-tint-glow:${v("-glow")}`;
}
import { styles } from "./styles";
import type { PrizeTileState } from "./types";

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

const checkIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="3"
  aria-hidden="true"
>
  <polyline points="20 6 9 17 4 12" />
</svg>`;

const lockIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  aria-hidden="true"
>
  <rect x="5" y="11" width="14" height="9" rx="1" />
  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
</svg>`;

/**
 * `<pq-prize-tile>` — a single prize tile (gold gift icon, value badge, name,
 * category, stock meta). States: selectable / locked / oos (oos also inferred from
 * `prize.inStock === false`). Selectable tiles fire `pq-prize-select` (detail.id) on
 * click/Enter/Space; `selected` shows a gold check.
 */
export class PqPrizeTile extends LitElement {
  static override styles = styles;

  static override properties = {
    prize: { attribute: false },
    selected: { type: Boolean, reflect: true },
    state: { type: String },
    profile: { type: String, reflect: true },
    category: { type: String },
  };

  declare prize?: Prize;
  declare selected: boolean;
  declare state: PrizeTileState;
  /** Surface density. `compact` renders the dense casino tile (ref `.prize-tile`). */
  declare profile: "compact" | "standard" | "expanded";
  /** Prize category string; resolved to an arcade accent color in the expanded profile. */
  declare category: string;

  constructor() {
    super();
    this.selected = false;
    this.state = "selectable";
    this.profile = "standard";
    this.category = "";
  }

  /** Effective state — explicit `locked`/`oos` win; otherwise stock drives `oos`. */
  get effectiveState(): PrizeTileState {
    if (this.state === "locked" || this.state === "oos") return this.state;
    if (this.prize && this.prize.inStock === false) return "oos";
    return "selectable";
  }

  private get selectable(): boolean {
    return this.effectiveState === "selectable";
  }

  override render(): TemplateResult {
    if (this.profile === "expanded") return this.renderExpanded();
    if (this.profile === "compact") return this.renderCompact();
    const p = this.prize;
    const stockLabel =
      this.effectiveState === "oos"
        ? "Out of stock"
        : this.effectiveState === "locked"
          ? "Unlocks at 100%"
          : "In stock";
    return html`
      <div class="tile" @click=${this.handleSelect} @keydown=${this.handleKeydown}>
        <div class="img">
          ${giftIcon} ${p ? html`<span class="value">${p.category}</span>` : nothing}
          <span class="check">${checkIcon}</span>
          <span class="lock"><span>${lockIcon}</span></span>
        </div>
        <h4 class="name">${p?.name ?? ""}</h4>
        <p class="cat">${p?.category ?? ""}</p>
        <span class="meta">${stockLabel}</span>
      </div>
    `;
  }

  /**
   * Roomy arcade prize card (ref `.prize-card`, kiosk stage 02 inner cards). Per-category
   * accent comes from the `tile--${color}` modifier (color resolved via the active tenant).
   * Locked variant drops the CTA, dims the image, overlays a lock, and shows a Locked pill.
   */
  private renderExpanded(): TemplateResult {
    const p = this.prize;
    const catLabel = this.category || p?.category || "";
    const locked = this.effectiveState === "locked";
    return html`
      <div
        class="tile tile--cat"
        style=${catTintStyle(catLabel)}
        @click=${this.handleSelect}
        @keydown=${this.handleKeydown}
      >
        <div class="img">
          ${giftIcon} ${locked ? html`<span class="lock-overlay">${lockIcon}</span>` : nothing}
        </div>
        ${catLabel ? html`<span class="cat-pill">${catLabel}</span>` : nothing}
        <h3 class="name">${p?.name ?? ""}</h3>
        <div class="meta-row">
          ${p ? html`<span class="val">${p.category}</span>` : nothing}
          ${locked
            ? html`<span class="stock-locked">${lockIcon}Locked</span>`
            : html`<span class="stock">In Stock</span>`}
        </div>
        ${locked
          ? nothing
          : html`<button class="cta" type="button" @click=${this.handleSelect}>
              Claim Reward
            </button>`}
      </div>
    `;
  }

  /** Dense casino tile for the 480×234 TTD prize grid (ref `.prize-tile`). */
  private renderCompact(): TemplateResult {
    const p = this.prize;
    if (this.effectiveState === "locked") {
      return html`
        <div class="tile" @click=${this.handleSelect} @keydown=${this.handleKeydown}>
          <div class="img">${lockIcon}</div>
          <h4 class="name">${p?.name ?? ""}</h4>
          <span class="lock-pin">${lockIcon}</span>
        </div>
      `;
    }
    return html`
      <div class="tile" @click=${this.handleSelect} @keydown=${this.handleKeydown}>
        <span class="check">${checkIcon}</span>
        <div class="img">${giftIcon}</div>
        <div class="info">
          <h4 class="name">${p?.name ?? ""}</h4>
          ${p ? html`<p class="val">${p.category}</p>` : nothing}
        </div>
      </div>
    `;
  }

  private handleSelect = (): void => {
    if (!this.selectable || !this.prize) return;
    this.dispatchEvent(
      new CustomEvent("pq-prize-select", {
        detail: { id: this.prize.id },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.handleSelect();
    }
  };

  protected override updated(): void {
    this.setAttribute("state", this.effectiveState);
    if (this.selectable) {
      this.setAttribute("role", "button");
      this.setAttribute("tabindex", "0");
      this.setAttribute("aria-pressed", String(this.selected));
      if (this.prize) this.setAttribute("aria-label", this.prize.name);
    } else {
      this.removeAttribute("role");
      this.removeAttribute("tabindex");
      this.removeAttribute("aria-pressed");
    }
  }
}

if (!customElements.get("pq-prize-tile")) {
  customElements.define("pq-prize-tile", PqPrizeTile);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-prize-tile": PqPrizeTile;
  }
}

export type { PrizeTileState, PrizeSelectDetail } from "./types";
