import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  BarChart,
  Card,
  DataTable,
  DetailCard,
  ErrorState,
  StatusPill,
  type BarDatum,
  type StatusTone,
} from "@/shared/ui";
import { count, countCompact, money, percent } from "@/shared/lib/format";
import { useGetCampaignReportQuery } from "../api";
import type { CampaignReportRow } from "../model";
import { useReportFilters } from "./useReportFilters";
import { useRegisterExport } from "./exportContext";

export function CampaignsReportPage() {
  const { range, property, segment } = useReportFilters();
  const report = useGetCampaignReportQuery({ range, property, segment });

  const columns = useMemo<ColumnDef<CampaignReportRow, unknown>[]>(
    () => [
      {
        id: "name",
        header: "Campaign",
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.name}</span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusPill tone={row.original.status as StatusTone}>{row.original.status}</StatusPill>
        ),
      },
      {
        id: "reach",
        header: "Reach",
        meta: { className: "text-right" },
        cell: ({ row }) => (
          <span className="tabular-nums text-text-secondary">
            {countCompact(row.original.reach)}
          </span>
        ),
      },
      {
        id: "offers",
        header: "Offers",
        meta: { className: "text-right" },
        cell: ({ row }) => <span className="tabular-nums">{count(row.original.offers)}</span>,
      },
      {
        id: "redemptions",
        header: "Redemptions",
        meta: { className: "text-right" },
        cell: ({ row }) => <span className="tabular-nums">{count(row.original.redemptions)}</span>,
      },
      {
        id: "engagement",
        header: "Engagement",
        meta: { className: "text-right" },
        cell: ({ row }) => (
          <span className="tabular-nums text-success">{percent(row.original.engagementRate)}</span>
        ),
      },
      {
        id: "revenue",
        header: "Revenue impact",
        meta: { className: "text-right" },
        cell: ({ row }) => (
          <span className="tabular-nums text-warning">{money(row.original.revenueImpact)}</span>
        ),
      },
    ],
    [],
  );

  const comparison: BarDatum[] = (report.data?.comparison ?? []).map((b, i, a) => ({
    label: b.label,
    value: b.value,
    highlight: i === a.length - 1,
  }));

  useRegisterExport({
    filename: "campaigns",
    build: () => {
      const rows = report.data?.rows;
      if (!rows) return null;
      return [
        ["campaign", "status", "reach", "offers", "redemptions", "engagement", "revenueImpact"],
        ...rows.map((r) => [
          r.name,
          r.status,
          r.reach,
          r.offers,
          r.redemptions,
          r.engagementRate,
          r.revenueImpact,
        ]),
      ];
    },
  });

  if (report.isError)
    return <ErrorState onRetry={() => report.refetch()} retrying={report.isFetching} />;

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden p-4">
        <DataTable columns={columns} data={report.data?.rows ?? []} loading={report.isLoading} />
      </Card>
      <DetailCard title="Redemptions by campaign">
        {report.data ? (
          <BarChart data={comparison} formatValue={(v) => count(v)} />
        ) : (
          <div className="h-56" />
        )}
      </DetailCard>
    </div>
  );
}
