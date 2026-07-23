import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, CheckCheck, Plus, ScrollText, Users, Zap } from "lucide-react";
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
import { count } from "@/shared/lib/format";
import { useListRulesQuery, useSetRuleStatusMutation } from "../api";
import type { Rule, RuleStatus } from "../model";
import { makeRuleColumns } from "./columns";

const TAB_ORDER = ["all", "active", "paused", "draft"] as const;
const TAB_LABEL: Record<string, string> = {
  all: "All",
  active: "Active",
  paused: "Paused",
  draft: "Draft",
};

export function RulesListPage() {
  const navigate = useNavigate();
  const pid = useAppSelector((s) => s.scope.activePropertyId) ?? "all";
  const canCreate = usePermission("rule.create");
  const canToggle = usePermission("rule.toggle");

  const url = useTableUrlState("all");
  const [searchInput, setSearchInput] = useState(url.q);
  const debounce = useRef<number | undefined>(undefined);
  const onSearch = (value: string) => {
    setSearchInput(value);
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => url.setQ(value), 300);
  };

  const list = useListRulesQuery({
    propertyId: pid,
    status: url.status,
    q: url.q,
    sort: url.sortParam,
    page: url.page,
  });
  const [setStatus] = useSetRuleStatusMutation();

  const onToggle = async (rule: Rule, next: RuleStatus) => {
    try {
      await setStatus({ id: rule.id, status: next }).unwrap();
      toast.success(next === "active" ? "Rule activated" : "Rule paused", {
        description: rule.name,
      });
    } catch {
      toast.error("Couldn't update rule", { description: "Please try again." });
    }
  };

  const columns = useMemo(
    () =>
      makeRuleColumns({
        onEdit: (r) => navigate(`/rules/${r.id}/edit`),
        onDuplicate: (r) => navigate(`/rules/new?from=${r.id}`),
        onToggle,
        canToggle,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, canToggle],
  );

  const counts = list.data?.counts;
  const stats = list.data?.stats;
  const tabs = TAB_ORDER.map((key) => ({
    key,
    label: TAB_LABEL[key],
    count: counts ? counts[key] : undefined,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Operator" }, { label: "Automation" }, { label: "Rules Engine" }]}
        title="Rules Engine"
        subtitle="Create and manage automated rules for player engagement."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/rules/logs")}>
              <ScrollText /> Execution logs
            </Button>
            {canCreate ? (
              <Button onClick={() => navigate("/rules/new")}>
                <Plus /> Create rule
              </Button>
            ) : null}
          </>
        }
      />

      <section aria-label="Rule metrics">
        {list.isError ? null : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {!stats ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  label="Total rules"
                  value={count(stats.totalRules)}
                  icon={<Zap className="size-4" />}
                />
                <StatCard
                  label="Active rules"
                  value={count(stats.activeRules)}
                  icon={<CheckCheck className="size-4" />}
                />
                <StatCard
                  label="Triggered today"
                  value={count(stats.triggeredToday)}
                  icon={<Activity className="size-4" />}
                />
                <StatCard
                  label="Players matched today"
                  value={count(stats.playersMatchedToday)}
                  icon={<Users className="size-4" />}
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
            onRowClick={(r) => navigate(`/rules/${r.id}/edit`)}
            sorting={url.sorting}
            onSortingChange={url.onSortingChange}
            manualSorting
            toolbar={
              <Toolbar className="mb-3">
                <StatusTabs tabs={tabs} value={url.status} onChange={url.setStatus} />
                <ToolbarSpacer />
                <SearchInput
                  value={searchInput}
                  onChange={onSearch}
                  placeholder="Search by rule name…"
                  className="w-56"
                />
              </Toolbar>
            }
            empty={
              <EmptyState
                compact
                icon={Zap}
                title={
                  url.q
                    ? "No rules match your search"
                    : url.status === "all"
                      ? "No rules for this property"
                      : `No ${TAB_LABEL[url.status]?.toLowerCase()} rules`
                }
                description={
                  canCreate && !url.q ? "Create a rule to automate player engagement." : undefined
                }
                action={
                  canCreate && !url.q ? (
                    <Button size="sm" onClick={() => navigate("/rules/new")}>
                      <Plus /> Create rule
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
