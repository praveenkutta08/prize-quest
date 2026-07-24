import type { ColumnDef } from "@tanstack/react-table";
import { Copy, Pause, Pencil, Play, Eye } from "lucide-react";
import { RowActionMenu, StatusPill, type StatusTone } from "@/shared/ui";
import { countCompact, count, percent } from "@/shared/lib/format";
import type { CampaignDefinition } from "../model";
import { ACTIVITY_LABEL, TYPE_LABEL, scheduleLabel } from "./labels";

export interface CampaignColumnActions {
  onView: (c: CampaignDefinition) => void;
  onEdit: (c: CampaignDefinition) => void;
  onDuplicate: (c: CampaignDefinition) => void;
  onToggleStatus: (c: CampaignDefinition) => void;
  /** Whether the operator may change status (RBAC: campaign.activate). */
  canActivate: boolean;
}

/** Is this a "go live" transition (vs a "pause")? */
export function isActivateTransition(status: CampaignDefinition["status"]): boolean {
  return status === "paused" || status === "draft" || status === "ended" || status === "scheduled";
}

export function makeCampaignColumns({
  onView,
  onEdit,
  onDuplicate,
  onToggleStatus,
  canActivate,
}: CampaignColumnActions): ColumnDef<CampaignDefinition, unknown>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: "Campaign",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="min-w-0">
            <p className="font-medium text-text-primary">{c.name}</p>
            <p className="truncate text-2xs text-text-tertiary">
              {TYPE_LABEL[c.type]} · {ACTIVITY_LABEL[c.earnRule.activity]}
            </p>
          </div>
        );
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusPill
          tone={row.original.status as StatusTone}
          pulse={row.original.status === "active"}
        >
          {row.original.status}
        </StatusPill>
      ),
    },
    {
      id: "schedule",
      header: "Schedule",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-text-secondary">
          {scheduleLabel(row.original.schedule.start, row.original.schedule.end)}
        </span>
      ),
    },
    {
      id: "audience",
      accessorKey: "audienceLabel",
      header: "Audience",
      enableSorting: false,
      cell: ({ row }) => <span className="text-text-secondary">{row.original.audienceLabel}</span>,
    },
    {
      id: "offers",
      header: "Offers",
      meta: { className: "text-right" },
      cell: ({ row }) => <span className="tabular-nums">{count(row.original.metrics.offers)}</span>,
    },
    {
      id: "reach",
      header: "Reach",
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="tabular-nums text-text-secondary">
          {countCompact(row.original.metrics.reach)}
        </span>
      ),
    },
    {
      id: "engagement",
      header: "Engagement",
      meta: { className: "text-right" },
      cell: ({ row }) =>
        row.original.metrics.engagementRate ? (
          <span className="font-medium tabular-nums text-success">
            {percent(row.original.metrics.engagementRate)}
          </span>
        ) : (
          <span className="text-text-tertiary">—</span>
        ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      meta: { className: "w-10 text-right" },
      cell: ({ row }) => {
        const c = row.original;
        const activate = isActivateTransition(c.status);
        return (
          <RowActionMenu
            actions={[
              { label: "View", icon: Eye, onSelect: () => onView(c) },
              { label: "Edit", icon: Pencil, onSelect: () => onEdit(c) },
              { label: "Duplicate", icon: Copy, onSelect: () => onDuplicate(c) },
              {
                label: activate ? "Activate" : "Pause",
                icon: activate ? Play : Pause,
                onSelect: () => onToggleStatus(c),
                danger: !activate,
                separatorBefore: true,
                hidden: !canActivate,
              },
            ]}
          />
        );
      },
    },
  ];
}
