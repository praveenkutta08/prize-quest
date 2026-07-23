import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Link2, Plus, Radio, Zap } from "lucide-react";
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
  StatCard,
  StatCardSkeleton,
  StatusTabs,
  Toolbar,
  ToolbarSpacer,
  toast,
} from "@/shared/ui";
import { useTableUrlState } from "@/shared/lib";
import { count, countCompact } from "@/shared/lib/format";
import { useListTriggerDefsQuery, useSetTriggerStatusMutation } from "../api";
import type { TriggerDefinition } from "../model";
import { makeTriggerColumns } from "./columns";

const CATEGORY_TAB_ORDER = ["all", "gameplay", "lifecycle", "financial", "schedule"] as const;
const TAB_LABEL: Record<string, string> = {
  all: "All",
  gameplay: "Gameplay",
  lifecycle: "Lifecycle",
  financial: "Financial",
  schedule: "Schedule",
};

export function TriggersListPage() {
  const navigate = useNavigate();
  const pid = useAppSelector((s) => s.scope.activePropertyId) ?? "all";
  const canManage = usePermission("triggers.manage");

  const url = useTableUrlState("all");
  const [searchInput, setSearchInput] = useState(url.q);
  const debounce = useRef<number | undefined>(undefined);

  const onSearch = (value: string) => {
    setSearchInput(value);
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => url.setQ(value), 300);
  };

  // `status` from the shared table state doubles as the category tab here.
  const list = useListTriggerDefsQuery({
    propertyId: pid,
    category: url.status,
    q: url.q,
    page: url.page,
  });
  const [setStatus] = useSetTriggerStatusMutation();

  const onToggleStatus = async (t: TriggerDefinition) => {
    const next = t.status === "active" ? "draft" : "active";
    try {
      await setStatus({ id: t.id, status: next }).unwrap();
      toast.success(next === "active" ? "Trigger activated" : "Trigger set to draft", {
        description: t.label,
      });
    } catch {
      toast.error("Couldn't update trigger");
    }
  };

  const columns = useMemo(
    () =>
      makeTriggerColumns({
        onView: (t) => navigate(`/triggers/${t.id}`),
        onEdit: (t) => navigate(`/triggers/${t.id}/edit`),
        onToggleStatus,
        canManage,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, canManage],
  );

  const counts = list.data?.counts;
  const stats = list.data?.stats;
  const tabs = CATEGORY_TAB_ORDER.map((key) => ({
    key,
    label: TAB_LABEL[key],
    count: key === "all" ? counts?.all : undefined,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Automation" }, { label: "Triggers" }]}
        title="Triggers"
        subtitle="The event catalog the Rules Engine binds to. Property-scoped."
        actions={
          canManage ? (
            <Button onClick={() => navigate("/triggers/new")}>
              <Plus /> New trigger
            </Button>
          ) : null
        }
      />

      <section aria-label="Trigger metrics">
        {list.isError ? null : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {!counts || !stats ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  label="Total triggers"
                  value={count(counts.all)}
                  icon={<Radio className="size-4" />}
                />
                <StatCard
                  label="Active"
                  value={count(counts.active)}
                  icon={<Zap className="size-4" />}
                />
                <StatCard
                  label="Bound rules"
                  value={count(stats.boundRules)}
                  icon={<Link2 className="size-4" />}
                />
                <StatCard
                  label="Fired today"
                  value={countCompact(stats.firedToday)}
                  icon={<Activity className="size-4" />}
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
            onRowClick={(t) => navigate(`/triggers/${t.id}`)}
            toolbar={
              <Toolbar className="mb-3">
                <StatusTabs
                  tabs={tabs}
                  value={url.status}
                  onChange={url.setStatus}
                  ariaLabel="Filter by category"
                />
                <ToolbarSpacer />
                <SearchInput
                  value={searchInput}
                  onChange={onSearch}
                  placeholder="Search triggers…"
                  className="w-48"
                />
              </Toolbar>
            }
            empty={
              <EmptyState
                compact
                icon={Radio}
                title={url.q ? "No triggers match your search" : "No triggers in this category"}
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
