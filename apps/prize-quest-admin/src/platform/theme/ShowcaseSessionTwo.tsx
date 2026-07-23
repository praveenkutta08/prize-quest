import { useMemo, useState } from "react";
import { Copy, Eye, Pause, Pencil, Calendar, List } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConditionBuilder,
  DataTable,
  RowActionMenu,
  SearchInput,
  SegmentedControl,
  StatusPill,
  StatusTabs,
  SummaryPanel,
  Toolbar,
  ToolbarSpacer,
  compileClauses,
  type ConditionGroupValue,
  type FieldDef,
  type ReachTestStatus,
  type StatusTone,
} from "@/shared/ui";
import { count, percent } from "@/shared/lib/format";

/** A small self-contained field catalog (the real one lives in the promotions feature). */
const DEMO_CATALOG: FieldDef[] = [
  {
    key: "player.tier",
    label: "player.tier",
    token: "tier",
    editor: "multi-select",
    operators: [
      { key: "in", label: "in", symbol: "IN" },
      { key: "not-in", label: "not in", symbol: "NOT IN" },
    ],
    options: [
      { value: "Silver", label: "Silver" },
      { value: "Gold", label: "Gold" },
      { value: "Platinum", label: "Platinum" },
      { value: "Diamond", label: "Diamond" },
    ],
  },
  {
    key: "player.age",
    label: "player.age",
    token: "age",
    editor: "number",
    unit: "yrs",
    operators: [
      { key: "gte", label: "≥", symbol: "≥" },
      { key: "lte", label: "≤", symbol: "≤" },
      { key: "between", label: "between", symbol: "BETWEEN" },
    ],
  },
  {
    key: "player.property",
    label: "player.property",
    token: "property",
    editor: "multi-select",
    operators: [{ key: "in", label: "in", symbol: "IN" }],
    options: [
      { value: "cr-lv", label: "Casino Royale LV" },
      { value: "cr-reno", label: "Casino Royale Reno" },
      { value: "cr-tahoe", label: "Casino Royale Tahoe" },
    ],
  },
];

interface DemoRow {
  id: string;
  name: string;
  sub: string;
  status: StatusTone;
  reach: number;
  engagement: number;
}

const DEMO_ROWS: DemoRow[] = [
  {
    id: "1",
    name: "Sunday Slot Sprint",
    sub: "Goal-based · slot wager",
    status: "active",
    reach: 12407,
    engagement: 0.319,
  },
  {
    id: "2",
    name: "March Madness",
    sub: "All players · property-wide",
    status: "active",
    reach: 28600,
    engagement: 0.418,
  },
  {
    id: "3",
    name: "VIP Appreciation Week",
    sub: "High-value reward sweep",
    status: "scheduled",
    reach: 1200,
    engagement: 0,
  },
  {
    id: "4",
    name: "High Roller Invitational",
    sub: "Exclusive · invite-only",
    status: "draft",
    reach: 300,
    engagement: 0,
  },
  {
    id: "5",
    name: "Weekend Warriors",
    sub: "Fri–Sun activity bonus",
    status: "ended",
    reach: 9800,
    engagement: 0.285,
  },
];

const DEMO_COLUMNS: ColumnDef<DemoRow, unknown>[] = [
  {
    accessorKey: "name",
    header: "Campaign",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-text-primary">{row.original.name}</p>
        <p className="text-2xs text-text-tertiary">{row.original.sub}</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusPill tone={row.original.status} pulse={row.original.status === "active"}>
        {row.original.status}
      </StatusPill>
    ),
  },
  {
    accessorKey: "reach",
    header: "Reach",
    meta: { className: "text-right" },
    cell: ({ row }) => <span className="tabular-nums">{count(row.original.reach)}</span>,
  },
  {
    accessorKey: "engagement",
    header: "Engagement",
    meta: { className: "text-right" },
    cell: ({ row }) =>
      row.original.engagement ? (
        <span className="font-medium text-success">{percent(row.original.engagement)}</span>
      ) : (
        <span className="text-text-tertiary">—</span>
      ),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    meta: { className: "w-10 text-right" },
    cell: () => (
      <RowActionMenu
        actions={[
          { label: "View", icon: Eye, onSelect: () => {} },
          { label: "Edit", icon: Pencil, onSelect: () => {} },
          { label: "Duplicate", icon: Copy, onSelect: () => {} },
          { label: "Pause", icon: Pause, onSelect: () => {}, danger: true, separatorBefore: true },
        ]}
      />
    ),
  },
];

/** Session 2 showcase for the reused trio (DataTable · ConditionBuilder · SummaryPanel). */
export function ShowcaseSessionTwo() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState("list");

  const [group, setGroup] = useState<ConditionGroupValue>({
    conjunction: "AND",
    conditions: [
      { field: "player.tier", operator: "in", value: ["Gold", "Platinum", "Diamond"] },
      { field: "player.age", operator: "gte", value: 21 },
    ],
  });

  const [testStatus, setTestStatus] = useState<ReachTestStatus>("idle");
  const [result, setResult] = useState<{ matchedPlayers: number; ofEligible: number }>();

  const clauses = useMemo(() => compileClauses(group, DEMO_CATALOG), [group]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return DEMO_ROWS.filter(
      (r) => (tab === "all" || r.status === tab) && (!term || r.name.toLowerCase().includes(term)),
    );
  }, [tab, q]);

  const runTest = () => {
    setTestStatus("loading");
    window.setTimeout(() => {
      setResult({ matchedPlayers: 8420, ofEligible: 24000 });
      setTestStatus("done");
    }, 700);
  };

  return (
    <div className="space-y-4">
      {/* DataTable */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>
            DataTable — sortable · status tabs · search · pagination · row actions
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <DataTable
            columns={DEMO_COLUMNS}
            data={rows}
            toolbar={
              <Toolbar className="mb-3">
                <StatusTabs
                  value={tab}
                  onChange={setTab}
                  tabs={[
                    { key: "all", label: "All", count: DEMO_ROWS.length },
                    { key: "active", label: "Active", count: 2 },
                    { key: "scheduled", label: "Scheduled", count: 1 },
                    { key: "draft", label: "Draft", count: 1 },
                    { key: "ended", label: "Ended", count: 1 },
                  ]}
                />
                <ToolbarSpacer />
                <SearchInput
                  value={q}
                  onChange={setQ}
                  placeholder="Search campaigns…"
                  className="w-52"
                />
                <SegmentedControl
                  value={view}
                  onChange={setView}
                  options={[
                    { value: "list", label: "List", icon: List },
                    { value: "calendar", label: "Calendar", icon: Calendar },
                  ]}
                />
              </Toolbar>
            }
            pagination={{ pageIndex: 0, pageSize: 8, total: rows.length, onPageChange: () => {} }}
          />
        </CardContent>
      </Card>

      {/* ConditionBuilder + SummaryPanel side by side */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>ConditionBuilder — typed field catalog, AND/OR</CardTitle>
          </CardHeader>
          <CardContent>
            <ConditionBuilder catalog={DEMO_CATALOG} value={group} onChange={setGroup} />
          </CardContent>
        </Card>

        <SummaryPanel
          className="lg:static"
          previewRows={[
            { label: "Campaign", value: "Summer Bash 2026" },
            { label: "Type · Schedule", value: "Goal-based · Jun 1 – Aug 31" },
            {
              label: "Estimated reach",
              value: result ? `~${count(result.matchedPlayers)} players` : "~12,400 players",
              emphasis: true,
            },
          ]}
          pseudocode={{
            whenClauses: clauses,
            conjunction: group.conjunction,
            thenClause: "unlock prize choice",
          }}
          test={{ status: testStatus, result, onRun: runTest }}
        />
      </div>
    </div>
  );
}
