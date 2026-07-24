import type { ColumnDef } from "@tanstack/react-table";
import { StatusPill, type StatusTone } from "@/shared/ui";
import { count, moneyCompact, percent } from "@/shared/lib/format";
import type { TopCampaignRow } from "../model";

export const topCampaignColumns: ColumnDef<TopCampaignRow, unknown>[] = [
  {
    accessorKey: "name",
    header: "Campaign",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium text-text-primary">{row.original.name}</p>
        <p className="truncate text-xs text-text-tertiary">{row.original.subtitle}</p>
      </div>
    ),
  },
  {
    accessorKey: "sent",
    header: "Sent",
    meta: { className: "text-right" },
    cell: ({ getValue }) => <span className="tabular-nums">{count(getValue() as number)}</span>,
  },
  {
    accessorKey: "redeemed",
    header: "Redeemed",
    meta: { className: "text-right" },
    cell: ({ getValue }) => <span className="tabular-nums">{count(getValue() as number)}</span>,
  },
  {
    accessorKey: "rate",
    header: "Rate",
    meta: { className: "text-right" },
    cell: ({ getValue }) => (
      <span className="font-medium tabular-nums text-text-primary">
        {percent(getValue() as number)}
      </span>
    ),
  },
  {
    accessorKey: "liability",
    header: "Liability",
    meta: { className: "text-right" },
    cell: ({ getValue }) => (
      <span className="tabular-nums text-warning">{moneyCompact(getValue() as number)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <StatusPill tone={status as StatusTone} pulse={status === "active"}>
          {status}
        </StatusPill>
      );
    },
  },
];
