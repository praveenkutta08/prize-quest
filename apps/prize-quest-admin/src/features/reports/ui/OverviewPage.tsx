import { useMemo } from "react";
import {
  BarChart,
  DetailCard,
  ErrorState,
  Funnel,
  StatCard,
  StatCardSkeleton,
  type BarDatum,
} from "@/shared/ui";
import { count, countCompact, moneyCompact, percent } from "@/shared/lib/format";
import { useGetOverviewQuery } from "../api";
import type { ReportKpi } from "../model";
import { useReportFilters } from "./useReportFilters";
import { useRegisterExport } from "./exportContext";

function fmtKpi(k: ReportKpi): string {
  if (k.format === "currency") return moneyCompact(k.value);
  if (k.format === "percent") return percent(k.value);
  return countCompact(k.value);
}

export function OverviewPage() {
  const { range, property, segment } = useReportFilters();
  const overview = useGetOverviewQuery({ range, property, segment });

  const engagement: BarDatum[] = useMemo(
    () =>
      (overview.data?.engagement ?? []).map((p, i, a) => ({
        label: p.date,
        value: p.value,
        highlight: i === a.length - 1,
      })),
    [overview.data?.engagement],
  );
  const redemptions: BarDatum[] = useMemo(
    () =>
      (overview.data?.redemptions ?? []).map((p, i, a) => ({
        label: p.date,
        value: p.value,
        highlight: i === a.length - 1,
      })),
    [overview.data?.redemptions],
  );

  useRegisterExport({
    filename: "overview",
    build: () => {
      const k = overview.data?.kpis;
      if (!k) return null;
      return [
        ["kpi", "value", "delta", "trend"],
        ...k.map((x) => [x.label, x.value, x.delta, x.trend]),
      ];
    },
  });

  if (overview.isError)
    return <ErrorState onRetry={() => overview.refetch()} retrying={overview.isFetching} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {overview.isLoading || !overview.data
          ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          : overview.data.kpis.map((k) => (
              <StatCard
                key={k.key}
                label={k.label}
                value={fmtKpi(k)}
                delta={{ trend: k.trend, label: `${k.delta > 0 ? "+" : ""}${k.delta}%` }}
              />
            ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailCard title="Engagement">
          {overview.data ? (
            <BarChart data={engagement} formatValue={(v) => count(v)} />
          ) : (
            <div className="h-56" />
          )}
        </DetailCard>
        <DetailCard title="Redemptions">
          {overview.data ? (
            <BarChart data={redemptions} formatValue={(v) => count(v)} />
          ) : (
            <div className="h-56" />
          )}
        </DetailCard>
      </div>

      <DetailCard title="Campaign funnel">
        {overview.data ? <Funnel data={overview.data.funnel} /> : null}
      </DetailCard>
    </div>
  );
}
