import type { FieldDef, FieldOption } from "@/shared/ui";

/**
 * Typed field catalog for rule *conditions* (plan §8 / prototype Screen 07).
 * Passed as a prop into the generic `ConditionBuilder` and `SummaryPanel` — the
 * same components Promotions eligibility uses, with a different catalog. Rules
 * lean on event-ish player attributes (birthday, tier changes, weekly play).
 */

const OP = {
  in: { key: "in", label: "in", symbol: "IN" },
  notIn: { key: "not-in", label: "not in", symbol: "NOT IN" },
  eq: { key: "eq", label: "equals", symbol: "==" },
  gte: { key: "gte", label: "≥", symbol: "≥" },
  lte: { key: "lte", label: "≤", symbol: "≤" },
} as const;

const TIERS: FieldOption[] = [
  { value: "Silver", label: "Silver" },
  { value: "Gold", label: "Gold" },
  { value: "Platinum", label: "Platinum" },
  { value: "Diamond", label: "Diamond" },
  { value: "VIP", label: "VIP" },
];

const SEGMENTS: FieldOption[] = [
  { value: "slots", label: "Slot players" },
  { value: "tables", label: "Table players" },
  { value: "new", label: "New members" },
  { value: "vip", label: "VIP hosts" },
  { value: "dormant", label: "Dormant / winback" },
];

const DAYS: FieldOption[] = [
  { value: "Mon", label: "Monday" },
  { value: "Tue", label: "Tuesday" },
  { value: "Wed", label: "Wednesday" },
  { value: "Thu", label: "Thursday" },
  { value: "Fri", label: "Friday" },
  { value: "Sat", label: "Saturday" },
  { value: "Sun", label: "Sunday" },
];

export const RULE_CONDITION_CATALOG: FieldDef[] = [
  {
    key: "player.birthday",
    label: "player.birthday",
    token: "player.birthday",
    editor: "keyword",
    operators: [OP.eq],
    keywords: [
      { value: "today", label: "today" },
      { value: "this-week", label: "this week" },
      { value: "this-month", label: "this month" },
    ],
  },
  {
    key: "player.tier",
    label: "player.tier",
    token: "player.tier",
    editor: "multi-select",
    operators: [OP.in, OP.notIn, OP.eq],
    options: TIERS,
  },
  {
    key: "player.tierChangedTo",
    label: "player.tierChangedTo",
    token: "tier.changed_to",
    editor: "multi-select",
    operators: [OP.in],
    options: TIERS,
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
    key: "player.weeklyCoinIn",
    label: "player.weeklyCoinIn",
    token: "weekly_coin_in",
    editor: "number",
    operators: [OP.gte, OP.lte],
    unit: "$",
    placeholder: "10000",
  },
  {
    key: "player.dayOfWeek",
    label: "player.dayOfWeek",
    token: "day",
    editor: "multi-select",
    operators: [OP.in, OP.eq],
    options: DAYS,
  },
  {
    key: "player.segment",
    label: "player.segment",
    token: "segment",
    editor: "multi-select",
    operators: [OP.in, OP.notIn],
    options: SEGMENTS,
  },
];
