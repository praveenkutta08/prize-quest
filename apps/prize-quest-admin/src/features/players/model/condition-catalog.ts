import type { FieldDef, FieldOption } from "@/shared/ui";

/**
 * Players-local field catalog for rendering segment `criteria` read-only in the
 * shared `ConditionBuilder` (Segments view). Kept feature-local — FSD forbids
 * importing the rules feature's catalog. Only needs to cover the fields the
 * segment seed uses.
 */

const OP = {
  in: { key: "in", label: "in", symbol: "IN" },
  notIn: { key: "not-in", label: "not in", symbol: "NOT IN" },
  gte: { key: "gte", label: "≥", symbol: "≥" },
  lte: { key: "lte", label: "≤", symbol: "≤" },
} as const;

const TIERS: FieldOption[] = [
  { value: "Silver", label: "Silver" },
  { value: "Gold", label: "Gold" },
  { value: "Platinum", label: "Platinum" },
  { value: "Diamond", label: "Diamond" },
];

const SEGMENTS: FieldOption[] = [
  { value: "vip", label: "VIP" },
  { value: "high-roller", label: "High roller" },
  { value: "regular", label: "Regular" },
  { value: "new", label: "New" },
  { value: "at-risk", label: "At-risk" },
  { value: "dormant", label: "Dormant" },
];

export const SEGMENT_CONDITION_CATALOG: FieldDef[] = [
  {
    key: "player.tier",
    label: "player.tier",
    token: "player.tier",
    editor: "multi-select",
    operators: [OP.in, OP.notIn],
    options: TIERS,
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
    key: "player.weeklyCoinIn",
    label: "player.weeklyCoinIn",
    token: "weekly_coin_in",
    editor: "number",
    operators: [OP.gte, OP.lte],
    unit: "$",
    placeholder: "10000",
  },
];
