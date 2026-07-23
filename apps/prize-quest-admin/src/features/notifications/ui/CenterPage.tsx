import { AlertTriangle, Bell, CheckCircle2, Info, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button, EmptyState, ErrorState, Skeleton } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { relativeTime } from "@/shared/lib/format";
import { useListNotificationsQuery, useMarkReadMutation } from "../api";
import type { OperatorNotification } from "../model";

const TYPE_META: Record<
  OperatorNotification["type"],
  { icon: LucideIcon; tone: string; ring: string }
> = {
  info: { icon: Info, tone: "text-info", ring: "border-info/30 bg-info-soft" },
  success: { icon: CheckCircle2, tone: "text-success", ring: "border-success/30 bg-success-soft" },
  warning: { icon: AlertTriangle, tone: "text-warning", ring: "border-warning/30 bg-warning-soft" },
  error: { icon: XCircle, tone: "text-danger", ring: "border-danger/30 bg-danger-soft" },
};

export function CenterPage() {
  const feed = useListNotificationsQuery();
  const [markRead] = useMarkReadMutation();

  const items = feed.data ?? [];
  const unread = items.filter((n) => !n.read).length;

  if (feed.isError) return <ErrorState onRetry={() => feed.refetch()} retrying={feed.isFetching} />;

  return (
    <div className="rounded-xl border border-hairline bg-surface-1">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
        <p className="text-sm text-text-secondary">
          <span className="font-semibold tabular-nums text-text-primary">{unread}</span> unread
        </p>
        {unread > 0 ? (
          <Button variant="secondary" size="sm" onClick={() => markRead({ all: true })}>
            Mark all read
          </Button>
        ) : null}
      </div>

      {feed.isLoading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="No operator notifications right now."
        />
      ) : (
        <ul className="divide-y divide-hairline">
          {items.map((n) => {
            const meta = TYPE_META[n.type];
            const Icon = meta.icon;
            return (
              <li
                key={n.id}
                className={cn(
                  "flex items-start gap-3.5 px-5 py-4 transition-colors",
                  !n.read && "bg-surface-2/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border",
                    meta.ring,
                    meta.tone,
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm",
                      n.read ? "text-text-secondary" : "font-medium text-text-primary",
                    )}
                  >
                    {n.title}
                  </p>
                  <p className="text-xs text-text-tertiary">{n.message}</p>
                  <p className="mt-0.5 font-mono text-2xs text-text-tertiary">
                    {relativeTime(n.time)}
                  </p>
                </div>
                {!n.read ? (
                  <button
                    type="button"
                    onClick={() => markRead({ ids: [n.id] })}
                    className="shrink-0 text-2xs text-brand underline-offset-2 hover:text-brand-bright hover:underline"
                  >
                    Mark read
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
