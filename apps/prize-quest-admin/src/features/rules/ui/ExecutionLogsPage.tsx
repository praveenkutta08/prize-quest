import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Radio } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import {
  Button,
  ErrorState,
  LogStream,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Toolbar,
  ToolbarSpacer,
  toast,
  type LogStreamRow,
} from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { count } from "@/shared/lib/format";
import { useListLogsQuery, useListRuleOptionsQuery, usePullLiveLogMutation } from "../api";
import type { ExecutionLogEntry, Severity } from "../model";
import { timeOfDay } from "./labels";

const RANGES = [
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7d" },
  { value: "30d", label: "Last 30d" },
  { value: "all", label: "All time" },
];

const SEV_TABS: { key: string; label: string; tone: string }[] = [
  { key: "all", label: "All", tone: "text-text-secondary" },
  { key: "ok", label: "Success", tone: "text-success" },
  { key: "warn", label: "Warning", tone: "text-warning" },
  { key: "err", label: "Error", tone: "text-danger" },
];

const LIVE_INTERVAL_MS = 2500;
const LIVE_BUFFER_CAP = 500;

export function ExecutionLogsPage() {
  const pid = useAppSelector((s) => s.scope.activePropertyId) ?? "all";
  const [params, setParams] = useSearchParams();

  const severity = params.get("severity") ?? "all";
  const range = params.get("range") ?? "30d";
  const ruleId = params.get("ruleId") ?? "all";

  const [cursor, setCursor] = useState("0");
  const patch = useCallback(
    (next: Record<string, string | undefined>) => {
      setCursor("0");
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(next)) {
            if (!v || v === "all") p.delete(k);
            else p.set(k, v);
          }
          return p;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const logs = useListLogsQuery({ propertyId: pid, severity, range, ruleId, cursor });
  const ruleOptions = useListRuleOptionsQuery(pid);
  const [pullLive] = usePullLiveLogMutation();

  const [liveOn, setLiveOn] = useState(false);
  const [liveRows, setLiveRows] = useState<ExecutionLogEntry[]>([]);

  useEffect(() => {
    if (!liveOn) return;
    const iv = window.setInterval(async () => {
      try {
        const res = await pullLive().unwrap();
        setLiveRows((prev) => [...res.rows, ...prev].slice(0, LIVE_BUFFER_CAP));
      } catch {
        /* ignore a dropped tick */
      }
    }, LIVE_INTERVAL_MS);
    return () => window.clearInterval(iv);
  }, [liveOn, pullLive]);

  // Live rows respect the active filters, and sit above the fetched page.
  const liveVisible = useMemo(
    () =>
      liveRows.filter(
        (l) =>
          (pid === "all" || l.propertyId === pid) &&
          (severity === "all" || l.severity === severity) &&
          (ruleId === "all" || l.ruleId === ruleId),
      ),
    [liveRows, pid, severity, ruleId],
  );

  const liveIds = useMemo(() => new Set(liveVisible.map((l) => l.id)), [liveVisible]);
  const combined = useMemo(
    () => [...liveVisible, ...(logs.data?.rows ?? [])],
    [liveVisible, logs.data?.rows],
  );

  const streamRows: LogStreamRow[] = combined.map((entry) =>
    toStreamRow(entry, liveIds.has(entry.id)),
  );
  const counts = logs.data?.counts;

  const exportCsv = () => {
    if (combined.length === 0) return;
    const header = [
      "time",
      "severity",
      "rule",
      "matched",
      "sent",
      "runtimeMs",
      "source",
      "env",
      "message",
    ];
    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = combined.map((l) =>
      [l.time, l.severity, l.ruleName, l.matched, l.sent, l.runtimeMs, l.source, l.env, l.message]
        .map(escape)
        .join(","),
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `execution-logs-${severity}-${range}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("Logs exported", { description: `${combined.length} rows · current filter` });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Automation" },
          { label: "Rules Engine", href: "/rules" },
          { label: "Execution logs" },
        ]}
        title="Execution logs"
        subtitle="Audit trail of every rule firing · used for compliance and debugging."
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv}>
              <Download /> Export CSV
            </Button>
            <Button
              variant={liveOn ? "default" : "secondary"}
              onClick={() => setLiveOn((v) => !v)}
              aria-pressed={liveOn}
            >
              <Radio className={cn(liveOn && "animate-pulse")} />
              {liveOn ? "Live tail on" : "Live tail"}
            </Button>
          </>
        }
      />

      <div className="rounded-xl border border-hairline bg-surface-1 p-4">
        <Toolbar className="mb-3">
          {/* Severity tabs (color-coded) */}
          <div
            role="tablist"
            aria-label="Filter by severity"
            className="flex flex-wrap items-center gap-1"
          >
            {SEV_TABS.map((tab) => {
              const active = tab.key === severity;
              const c = counts ? counts[tab.key as keyof typeof counts] : undefined;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => patch({ severity: tab.key })}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    active ? "bg-surface-2" : "hover:bg-surface-1",
                    active ? tab.tone : "text-text-tertiary hover:text-text-secondary",
                  )}
                >
                  {tab.label}
                  {c !== undefined ? (
                    <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-2xs tabular-nums">
                      {count(c)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <ToolbarSpacer />
          <Select value={range} onValueChange={(v) => patch({ range: v })}>
            <SelectTrigger className="h-9 w-[150px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value} className="text-xs">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={ruleId} onValueChange={(v) => patch({ ruleId: v })}>
            <SelectTrigger className="h-9 w-[180px] text-xs">
              <SelectValue placeholder="All rules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All rules
              </SelectItem>
              {(ruleOptions.data ?? []).map((r) => (
                <SelectItem key={r.value} value={r.value} className="text-xs">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Toolbar>

        {logs.isError ? (
          <ErrorState onRetry={() => logs.refetch()} retrying={logs.isFetching} />
        ) : logs.isLoading && combined.length === 0 ? (
          <div className="space-y-2 py-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <LogStream
            rows={streamRows}
            height={560}
            hasMore={Boolean(logs.data?.nextCursor)}
            loadingMore={logs.isFetching && cursor !== "0"}
            onLoadMore={() => {
              if (logs.data?.nextCursor) setCursor(logs.data.nextCursor);
            }}
          />
        )}
      </div>
    </div>
  );
}

function toStreamRow(entry: ExecutionLogEntry, fresh: boolean): LogStreamRow {
  const prefix = `${entry.ruleName} · `;
  const rest = entry.message.startsWith(prefix)
    ? entry.message.slice(prefix.length)
    : entry.message;
  return {
    id: entry.id,
    severity: entry.severity as Severity,
    time: timeOfDay(entry.time),
    message: (
      <>
        <strong className="font-semibold text-text-primary">{entry.ruleName}</strong> · {rest}
      </>
    ),
    meta: `${entry.source} · ${entry.env}`,
    fresh,
  };
}
