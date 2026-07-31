import { LitElement, html, nothing, type TemplateResult } from "lit";
import { deriveRarity, type Campaign, type Prize } from "@pq/mock-data";
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

/**
 * Product-level art hints, matched against the prize NAME before falling back to the
 * category. A category map alone gave every "electronics" prize the same phone glyph —
 * AirPods, an iPad and a smart speaker all looked identical on the card. Ordered
 * longest-match-first where prefixes overlap. Placeholder art only: production swaps
 * these for the operator's `artUrl` product shots.
 */
const NAME_EMOJI: ReadonlyArray<readonly [pattern: string, emoji: string]> = [
  ["airpod", "🎧"],
  ["headphone", "🎧"],
  ["earbud", "🎧"],
  ["speaker", "🔊"],
  ["ipad", "📱"],
  ["tablet", "📱"],
  ["tab ", "📱"],
  ["iphone", "📱"],
  ["phone", "📱"],
  ["macbook", "💻"],
  ["laptop", "💻"],
  ["watch", "⌚"],
  ["tv", "📺"],
  ["camera", "📷"],
  ["echo", "🔊"],
  ["show", "🖥️"],
  ["console", "🎮"],
  ["playstation", "🎮"],
  ["xbox", "🎮"],
  ["cap", "🧢"],
  ["hat", "🧢"],
  ["jersey", "👕"],
  ["shirt", "👕"],
  ["hoodie", "🧥"],
  ["backpack", "🎒"],
  ["bag", "🎒"],
  ["luggage", "🧳"],
  ["sneaker", "👟"],
  ["shoe", "👟"],
  ["rambler", "🥤"],
  ["tumbler", "🥤"],
  ["bottle", "🍾"],
  ["cooler", "🧊"],
  ["grill", "🍖"],
  ["golf", "⛳"],
  ["topgolf", "⛳"],
  ["bike", "🚲"],
  ["tent", "🏕️"],
  ["chair", "🪑"],
  ["trip", "✈️"],
  ["flight", "✈️"],
  ["vegas", "🎰"],
  ["hotel", "🏨"],
  ["suite", "🏨"],
  ["spa", "💆"],
  ["dinner", "🍽️"],
  ["dining", "🍽️"],
  ["wine", "🍷"],
  ["gift card", "💳"],
  ["amazon", "📦"],
  ["voucher", "🎟️"],
  ["credit", "💳"],
];

/** Prize art: product-level match on the name, else the category map, else a gift. */
function emojiFor(prize: Prize): string {
  const name = (prize.name ?? "").toLowerCase();
  for (const [pattern, emoji] of NAME_EMOJI) {
    if (name.includes(pattern)) return emoji;
  }
  return CATEGORY_EMOJI[prize.category?.toLowerCase()] ?? "🎁";
}

/** Title-case a category slug, e.g. "smart-home" → "Smart Home". */
function categoryLabel(category: string | undefined): string {
  if (!category) return "";
  return category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * The one-line descriptor under a prize name. Prizes carry no copy of their own, so
 * this is composed from the fields they do have — category plus how the prize is
 * delivered. Deliberately says nothing about price.
 */
function descriptorFor(p: Prize): string {
  const cat = categoryLabel(p.category);
  const delivery =
    p.prizeType === "digital"
      ? "Digital voucher · delivered instantly"
      : "Ships free · arrives in 5–7 days";
  return cat ? `${cat} · ${delivery}` : delivery;
}

/**
 * `<pq-reward-select>` — the reward-selection screen body (compact arcade only).
 *
 * ONE PRIZE PER PAGE, full width, in the same `<pq-list-carousel>` the promotions list
 * uses — so a prize gets the same room a campaign does instead of being squeezed into a
 * third of the panel. Each card is the `layout="wide"` product well with its own
 * Collect button.
 *
 * Two things were deliberately removed: the pinned strip that used to sit above the
 * carousel (the campaign name is already in the screen header, so it was said twice),
 * and the price on each card (the prize is earned, not bought).
 *
 * Tapping a reward fires `pq-prize-select` (bubbles to the app → selects the prize) and
 * then `pq-claim-start`, reusing the existing confirm → pin → … → success claim flow.
 */
export class PqRewardSelect extends LitElement {
  static override styles = styles;

  static override properties = {
    profile: { type: String, reflect: true },
    _campaign: { state: true },
    _prizes: { state: true },
  };

  declare profile: "compact" | "standard" | "expanded";
  declare private _campaign: Campaign | null;
  declare private _prizes: Prize[] | null;

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
    // A not-yet-eligible campaign shows its prizes as a PREVIEW: cards at full
    // strength, Collect replaced by a disabled "Locked" (customer decision).
    const locked = c.status !== "eligible";
    return html`
      <div class="rwd-body" @pq-prize-select=${this.#onPick}>
        ${rewards.length
          ? html`<pq-list-carousel loop .itemsPerPage=${1} aria-label="Available rewards">
              ${rewards.map(
                (p) =>
                  html`<pq-reward-card
                    layout="wide"
                    cta="Collect"
                    name=${p.name}
                    sub=${descriptorFor(p)}
                    rarity=${p.rarity ?? deriveRarity(p.value)}
                    art-emoji=${emojiFor(p)}
                    prize-id=${p.id}
                    ?disabled=${p.inStock === false}
                    ?locked=${locked}
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
