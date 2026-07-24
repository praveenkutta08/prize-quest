import { useRef, useState, type ReactNode, type UIEvent } from "react";
import { cn } from "@/shared/lib/cn";
import { Loader2 } from "lucide-react";

export type LogSeverity = "ok" | "warn" | "err" | "info";

export interface LogStreamRow {
  id: string;
  severity: LogSeverity;
  /** Preformatted time, e.g. "10:08:42". */
  time: string;
  /** Message body — the caller can emphasize the rule name. */
  message: ReactNode;
  /** Source meta, e.g. "scheduler · prod-us-east". */
  meta: string;
  /** True for a freshly live-tailed row (subtle highlight). */
  fresh?: boolean;
}

const ROW_HEIGHT = 52;
const OVERSCAN = 8;

const SEV_DOT: Record<LogSeverity, string> = {
  ok: "bg-success",
  warn: "bg-warning",
  err: "bg-danger",
  info: "bg-info",
};

/**
 * Virtualized execution-log stream (plan §8 `LogStream`). Hand-rolled windowing
 * (fixed row height + overscan) renders only the visible slice, so a capped
 * ~500-row live-tail buffer stays smooth without a virtualization dependency.
 * Infinite scroll fires `onLoadMore` near the bottom.
 */
export function LogStream({
  rows,
  height = 540,
  hasMore,
  loadingMore,
  onLoadMore,
  onRowClick,
  emptyLabel = "No log entries match these filters.",
  className,
}: {
  rows: LogStreamRow[];
  height?: number;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  /** Open a row's detail (e.g. the audit before/after). */
  onRowClick?: (id: string) => void;
  emptyLabel?: string;
  className?: string;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const loadGuard = useRef(false);

  const total = rows.length;
  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visible = Math.ceil(height / ROW_HEIGHT) + OVERSCAN * 2;
  const end = Math.min(total, start + visible);
  const slice = rows.slice(start, end);

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setScrollTop(el.scrollTop);
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < ROW_HEIGHT * 4;
    if (nearBottom && hasMore && !loadingMore && !loadGuard.current) {
      loadGuard.current = true;
      onLoadMore?.();
    }
    if (!nearBottom) loadGuard.current = false;
  };

  if (total === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-hairline bg-surface-1 text-sm text-text-tertiary",
          className,
        )}
        style={{ height }}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div
      role="log"
      aria-live="polite"
      onScroll={onScroll}
      className={cn("overflow-y-auto rounded-lg border border-hairline bg-surface-1", className)}
      style={{ height }}
    >
      <div style={{ height: total * ROW_HEIGHT, position: "relative" }}>
        {slice.map((row, i) => (
          <div
            key={row.id}
            className="absolute inset-x-0"
            style={{ top: (start + i) * ROW_HEIGHT, height: ROW_HEIGHT }}
          >
            <LogRow row={row} onClick={onRowClick} />
          </div>
        ))}
      </div>
      {loadingMore ? (
        <div className="flex items-center justify-center gap-2 py-3 text-2xs text-text-tertiary">
          <Loader2 className="size-3.5 animate-spin" /> Loading more…
        </div>
      ) : null}
    </div>
  );
}

function LogRow({ row, onClick }: { row: LogStreamRow; onClick?: (id: string) => void }) {
  const content = (
    <>
      <span
        role="img"
        className={cn("size-2 shrink-0 rounded-full", SEV_DOT[row.severity])}
        aria-label={row.severity}
      />
      <span className="w-20 shrink-0 font-mono text-2xs tabular-nums text-text-tertiary">
        {row.time}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">{row.message}</span>
      <span className="hidden shrink-0 font-mono text-2xs text-text-tertiary sm:block">
        {row.meta}
      </span>
    </>
  );
  const base = cn(
    "flex h-full w-full items-center gap-3 border-b border-hairline/60 px-4 text-left transition-colors",
    row.fresh ? "bg-brand-subtle/40" : "hover:bg-surface-2/50",
  );
  return onClick ? (
    <button
      type="button"
      onClick={() => onClick(row.id)}
      className={cn(base, "focus-visible:outline-none focus-visible:bg-surface-2")}
    >
      {content}
    </button>
  ) : (
    <div className={base}>{content}</div>
  );
}
