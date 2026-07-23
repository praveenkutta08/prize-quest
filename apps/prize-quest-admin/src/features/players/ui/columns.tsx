import type { ColumnDef } from "@tanstack/react-table";
import { Coins, Eye, UserPlus } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  RowActionMenu,
  StatusPill,
  type StatusTone,
} from "@/shared/ui";
import { money, count } from "@/shared/lib/format";
import type { Player } from "../model";
import {
  SEGMENT_BADGE,
  SEGMENT_LABEL,
  STATUS_LABEL,
  lastVisitLabel,
  statusTone,
  tierTone,
} from "./labels";

export interface PlayerColumnActions {
  onView: (p: Player) => void;
  onAddToCampaign: (p: Player) => void;
  onAdjustPoints: (p: Player) => void;
  /** Whether the operator may adjust points (RBAC: players.adjust). */
  canAdjust: boolean;
  propertyName: (id: string) => string;
}

export function makePlayerColumns({
  onView,
  onAddToCampaign,
  onAdjustPoints,
  canAdjust,
  propertyName,
}: PlayerColumnActions): ColumnDef<Player, unknown>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: "Player",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback>{p.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium text-text-primary">{p.name}</p>
              <p className="truncate text-2xs text-text-tertiary">{p.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "tier",
      accessorKey: "tier",
      header: "Tier",
      cell: ({ row }) => (
        <StatusPill tone={tierTone(row.original.tier) as StatusTone}>
          {row.original.tier}
        </StatusPill>
      ),
    },
    {
      id: "segment",
      accessorKey: "segment",
      header: "Segment",
      cell: ({ row }) => (
        <Badge variant={SEGMENT_BADGE[row.original.segment]}>
          {SEGMENT_LABEL[row.original.segment]}
        </Badge>
      ),
    },
    {
      id: "propertyId",
      accessorKey: "propertyId",
      header: "Property",
      cell: ({ row }) => (
        <span className="text-text-secondary">{propertyName(row.original.propertyId)}</span>
      ),
    },
    {
      id: "lifetimeValue",
      accessorKey: "lifetimeValue",
      header: "Lifetime value",
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="tabular-nums text-warning">{money(row.original.lifetimeValue)}</span>
      ),
    },
    {
      id: "pointsBalance",
      accessorKey: "pointsBalance",
      header: "Points",
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="tabular-nums text-text-secondary">
          {count(row.original.pointsBalance)}
        </span>
      ),
    },
    {
      id: "lastVisitDays",
      accessorKey: "lastVisitDays",
      header: "Last visit",
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-text-secondary">
          {lastVisitLabel(row.original.lastVisitDays)}
        </span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusPill tone={statusTone(row.original.status) as StatusTone}>
          {STATUS_LABEL[row.original.status]}
        </StatusPill>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      meta: { className: "w-10 text-right" },
      cell: ({ row }) => {
        const p = row.original;
        return (
          <RowActionMenu
            actions={[
              { label: "View profile", icon: Eye, onSelect: () => onView(p) },
              { label: "Add to campaign", icon: UserPlus, onSelect: () => onAddToCampaign(p) },
              {
                label: "Adjust points",
                icon: Coins,
                onSelect: () => onAdjustPoints(p),
                separatorBefore: true,
                hidden: !canAdjust,
              },
            ]}
          />
        );
      },
    },
  ];
}
