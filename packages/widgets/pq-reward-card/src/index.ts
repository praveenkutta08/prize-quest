import { LitElement, html, nothing, type TemplateResult } from "lit";
import type { PrizeRarity } from "@pq/mock-data";
import { styles } from "./styles";

const TIER_LABEL: Record<PrizeRarity, string> = {
  common: "Common",
  rare: "★ Rare",
  epic: "★★ Epic",
  legendary: "★★★ Legendary",
};

/**
 * `<pq-reward-card>` — a single reward card in one of two layouts.
 *
 * `layout="tile"` (default) is the original 3-up rarity-tiered tile: hero art zone,
 * clamped name, metallic-gold value, rarity badge.
 *
 * `layout="wide"` is the full-width PRODUCT WELL used on the reward-selection screen:
 * a lit square art well on the left, name + descriptor on the right, and an explicit
 * action button. It shows NO price — the patron has already earned the prize, so a
 * dollar value on the card reads like a store, not a reward.
 *
 * Clicking an in-stock card (or its action button) fires `pq-prize-select`
 * (detail `{ id }`) to reuse the existing claim flow.
 */
export class PqRewardCard extends LitElement {
  static override styles = styles;

  static override properties = {
    name: { type: String },
    value: { type: String },
    sub: { type: String },
    cta: { type: String },
    layout: { type: String, reflect: true },
    artUrl: { type: String, attribute: "art-url" },
    artEmoji: { type: String, attribute: "art-emoji" },
    rarity: { type: String, reflect: true },
    prizeId: { type: String, attribute: "prize-id" },
    disabled: { type: Boolean, reflect: true },
  };

  declare name: string;
  declare value: string;
  /** Short descriptor under the name (wide layout only), e.g. "Electronics · ships free". */
  declare sub: string;
  /** Action-button label (wide layout only). */
  declare cta: string;
  /** `tile` = original 3-up card · `wide` = full-width product well. */
  declare layout: "tile" | "wide";
  declare artUrl: string;
  declare artEmoji: string;
  declare rarity: PrizeRarity;
  declare prizeId: string;
  declare disabled: boolean;

  constructor() {
    super();
    this.name = "";
    this.value = "";
    this.sub = "";
    this.cta = "Collect";
    this.layout = "tile";
    this.artUrl = "";
    this.artEmoji = "🎁";
    this.rarity = "common";
    this.prizeId = "";
    this.disabled = false;
  }

  #select = (): void => {
    if (this.disabled || !this.prizeId) return;
    this.dispatchEvent(
      new CustomEvent("pq-prize-select", {
        detail: { id: this.prizeId },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private renderArt(): TemplateResult {
    return this.artUrl
      ? html`<img src=${this.artUrl} alt=${this.name} />`
      : html`<span>${this.artEmoji}</span>`;
  }

  override render(): TemplateResult {
    return this.layout === "wide" ? this.renderWide() : this.renderTile();
  }

  /** Full-width product well — art left, copy right, explicit action button. */
  private renderWide(): TemplateResult {
    const out = this.disabled;
    return html`
      <button class="rwd-wide" type="button" ?disabled=${out} @click=${this.#select}>
        <div class="wide-art">${this.renderArt()}</div>
        <div class="wide-body">
          ${this.name ? html`<h4 class="wide-name">${this.name}</h4>` : nothing}
          ${this.sub ? html`<p class="wide-sub">${this.sub}</p>` : nothing}
          <div class="wide-row">
            <span class="wide-cta">${out ? "Out of stock" : this.cta} ${out ? nothing : "→"}</span>
            <span class="wide-stock">${out ? "Unavailable" : "In stock"}</span>
          </div>
        </div>
      </button>
    `;
  }

  private renderTile(): TemplateResult {
    return html`
      <button class="rwd-card" type="button" ?disabled=${this.disabled} @click=${this.#select}>
        <div class="art">${this.renderArt()}</div>
        ${this.name ? html`<h4 class="name">${this.name}</h4>` : nothing}
        <div class="val">${this.value}</div>
        <div class="tier">${TIER_LABEL[this.rarity] ?? TIER_LABEL.common}</div>
      </button>
    `;
  }
}

if (!customElements.get("pq-reward-card")) {
  customElements.define("pq-reward-card", PqRewardCard);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-reward-card": PqRewardCard;
  }
}
