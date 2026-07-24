import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Copy, Pencil, Plus, Power } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  DataTable,
  ErrorState,
  RowActionMenu,
  StatusPill,
  Toggle,
  toast,
} from "@/shared/ui";
import { relativeTime } from "@/shared/lib/format";
import { usePermission } from "./usePermission";
import { useListTemplatesQuery, useSetTemplateStatusMutation } from "../api";
import type { NotificationTemplate } from "../model";
import { CHANNEL_LABEL } from "./labels";

export function TemplatesPage() {
  const navigate = useNavigate();
  const canManage = usePermission("notifications.manage");
  const list = useListTemplatesQuery();
  const [setStatus] = useSetTemplateStatusMutation();

  const onToggle = async (t: NotificationTemplate) => {
    const next = t.status === "active" ? "draft" : "active";
    try {
      await setStatus({ id: t.id, status: next }).unwrap();
      toast.success(next === "active" ? "Template activated" : "Template set to draft", {
        description: t.name,
      });
    } catch {
      toast.error("Couldn't update template");
    }
  };

  const columns = useMemo<ColumnDef<NotificationTemplate, unknown>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.name}</span>
        ),
      },
      {
        id: "channel",
        header: "Channel",
        cell: ({ row }) => <Badge variant="neutral">{CHANNEL_LABEL[row.original.channel]}</Badge>,
      },
      {
        id: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <span className="truncate text-text-secondary">{row.original.subject ?? "—"}</span>
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
                  onCheckedChange={() => onToggle(t)}
                  label={`Toggle ${t.name}`}
                />
              ) : null}
              <StatusPill tone={t.status === "active" ? "active" : "draft"}>{t.status}</StatusPill>
            </div>
          );
        },
      },
      {
        id: "updatedAt",
        header: "Updated",
        cell: ({ row }) => (
          <span className="text-text-tertiary">{relativeTime(row.original.updatedAt)}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        meta: { className: "w-10 text-right" },
        cell: ({ row }) => {
          const t = row.original;
          if (!canManage) return null;
          return (
            <RowActionMenu
              actions={[
                {
                  label: "Edit",
                  icon: Pencil,
                  onSelect: () => navigate(`/notifications/templates/${t.id}/edit`),
                },
                {
                  label: "Duplicate",
                  icon: Copy,
                  onSelect: () => navigate(`/notifications/templates/new?from=${t.id}`),
                },
                {
                  label: t.status === "active" ? "Set to draft" : "Activate",
                  icon: Power,
                  onSelect: () => onToggle(t),
                  separatorBefore: true,
                },
              ]}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage, navigate],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-2xs uppercase tracking-wide text-text-tertiary">
          {list.data?.length ?? 0} templates
        </p>
        {canManage ? (
          <Button size="sm" onClick={() => navigate("/notifications/templates/new")}>
            <Plus /> New template
          </Button>
        ) : null}
      </div>
      <Card className="overflow-hidden p-4">
        {list.isError ? (
          <ErrorState onRetry={() => list.refetch()} retrying={list.isFetching} />
        ) : (
          <DataTable
            columns={columns}
            data={list.data ?? []}
            loading={list.isLoading}
            onRowClick={(t) => canManage && navigate(`/notifications/templates/${t.id}/edit`)}
          />
        )}
      </Card>
    </div>
  );
}
