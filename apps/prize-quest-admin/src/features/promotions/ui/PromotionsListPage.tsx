import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CalendarClock,
  Calendar,
  DollarSign,
  List,
  Megaphone,
  Plus,
  Users,
} from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { usePermission } from "./usePermission";
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  PageHeader,
  SearchInput,
  SegmentedControl,
  StatCard,
  StatCardSkeleton,
  StatusTabs,
  Toolbar,
  ToolbarSpacer,
  toast,
} from "@/shared/ui";
import { useTableUrlState } from "@/shared/lib";
import { count, countCompact, moneyCompact, percent } from "@/shared/lib/format";
import { useListCampaignsQuery, useSetCampaignStatusMutation } from "../api";
import type { CampaignDefinition } from "../model";
import { makeCampaignColumns, isActivateTransition } from "./columns";

const STATUS_TAB_ORDER = ["all", "active", "scheduled", "draft", "ended"] as const;
const TAB_LABEL: Record<string, string> = {
  all: "All",
  active: "Active",
  scheduled: "Scheduled",
  draft: "Draft",
  ended: "Ended",
};

export function PromotionsListPage() {
  const navigate = useNavigate();
  const pid = useAppSelector((s) => s.scope.activePropertyId) ?? "all";
  const canCreate = usePermission("campaign.create");
  const canActivate = usePermission("campaign.activate");

  const url = useTableUrlState("all");
  const [view, setView] = useState("list");
  const [searchInput, setSearchInput] = useState(url.q);
  const debounce = useRef<number | undefined>(undefined);

  const onSearch = (value: string) => {
    setSearchInput(value);
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => url.setQ(value), 300);
  };

  const list = useListCampaignsQuery({
    propertyId: pid,
    status: url.status,
    q: url.q,
    sort: url.sortParam,
    page: url.page,
  });

  const [setStatus] = useSetCampaignStatusMutation();

  const onToggleStatus = async (c: CampaignDefinition) => {
    const activating = isActivateTransition(c.status);
    const nextStatus = activating ? "active" : "paused";
    try {
      await setStatus({ id: c.id, status: nextStatus }).unwrap();
      toast.success(activating ? "Campaign activated" : "Campaign paused", {
        description: c.name,
      });
    } catch {
      toast.error("Couldn't update status", { description: "Please try again." });
    }
  };

  const columns = useMemo(
    () =>
      makeCampaignColumns({
        onView: (c) => navigate(`/promotions/${c.id}`),
        onEdit: (c) => navigate(`/promotions/${c.id}/edit`),
        onDuplicate: (c) => navigate(`/promotions/new?from=${c.id}`),
        onToggleStatus,
        canActivate,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, canActivate],
  );

  const counts = list.data?.counts;
  const stats = list.data?.stats;

  const tabs = STATUS_TAB_ORDER.map((key) => ({
    key,
    label: TAB_LABEL[key],
    count: counts ? counts[key] : undefined,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Operator" }, { label: "Promotions" }]}
        title="Promotions"
        subtitle="Manage and monitor Prize Quest campaigns across properties."
        actions={
          canCreate ? (
            <Button onClick={() => navigate("/promotions/new")}>
              <Plus /> New campaign
            </Button>
          ) : null
        }
      />

      {/* Stat tiles */}
      <section aria-label="Campaign metrics">
        {list.isError ? null : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {!stats ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  label="Active campaigns"
                  value={count(stats.activeCampaigns)}
                  icon={<Megaphone className="size-4" />}
                />
                <StatCard
                  label="Total reach"
                  value={countCompact(stats.totalReach)}
                  icon={<Users className="size-4" />}
                />
                <StatCard
                  label="Avg engagement"
                  value={percent(stats.avgEngagement)}
                  icon={<Activity className="size-4" />}
                />
                <StatCard
                  label="Revenue impact"
                  value={<span className="text-warning">{moneyCompact(stats.revenueImpact)}</span>}
                  icon={<DollarSign className="size-4 text-warning" />}
                />
              </>
            )}
          </div>
        )}
      </section>

      {/* Table card */}
      <Card className="overflow-hidden p-4">
        {list.isError ? (
          <ErrorState onRetry={() => list.refetch()} retrying={list.isFetching} />
        ) : view === "calendar" ? (
          <>
            <ListToolbar
              tabs={tabs}
              status={url.status}
              onStatus={url.setStatus}
              search={searchInput}
              onSearch={onSearch}
              view={view}
              onView={setView}
            />
            <EmptyState
              icon={CalendarClock}
              title="Calendar view is coming soon"
              description="A scheduling calendar for campaign windows arrives in a future release. Use the list view to manage promotions today."
              action={
                <Button variant="secondary" size="sm" onClick={() => setView("list")}>
                  <List /> Back to list
                </Button>
              }
            />
          </>
        ) : (
          <DataTable
            columns={columns}
            data={list.data?.rows ?? []}
            loading={list.isLoading}
            onRowClick={(c) => navigate(`/promotions/${c.id}`)}
            sorting={url.sorting}
            onSortingChange={url.onSortingChange}
            manualSorting
            toolbar={
              <ListToolbar
                tabs={tabs}
                status={url.status}
                onStatus={url.setStatus}
                search={searchInput}
                onSearch={onSearch}
                view={view}
                onView={setView}
              />
            }
            empty={
              <EmptyState
                compact
                icon={Megaphone}
                title={
                  url.q
                    ? "No campaigns match your search"
                    : url.status === "all"
                      ? "No campaigns for this property"
                      : `No ${TAB_LABEL[url.status]?.toLowerCase()} campaigns`
                }
                description={
                  canCreate && !url.q
                    ? "Create a promotion to start engaging players here."
                    : undefined
                }
                action={
                  canCreate && !url.q ? (
                    <Button size="sm" onClick={() => navigate("/promotions/new")}>
                      <Plus /> New campaign
                    </Button>
                  ) : undefined
                }
              />
            }
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

function ListToolbar({
  tabs,
  status,
  onStatus,
  search,
  onSearch,
  view,
  onView,
}: {
  tabs: { key: string; label: string; count?: number }[];
  status: string;
  onStatus: (s: string) => void;
  search: string;
  onSearch: (v: string) => void;
  view: string;
  onView: (v: string) => void;
}) {
  return (
    <Toolbar className="mb-3">
      <StatusTabs tabs={tabs} value={status} onChange={onStatus} />
      <ToolbarSpacer />
      <SearchInput
        value={search}
        onChange={onSearch}
        placeholder="Search campaigns…"
        className="w-52"
      />
      <SegmentedControl
        value={view}
        onChange={onView}
        options={[
          { value: "list", label: "List", icon: List },
          { value: "calendar", label: "Calendar", icon: Calendar },
        ]}
      />
    </Toolbar>
  );
}
