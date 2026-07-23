import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Clock, PackageCheck, Truck, X } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { usePermission } from "./usePermission";
import {
  Button,
  Card,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  ErrorState,
  PageHeader,
  SearchInput,
  SegmentedControl,
  StatCard,
  StatCardSkeleton,
  StatusTabs,
  Toolbar,
  ToolbarSpacer,
  toast,
} from "@/shared/ui";
import { useTableUrlState } from "@/shared/lib";
import { count } from "@/shared/lib/format";
import { nextStatus, type BulkAction, type FulfillmentOrder } from "../model";
import { useBulkUpdateMutation, useAdvanceStatusMutation, useListOrdersQuery } from "../api";
import { makeOrderColumns } from "./columns";
import { OrderDrawer } from "./OrderDrawer";

const STATUS_TAB_ORDER = [
  "all",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
] as const;
const TAB_LABEL: Record<string, string> = {
  all: "All",
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
};
const METHODS = [
  { value: "all", label: "All" },
  { value: "ship", label: "Ship" },
  { value: "pickup", label: "Pickup" },
  { value: "auto", label: "Auto" },
  { value: "manual", label: "Manual" },
];

export function FulfillmentQueuePage() {
  const pid = useAppSelector((s) => s.scope.activePropertyId) ?? "all";
  const canManage = usePermission("fulfillment.manage");

  const url = useTableUrlState("all");
  const [searchInput, setSearchInput] = useState(url.q);
  const debounce = useRef<number | undefined>(undefined);

  const params = new URLSearchParams(window.location.search);
  const method = params.get("method") ?? "all";
  const setMethod = (v: string) => {
    const p = new URLSearchParams(window.location.search);
    if (!v || v === "all") p.delete("method");
    else p.set("method", v);
    p.delete("page");
    window.history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
    setMethodTick((t) => t + 1);
  };
  const [, setMethodTick] = useState(0);

  const onSearch = (value: string) => {
    setSearchInput(value);
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => url.setQ(value), 300);
  };

  const list = useListOrdersQuery({
    propertyId: pid,
    status: url.status,
    method,
    q: url.q,
    page: url.page,
  });
  const [bulkUpdate] = useBulkUpdateMutation();
  const [advance] = useAdvanceStatusMutation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [cancelOrder, setCancelOrder] = useState<FulfillmentOrder | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState<BulkAction | null>(null);

  const onAdvance = async (o: FulfillmentOrder) => {
    const next = nextStatus(o.status);
    if (!next) return;
    try {
      await advance({ id: o.id, status: next }).unwrap();
      toast.success(`Advanced to ${next}`, { description: o.id });
    } catch {
      toast.error("Couldn't advance order");
    }
  };

  const doCancel = async () => {
    if (!cancelOrder) return;
    try {
      await advance({ id: cancelOrder.id, status: "cancelled" }).unwrap();
      toast.success("Order cancelled", { description: cancelOrder.id });
    } catch {
      toast.error("Couldn't cancel order");
    }
    setCancelOrder(null);
  };

  const runBulk = async (action: BulkAction) => {
    setBulkConfirm(null);
    try {
      const res = await bulkUpdate({ ids: selectedIds, action }).unwrap();
      toast.success("Bulk action applied", { description: `${res.updated} orders updated` });
      setSelectedIds([]);
    } catch {
      toast.error("Bulk action failed", { description: "Please try again." });
    }
  };

  const columns = useMemo(
    () =>
      makeOrderColumns({
        onView: (o) => setDrawerId(o.id),
        onAdvance,
        onCancel: (o) => setCancelOrder(o),
        canManage,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage],
  );

  const counts = list.data?.counts;
  const tabs = STATUS_TAB_ORDER.map((key) => ({
    key,
    label: TAB_LABEL[key],
    count: counts ? counts[key as keyof typeof counts] : undefined,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Operations" }, { label: "Fulfillment" }]}
        title="Fulfillment"
        subtitle="The physical and manual reward fulfillment queue. Property-scoped."
      />

      <section aria-label="Fulfillment metrics">
        {list.isError ? null : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {!counts ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  label="Pending"
                  value={count(counts.pending)}
                  icon={<Clock className="size-4" />}
                />
                <StatCard
                  label="Processing"
                  value={count(counts.processing)}
                  icon={<Truck className="size-4" />}
                />
                <StatCard
                  label="Shipped today"
                  value={count(counts.shippedToday)}
                  icon={<PackageCheck className="size-4" />}
                />
                <StatCard
                  label="Failed"
                  value={<span className="text-danger">{count(counts.failed)}</span>}
                  icon={<AlertTriangle className="size-4 text-danger" />}
                />
              </>
            )}
          </div>
        )}
      </section>

      <Card className="overflow-hidden p-4">
        {/* Bulk action bar */}
        {canManage && selectedIds.length > 0 ? (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-brand/30 bg-brand-subtle px-4 py-2.5">
            <span className="text-sm text-text-primary">
              <span className="font-semibold tabular-nums">{selectedIds.length}</span> selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setBulkConfirm("mark-processing")}
              >
                Mark processing
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setBulkConfirm("mark-shipped")}>
                Mark shipped
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                <X /> Clear
              </Button>
            </div>
          </div>
        ) : null}

        {list.isError ? (
          <ErrorState onRetry={() => list.refetch()} retrying={list.isFetching} />
        ) : (
          <DataTable
            columns={columns}
            data={list.data?.rows ?? []}
            loading={list.isLoading}
            onRowClick={(o) => setDrawerId(o.id)}
            enableRowSelection={canManage}
            getRowId={(o) => o.id}
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
            toolbar={
              <Toolbar className="mb-3">
                <StatusTabs tabs={tabs} value={url.status} onChange={url.setStatus} />
                <ToolbarSpacer />
                <SegmentedControl
                  value={method}
                  onChange={setMethod}
                  options={METHODS}
                  ariaLabel="Method"
                />
                <SearchInput
                  value={searchInput}
                  onChange={onSearch}
                  placeholder="Player or reward…"
                  className="w-48"
                />
              </Toolbar>
            }
            empty={
              <EmptyState
                compact
                icon={PackageCheck}
                title={
                  url.q
                    ? "No orders match your search"
                    : `No ${TAB_LABEL[url.status]?.toLowerCase()} orders`
                }
              />
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

      {drawerId ? <OrderDrawer id={drawerId} onClose={() => setDrawerId(null)} /> : null}

      <Dialog open={Boolean(cancelOrder)} onOpenChange={(v) => !v && setCancelOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription>{cancelOrder?.id} will be marked cancelled.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelOrder(null)}>
              Keep order
            </Button>
            <Button variant="danger" onClick={doCancel}>
              Cancel order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(bulkConfirm)} onOpenChange={(v) => !v && setBulkConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to {selectedIds.length} orders?</DialogTitle>
            <DialogDescription>
              {bulkConfirm === "mark-shipped"
                ? "Mark the selected orders as shipped."
                : "Mark the selected orders as processing."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBulkConfirm(null)}>
              Cancel
            </Button>
            <Button onClick={() => bulkConfirm && runBulk(bulkConfirm)}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
