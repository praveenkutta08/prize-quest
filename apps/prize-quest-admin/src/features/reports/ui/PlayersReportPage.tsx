import { BarChart, DetailCard, ErrorState, type BarDatum } from "@/shared/ui";
import { count } from "@/shared/lib/format";
import { useGetPlayerReportQuery } from "../api";
import type { Breakdown } from "../model";
import { useReportFilters } from "./useReportFilters";
import { useRegisterExport } from "./exportContext";

const toBars = (b: Breakdown[]): BarDatum[] =>
  b.map((x, i, a) => ({ label: x.label, value: x.value, highlight: i === a.length - 1 }));

export function PlayersReportPage() {
  const { range, property, segment } = useReportFilters();
  const report = useGetPlayerReportQuery({ range, property, segment });

  useRegisterExport({
    filename: "players",
    build: () => {
      const d = report.data;
      if (!d) return null;
      const rows: (string | number)[][] = [["group", "label", "value"]];
      d.tierDistribution.forEach((x) => rows.push(["tier", x.label, x.value]));
      d.ltvBands.forEach((x) => rows.push(["ltv", x.label, x.value]));
      d.segments.forEach((x) => rows.push(["segment", x.label, x.value]));
      return rows;
    },
  });

  if (report.isError)
    return <ErrorState onRetry={() => report.refetch()} retrying={report.isFetching} />;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DetailCard title="Tier distribution">
        {report.data ? (
          <BarChart data={toBars(report.data.tierDistribution)} formatValue={(v) => count(v)} />
        ) : (
          <div className="h-56" />
        )}
      </DetailCard>
      <DetailCard title="Lifetime value bands">
        {report.data ? (
          <BarChart data={toBars(report.data.ltvBands)} formatValue={(v) => count(v)} />
        ) : (
          <div className="h-56" />
        )}
      </DetailCard>
      <DetailCard title="Segments" className="lg:col-span-2">
        {report.data ? (
          <BarChart data={toBars(report.data.segments)} formatValue={(v) => count(v)} />
        ) : (
          <div className="h-56" />
        )}
      </DetailCard>
    </div>
  );
}
