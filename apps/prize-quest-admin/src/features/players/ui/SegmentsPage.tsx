import { useNavigate } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import {
  Badge,
  ConditionBuilder,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  type ConditionGroupValue,
} from "@/shared/ui";
import { count } from "@/shared/lib/format";
import { SEGMENT_CONDITION_CATALOG } from "../model";
import { useListSegmentsQuery } from "../api";
import { SEGMENT_BADGE, SEGMENT_LABEL } from "./labels";

export function SegmentsPage() {
  const navigate = useNavigate();
  const pid = "all";
  const segments = useListSegmentsQuery(pid);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Engagement" },
          { label: "Players", href: "/players" },
          { label: "Segments" },
        ]}
        title="Segments"
        subtitle="Auto-computed player segments and the criteria that define them. Read-only."
      />

      {segments.isError ? (
        <ErrorState onRetry={() => segments.refetch()} retrying={segments.isFetching} />
      ) : segments.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : (segments.data ?? []).length === 0 ? (
        <EmptyState icon={Users} title="No segments defined" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(segments.data ?? []).map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => navigate(`/players?segment=${s.key}`)}
              className="group flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-5 text-left transition-colors hover:border-hairline-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <Badge variant={SEGMENT_BADGE[s.key]}>{SEGMENT_LABEL[s.key]}</Badge>
                    <span className="font-display text-2xl font-semibold tabular-nums text-text-primary">
                      {count(s.count)}
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary">{s.description}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-text-tertiary transition-colors group-hover:text-brand-bright" />
              </div>

              {s.criteria ? (
                <div className="border-t border-hairline pt-4" onClick={(e) => e.stopPropagation()}>
                  <p className="mb-2 text-2xs uppercase tracking-wide text-text-tertiary">
                    Criteria
                  </p>
                  <ConditionBuilder
                    catalog={SEGMENT_CONDITION_CATALOG}
                    value={s.criteria as ConditionGroupValue}
                    onChange={() => {}}
                    readOnly
                  />
                </div>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
