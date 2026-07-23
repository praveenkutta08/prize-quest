import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, DollarSign, Users, UserCheck } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { usePermission } from "./usePermission";
import {
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  PageHeader,
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  StatCardSkeleton,
  StatusTabs,
  Toolbar,
  ToolbarSpacer,
} from "@/shared/ui";
import { useTableUrlState } from "@/shared/lib";
import { count, moneyCompact } from "@/shared/lib/format";
import { useListPlayersQuery } from "../api";
import type { Player } from "../model";
import { makePlayerColumns } from "./columns";
import { AddToCampaignDialog, AdjustPointsDialog } from "./dialogs";
import { SEGMENT_LABEL } from "./labels";

const SEGMENT_TAB_ORDER = [
  "all",
  "vip",
  "high-roller",
  "regular",
  "new",
  "at-risk",
  "dormant",
] as const;
const TAB_LABEL: Record<string, string> = {
  all: "All",
  vip: "VIP",
  "high-roller": "High roller",
  regular: "Regular",
  new: "New",
  "at-risk": "At-risk",
  dormant: "Dormant",
};

const TIERS = ["Silver", "Gold", "Platinum", "Diamond"];
const STATUSES: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "self-excluded", label: "Self-excluded" },
];

export function PlayersListPage() {
  const navigate = useNavigate();
  const pid = useAppSelector((s) => s.scope.activePropertyId) ?? "all";
  const properties = useAppSelector((s) => s.tenant.context?.properties ?? []);
  const canAdjust = usePermission("players.adjust");

  const url = useTableUrlState("all");
  const [searchInput, setSearchInput] = useState(url.q);
  const debounce = useRef<number | undefined>(undefined);

  const params = new URLSearchParams(window.location.search);
  const tier = params.get("tier") ?? "all";
  const status = params.get("statusFilter") ?? "all";
  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(window.location.search);
    if (!value || value === "all") p.delete(key);
    else p.set(key, value);
    p.delete("page");
    navigate({ search: p.toString() }, { replace: true });
  };

  const onSearch = (value: string) => {
    setSearchInput(value);
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => url.setQ(value), 300);
  };

  const list = useListPlayersQuery({
    propertyId: pid,
    segment: url.status,
    tier,
    status,
    q: url.q,
    sort: url.sortParam,
    page: url.page,
  });

  const [adjustFor, setAdjustFor] = useState<Player | null>(null);
  const [campaignFor, setCampaignFor] = useState<Player | null>(null);

  const propertyName = (id: string) => properties.find((p) => p.id === id)?.name ?? id;

  const columns = useMemo(
    () =>
      makePlayerColumns({
        onView: (p) => navigate(`/players/${p.id}`),
        onAddToCampaign: (p) => setCampaignFor(p),
        onAdjustPoints: (p) => setAdjustFor(p),
        canAdjust,
        propertyName,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, canAdjust, properties],
  );

  const counts = list.data?.counts;
  const stats = list.data?.stats;

  const tabs = SEGMENT_TAB_ORDER.map((key) => ({
    key,
    label: TAB_LABEL[key],
    count: counts ? counts[key] : undefined,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Engagement" }, { label: "Players" }]}
        title="Players"
        subtitle="The player directory — segments, lifetime value, and recent activity."
      />

      <section aria-label="Player metrics">
        {list.isError ? null : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {!stats ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  label="Total players"
                  value={count(stats.totalPlayers)}
                  icon={<Users className="size-4" />}
                />
                <StatCard
                  label="Active · month"
                  value={count(stats.activeThisMonth)}
                  icon={<UserCheck className="size-4" />}
                />
                <StatCard
                  label="Avg lifetime value"
                  value={
                    <span className="text-warning">{moneyCompact(stats.avgLifetimeValue)}</span>
                  }
                  icon={<DollarSign className="size-4 text-warning" />}
                />
                <StatCard
                  label="At-risk"
                  value={<span className="text-danger">{count(stats.atRisk)}</span>}
                  icon={<AlertTriangle className="size-4 text-danger" />}
                />
              </>
            )}
          </div>
        )}
      </section>

      <Card className="overflow-hidden p-4">
        {list.isError ? (
          <ErrorState onRetry={() => list.refetch()} retrying={list.isFetching} />
        ) : (
          <DataTable
            columns={columns}
            data={list.data?.rows ?? []}
            loading={list.isLoading}
            onRowClick={(p) => navigate(`/players/${p.id}`)}
            sorting={url.sorting}
            onSortingChange={url.onSortingChange}
            manualSorting
            toolbar={
              <Toolbar className="mb-3">
                <StatusTabs
                  tabs={tabs}
                  value={url.status}
                  onChange={url.setStatus}
                  ariaLabel="Filter by segment"
                />
                <ToolbarSpacer />
                <Select value={tier} onValueChange={(v) => setParam("tier", v)}>
                  <SelectTrigger className="h-9 w-[140px] text-xs">
                    <SelectValue placeholder="All tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All tiers
                    </SelectItem>
                    {TIERS.map((t) => (
                      <SelectItem key={t} value={t} className="text-xs">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={status} onValueChange={(v) => setParam("statusFilter", v)}>
                  <SelectTrigger className="h-9 w-[150px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="text-xs">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <SearchInput
                  value={searchInput}
                  onChange={onSearch}
                  placeholder="Search players…"
                  className="w-48"
                />
              </Toolbar>
            }
            empty={
              <EmptyState
                compact
                icon={Users}
                title={
                  url.q
                    ? "No players match your search"
                    : url.status === "all"
                      ? "No players for this property"
                      : `No ${SEGMENT_LABEL[url.status as keyof typeof SEGMENT_LABEL]?.toLowerCase() ?? url.status} players`
                }
              />
            }
            pagination={{
              pageIndex: url.page,
              pageSize: 10,
              total: list.data?.total ?? 0,
              onPageChange: url.setPage,
            }}
          />
        )}
      </Card>

      {adjustFor ? (
        <AdjustPointsDialog
          player={adjustFor}
          open
          onOpenChange={(v) => !v && setAdjustFor(null)}
        />
      ) : null}
      {campaignFor ? (
        <AddToCampaignDialog
          player={campaignFor}
          open
          onOpenChange={(v) => !v && setCampaignFor(null)}
        />
      ) : null}
    </div>
  );
}
