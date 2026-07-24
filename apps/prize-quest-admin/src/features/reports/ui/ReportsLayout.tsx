import { useRef } from "react";
import { NavLink, Outlet, useSearchParams } from "react-router-dom";
import { Download, Printer } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import {
  Button,
  PageHeader,
  PresetChips,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { usePermission } from "./usePermission";
import { ReportExportContext, type ExportSpec } from "./exportContext";

const RANGES = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
];
const SEGMENTS = [
  { value: "all", label: "All segments" },
  { value: "vip", label: "VIP" },
  { value: "high-roller", label: "High roller" },
  { value: "regular", label: "Regular" },
  { value: "new", label: "New" },
  { value: "at-risk", label: "At-risk" },
  { value: "dormant", label: "Dormant" },
];

const TABS = [
  { label: "Overview", to: "/reports", end: true },
  { label: "Campaigns", to: "/reports/campaigns", end: true },
  { label: "Players", to: "/reports/players", end: true },
  { label: "Rewards", to: "/reports/rewards", end: true },
];

export function ReportsLayout() {
  const canExport = usePermission("logs.export");
  const [params, setParams] = useSearchParams();
  const range = params.get("range") ?? "30d";
  const segment = params.get("segment") ?? "all";
  const properties = useAppSelector((s) => s.tenant.context?.properties ?? []);
  const activePid = useAppSelector((s) => s.scope.activePropertyId) ?? "all";
  const activeName = properties.find((p) => p.id === activePid)?.name ?? "All properties";

  const exportRef = useRef<ExportSpec | null>(null);

  const patch = (next: Record<string, string>) => {
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

  const exportCsv = () => {
    const spec = exportRef.current;
    const rows = spec?.build();
    if (!spec || !rows || rows.length === 0) {
      toast.error("Nothing to export in this view");
      return;
    }
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${spec.filename}-${range}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("Report exported", { description: `${rows.length - 1} rows · current view` });
  };

  return (
    <ReportExportContext.Provider value={{ ref: exportRef }}>
      <div className="flex flex-col gap-6">
        <PageHeader
          breadcrumbs={[{ label: "Overview" }, { label: "Reports" }]}
          title="Reports"
          subtitle={`Analytics across the console · ${activeName}`}
          actions={
            <>
              {canExport ? (
                <Button variant="secondary" onClick={exportCsv}>
                  <Download /> Export CSV
                </Button>
              ) : null}
              <Button variant="outline" onClick={() => window.print()}>
                <Printer /> Export PDF
              </Button>
            </>
          }
        />

        {/* Tabs */}
        <nav
          aria-label="Report sections"
          className="flex items-center gap-1 border-b border-hairline"
        >
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={{ pathname: t.to, search: params.toString() }}
              end={t.end}
              className={({ isActive }) =>
                cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-text-primary after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-brand"
                    : "text-text-tertiary hover:text-text-secondary",
                )
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>

        {/* Global filter bar */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-hairline bg-surface-1 px-4 py-3">
          <span className="text-2xs uppercase tracking-wide text-text-tertiary">Range</span>
          <PresetChips
            ariaLabel="Date range"
            value={range}
            chips={RANGES}
            onSelect={(v) => patch({ range: v })}
          />
          <span className="ml-2 text-2xs uppercase tracking-wide text-text-tertiary">Segment</span>
          <Select value={segment} onValueChange={(v) => patch({ segment: v })}>
            <SelectTrigger className="h-8 w-[150px] text-xs" aria-label="Filter by segment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEGMENTS.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-xs">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="ml-auto text-2xs text-text-tertiary">
            Scoped to <span className="text-text-secondary">{activeName}</span> · switch via the
            property picker
          </span>
        </div>

        <Outlet />
      </div>
    </ReportExportContext.Provider>
  );
}
