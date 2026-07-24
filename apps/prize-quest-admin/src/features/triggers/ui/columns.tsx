import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Link2, Pencil } from "lucide-react";
import { Badge, RowActionMenu, StatusPill, Toggle, type StatusTone } from "@/shared/ui";
import { count } from "@/shared/lib/format";
import type { TriggerDefinition } from "../model";
import { CATEGORY_LABEL, categoryTone } from "./labels";

export interface TriggerColumnActions {
  onView: (t: TriggerDefinition) => void;
  onEdit: (t: TriggerDefinition) => void;
  onToggleStatus: (t: TriggerDefinition) => void;
  canManage: boolean;
}

export function makeTriggerColumns({
  onView,
  onEdit,
  onToggleStatus,
  canManage,
}: TriggerColumnActions): ColumnDef<TriggerDefinition, unknown>[] {
  return [
    {
      id: "label",
      header: "Trigger",
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="min-w-0">
            <p className="font-medium text-text-primary">{t.label}</p>
            <p className="font-mono text-2xs text-text-tertiary">{t.key}</p>
          </div>
        );
      },
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => (
        <StatusPill tone={categoryTone(row.original.category) as StatusTone}>
          {CATEGORY_LABEL[row.original.category]}
        </StatusPill>
      ),
    },
    {
      id: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="truncate text-text-secondary">{row.original.description}</span>
      ),
    },
    {
      id: "boundRuleCount",
      header: "Bound rules",
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <span className="tabular-nums text-text-secondary">
          {count(row.original.boundRuleCount)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex items-center gap-2.5">
            {canManage ? (
              <Toggle
                checked={t.status === "active"}
                onCheckedChange={() => onToggleStatus(t)}
                label={`Toggle ${t.label}`}
              />
            ) : null}
            <Badge variant={t.status === "active" ? "success" : "neutral"}>{t.status}</Badge>
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
        const t = row.original;
        return (
          <RowActionMenu
            actions={[
              { label: "View", icon: Eye, onSelect: () => onView(t) },
              { label: "Edit", icon: Pencil, onSelect: () => onEdit(t), hidden: !canManage },
              {
                label: "View bindings",
                icon: Link2,
                onSelect: () => onView(t),
                separatorBefore: true,
              },
            ]}
          />
        );
      },
    },
  ];
}
