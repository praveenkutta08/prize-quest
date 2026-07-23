import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, Gift, LayoutGrid, List, Package, Plus, RefreshCw, TrendingUp } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { usePermission } from "./usePermission";
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  PageHeader,
  PrizeThumbGrid,
  SearchInput,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  StatCardSkeleton,
  StatusTabs,
  Skeleton,
  Toolbar,
  ToolbarSpacer,
  toast,
  type PrizeLike,
} from "@/shared/ui";
import { useTableUrlState } from "@/shared/lib";
import { count, countCompact } from "@/shared/lib/format";
import {
  useListRewardCategoriesQuery,
  useListRewardsQuery,
  useSetRewardStatusMutation,
  useSyncCatalogMutation,
} from "../api";
import type { RewardItem } from "../model";
import { CATEGORY_LABEL } from "./labels";
import { isRewardLive, makeRewardColumns } from "./columns";

const STATUS_TAB_ORDER = ["all", "active", "draft", "out-of-stock"] as const;
const TAB_LABEL: Record<string, string> = {
  all: "All",
  active: "Active",
  draft: "Draft",
  "out-of-stock": "Out of stock",
};

export function RewardsListPage() {
  const navigate = useNavigate();
  const pid = useAppSelector((s) => s.scope.activePropertyId) ?? "all";
  const canSync = usePermission("catalog.sync");

  const url = useTableUrlState("all");
  const [searchInput, setSearchInput] = useState(url.q);
  const debounce = useRef<number | undefined>(undefined);

  // Category + view live in the URL alongside the shared table state.
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category") ?? "all";
  const view = params.get("view") ?? "list";
  const setParam = (key: string, value: string, resetPage = true) => {
    const p = new URLSearchParams(window.location.search);
    if (!value || value === "all" || (key === "view" && value === "list")) p.delete(key);
    else p.set(key, value);
    if (resetPage) p.delete("page");
    navigate({ search: p.toString() }, { replace: true });
  };

  const onSearch = (value: string) => {
    setSearchInput(value);
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => url.setQ(value), 300);
  };

  const list = useListRewardsQuery({
    propertyId: pid,
    status: url.status,
    category,
    q: url.q,
    sort: url.sortParam,
    page: url.page,
  });
  const categories = useListRewardCategoriesQuery(pid);

  const [setStatus] = useSetRewardStatusMutation();
  const [syncCatalog, syncState] = useSyncCatalogMutation();

  const onToggleStatus = async (r: RewardItem) => {
    const nextStatus = isRewardLive(r.status) ? "archived" : "active";
    try {
      await setStatus({ id: r.id, status: nextStatus }).unwrap();
      toast.success(nextStatus === "active" ? "Reward activated" : "Reward archived", {
        description: r.name,
      });
    } catch {
      toast.error("Couldn't update status", { description: "Please try again." });
    }
  };

  const onSync = async () => {
    try {
      const res = await syncCatalog().unwrap();
      toast.success("Catalog synced", {
        description: `Added ${res.added} · updated ${res.updated} · skipped ${res.skipped}`,
      });
    } catch {
      toast.error("Sync failed", { description: "Please try again." });
    }
  };

  const columns = useMemo(
    () =>
      makeRewardColumns({
        onView: (r) => navigate(`/rewards/${r.id}`),
        onEdit: (r) => navigate(`/rewards/${r.id}/edit`),
        onDuplicate: (r) => navigate(`/rewards/new?from=${r.id}`),
        onToggleStatus,
        onSync,
        canSync,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, canSync],
  );

  const counts = list.data?.counts;
  const stats = list.data?.stats;

  const tabs = STATUS_TAB_ORDER.map((key) => ({
    key,
    label: TAB_LABEL[key],
    count: counts ? counts[key] : undefined,
  }));

  const galleryItems: PrizeLike[] = (list.data?.rows ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    value: r.value,
    inStock: r.inStock,
    rarity: r.rarity,
    stockCount: r.stockCount,
  }));

  const toolbar = (
    <Toolbar className="mb-3">
      <StatusTabs tabs={tabs} value={url.status} onChange={url.setStatus} />
      <ToolbarSpacer />
      <Select value={category} onValueChange={(v) => setParam("category", v)}>
        <SelectTrigger className="h-9 w-[170px] text-xs">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            All categories
          </SelectItem>
          {(categories.data ?? []).map((c) => (
            <SelectItem key={c.key} value={c.key} className="text-xs">
              {CATEGORY_LABEL[c.key]} · {c.count}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SearchInput
        value={searchInput}
        onChange={onSearch}
        placeholder="Search rewards…"
        className="w-48"
      />
      <SegmentedControl
        value={view}
        onChange={(v) => setParam("view", v, false)}
        options={[
          { value: "list", label: "List", icon: List },
          { value: "gallery", label: "Gallery", icon: LayoutGrid },
        ]}
      />
    </Toolbar>
  );

  const emptyState = (
    <EmptyState
      compact
      icon={Gift}
      title={
        url.q
          ? "No rewards match your search"
          : url.status === "all"
            ? "No rewards for this property"
            : `No ${TAB_LABEL[url.status]?.toLowerCase()} rewards`
      }
      description={
        canSync && !url.q ? "Add a reward or sync from a vendor to stock the catalog." : undefined
      }
      action={
        canSync && !url.q ? (
          <Button size="sm" onClick={() => navigate("/rewards/new")}>
            <Plus /> New reward
          </Button>
        ) : undefined
      }
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Engagement" }, { label: "Rewards catalog" }]}
        title="Rewards catalog"
        subtitle="The managed reward inventory that promotions draw from."
        actions={
          <>
            {canSync ? (
              <Button variant="secondary" onClick={onSync} disabled={syncState.isLoading}>
                <RefreshCw className={syncState.isLoading ? "animate-spin" : undefined} />
                {syncState.isLoading ? "Syncing…" : "Sync catalog"}
              </Button>
            ) : null}
            <Button onClick={() => navigate("/rewards/new")}>
              <Plus /> New reward
            </Button>
          </>
        }
      />

      {/* Stat tiles */}
      <section aria-label="Reward metrics">
        {list.isError ? null : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {!stats ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  label="Total items"
                  value={count(stats.totalItems)}
                  icon={<Boxes className="size-4" />}
                />
                <StatCard
                  label="Active"
                  value={count(stats.activeItems)}
                  icon={<Gift className="size-4" />}
                />
                <StatCard
                  label="Low stock"
                  value={<span className="text-warning">{count(stats.lowStock)}</span>}
                  icon={<Package className="size-4 text-warning" />}
                />
                <StatCard
                  label="Redemptions · month"
                  value={countCompact(stats.redemptionsThisMonth)}
                  icon={<TrendingUp className="size-4" />}
                />
              </>
            )}
          </div>
        )}
      </section>

      <Card className="overflow-hidden p-4">
        {list.isError ? (
          <ErrorState onRetry={() => list.refetch()} retrying={list.isFetching} />
        ) : view === "gallery" ? (
          <>
            {toolbar}
            {list.isLoading ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            ) : galleryItems.length === 0 ? (
              <div className="py-2">{emptyState}</div>
            ) : (
              <PrizeThumbGrid
                prizes={galleryItems}
                showValue
                showRarity
                showStock
                onSelect={(id) => navigate(`/rewards/${id}`)}
              />
            )}
          </>
        ) : (
          <DataTable
            columns={columns}
            data={list.data?.rows ?? []}
            loading={list.isLoading}
            onRowClick={(r) => navigate(`/rewards/${r.id}`)}
            sorting={url.sorting}
            onSortingChange={url.onSortingChange}
            manualSorting
            toolbar={toolbar}
            empty={emptyState}
            pagination={{
              pageIndex: url.page,
              pageSize: 8,
              total: list.data?.total ?? 0,
              onPageChange: url.setPage,
            }}
          />
        )}
      </Card>
    </div>
  );
}
