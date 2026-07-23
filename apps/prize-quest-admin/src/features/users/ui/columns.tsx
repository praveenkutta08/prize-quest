import type { ColumnDef } from "@tanstack/react-table";
import { Mail, Pencil, Power, ShieldCheck } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  RowActionMenu,
  StatusPill,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  type StatusTone,
} from "@/shared/ui";
import { relativeTime } from "@/shared/lib/format";
import type { ManagedUser } from "../model";
import { ROLE_LABEL, STATUS_LABEL, roleTone, statusTone } from "./labels";

export interface UserColumnActions {
  onEdit: (u: ManagedUser) => void;
  onChangeRole: (u: ManagedUser) => void;
  onToggleStatus: (u: ManagedUser) => void;
  onResend: (u: ManagedUser) => void;
  canManage: boolean;
  currentOperatorId?: string;
}

const SELF_LOCK_HINT = "You can't deactivate or change the role of your own account.";

export function makeUserColumns({
  onEdit,
  onChangeRole,
  onToggleStatus,
  onResend,
  canManage,
  currentOperatorId,
}: UserColumnActions): ColumnDef<ManagedUser, unknown>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const u = row.original;
        const isSelf = u.id === currentOperatorId;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback>{u.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate font-medium text-text-primary">
                {u.name}
                {isSelf ? (
                  <span className="rounded-full border border-hairline bg-surface-2 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-text-tertiary">
                    you
                  </span>
                ) : null}
              </p>
              <p className="truncate text-2xs text-text-tertiary">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "role",
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <StatusPill tone={roleTone(row.original.role) as StatusTone}>
          {ROLE_LABEL[row.original.role]}
        </StatusPill>
      ),
    },
    {
      id: "title",
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <span className="text-text-secondary">{row.original.title}</span>,
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
      id: "lastActiveAt",
      header: "Last active",
      cell: ({ row }) => {
        const u = row.original;
        if (u.status === "pending") {
          return (
            <span className="text-text-tertiary">
              Invited {u.invitedAt ? relativeTime(u.invitedAt) : "—"}
            </span>
          );
        }
        return (
          <span className="text-text-secondary">
            {u.lastActiveAt ? relativeTime(u.lastActiveAt) : "—"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      meta: { className: "w-10 text-right" },
      cell: ({ row }) => {
        const u = row.original;
        const isSelf = u.id === currentOperatorId;
        const isPending = u.status === "pending";
        if (!canManage) return null;

        const menu = (
          <RowActionMenu
            actions={[
              { label: "Edit", icon: Pencil, onSelect: () => onEdit(u), hidden: isPending },
              {
                label: "Change role",
                icon: ShieldCheck,
                onSelect: () => onChangeRole(u),
                hidden: isPending,
                disabled: isSelf,
              },
              {
                label: u.status === "active" ? "Deactivate" : "Activate",
                icon: Power,
                onSelect: () => onToggleStatus(u),
                danger: u.status === "active",
                separatorBefore: true,
                hidden: isPending,
                disabled: isSelf && u.status === "active",
              },
              {
                label: "Resend invite",
                icon: Mail,
                onSelect: () => onResend(u),
                hidden: !isPending,
              },
            ]}
          />
        );

        return isSelf ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{menu}</span>
              </TooltipTrigger>
              <TooltipContent>{SELF_LOCK_HINT}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          menu
        );
      },
    },
  ];
}
