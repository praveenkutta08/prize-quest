import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Gauge, Plus, RefreshCw, ScrollText, Zap } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import {
  ActivityFeed,
  BarChart,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
  ErrorState,
  PageHeader,
  QuickActions,
  StatCard,
  StatCardSkeleton,
  Skeleton,
  toast,
} from "@/shared/ui";
import { count, greeting, longDate, moneyCompact } from "@/shared/lib/format";
import {
  useGetActivityQuery,
  useGetClaimsSeriesQuery,
  useGetKpisQuery,
  useGetTopCampaignsQuery,
} from "../api";
import type { Kpi } from "../model";
import { topCampaignColumns } from "./topCampaignColumns";

function formatKpiValue(kpi: Kpi): string {
  switch (kpi.format) {
    case "count":
      return count(kpi.value);
    case "money-compact":
      return moneyCompact(kpi.value);
    default:
      return String(kpi.value);
  }
}

/** Staggered first-paint reveal wrapper (reduced-motion is honoured in tokens.css). */
function Reveal({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <div className="animate-rise-in" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const pid = useAppSelector((s) => s.scope.activePropertyId) ?? "all";
  const properties = useAppSelector((s) => s.tenant.context?.properties ?? []);
  const user = useAppSelector((s) => s.auth.session?.user);

  const activeProperty = pid === "all" ? null : properties.find((p) => p.id === pid);
  const contextLine = [
    longDate(),
    activeProperty ? activeProperty.name : "All properties",
    `${properties.length} properties active`,
  ].join(" · ");

  const kpis = useGetKpisQuery(pid);
  const claims = useGetClaimsSeriesQuery(pid);
  const activity = useGetActivityQuery(pid);
  const campaigns = useGetTopCampaignsQuery(pid);

  const firstName = user?.name.split(" ")[0] ?? "there";

  const quickActions = [
    {
      icon: Plus,
      title: "New campaign",
      subtitle: "Create a Prize Quest promotion",
      onClick: () => stub("New campaign"),
    },
    {
      icon: Zap,
      title: "New rule",
      subtitle: "Automate player engagement",
      onClick: () => stub("New rule"),
    },
    {
      icon: RefreshCw,
      title: "Catalog sync",
      subtitle: "Refresh Tier Rewards prizes",
      onClick: () => stub("Catalog sync"),
    },
    {
      icon: ScrollText,
      title: "Audit export",
      subtitle: "Compliance report for regulators",
      onClick: () => stub("Audit export"),
    },
  ];

  function stub(what: string) {
    toast(`${what} — coming in a later session`, {
      description: "This action is stubbed while the workflow is built out.",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal delay={0}>
        <PageHeader
          breadcrumbs={[{ label: "Operator" }, { label: "Dashboard" }]}
          title={`${greeting()}, ${firstName}`}
          subtitle={contextLine}
          actions={
            <>
              <Button variant="secondary" onClick={() => stub("Export")}>
                <Download /> Export
              </Button>
              <Button onClick={() => navigate("/promotions")}>
                <Plus /> New campaign
              </Button>
            </>
          }
        />
      </Reveal>

      {/* KPI tiles */}
      <Reveal delay={60}>
        <section aria-label="Key metrics">
          {kpis.isError ? (
            <ErrorState compact onRetry={() => kpis.refetch()} retrying={kpis.isFetching} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {kpis.isLoading || !kpis.data
                ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                : kpis.data.map((kpi) => (
                    <StatCard
                      key={kpi.key}
                      label={kpi.label}
                      value={formatKpiValue(kpi)}
                      delta={{ trend: kpi.delta.trend, label: kpi.delta.label }}
                      progress={kpi.progress}
                      icon={kpi.key === "liability" ? <Gauge className="size-4" /> : undefined}
                    />
                  ))}
            </div>
          )}
        </section>
      </Reveal>

      {/* Chart + quick actions */}
      <Reveal delay={120}>
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <div>
                <CardTitle>Claims</CardTitle>
                <p className="text-xs text-text-tertiary">Daily redemption volume · last 7 days</p>
              </div>
              <button
                type="button"
                onClick={() => stub("Claims report")}
                className="text-xs text-brand underline-offset-4 hover:underline"
              >
                View report →
              </button>
            </CardHeader>
            <CardContent>
              {claims.isError ? (
                <ErrorState compact onRetry={() => claims.refetch()} retrying={claims.isFetching} />
              ) : claims.isLoading || !claims.data ? (
                <Skeleton className="h-[220px] w-full" />
              ) : claims.data.every((d) => d.value === 0) ? (
                <EmptyState compact title="No claims in this window" />
              ) : (
                <BarChart data={claims.data} formatValue={count} unit="claims" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions actions={quickActions} />
            </CardContent>
          </Card>
        </div>
      </Reveal>

      {/* Top campaigns + activity */}
      <Reveal delay={180}>
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="overflow-hidden xl:col-span-2">
            <CardHeader>
              <div>
                <CardTitle>Top performing campaigns</CardTitle>
                <p className="text-xs text-text-tertiary">By redemption rate · last 7 days</p>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {campaigns.isError ? (
                <div className="px-5 pb-5">
                  <ErrorState
                    compact
                    onRetry={() => campaigns.refetch()}
                    retrying={campaigns.isFetching}
                  />
                </div>
              ) : (
                <DataTable
                  columns={topCampaignColumns}
                  data={campaigns.data ?? []}
                  loading={campaigns.isLoading}
                  skeletonRows={4}
                  empty={
                    <div className="px-5 pb-5">
                      <EmptyState compact title="No campaigns for this property" />
                    </div>
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.isError ? (
                <ErrorState
                  compact
                  onRetry={() => activity.refetch()}
                  retrying={activity.isFetching}
                />
              ) : activity.isLoading || !activity.data ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3.5">
                      <Skeleton className="size-8 shrink-0 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activity.data.length === 0 ? (
                <EmptyState compact title="No recent activity" />
              ) : (
                <ActivityFeed items={activity.data} />
              )}
            </CardContent>
          </Card>
        </div>
      </Reveal>
    </div>
  );
}
