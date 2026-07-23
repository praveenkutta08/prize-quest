import { useMemo, useRef, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Badge,
  Card,
  DataTable,
  ErrorState,
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusPill,
  Toolbar,
  ToolbarSpacer,
} from "@/shared/ui";
import { useTableUrlState } from "@/shared/lib";
import { count, relativeTime } from "@/shared/lib/format";
import { useListDeliveriesQuery } from "../api";
import type { NotificationDelivery } from "../model";
import { CHANNEL_LABEL, deliveryTone } from "./labels";

const CHANNELS = [
  { value: "all", label: "All channels" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push" },
  { value: "in-app", label: "In-app" },
];
const STATUSES = ["all", "sent", "scheduled", "failed"];

export function DeliveryLogPage() {
  const url = useTableUrlState("all");
  const [searchInput, setSearchInput] = useState(url.q);
  const debounce = useRef<number | undefined>(undefined);

  const params = new URLSearchParams(window.location.search);
  const channel = params.get("channel") ?? "all";
  const setChannel = (v: string) => {
    const p = new URLSearchParams(window.location.search);
    if (!v || v === "all") p.delete("channel");
    else p.set("channel", v);
    p.delete("page");
    window.history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
    setTick((t) => t + 1);
  };
  const [, setTick] = useState(0);

  const onSearch = (value: string) => {
    setSearchInput(value);
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => url.setQ(value), 300);
  };

  const list = useListDeliveriesQuery({ status: url.status, channel, q: url.q, page: url.page });

  const columns = useMemo<ColumnDef<NotificationDelivery, unknown>[]>(
    () => [
      {
        id: "template",
        header: "Template",
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.templateName}</span>
        ),
      },
      {
        id: "channel",
        header: "Channel",
        cell: ({ row }) => <Badge variant="neutral">{CHANNEL_LABEL[row.original.channel]}</Badge>,
      },
      {
        id: "recipients",
        header: "Recipients",
        meta: { className: "text-right" },
        cell: ({ row }) => (
          <span className="tabular-nums text-text-secondary">
            {count(row.original.recipientCount)}
          </span>
        ),
      },
      {
        id: "sentAt",
        header: "Sent at",
        cell: ({ row }) => (
          <span className="text-text-tertiary">{relativeTime(row.original.sentAt)}</span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusPill tone={deliveryTone(row.original.status)}>{row.original.status}</StatusPill>
        ),
      },
    ],
    [],
  );

  return (
    <Card className="overflow-hidden p-4">
      {list.isError ? (
        <ErrorState onRetry={() => list.refetch()} retrying={list.isFetching} />
      ) : (
        <DataTable
          columns={columns}
          data={list.data?.rows ?? []}
          loading={list.isLoading}
          toolbar={
            <Toolbar className="mb-3">
              <div
                className="flex flex-wrap items-center gap-1"
                role="tablist"
                aria-label="Filter by status"
              >
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="tab"
                    aria-selected={url.status === s}
                    onClick={() => url.setStatus(s)}
                    className={
                      url.status === s
                        ? "rounded-md bg-surface-2 px-2.5 py-1.5 text-xs font-medium capitalize text-text-primary"
                        : "rounded-md px-2.5 py-1.5 text-xs font-medium capitalize text-text-tertiary hover:text-text-secondary"
                    }
                  >
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
              <ToolbarSpacer />
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="h-9 w-[150px] text-xs" aria-label="Filter by channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <SearchInput
                value={searchInput}
                onChange={onSearch}
                placeholder="Search deliveries…"
                className="w-44"
              />
            </Toolbar>
          }
          pagination={{
            pageIndex: url.page,
            pageSize: 10,
            total: list.data?.total ?? 0,
            onPageChange: url.setPage,
          }}
        />
      )}
    </Card>
  );
}
