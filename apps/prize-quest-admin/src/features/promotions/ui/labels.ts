import type { FieldDef } from "@/shared/ui";
import type {
  CampaignType,
  ConditionGroup,
  CountsToward,
  EarnActivity,
  Recurrence,
} from "../model";

export const TYPE_LABEL: Record<CampaignType, string> = {
  "goal-based": "Goal-based",
  milestone: "Milestone",
  "repeating-multi-tier": "Repeating multi-tier",
};

export const RECURRENCE_LABEL: Record<Recurrence, string> = {
  "one-shot": "One-shot · entire window",
  "weekly-reset": "Weekly reset",
  "daily-reset": "Daily reset",
};

export const ACTIVITY_LABEL: Record<EarnActivity, string> = {
  "slot-wager": "Slot wager",
  "table-avg-bet": "Table avg bet",
  "fnb-spend": "F&B spend",
  "hotel-night": "Hotel night",
};

export const COUNTS_TOWARD_LABEL: Record<CountsToward, string> = {
  "coin-in": "Coin-in",
  "theoretical-win": "Theoretical win",
  "actual-win": "Actual win",
};

/** "Jun 1" from an ISO date; timezone-stable (parses at local midnight). */
export function monthDay(iso: string): string {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** "Jun 1 → Aug 31" schedule range. */
export function scheduleLabel(start: string, end: string): string {
  if (!start && !end) return "Not scheduled";
  return `${monthDay(start)} → ${monthDay(end)}`;
}

/** "last_visit" → "Last visit". */
function titleFromToken(token: string): string {
  const s = token.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Turn an eligibility group into readable label/value rows for the detail view. */
export function describeConditions(
  group: ConditionGroup,
  catalog: FieldDef[],
): Array<{ label: string; value: string }> {
  return group.conditions.map((cond) => {
    const field = catalog.find((f) => f.key === cond.field);
    const label = field ? titleFromToken(field.token) : cond.field;
    const op = field?.operators.find((o) => o.key === cond.operator);
    const labelFor = (v: unknown) => {
      const raw = String(v);
      return (
        field?.options?.find((o) => o.value === raw)?.label ??
        field?.keywords?.find((k) => k.value === raw)?.label ??
        raw
      );
    };

    let value: string;
    if (Array.isArray(cond.value)) {
      value =
        cond.operator === "between"
          ? `${labelFor(cond.value[0])}–${labelFor(cond.value[1])}${field?.unit ? ` ${field.unit}` : ""}`
          : cond.value.map(labelFor).join(" · ");
      if (cond.operator === "not-in") value = `not ${value}`;
    } else {
      const unit = field?.unit ? ` ${field.unit}` : "";
      value = `${op && op.symbol !== "=" ? `${op.symbol} ` : ""}${labelFor(cond.value)}${unit}`;
    }
    return { label, value };
  });
}
