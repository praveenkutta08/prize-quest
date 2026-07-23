import type { ColumnDef } from "@tanstack/react-table";
import { Copy, Pause, Pencil, Play } from "lucide-react";
import { RowActionMenu, StatusPill, Toggle, type StatusTone } from "@/shared/ui";
import type { Rule, RuleStatus } from "../model";
import { actionLabel, conditionSummary, runTime } from "./labels";

export interface RuleColumnActions {
  onEdit: (rule: Rule) => void;
  onDuplicate: (rule: Rule) => void;
  onToggle: (rule: Rule, next: RuleStatus) => void;
  /** RBAC: rule.toggle — may the operator change status? */
  canToggle: boolean;
}

export function makeRuleColumns({
  onEdit,
  onDuplicate,
  onToggle,
  canToggle,
}: RuleColumnActions): ColumnDef<Rule, unknown>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium text-text-primary">{row.original.name}</p>
          <p className="truncate text-2xs text-text-tertiary">
            Priority {row.original.priority}/10
          </p>
        </div>
      ),
    },
    {
      id: "trigger",
      header: "Trigger",
      cell: ({ row }) =>
        row.original.triggerType === "event" ? (
          <StatusPill tone="event">Event</StatusPill>
        ) : (
          <StatusPill tone="scheduled">Scheduled</StatusPill>
        ),
    },
    {
      id: "condition",
      header: "Condition",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[240px] font-mono text-2xs text-text-tertiary">
          {conditionSummary(row.original)}
        </span>
      ),
    },
    {
      id: "action",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-text-secondary">{actionLabel(row.original.action)}</span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const rule = row.original;
        if (!canToggle) {
          return (
            <StatusPill tone={rule.status as StatusTone} pulse={rule.status === "active"}>
              {rule.status}
            </StatusPill>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <Toggle
              checked={rule.status === "active"}
              onCheckedChange={(on) => onToggle(rule, on ? "active" : "paused")}
              label={`Toggle ${rule.name}`}
            />
            <span className="text-2xs capitalize text-text-tertiary">{rule.status}</span>
          </div>
        );
      },
    },
    {
      id: "lastRun",
      header: "Last run",
      meta: { className: "whitespace-nowrap" },
      cell: ({ row }) => (
        <span className="tabular-nums text-text-secondary">
          {runTime(row.original.lastRun, "Never")}
        </span>
      ),
    },
    {
      id: "nextRun",
      header: "Next run",
      enableSorting: false,
      meta: { className: "whitespace-nowrap" },
      cell: ({ row }) => (
        <span className="tabular-nums text-text-tertiary">{runTime(row.original.nextRun)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      meta: { className: "w-10 text-right" },
      cell: ({ row }) => {
        const rule = row.original;
        const activate = rule.status !== "active";
        return (
          <RowActionMenu
            actions={[
              { label: "Edit", icon: Pencil, onSelect: () => onEdit(rule) },
              { label: "Duplicate", icon: Copy, onSelect: () => onDuplicate(rule) },
              {
                label: activate ? "Activate" : "Pause",
                icon: activate ? Play : Pause,
                onSelect: () => onToggle(rule, activate ? "active" : "paused"),
                danger: !activate,
                separatorBefore: true,
                hidden: !canToggle,
              },
            ]}
          />
        );
      },
    },
  ];
}
