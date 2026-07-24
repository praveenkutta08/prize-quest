import type { LucideIcon } from "lucide-react";
import { Gift, RefreshCw, Sparkles, TrendingUp, Zap } from "lucide-react";
import { relativeTime } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";

export interface ActivityFeedItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  timestamp: string;
}

const ICONS: Record<string, { icon: LucideIcon; tone: string }> = {
  offer: { icon: Gift, tone: "text-brand" },
  rule: { icon: Zap, tone: "text-info" },
  catalog: { icon: RefreshCw, tone: "text-text-secondary" },
  tier: { icon: TrendingUp, tone: "text-success" },
  schedule: { icon: Sparkles, tone: "text-warning" },
};

/** Recent activity — typed icon + title + sub + relative time. */
export function ActivityFeed({ items }: { items: ActivityFeedItem[] }) {
  return (
    <ol className="flex flex-col">
      {items.map((item, i) => {
        const meta = ICONS[item.type] ?? { icon: Sparkles, tone: "text-text-tertiary" };
        const Icon = meta.icon;
        return (
          <li key={item.id} className="flex gap-3.5">
            {/* Timeline rail */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-2",
                  meta.tone,
                )}
              >
                <Icon className="size-4" strokeWidth={1.9} />
              </span>
              {i < items.length - 1 ? <span className="w-px flex-1 bg-hairline" /> : null}
            </div>
            <div className="min-w-0 flex-1 pb-5">
              <p className="text-sm font-medium text-text-primary">{item.title}</p>
              <p className="truncate text-xs text-text-tertiary">{item.subtitle}</p>
              <p className="mt-0.5 font-mono text-2xs text-text-tertiary">
                {relativeTime(item.timestamp)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
