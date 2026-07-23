import type { FieldDef, FieldOption } from "@/shared/ui";

/**
 * The typed field catalog for campaign *eligibility* (plan §8 / TASK 5 table).
 * Each field declares its value type, allowed operators, and value editor. This
 * concrete catalog is passed as a prop into the generic `ConditionBuilder` and
 * `SummaryPanel` (both in `shared/ui`) — Session 3's rule builder supplies its
 * own catalog to the same components.
 *
 * `player.property` options are runtime (the tenant's properties), so the
 * catalog is assembled by `buildEligibilityCatalog(properties)`.
 */

const OP = {
  in: { key: "in", label: "in", symbol: "IN" },
  notIn: { key: "not-in", label: "not in", symbol: "NOT IN" },
  eq: { key: "eq", label: "=", symbol: "=" },
  gte: { key: "gte", label: "≥", symbol: "≥" },
  lte: { key: "lte", label: "≤", symbol: "≤" },
  between: { key: "between", label: "between", symbol: "BETWEEN" },
} as const;

const TIERS: FieldOption[] = [
  { value: "Silver", label: "Silver" },
  { value: "Gold", label: "Gold" },
  { value: "Platinum", label: "Platinum" },
  { value: "Diamond", label: "Diamond" },
];

const SEGMENTS: FieldOption[] = [
  { value: "slots", label: "Slot players" },
  { value: "tables", label: "Table players" },
  { value: "new", label: "New members" },
  { value: "vip", label: "VIP hosts" },
  { value: "dormant", label: "Dormant / winback" },
];

/** Build the eligibility catalog, injecting the tenant's properties as options. */
export function buildEligibilityCatalog(properties: FieldOption[]): FieldDef[] {
  return [
    {
      key: "player.tier",
      label: "player.tier",
      token: "tier",
      editor: "multi-select",
      operators: [OP.in, OP.notIn, OP.eq],
      options: TIERS,
    },
    {
      key: "player.age",
      label: "player.age",
      token: "age",
      editor: "number",
      operators: [OP.gte, OP.lte, OP.eq, OP.between],
      unit: "yrs",
      placeholder: "21",
    },
    {
      key: "player.property",
      label: "player.property",
      token: "property",
      editor: "multi-select",
      operators: [OP.in, OP.notIn],
      options: properties,
    },
    {
      key: "player.segment",
      label: "player.segment",
      token: "segment",
      editor: "multi-select",
      operators: [OP.in, OP.notIn],
      options: SEGMENTS,
    },
    {
      key: "player.lastVisitDays",
      label: "player.lastVisitDays",
      token: "last_visit",
      editor: "number",
      operators: [OP.gte, OP.lte],
      unit: "days",
      placeholder: "30",
    },
    {
      key: "player.birthday",
      label: "player.birthday",
      token: "birthday",
      editor: "keyword",
      operators: [OP.eq],
      keywords: [
        { value: "today", label: "today" },
        { value: "this-week", label: "this week" },
        { value: "this-month", label: "this month" },
      ],
    },
  ];
}

/** Static fallback catalog (no tenant properties) — used by the design-system demo. */
export const DEMO_ELIGIBILITY_CATALOG = buildEligibilityCatalog([
  { value: "cr-lv", label: "Casino Royale LV" },
  { value: "cr-reno", label: "Casino Royale Reno" },
  { value: "cr-tahoe", label: "Casino Royale Tahoe" },
]);
