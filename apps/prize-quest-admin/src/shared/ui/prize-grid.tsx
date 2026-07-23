import { type ComponentType } from "react";
import {
  BedDouble,
  Coins,
  CreditCard,
  Gift,
  Glasses,
  Headphones,
  Package,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { moneyPrecise } from "@/shared/lib/format";

/** Minimal structural prize shape (the feature's PrizeCatalogItem assigns to it). */
export interface PrizeLike {
  id: string;
  name: string;
  category: string;
  value: number;
  prizeType?: "physical" | "digital";
  inStock?: boolean;
  /** Optional richer fields used by the Rewards gallery (Session 4). */
  rarity?: string;
  stockCount?: number;
}

/** Rarity → token-driven chip tone for the gallery. */
const RARITY_TONE: Record<string, string> = {
  common: "border-hairline bg-surface-2 text-text-tertiary",
  rare: "border-info/30 bg-info-soft text-info",
  epic: "border-brand/35 bg-brand-subtle text-brand-bright",
  legendary: "border-warning/30 bg-warning-soft text-warning",
};

const CATEGORY_ICON: Record<string, ComponentType<{ className?: string }>> = {
  // Promotions prize categories (Title Case)
  Electronics: Headphones,
  "Gift card": CreditCard,
  Dining: UtensilsCrossed,
  Merch: Package,
  Apparel: Glasses,
  "Free play": Coins,
  Hospitality: BedDouble,
  // Rewards catalog categories (kebab keys)
  electronics: Headphones,
  "gift-card": CreditCard,
  experience: BedDouble,
  "free-play": Coins,
  comp: UtensilsCrossed,
  merchandise: Package,
  points: Coins,
};

export function prizeIcon(category: string): ComponentType<{ className?: string }> {
  return CATEGORY_ICON[category] ?? Gift;
}

/**
 * Thumbnail grid of prizes (plan §8 `PrizeThumbGrid`, prototype `.prize-thumbs`).
 * Optionally shows the value and a remove affordance (used in the create form's
 * selected list). Read-only on the detail screen.
 */
export function PrizeThumbGrid({
  prizes,
  showValue,
  showRarity,
  showStock,
  onRemove,
  onSelect,
  emptyHint = "No prizes selected yet.",
  className,
}: {
  prizes: PrizeLike[];
  showValue?: boolean;
  /** Render a rarity chip (uses `PrizeLike.rarity`). */
  showRarity?: boolean;
  /** Render a stock badge in the corner (uses `PrizeLike.stockCount`/`inStock`). */
  showStock?: boolean;
  onRemove?: (id: string) => void;
  /** Make a card clickable (e.g. the Rewards gallery → detail). */
  onSelect?: (id: string) => void;
  emptyHint?: string;
  className?: string;
}) {
  if (prizes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-hairline bg-surface-1/40 px-4 py-6 text-center text-sm text-text-tertiary">
        {emptyHint}
      </p>
    );
  }
  return (
    <div className={cn("grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4", className)}>
      {prizes.map((prize) => {
        const Icon = prizeIcon(prize.category);
        const lowStock =
          showStock &&
          prize.stockCount !== undefined &&
          prize.stockCount > 0 &&
          prize.stockCount <= 10;
        const outOfStock = showStock && prize.inStock === false;
        const card = (
          <>
            {onRemove ? (
              <button
                type="button"
                onClick={() => onRemove(prize.id)}
                aria-label={`Remove ${prize.name}`}
                className="absolute right-1.5 top-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-surface-2 text-text-tertiary opacity-0 transition-opacity hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="size-3" />
              </button>
            ) : null}
            {showStock ? (
              <span
                className={cn(
                  "absolute right-1.5 top-1.5 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold tabular-nums",
                  outOfStock
                    ? "border-danger/30 bg-danger-soft text-danger"
                    : lowStock
                      ? "border-warning/30 bg-warning-soft text-warning"
                      : "border-hairline bg-surface-2 text-text-tertiary",
                )}
              >
                {outOfStock ? "Out" : (prize.stockCount ?? 0) >= 999 ? "∞" : prize.stockCount}
              </span>
            ) : null}
            <span className="flex size-10 items-center justify-center rounded-full border border-hairline bg-surface-1 text-brand">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-2xs font-medium text-text-secondary">{prize.name}</p>
              {showValue ? (
                <p className="font-mono text-2xs text-text-tertiary">{moneyPrecise(prize.value)}</p>
              ) : null}
              {showRarity && prize.rarity ? (
                <span
                  className={cn(
                    "mt-1 inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-semibold capitalize",
                    RARITY_TONE[prize.rarity] ?? RARITY_TONE.common,
                  )}
                >
                  {prize.rarity}
                </span>
              ) : null}
            </div>
          </>
        );
        const cardClass =
          "group relative flex flex-col items-center gap-2 rounded-lg border border-hairline bg-surface-sunken p-3 text-center transition-colors hover:border-hairline-strong";
        return onSelect ? (
          <button
            key={prize.id}
            type="button"
            onClick={() => onSelect(prize.id)}
            className={cn(
              cardClass,
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            )}
          >
            {card}
          </button>
        ) : (
          <div key={prize.id} className={cardClass}>
            {card}
          </div>
        );
      })}
    </div>
  );
}
