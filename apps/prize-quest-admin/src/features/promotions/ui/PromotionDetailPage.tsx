import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Copy, Pause, Pencil, Play } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { usePermission } from "./usePermission";
import {
  Badge,
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
  ErrorState,
  Funnel,
  PageHeader,
  PrizeThumbGrid,
  Skeleton,
  StatusPill,
  type StatusTone,
  toast,
} from "@/shared/ui";
import { count, moneyCompact, moneyPrecise, percent } from "@/shared/lib/format";
import { useGetCampaignQuery, useListPrizesQuery, useSetCampaignStatusMutation } from "../api";
import { buildEligibilityCatalog } from "../model";
import { isActivateTransition } from "./columns";
import {
  ACTIVITY_LABEL,
  COUNTS_TOWARD_LABEL,
  TYPE_LABEL,
  describeConditions,
  scheduleLabel,
} from "./labels";

export function PromotionDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const canActivate = usePermission("campaign.activate");
  const properties = useAppSelector((s) => s.tenant.context?.properties ?? []);

  const campaign = useGetCampaignQuery(id);
  const prizes = useListPrizesQuery();
  const [setStatus] = useSetCampaignStatusMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const catalog = useMemo(
    () => buildEligibilityCatalog(properties.map((p) => ({ value: p.id, label: p.name }))),
    [properties],
  );

  if (campaign.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          breadcrumbs={[{ label: "Operator" }, { label: "Promotions", href: "/promotions" }]}
          title="Campaign"
        />
        <ErrorState
          title="Couldn't load this campaign"
          onRetry={() => campaign.refetch()}
          retrying={campaign.isFetching}
        />
      </div>
    );
  }

  if (campaign.isLoading || !campaign.data) {
    return <DetailSkeleton />;
  }

  const c = campaign.data;
  const activating = isActivateTransition(c.status);
  const selectedPrizes = (prizes.data ?? []).filter((p) => c.prizeIds.includes(p.id));
  const budgetPct = c.compliance.budgetCap
    ? (c.compliance.budgetUsed / c.compliance.budgetCap) * 100
    : 0;
  const approver = APPROVER_NAMES[c.compliance.approverId ?? ""] ?? c.compliance.approverId ?? "—";

  const doToggle = async () => {
    setConfirmOpen(false);
    const nextStatus = activating ? "active" : "paused";
    try {
      await setStatus({ id: c.id, status: nextStatus }).unwrap();
      toast.success(activating ? "Campaign activated" : "Campaign paused", { description: c.name });
    } catch {
      toast.error("Couldn't update status", { description: "Please try again." });
    }
  };

  const editSection = (section: string) => navigate(`/promotions/${c.id}/edit#${section}`);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Operator" },
          { label: "Promotions", href: "/promotions" },
          { label: c.name },
        ]}
        title={c.name}
      />

      <DetailHero
        pills={
          <>
            <StatusPill tone={c.status as StatusTone} pulse={c.status === "active"}>
              {c.status}
            </StatusPill>
            <Badge variant="neutral">{TYPE_LABEL[c.type]}</Badge>
          </>
        }
        title={c.name}
        subtitle={c.description}
        meta={[
          { label: "Schedule", value: scheduleLabel(c.schedule.start, c.schedule.end) },
          { label: "Reach", value: count(c.metrics.reach) },
          {
            label: "Claims",
            value: <span className="text-success">{count(c.metrics.funnel.claimed)}</span>,
          },
          {
            label: "Liability",
            value: <span className="text-warning">{moneyCompact(c.compliance.budgetUsed)}</span>,
          },
        ]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(`/promotions/${c.id}/edit`)}>
              <Pencil /> Edit
            </Button>
            <Button variant="outline" onClick={() => navigate(`/promotions/new?from=${c.id}`)}>
              <Copy /> Duplicate
            </Button>
            {canActivate ? (
              <Button
                variant={activating ? "default" : "danger"}
                onClick={() => setConfirmOpen(true)}
              >
                {activating ? <Play /> : <Pause />}
                {activating ? "Activate" : "Pause"}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div className="space-y-4">
          <DetailCard
            title="Eligibility"
            action={<EditLink onClick={() => editSection("section-eligibility")} />}
          >
            <DescriptionList
              items={[
                ...describeConditions(c.eligibility, catalog),
                { label: "Audience", value: c.audienceLabel },
              ]}
            />
          </DetailCard>

          <DetailCard
            title="Earn rules"
            action={<EditLink onClick={() => editSection("section-earn")} />}
          >
            <DescriptionList
              items={[
                {
                  label: "Goal",
                  value: (
                    <span className="font-mono text-success">
                      {ACTIVITY_LABEL[c.earnRule.activity]} ≥ {moneyPrecise(c.earnRule.threshold)}
                    </span>
                  ),
                },
                { label: "Counts toward", value: COUNTS_TOWARD_LABEL[c.earnRule.countsToward] },
                { label: "Currency", value: c.earnRule.currency },
                ...(c.earnRule.timeWindow
                  ? [{ label: "Time window", value: c.earnRule.timeWindow }]
                  : []),
              ]}
            />
          </DetailCard>

          <DetailCard
            title={`Prize catalog · ${c.prizeIds.length} prizes`}
            action={<EditLink label="Manage" onClick={() => editSection("section-prizes")} />}
          >
            {prizes.isLoading ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <PrizeThumbGrid prizes={selectedPrizes} showValue />
            )}
          </DetailCard>
        </div>

        <div className="space-y-4">
          <DetailCard title="Performance">
            <Funnel data={c.metrics.funnel} />
          </DetailCard>

          <DetailCard title="Compliance">
            <DescriptionList
              items={[
                {
                  label: "Audit log",
                  value: <span className="text-success">All events tracked</span>,
                },
                {
                  label: "Budget cap",
                  value: `${moneyCompact(c.compliance.budgetCap)} · ${percent(budgetPct, true, 0)} used`,
                },
                { label: "Approved by", value: approver },
                {
                  label: "Filed",
                  value: c.compliance.filingRef ?? "Not filed",
                },
              ]}
            />
            <div className="mt-4 space-y-1.5">
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-warning transition-[width] duration-slow ease-out"
                  style={{ width: `${Math.min(100, budgetPct)}%` }}
                />
              </div>
              <p className="font-mono text-2xs text-text-tertiary">
                {moneyPrecise(c.compliance.budgetUsed)} of {moneyPrecise(c.compliance.budgetCap)}
              </p>
            </div>
          </DetailCard>
        </div>
      </div>

      {/* Confirm status change */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activating ? "Activate campaign?" : "Pause campaign?"}</DialogTitle>
            <DialogDescription>
              {activating
                ? `${c.name} will go live and begin offering prizes to eligible players immediately.`
                : `${c.name} will stop offering prizes. In-progress players keep their earned offers.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant={activating ? "default" : "danger"} onClick={doToggle}>
              {activating ? "Activate" : "Pause"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const APPROVER_NAMES: Record<string, string> = {
  "u-maya-rodriguez": "Maya Rodriguez (VP Marketing)",
  "u-james-chen": "James Chen (Marketing Manager)",
};

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
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
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
