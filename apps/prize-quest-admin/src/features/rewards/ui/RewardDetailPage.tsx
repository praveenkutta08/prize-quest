import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Archive, Copy, Pencil, RotateCcw } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { usePermission } from "./usePermission";
import {
  Badge,
  BarChart,
  Button,
  DescriptionList,
  DetailCard,
  DetailHero,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  StatusPill,
  toast,
  type BarDatum,
  type StatusTone,
} from "@/shared/ui";
import { count, money, percent } from "@/shared/lib/format";
import { useGetRewardQuery, useListVendorsQuery, useSetRewardStatusMutation } from "../api";
import type { RewardDetail } from "../model";
import { isRewardLive } from "./columns";
import {
  CATEGORY_LABEL,
  FULFILLMENT_LABEL,
  RARITY_LABEL,
  STATUS_LABEL,
  TYPE_LABEL,
  VENDOR_TYPE_LABEL,
  isLowStock,
  statusTone,
} from "./labels";

/** Deterministic-ish redemption history from a reward's total (no persistence needed). */
function redemptionSeries(r: RewardDetail): BarDatum[] {
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const base = Math.max(1, Math.round(r.redemptionCount / 6));
  return months.map((label, i) => {
    const wobble = 0.7 + ((r.id.charCodeAt(3) + i * 7) % 60) / 100;
    return {
      label,
      value: Math.round(base * wobble),
      highlight: i === months.length - 1,
    };
  });
}

export function RewardDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const canSync = usePermission("catalog.sync");
  const properties = useAppSelector((s) => s.tenant.context?.properties ?? []);

  const reward = useGetRewardQuery(id);
  const vendors = useListVendorsQuery();
  const [setStatus] = useSetRewardStatusMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (reward.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          breadcrumbs={[{ label: "Engagement" }, { label: "Rewards catalog", href: "/rewards" }]}
          title="Reward"
        />
        <ErrorState
          title="Couldn't load this reward"
          onRetry={() => reward.refetch()}
          retrying={reward.isFetching}
        />
      </div>
    );
  }

  if (reward.isLoading || !reward.data) {
    return <DetailSkeleton />;
  }

  const r = reward.data;
  const live = isRewardLive(r.status);
  const vendor = vendors.data?.find((v) => v.id === r.vendorId);
  const propertyNames = r.propertyIds
    .map((pidValue) => properties.find((p) => p.id === pidValue)?.name ?? pidValue)
    .join(" · ");
  const low = isLowStock(r.stockCount, r.lowStockThreshold);

  const editSection = (section: string) => navigate(`/rewards/${r.id}/edit#${section}`);

  const doToggle = async () => {
    setConfirmOpen(false);
    const nextStatus = live ? "archived" : "active";
    try {
      await setStatus({ id: r.id, status: nextStatus }).unwrap();
      toast.success(nextStatus === "active" ? "Reward activated" : "Reward archived", {
        description: r.name,
      });
    } catch {
      toast.error("Couldn't update status", { description: "Please try again." });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Engagement" },
          { label: "Rewards catalog", href: "/rewards" },
          { label: r.name },
        ]}
        title={r.name}
      />

      <DetailHero
        pills={
          <>
            <StatusPill tone={statusTone(r.status) as StatusTone} pulse={r.status === "active"}>
              {STATUS_LABEL[r.status]}
            </StatusPill>
            <Badge variant="brand" className="capitalize">
              {RARITY_LABEL[r.rarity]}
            </Badge>
            <Badge variant="neutral">{TYPE_LABEL[r.rewardType]}</Badge>
          </>
        }
        title={r.name}
        subtitle={r.description}
        meta={[
          { label: "Retail value", value: money(r.value) },
          {
            label: "Operator cost",
            value: <span className="text-text-secondary">{money(r.cost)}</span>,
          },
          { label: "Margin", value: <span className="text-success">{percent(r.marginPct)}</span> },
          {
            label: "Stock",
            value: (
              <span className={low ? "text-warning" : undefined}>
                {r.stockCount >= 999 ? "∞" : count(r.stockCount)}
              </span>
            ),
          },
        ]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(`/rewards/${r.id}/edit`)}>
              <Pencil /> Edit
            </Button>
            <Button variant="outline" onClick={() => navigate(`/rewards/new?from=${r.id}`)}>
              <Copy /> Duplicate
            </Button>
            {canSync ? (
              <Button variant={live ? "danger" : "default"} onClick={() => setConfirmOpen(true)}>
                {live ? <Archive /> : <RotateCcw />}
                {live ? "Archive" : "Activate"}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div className="space-y-4">
          <DetailCard
            title="Details"
            action={<EditLink onClick={() => editSection("section-basics")} />}
          >
            <DescriptionList
              items={[
                { label: "Name", value: r.name },
                { label: "Category", value: CATEGORY_LABEL[r.category] },
                { label: "Type", value: TYPE_LABEL[r.rewardType] },
                { label: "Description", value: r.description ?? "—" },
              ]}
            />
          </DetailCard>

          <DetailCard
            title="Value & margin"
            action={<EditLink onClick={() => editSection("section-value")} />}
          >
            <DescriptionList
              items={[
                { label: "Retail value", value: money(r.value) },
                { label: "Operator cost", value: money(r.cost) },
                {
                  label: "Margin",
                  value: <span className="font-mono text-success">{percent(r.marginPct)}</span>,
                },
              ]}
            />
          </DetailCard>

          <DetailCard
            title="Stock & vendor"
            action={<EditLink onClick={() => editSection("section-stock")} />}
          >
            <DescriptionList
              items={[
                {
                  label: "Stock count",
                  value: (
                    <span className={low ? "text-warning" : undefined}>
                      {r.stockCount >= 999 ? "Unlimited" : count(r.stockCount)}
                    </span>
                  ),
                },
                {
                  label: "Low-stock threshold",
                  value: r.lowStockThreshold !== undefined ? count(r.lowStockThreshold) : "—",
                },
                {
                  label: "Vendor",
                  value: vendor ? `${vendor.name} · ${VENDOR_TYPE_LABEL[vendor.type]}` : "—",
                },
                {
                  label: "Vendor SKU",
                  value: r.vendorSku ? <span className="font-mono">{r.vendorSku}</span> : "—",
                },
              ]}
            />
          </DetailCard>

          <DetailCard title="Used by">
            {r.usage.length === 0 ? (
              <EmptyState
                compact
                title="Not used in any campaign yet"
                description="Add this reward to a promotion to see it here."
              />
            ) : (
              <ul className="divide-y divide-hairline">
                {r.usage.map((u) => (
                  <li
                    key={u.campaignId}
                    className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                  >
                    <span className="text-sm text-text-secondary">{u.name}</span>
                    <Link
                      to={`/promotions/${u.campaignId}`}
                      className="text-xs text-brand underline-offset-4 hover:text-brand-bright hover:underline"
                    >
                      View campaign
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </div>

        <div className="space-y-4">
          <DetailCard title="Redemption history">
            <BarChart data={redemptionSeries(r)} formatValue={(v) => count(v)} unit="claims" />
            <p className="mt-3 border-t border-hairline pt-3 text-xs text-text-tertiary">
              <span className="font-mono tabular-nums text-text-secondary">
                {count(r.redemptionCount)}
              </span>{" "}
              total redemptions to date.
            </p>
          </DetailCard>

          <DetailCard
            title="Fulfillment"
            action={<EditLink onClick={() => editSection("section-fulfillment")} />}
          >
            <DescriptionList
              items={[
                { label: "Method", value: FULFILLMENT_LABEL[r.fulfillmentMethod] },
                {
                  label: "Rarity",
                  value: <span className="capitalize">{RARITY_LABEL[r.rarity]}</span>,
                },
              ]}
            />
          </DetailCard>

          <DetailCard
            title="Availability"
            action={<EditLink onClick={() => editSection("section-availability")} />}
          >
            <p className="text-sm text-text-secondary">
              {propertyNames || "No properties assigned"}
            </p>
          </DetailCard>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{live ? "Archive reward?" : "Activate reward?"}</DialogTitle>
            <DialogDescription>
              {live
                ? `${r.name} will be hidden from promotions' prize picker. Existing campaigns keep it.`
                : `${r.name} will become available for promotions to offer.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant={live ? "danger" : "default"} onClick={doToggle}>
              {live ? "Archive" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditLink({ onClick, label = "Edit" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs text-brand underline-offset-4 transition-colors hover:text-brand-bright hover:underline"
    >
      {label}
    </button>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-64" />
      <div className="rounded-xl border border-hairline bg-surface-1 p-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-3 h-8 w-80" />
        <div className="mt-6 grid grid-cols-4 gap-4 border-t border-hairline pt-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
