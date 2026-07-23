import { BarChart, DetailCard, ErrorState, type BarDatum } from "@/shared/ui";
import { count } from "@/shared/lib/format";
import { useGetRewardReportQuery } from "../api";
import type { Breakdown } from "../model";
import { useReportFilters } from "./useReportFilters";
import { useRegisterExport } from "./exportContext";

const toBars = (b: Breakdown[]): BarDatum[] =>
  b.map((x, i, a) => ({ label: x.label, value: x.value, highlight: i === a.length - 1 }));

export function RewardsReportPage() {
  const { range, property, segment } = useReportFilters();
  const report = useGetRewardReportQuery({ range, property, segment });

  useRegisterExport({
    filename: "rewards",
    build: () => {
      const d = report.data;
      if (!d) return null;
      const rows: (string | number)[][] = [["group", "label", "value"]];
      d.topRedeemed.forEach((x) => rows.push(["top-redeemed", x.label, x.value]));
      d.categoryBreakdown.forEach((x) => rows.push(["category", x.label, x.value]));
      return rows;
    },
  });

  if (report.isError)
    return <ErrorState onRetry={() => report.refetch()} retrying={report.isFetching} />;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DetailCard title="Top redeemed rewards">
        {report.data ? (
          <BarChart data={toBars(report.data.topRedeemed)} formatValue={(v) => count(v)} />
        ) : (
          <div className="h-56" />
        )}
      </DetailCard>
      <DetailCard title="Category breakdown">
        {report.data ? (
          <BarChart data={toBars(report.data.categoryBreakdown)} formatValue={(v) => count(v)} />
        ) : (
          <div className="h-56" />
        )}
      </DetailCard>
    </div>
  );
}
