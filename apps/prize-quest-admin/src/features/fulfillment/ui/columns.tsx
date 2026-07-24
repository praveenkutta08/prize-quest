import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Eye, Truck, XCircle } from "lucide-react";
import { RowActionMenu, StatusPill, type StatusTone } from "@/shared/ui";
import { relativeTime } from "@/shared/lib/format";
import { nextStatus, type FulfillmentOrder } from "../model";
import { METHOD_LABEL, STATUS_LABEL, statusTone } from "./labels";

export interface OrderColumnActions {
  onView: (o: FulfillmentOrder) => void;
  onAdvance: (o: FulfillmentOrder) => void;
  onCancel: (o: FulfillmentOrder) => void;
  canManage: boolean;
}

export function makeOrderColumns({
  onView,
  onAdvance,
  onCancel,
  canManage,
}: OrderColumnActions): ColumnDef<FulfillmentOrder, unknown>[] {
  return [
    {
      id: "order",
      header: "Order",
      cell: ({ row }) => {
        const o = row.original;
        return (
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-mono text-xs text-text-primary">
              {o.id}
              {o.priority === "high" ? (
                <span className="rounded-full border border-brand/35 bg-brand-subtle px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-bright">
                  high
                </span>
              ) : null}
            </p>
            <p className="text-2xs text-text-tertiary">{relativeTime(o.createdAt)}</p>
          </div>
        );
      },
    },
    {
      id: "player",
      header: "Player",
      cell: ({ row }) => <span className="text-text-secondary">{row.original.playerName}</span>,
    },
    {
      id: "reward",
      header: "Reward",
      cell: ({ row }) => {
        const o = row.original;
        return (
          <div className="min-w-0">
            <p className="truncate text-text-primary">{o.rewardName}</p>
            <p className="text-2xs capitalize text-text-tertiary">{o.rewardType}</p>
          </div>
        );
      },
    },
    {
      id: "quantity",
      header: "Qty",
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="tabular-nums text-text-secondary">{row.original.quantity}</span>
      ),
    },
    {
      id: "method",
      header: "Method",
      cell: ({ row }) => (
        <span className="text-text-secondary">{METHOD_LABEL[row.original.method]}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusPill tone={statusTone(row.original.status) as StatusTone}>
          {STATUS_LABEL[row.original.status]}
        </StatusPill>
      ),
    },
    {
      id: "age",
      header: "Age",
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-text-tertiary">
          {relativeTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      meta: { className: "w-10 text-right" },
      cell: ({ row }) => {
        const o = row.original;
        const next = nextStatus(o.status);
        const terminal =
          o.status === "cancelled" || o.status === "failed" || o.status === "delivered";
        return (
          <RowActionMenu
            actions={[
              { label: "View", icon: Eye, onSelect: () => onView(o) },
              {
                label: next ? `Advance to ${STATUS_LABEL[next].toLowerCase()}` : "Advance status",
                icon: ChevronRight,
                onSelect: () => onAdvance(o),
                hidden: !canManage || !next,
              },
              {
                label: "Add tracking",
                icon: Truck,
                onSelect: () => onView(o),
                hidden: !canManage || o.method !== "ship",
              },
              {
                label: "Cancel",
                icon: XCircle,
                onSelect: () => onCancel(o),
                danger: true,
                separatorBefore: true,
                hidden: !canManage || terminal,
              },
            ]}
          />
        );
      },
    },
  ];
}
