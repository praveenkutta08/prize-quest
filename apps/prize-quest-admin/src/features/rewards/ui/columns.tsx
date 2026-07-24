import type { ColumnDef } from "@tanstack/react-table";
import { Archive, Copy, Eye, Pencil, RefreshCw } from "lucide-react";
import { RowActionMenu, StatusPill, Toggle, prizeIcon, type StatusTone } from "@/shared/ui";
import { count, money, percent } from "@/shared/lib/format";
import type { RewardItem } from "../model";
import { CATEGORY_LABEL, RARITY_LABEL, TYPE_LABEL, isLowStock, statusTone } from "./labels";

export interface RewardColumnActions {
  onView: (r: RewardItem) => void;
  onEdit: (r: RewardItem) => void;
  onDuplicate: (r: RewardItem) => void;
  onToggleStatus: (r: RewardItem) => void;
  onSync: () => void;
  /** Whether the operator may change status / sync (RBAC: catalog.sync). */
  canSync: boolean;
}

/** Is this reward currently "on"? (active vs archived) */
export function isRewardLive(status: RewardItem["status"]): boolean {
  return status === "active" || status === "out-of-stock";
}

export function makeRewardColumns({
  onView,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onSync,
  canSync,
}: RewardColumnActions): ColumnDef<RewardItem, unknown>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: "Reward",
      cell: ({ row }) => {
        const r = row.original;
        const Icon = prizeIcon(r.category);
        return (
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-hairline bg-surface-sunken text-brand">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-text-primary">{r.name}</p>
              <p className="truncate text-2xs text-text-tertiary">
                {CATEGORY_LABEL[r.category]} · {TYPE_LABEL[r.rewardType]}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "category",
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-text-secondary">{CATEGORY_LABEL[row.original.category]}</span>
      ),
    },
    {
      id: "rarity",
      accessorKey: "rarity",
      header: "Rarity",
      cell: ({ row }) => (
        <span className="capitalize text-text-secondary">{RARITY_LABEL[row.original.rarity]}</span>
      ),
    },
    {
      id: "value",
      accessorKey: "value",
      header: "Value",
      meta: { className: "text-right" },
      cell: ({ row }) => <span className="tabular-nums">{money(row.original.value)}</span>,
    },
    {
      id: "cost",
      accessorKey: "cost",
      header: "Cost",
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="tabular-nums text-text-tertiary">{money(row.original.cost)}</span>
      ),
    },
    {
      id: "marginPct",
      accessorKey: "marginPct",
      header: "Margin",
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="tabular-nums text-success">{percent(row.original.marginPct)}</span>
      ),
    },
    {
      id: "stockCount",
      accessorKey: "stockCount",
      header: "Stock",
      meta: { className: "text-right" },
      cell: ({ row }) => {
        const r = row.original;
        const low = isLowStock(r.stockCount, r.lowStockThreshold);
        return (
          <span
            className={
              low ? "font-medium tabular-nums text-warning" : "tabular-nums text-text-secondary"
            }
          >
            {r.stockCount >= 999 ? "∞" : count(r.stockCount)}
          </span>
        );
      },
    },
    {
      id: "redemptionCount",
      accessorKey: "redemptionCount",
      header: "Redemptions",
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="tabular-nums text-text-secondary">
          {count(row.original.redemptionCount)}
        </span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const r = row.original;
        const live = isRewardLive(r.status);
        return (
          <div className="flex items-center gap-2.5">
            {canSync && r.status !== "draft" ? (
              <Toggle
                checked={r.status === "active"}
                onCheckedChange={() => onToggleStatus(r)}
                label={`Toggle ${r.name} active`}
                disabled={r.status === "out-of-stock"}
              />
            ) : null}
            <StatusPill
              tone={statusTone(r.status) as StatusTone}
              pulse={live && r.status === "active"}
            >
              {r.status.replace(/-/g, " ")}
            </StatusPill>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      meta: { className: "w-10 text-right" },
      cell: ({ row }) => {
        const r = row.original;
        const archived = r.status === "archived";
        return (
          <RowActionMenu
            actions={[
              { label: "View", icon: Eye, onSelect: () => onView(r) },
              { label: "Edit", icon: Pencil, onSelect: () => onEdit(r) },
              { label: "Duplicate", icon: Copy, onSelect: () => onDuplicate(r) },
              {
                label: archived ? "Restore" : "Archive",
                icon: Archive,
                onSelect: () => onToggleStatus(r),
                danger: !archived,
                separatorBefore: true,
                hidden: !canSync,
              },
              {
                label: "Sync catalog",
                icon: RefreshCw,
                onSelect: onSync,
                hidden: !canSync,
              },
            ]}
          />
        );
      },
    },
  ];
}
