import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Pencil, Power } from "lucide-react";
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
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  StatusPill,
  toast,
  type StatusTone,
} from "@/shared/ui";
import { count } from "@/shared/lib/format";
import {
  useGetTriggerDefQuery,
  useGetTriggerRulesQuery,
  useSetTriggerStatusMutation,
} from "../api";
import { CATEGORY_LABEL, categoryTone } from "./labels";

export function TriggerDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const canManage = usePermission("triggers.manage");
  const properties = useAppSelector((s) => s.tenant.context?.properties ?? []);

  const trigger = useGetTriggerDefQuery(id);
  const rules = useGetTriggerRulesQuery(id, { skip: !id });
  const [setStatus] = useSetTriggerStatusMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (trigger.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          breadcrumbs={[{ label: "Automation" }, { label: "Triggers", href: "/triggers" }]}
          title="Trigger"
        />
        <ErrorState
          title="Couldn't load this trigger"
          onRetry={() => trigger.refetch()}
          retrying={trigger.isFetching}
        />
      </div>
    );
  }
  if (trigger.isLoading || !trigger.data) return <DetailSkeleton />;

  const t = trigger.data;
  const active = t.status === "active";
  const propertyNames = t.propertyIds
    .map((p) => properties.find((x) => x.id === p)?.name ?? p)
    .join(" · ");

  const doToggle = async () => {
    setConfirmOpen(false);
    const next = active ? "draft" : "active";
    try {
      await setStatus({ id: t.id, status: next }).unwrap();
      toast.success(next === "active" ? "Trigger activated" : "Trigger set to draft", {
        description: t.label,
      });
    } catch {
      toast.error("Couldn't update trigger");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Automation" },
          { label: "Triggers", href: "/triggers" },
          { label: t.label },
        ]}
        title={t.label}
      />

      <DetailHero
        pills={
          <>
            <StatusPill tone={categoryTone(t.category) as StatusTone}>
              {CATEGORY_LABEL[t.category]}
            </StatusPill>
            <Badge variant={active ? "success" : "neutral"}>{t.status}</Badge>
          </>
        }
        title={t.label}
        subtitle={<span className="font-mono text-text-tertiary">{t.key}</span>}
        meta={[
          { label: "Bound rules", value: count(t.boundRuleCount) },
          { label: "Payload fields", value: count(t.payloadFields.length) },
          {
            label: "Updated",
            value: new Date(t.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          },
          { label: "Properties", value: String(t.propertyIds.length) },
        ]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(`/triggers/${t.id}/edit`)}>
              <Pencil /> Edit
            </Button>
            {canManage ? (
              <Button variant={active ? "danger" : "default"} onClick={() => setConfirmOpen(true)}>
                <Power /> {active ? "Set to draft" : "Activate"}
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div className="space-y-4">
          <DetailCard title="Definition">
            <DescriptionList
              items={[
                { label: "Label", value: t.label },
                { label: "Key", value: <span className="font-mono">{t.key}</span> },
                { label: "Category", value: CATEGORY_LABEL[t.category] },
                { label: "Description", value: t.description },
                { label: "Availability", value: propertyNames },
              ]}
            />
          </DetailCard>

          <DetailCard title={`Payload fields · ${t.payloadFields.length}`}>
            {t.payloadFields.length === 0 ? (
              <EmptyState compact title="No payload fields" />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-2xs uppercase tracking-wide text-text-tertiary">
                    <th className="pb-2 text-left font-medium">Name</th>
                    <th className="pb-2 text-left font-medium">Type</th>
                    <th className="pb-2 text-left font-medium">Label</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {t.payloadFields.map((f) => (
                    <tr key={f.name}>
                      <td className="py-2 font-mono text-xs text-text-secondary">{f.name}</td>
                      <td className="py-2 capitalize text-text-tertiary">{f.type}</td>
                      <td className="py-2 text-text-secondary">{f.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </DetailCard>
        </div>

        <DetailCard title={`Bound rules · ${rules.data?.length ?? t.boundRuleCount}`}>
          {rules.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (rules.data ?? []).length === 0 ? (
            <EmptyState
              compact
              title="No rules bound yet"
              description="Rules that listen to this event will appear here."
            />
          ) : (
            <ul className="divide-y divide-hairline">
              {(rules.data ?? []).map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text-secondary">{r.name}</p>
                    <p className="text-2xs capitalize text-text-tertiary">{r.status}</p>
                  </div>
                  <Link
                    to={`/rules/${r.id}/edit`}
                    className="shrink-0 text-xs text-brand underline-offset-4 hover:text-brand-bright hover:underline"
                  >
                    Edit rule
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DetailCard>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{active ? "Set trigger to draft?" : "Activate trigger?"}</DialogTitle>
            <DialogDescription>
              {active
                ? `${t.label} will be removed from the Rules event picker.`
                : `${t.label} will become available in the Rules event picker.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant={active ? "danger" : "default"} onClick={doToggle}>
              {active ? "Set to draft" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
