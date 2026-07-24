import { useState } from "react";
import { Check, Truck, XCircle } from "lucide-react";
import {
  Badge,
  Button,
  DescriptionList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Skeleton,
  StatusPill,
  toast,
  type StatusTone,
} from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { relativeTime } from "@/shared/lib/format";
import { usePermission } from "./usePermission";
import { STATUS_FLOW, nextStatus, type FulfillmentOrder } from "../model";
import { useAdvanceStatusMutation, useGetOrderQuery } from "../api";
import { METHOD_LABEL, STATUS_LABEL, statusTone } from "./labels";

export function OrderDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const canManage = usePermission("fulfillment.manage");
  const order = useGetOrderQuery(id);
  const [advance] = useAdvanceStatusMutation();
  const [tracking, setTracking] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);

  const o = order.data;
  const next = o ? nextStatus(o.status) : null;
  const needsTracking = o?.method === "ship" && next === "shipped";

  const doAdvance = async () => {
    if (!o || !next) return;
    try {
      await advance({
        id: o.id,
        status: next,
        trackingNumber: needsTracking
          ? tracking || `1Z${Date.now().toString().slice(-9)}`
          : undefined,
      }).unwrap();
      toast.success(`Advanced to ${STATUS_LABEL[next].toLowerCase()}`, { description: o.id });
      setTracking("");
    } catch {
      toast.error("Couldn't advance order", { description: "Please try again." });
    }
  };

  const doCancel = async () => {
    if (!o) return;
    setConfirmCancel(false);
    try {
      await advance({ id: o.id, status: "cancelled" }).unwrap();
      toast.success("Order cancelled", { description: o.id });
    } catch {
      toast.error("Couldn't cancel order", { description: "Please try again." });
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-[480px] gap-0 rounded-none border-l p-0"
        style={{
          left: "auto",
          right: 0,
          top: 0,
          bottom: 0,
          transform: "none",
          height: "100vh",
          maxWidth: 480,
        }}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <DialogHeader className="border-b border-hairline p-6">
            {order.isLoading || !o ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={statusTone(o.status) as StatusTone}>
                    {STATUS_LABEL[o.status]}
                  </StatusPill>
                  {o.priority === "high" ? <Badge variant="brand">High priority</Badge> : null}
                  <Badge variant="neutral">{METHOD_LABEL[o.method]}</Badge>
                </div>
                <DialogTitle className="mt-2 font-mono">{o.id}</DialogTitle>
                <DialogDescription>
                  {o.playerName} · {o.rewardName} × {o.quantity}
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          {order.isLoading || !o ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Status timeline */}
              <div>
                <p className="mb-3 text-2xs uppercase tracking-wide text-text-tertiary">
                  Status timeline
                </p>
                <Timeline order={o} />
              </div>

              <Section title="Player">
                <DescriptionList
                  items={[
                    { label: "Name", value: o.playerName },
                    { label: "Player ID", value: <span className="font-mono">{o.playerId}</span> },
                  ]}
                />
              </Section>
              <Section title="Reward">
                <DescriptionList
                  items={[
                    { label: "Reward", value: o.rewardName },
                    { label: "Type", value: <span className="capitalize">{o.rewardType}</span> },
                    { label: "Quantity", value: String(o.quantity) },
                  ]}
                />
              </Section>
              <Section title="Shipping">
                <DescriptionList
                  items={[
                    { label: "Address", value: o.address ?? "—" },
                    {
                      label: "Tracking",
                      value: o.trackingNumber ? (
                        <span className="font-mono">{o.trackingNumber}</span>
                      ) : (
                        "—"
                      ),
                    },
                    { label: "Vendor", value: o.vendorId ?? "—" },
                    { label: "Updated", value: relativeTime(o.updatedAt) },
                  ]}
                />
              </Section>

              {/* Advance-state actions */}
              {canManage ? (
                <div className="space-y-3 border-t border-hairline pt-4">
                  {needsTracking ? (
                    <Input
                      placeholder="Tracking number (optional)"
                      value={tracking}
                      onChange={(e) => setTracking(e.target.value)}
                    />
                  ) : null}
                  {next ? (
                    <Button className="w-full" onClick={doAdvance}>
                      {needsTracking ? <Truck /> : <Check />} Advance to{" "}
                      {STATUS_LABEL[next].toLowerCase()}
                    </Button>
                  ) : (
                    <p className="text-center text-2xs text-text-tertiary">
                      This order has reached a terminal state.
                    </p>
                  )}
                  {o.status !== "cancelled" && o.status !== "failed" && o.status !== "delivered" ? (
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={() => setConfirmCancel(true)}
                    >
                      <XCircle /> Cancel order
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription>
              {o?.id} will be marked cancelled. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmCancel(false)}>
              Keep order
            </Button>
            <Button variant="danger" onClick={doCancel}>
              Cancel order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-2xs uppercase tracking-wide text-text-tertiary">{title}</p>
      {children}
    </div>
  );
}

function Timeline({ order }: { order: FulfillmentOrder }) {
  const terminal = order.status === "cancelled" || order.status === "failed";
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  return (
    <ol className="space-y-0">
      {STATUS_FLOW.map((stage, i) => {
        const done = !terminal && currentIndex >= i;
        const current = !terminal && currentIndex === i;
        return (
          <li key={stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-2xs",
                  done
                    ? "border-success/40 bg-success-soft text-success"
                    : "border-hairline bg-surface-2 text-text-tertiary",
                  current && "ring-2 ring-brand/40",
                )}
              >
                {done ? <Check className="size-3" /> : i + 1}
              </span>
              {i < STATUS_FLOW.length - 1 ? (
                <span className={cn("w-px flex-1", done ? "bg-success/40" : "bg-hairline")} />
              ) : null}
            </div>
            <div className="pb-4">
              <p className={cn("text-sm", done ? "text-text-primary" : "text-text-tertiary")}>
                {STATUS_LABEL[stage]}
              </p>
            </div>
          </li>
        );
      })}
      {terminal ? (
        <li className="mt-1 flex items-center gap-2 rounded-md border border-danger/25 bg-danger-soft/40 px-3 py-2">
          <XCircle className="size-4 text-danger" />
          <span className="text-xs text-danger">{STATUS_LABEL[order.status]}</span>
        </li>
      ) : null}
    </ol>
  );
}
