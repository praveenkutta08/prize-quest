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
}

const CATEGORY_ICON: Record<string, ComponentType<{ className?: string }>> = {
  Electronics: Headphones,
  "Gift card": CreditCard,
  Dining: UtensilsCrossed,
  Merch: Package,
  Apparel: Glasses,
  "Free play": Coins,
  Hospitality: BedDouble,
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
  onRemove,
  emptyHint = "No prizes selected yet.",
  className,
}: {
  prizes: PrizeLike[];
  showValue?: boolean;
  onRemove?: (id: string) => void;
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
        return (
          <div
            key={prize.id}
            className="group relative flex flex-col items-center gap-2 rounded-lg border border-hairline bg-surface-sunken p-3 text-center transition-colors hover:border-hairline-strong"
          >
            {onRemove ? (
              <button
                type="button"
                onClick={() => onRemove(prize.id)}
                aria-label={`Remove ${prize.name}`}
                className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-surface-2 text-text-tertiary opacity-0 transition-opacity hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="size-3" />
              </button>
            ) : null}
            <span className="flex size-10 items-center justify-center rounded-full border border-hairline bg-surface-1 text-brand">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-2xs font-medium text-text-secondary">{prize.name}</p>
              {showValue ? (
                <p className="font-mono text-2xs text-text-tertiary">{moneyPrecise(prize.value)}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
