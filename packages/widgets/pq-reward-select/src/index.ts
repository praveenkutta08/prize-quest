import { LitElement, html, nothing, type TemplateResult } from "lit";
import {
  deriveRarity,
  type Campaign,
  type Prize,
} from "@pq/mock-data";
import { bindAtom, $activeCampaign, $prizes } from "@pq/store";
import { styles } from "./styles";
import "@pq/pq-list-carousel";
import "@pq/pq-reward-card";

/** Per-category placeholder emoji for the reward art zone (prod swaps for artUrl). */
const CATEGORY_EMOJI: Record<string, string> = {
  electronics: "📱",
  audio: "🎧",
  outdoor: "🏕️",
  "smart-home": "🏠",
  "gift-cards": "🎁",
  wellness: "💆",
  food: "🍽️",
  dining: "🍽️",
  travel: "✈️",
  sports: "⛳",
};

function money(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function emojiFor(category: string): string {
  return CATEGORY_EMOJI[category?.toLowerCase()] ?? "🎁";
}

/**
 * `<pq-reward-select>` — the reward-selection screen body (compact arcade only).
 * Shows a pinned complete-state progress strip (orange→yellow, matching every
 * other progress bar) over a paged carousel of
 * `<pq-reward-card>` (3 per page). Tapping a reward fires `pq-prize-select`
 * (bubbles to the app → selects the prize) and then `pq-claim-start`, reusing
 * the existing confirm → pin → … → success claim flow.
 */
export class PqRewardSelect extends LitElement {
  static override styles = styles;

  static override properties = {
    profile: { type: String, reflect: true },
    _campaign: { state: true },
    _prizes: { state: true },
  };

  declare profile: "compact" | "standard" | "expanded";
  private declare _campaign: Campaign | null;
  private declare _prizes: Prize[] | null;

  constructor() {
    super();
    this.profile = "compact";
    this._campaign = null;
    this._prizes = null;
    bindAtom(this, $activeCampaign, "_campaign");
    bindAtom(this, $prizes, "_prizes");
  }

  /** A reward was tapped — start the claim once the prize-select has settled. */
  #onPick = (e: Event): void => {
    const { id } = (e as CustomEvent<{ id: string }>).detail;
    const campaignId = this._campaign?.id;
    if (!campaignId) return;
    // Defer so the app's pq-prize-select handler ($selectedPrize) runs first.
    queueMicrotask(() => {
      this.dispatchEvent(
        new CustomEvent("pq-claim-start", {
          detail: { campaignId, prizeId: id },
          bubbles: true,
          composed: true,
        }),
      );
    });
  };

  override render(): TemplateResult {
    const c = this._campaign;
    const rewards = this._prizes ?? [];
    if (!c) {
      return html`<div class="rwd-body">
        <p class="empty">No campaign selected.</p>
      </div>`;
    }
    const goal = money(c.goal);
    return html`
      <div class="rwd-body" @pq-prize-select=${this.#onPick}>
        <div class="rwd-prog">
          <div class="rwd-prog__row">
            <span class="rwd-prog__label">Wager Complete</span>
            <span class="rwd-prog__val"><strong>${goal}</strong> / ${goal} ✓</span>
            <span class="rwd-prog__cta">Pick your prize ↓</span>
          </div>
          <div class="rwd-prog__bar">
            <div class="rwd-prog__fill"></div>
          </div>
        </div>
        ${rewards.length
          ? html`<pq-list-carousel
              .itemsPerPage=${3}
              aria-label="Available rewards"
            >
              ${rewards.map(
                (p) => html`<pq-reward-card
                  name=${p.name}
                  value=${money(p.value)}
                  rarity=${p.rarity ?? deriveRarity(p.value)}
                  art-emoji=${emojiFor(p.category)}
                  prize-id=${p.id}
                  ?disabled=${p.inStock === false}
                ></pq-reward-card>`,
              )}
            </pq-list-carousel>`
          : nothing}
      </div>
    `;
  }
}

if (!customElements.get("pq-reward-select")) {
  customElements.define("pq-reward-select", PqRewardSelect);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-reward-select": PqRewardSelect;
  }
}
