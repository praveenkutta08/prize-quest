import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Coins, Download, Loader2, UserPlus } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { usePermission } from "./usePermission";
import {
  ActivityFeed,
  Avatar,
  AvatarFallback,
  Badge,
  BarChart,
  Button,
  DescriptionList,
  DetailCard,
  DetailHero,
  EmptyState,
  ErrorState,
  PageHeader,
  PrizeThumbGrid,
  Skeleton,
  StatusPill,
  Textarea,
  toast,
  type BarDatum,
  type PrizeLike,
  type StatusTone,
} from "@/shared/ui";
import { count, money, relativeTime } from "@/shared/lib/format";
import {
  useGetPlayerActivityQuery,
  useGetPlayerCampaignsQuery,
  useGetPlayerQuery,
  useGetPlayerRewardsQuery,
} from "../api";
import { toActivityFeedItem, type Player } from "../model";
import { AddToCampaignDialog, AdjustPointsDialog } from "./dialogs";
import { SEGMENT_BADGE, SEGMENT_LABEL, STATUS_LABEL, statusTone, tierTone } from "./labels";

/** Deterministic visits/wager series for the overview chart. */
function visitSeries(p: Player): BarDatum[] {
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const base = Math.max(1, Math.round(p.visitsYtd / 6));
  return months.map((label, i) => ({
    label,
    value: Math.round(base * (0.6 + ((p.age + i * 5) % 80) / 100)),
    highlight: i === months.length - 1,
  }));
}

const REWARD_STATUS_TONE: Record<string, StatusTone> = {
  fulfilled: "active",
  claimed: "scheduled",
  pending: "paused",
};

export function PlayerProfilePage() {
  const { id = "" } = useParams();
  const canAdjust = usePermission("players.adjust");
  const properties = useAppSelector((s) => s.tenant.context?.properties ?? []);

  const player = useGetPlayerQuery(id);
  const rewards = useGetPlayerRewardsQuery(id, { skip: !id });
  const campaigns = useGetPlayerCampaignsQuery(id, { skip: !id });

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const activity = useGetPlayerActivityQuery({ id, cursor });

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [notes, setNotes] = useState("");

  // Infinite scroll: load the next page when the sentinel enters view.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const nextCursor = activity.data?.nextCursor;
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !nextCursor || activity.isFetching) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && nextCursor) setCursor(nextCursor);
      },
      { rootMargin: "120px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [nextCursor, activity.isFetching]);

  const feedItems = useMemo(
    () => (activity.data?.rows ?? []).map(toActivityFeedItem),
    [activity.data?.rows],
  );

  if (player.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          breadcrumbs={[{ label: "Engagement" }, { label: "Players", href: "/players" }]}
          title="Player"
        />
        <ErrorState
          title="Couldn't load this player"
          onRetry={() => player.refetch()}
          retrying={player.isFetching}
        />
      </div>
    );
  }

  if (player.isLoading || !player.data) {
    return <ProfileSkeleton />;
  }

  const p = player.data;
  const propertyName = properties.find((x) => x.id === p.propertyId)?.name ?? p.propertyId;

  const rewardItems: PrizeLike[] = (rewards.data ?? []).map((r) => ({
    id: r.rewardId,
    name: r.name,
    category: "experience",
    value: 0,
  }));

  const exportProfile = () => {
    const rows = [
      ["field", "value"],
      ["name", p.name],
      ["email", p.email],
      ["tier", p.tier],
      ["segment", p.segment],
      ["property", propertyName],
      ["lifetimeValue", String(p.lifetimeValue)],
      ["pointsBalance", String(p.pointsBalance)],
      ["visitsYtd", String(p.visitsYtd)],
      ["lastVisitDays", String(p.lastVisitDays)],
      ["status", p.status],
    ];
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `player-${p.id}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("Profile exported", { description: p.name });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Engagement" },
          { label: "Players", href: "/players" },
          { label: p.name },
        ]}
        title={p.name}
      />

      <DetailHero
        pills={
          <>
            <StatusPill tone={tierTone(p.tier) as StatusTone}>{p.tier}</StatusPill>
            <Badge variant={SEGMENT_BADGE[p.segment]}>{SEGMENT_LABEL[p.segment]}</Badge>
            <StatusPill tone={statusTone(p.status) as StatusTone}>
              {STATUS_LABEL[p.status]}
            </StatusPill>
          </>
        }
        title={
          <span className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback>{p.initials}</AvatarFallback>
            </Avatar>
            {p.name}
          </span>
        }
        subtitle={`${p.email} · ${propertyName} · member since ${new Date(p.joinedAt).getFullYear()}`}
        meta={[
          {
            label: "Lifetime value",
            value: <span className="text-warning">{money(p.lifetimeValue)}</span>,
          },
          { label: "Points balance", value: count(p.pointsBalance) },
          { label: "Visits YTD", value: count(p.visitsYtd) },
          { label: "Last visit", value: `${p.lastVisitDays}d ago` },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => setCampaignOpen(true)}>
              <UserPlus /> Add to campaign
            </Button>
            {canAdjust ? (
              <Button variant="secondary" onClick={() => setAdjustOpen(true)}>
                <Coins /> Adjust points
              </Button>
            ) : null}
            <Button variant="outline" onClick={exportProfile}>
              <Download /> Export
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div className="space-y-4">
          <DetailCard title="Overview">
            <DescriptionList
              items={[
                { label: "Tier", value: p.tier },
                { label: "Segment", value: SEGMENT_LABEL[p.segment] },
                { label: "Status", value: STATUS_LABEL[p.status] },
                { label: "Age", value: String(p.age) },
                {
                  label: "Joined",
                  value: new Date(p.joinedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),
                },
                { label: "Phone", value: p.phone ?? "—" },
              ]}
            />
            <div className="mt-5 border-t border-hairline pt-4">
              <p className="mb-3 text-2xs uppercase tracking-wide text-text-tertiary">
                Visits · last 6 months
              </p>
              <BarChart data={visitSeries(p)} formatValue={(v) => count(v)} unit="visits" />
            </div>
          </DetailCard>

          <DetailCard title="Activity">
            {activity.isError ? (
              <ErrorState
                compact
                onRetry={() => activity.refetch()}
                retrying={activity.isFetching}
              />
            ) : feedItems.length === 0 && activity.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <>
                <ActivityFeed items={feedItems} />
                <div ref={sentinelRef} className="h-4" />
                {activity.isFetching ? (
                  <p className="flex items-center justify-center gap-2 py-2 text-xs text-text-tertiary">
                    <Loader2 className="size-3.5 animate-spin" /> Loading more…
                  </p>
                ) : !nextCursor ? (
                  <p className="py-2 text-center text-2xs text-text-tertiary">End of activity</p>
                ) : null}
              </>
            )}
          </DetailCard>
        </div>

        <div className="space-y-4">
          <DetailCard title="Rewards">
            {rewards.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : rewardItems.length === 0 ? (
              <EmptyState compact title="No rewards claimed yet" />
            ) : (
              <div className="space-y-2">
                <PrizeThumbGrid prizes={rewardItems} />
                <ul className="space-y-1.5 pt-1">
                  {(rewards.data ?? []).map((r, i) => (
                    <li key={i} className="flex items-center justify-between text-xs">
                      <span className="truncate text-text-secondary">{r.name}</span>
                      <StatusPill tone={REWARD_STATUS_TONE[r.status] ?? "draft"}>
                        {r.status}
                      </StatusPill>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </DetailCard>

          <DetailCard title="Campaigns">
            {campaigns.isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (campaigns.data ?? []).length === 0 ? (
              <EmptyState compact title="Not enrolled in any campaign" />
            ) : (
              <ul className="divide-y divide-hairline">
                {(campaigns.data ?? []).map((c) => (
                  <li
                    key={c.campaignId}
                    className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-text-secondary">{c.name}</p>
                      <p className="text-2xs text-text-tertiary">
                        Enrolled {relativeTime(c.enrolledAt)}
                      </p>
                    </div>
                    <Link
                      to={`/promotions/${c.campaignId}`}
                      className="shrink-0 text-xs text-brand underline-offset-4 hover:text-brand-bright hover:underline"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>

          <DetailCard title="Notes">
            <Textarea
              placeholder="Add an internal note about this player… (session-only)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            <p className="mt-2 text-2xs text-text-tertiary">
              Notes are local to this session — not persisted.
            </p>
          </DetailCard>
        </div>
      </div>

      <AdjustPointsDialog player={p} open={adjustOpen} onOpenChange={setAdjustOpen} />
      <AddToCampaignDialog player={p} open={campaignOpen} onOpenChange={setCampaignOpen} />
    </div>
  );
}

function ProfileSkeleton() {
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
