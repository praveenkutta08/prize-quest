import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download } from "lucide-react";
import {
  Button,
  DescriptionList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ErrorState,
  LogStream,
  PageHeader,
  PresetChips,
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  StatusPill,
  Toolbar,
  ToolbarSpacer,
  toast,
  type LogSeverity,
  type LogStreamRow,
} from "@/shared/ui";
import { usePermission } from "./usePermission";
import { useListAuditQuery } from "../api";
import type { AuditAction, AuditEntry } from "../model";

const ACTORS = [
  { value: "all", label: "All actors" },
  { value: "u-alex-rivera", label: "Alex Rivera" },
  { value: "u-james-chen", label: "James Chen" },
  { value: "u-maya-rodriguez", label: "Maya Rodriguez" },
  { value: "u-sam-patel", label: "Sam Patel" },
  { value: "u-nina-okafor", label: "Nina Okafor" },
];
const ACTIONS = [
  "all",
  "create",
  "update",
  "delete",
  "activate",
  "pause",
  "login",
  "export",
  "permission-change",
  "invite",
];
const TARGETS = [
  "all",
  "campaign",
  "rule",
  "reward",
  "user",
  "setting",
  "player",
  "trigger",
  "fulfillment",
];
const RANGES = [
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7d" },
  { value: "30d", label: "Last 30d" },
  { value: "all", label: "All time" },
];

/** Map an audit action to a tone dot. */
function actionSeverity(action: AuditAction): LogSeverity {
  if (action === "delete" || action === "permission-change") return "err";
  if (action === "create" || action === "activate") return "ok";
  if (action === "pause" || action === "update") return "warn";
  return "info";
}

function timeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour12: false });
}

export function AuditLogsPage() {
  const canExport = usePermission("audit.export");
  const [params, setParams] = useSearchParams();

  const actor = params.get("actor") ?? "all";
  const action = params.get("action") ?? "all";
  const target = params.get("target") ?? "all";
  const range = params.get("range") ?? "30d";
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [detail, setDetail] = useState<AuditEntry | null>(null);

  const patch = (next: Record<string, string | undefined>) => {
    setCursor(undefined);
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
  };

  const audit = useListAuditQuery({ actor, action, target, range, q, cursor });
  const rowsById = useMemo(() => {
    const m = new Map<string, AuditEntry>();
    for (const e of audit.data?.rows ?? []) m.set(e.id, e);
    return m;
  }, [audit.data?.rows]);

  const streamRows: LogStreamRow[] = (audit.data?.rows ?? []).map((e) => ({
    id: e.id,
    severity: actionSeverity(e.action),
    time: timeOfDay(e.time),
    message: (
      <>
        <strong className="font-semibold text-text-primary">{e.actorName}</strong> {e.action}{" "}
        <span className="text-text-tertiary">{e.targetType}:</span> {e.targetLabel} · {e.summary}
      </>
    ),
    meta: e.ip ?? "",
  }));

  const exportCsv = () => {
    const rows = audit.data?.rows ?? [];
    if (rows.length === 0) return;
    const header = [
      "time",
      "actor",
      "action",
      "targetType",
      "targetLabel",
      "summary",
      "ip",
      "property",
    ];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = rows.map((e) =>
      [
        e.time,
        e.actorName,
        e.action,
        e.targetType,
        e.targetLabel,
        e.summary,
        e.ip ?? "",
        e.propertyId ?? "",
      ]
        .map((v) => esc(String(v)))
        .join(","),
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `audit-${range}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("Audit log exported", { description: `${rows.length} rows · current filter` });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Operations" }, { label: "Audit logs" }]}
        title="Audit logs"
        subtitle="Console-wide operator action trail. Tenant-level — distinct from rule execution logs."
        actions={
          canExport ? (
            <Button variant="secondary" onClick={exportCsv}>
              <Download /> Export CSV
            </Button>
          ) : null
        }
      />

      <div className="rounded-xl border border-hairline bg-surface-1 p-4">
        <Toolbar className="mb-3">
          <Select value={actor} onValueChange={(v) => patch({ actor: v })}>
            <SelectTrigger className="h-9 w-[150px] text-xs" aria-label="Filter by actor">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTORS.map((a) => (
                <SelectItem key={a.value} value={a.value} className="text-xs">
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={action} onValueChange={(v) => patch({ action: v })}>
            <SelectTrigger className="h-9 w-[140px] text-xs" aria-label="Filter by action">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              {ACTIONS.map((a) => (
                <SelectItem key={a} value={a} className="text-xs capitalize">
                  {a === "all" ? "All actions" : a.replace(/-/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={target} onValueChange={(v) => patch({ target: v })}>
            <SelectTrigger className="h-9 w-[140px] text-xs" aria-label="Filter by target">
              <SelectValue placeholder="All targets" />
            </SelectTrigger>
            <SelectContent>
              {TARGETS.map((t) => (
                <SelectItem key={t} value={t} className="text-xs capitalize">
                  {t === "all" ? "All targets" : t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToolbarSpacer />
          <PresetChips
            ariaLabel="Date range"
            value={range}
            chips={RANGES}
            onSelect={(v) => patch({ range: v })}
          />
          <SearchInput value={q} onChange={setQ} placeholder="Search audit…" className="w-44" />
        </Toolbar>

        {audit.isError ? (
          <ErrorState onRetry={() => audit.refetch()} retrying={audit.isFetching} />
        ) : audit.isLoading && streamRows.length === 0 ? (
          <div className="space-y-2 py-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <LogStream
            rows={streamRows}
            height={560}
            hasMore={Boolean(audit.data?.nextCursor)}
            loadingMore={audit.isFetching && cursor !== undefined}
            onLoadMore={() => {
              if (audit.data?.nextCursor) setCursor(audit.data.nextCursor);
            }}
            onRowClick={(id) => setDetail(rowsById.get(id) ?? null)}
            emptyLabel="No audit entries match these filters."
          />
        )}
      </div>

      <Dialog open={Boolean(detail)} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="max-w-xl">
          {detail ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <StatusPill
                    tone={
                      detail.action === "delete" || detail.action === "permission-change"
                        ? "danger"
                        : detail.action === "create" || detail.action === "activate"
                          ? "active"
                          : "scheduled"
                    }
                  >
                    {detail.action}
                  </StatusPill>
                </div>
                <DialogTitle className="mt-1">{detail.summary}</DialogTitle>
                <DialogDescription>
                  {detail.actorName} · {new Date(detail.time).toLocaleString("en-US")}
                </DialogDescription>
              </DialogHeader>
              <DescriptionList
                items={[
                  { label: "Actor", value: detail.actorName },
                  { label: "Target", value: `${detail.targetType} · ${detail.targetLabel}` },
                  {
                    label: "IP",
                    value: detail.ip ? <span className="font-mono">{detail.ip}</span> : "—",
                  },
                  { label: "Property", value: detail.propertyId ?? "Tenant-wide" },
                ]}
              />
              {detail.before || detail.after ? (
                <div className="grid grid-cols-2 gap-4 border-t border-hairline pt-4">
                  <DiffColumn label="Before" data={detail.before} />
                  <DiffColumn label="After" data={detail.after} />
                </div>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DiffColumn({ label, data }: { label: string; data?: Record<string, unknown> }) {
  return (
    <div>
      <p className="mb-2 text-2xs uppercase tracking-wide text-text-tertiary">{label}</p>
      {data && Object.keys(data).length > 0 ? (
        <dl className="space-y-1.5">
          {Object.entries(data).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3 text-xs">
              <dt className="font-mono text-text-tertiary">{k}</dt>
              <dd className="font-mono text-text-secondary">{String(v)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-xs text-text-tertiary">—</p>
      )}
    </div>
  );
}
