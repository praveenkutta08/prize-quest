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
 * `<pq-reward-card>` — a single rarity-tiered reward card: hero art zone, 2-line
 * clamped name, metallic-gold value, and a rarity tier badge. The rarity drives
 * the border / top stripe / glow / label (see styles). Clicking an in-stock card
 * fires `pq-prize-select` (detail `{ id }`) to reuse the existing claim flow.
 */
export class PqRewardCard extends LitElement {
  static override styles = styles;

  static override properties = {
    name: { type: String },
    value: { type: String },
    artUrl: { type: String, attribute: "art-url" },
    artEmoji: { type: String, attribute: "art-emoji" },
    rarity: { type: String, reflect: true },
    prizeId: { type: String, attribute: "prize-id" },
    disabled: { type: Boolean, reflect: true },
  };

  declare name: string;
  declare value: string;
  declare artUrl: string;
  declare artEmoji: string;
  declare rarity: PrizeRarity;
  declare prizeId: string;
  declare disabled: boolean;

  constructor() {
    super();
    this.name = "";
    this.value = "";
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

  override render(): TemplateResult {
    return html`
      <button
        class="rwd-card"
        type="button"
        ?disabled=${this.disabled}
        @click=${this.#select}
      >
        <div class="art">
          ${this.artUrl
            ? html`<img src=${this.artUrl} alt=${this.name} />`
            : html`<span>${this.artEmoji}</span>`}
        </div>
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
