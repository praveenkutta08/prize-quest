import type { PayloadField, TriggerCategory, TriggerDefinition } from "@/features/triggers/model";

/**
 * Trigger-definition fixtures — ~15 across categories, with payload fields and
 * plausible bound-rule counts. Deterministic. `GET /api/triggers` (the Session 3
 * EventSelector feed) projects the active ones to `{key,label,description}`.
 */

const ALL = ["cr-lv", "cr-reno", "cr-tahoe"];

function pf(name: string, type: PayloadField["type"], label: string): PayloadField {
  return { name, type, label };
}

interface Spec {
  key: string;
  label: string;
  description: string;
  category: TriggerCategory;
  fields: PayloadField[];
  status: "active" | "draft";
  bound: number;
}

const SPECS: Spec[] = [
  {
    key: "card-tap",
    label: "Card tap",
    description: "Fires when a player taps their loyalty card at any reader.",
    category: "gameplay",
    fields: [pf("playerId", "string", "Player ID"), pf("deviceId", "string", "Device ID")],
    status: "active",
    bound: 4,
  },
  {
    key: "tier-change",
    label: "Tier change",
    description: "Fires when a player's loyalty tier changes.",
    category: "lifecycle",
    fields: [pf("fromTier", "enum", "From tier"), pf("toTier", "enum", "To tier")],
    status: "active",
    bound: 3,
  },
  {
    key: "budget-cap",
    label: "Budget cap reached",
    description: "Fires when a campaign reaches a budget-cap threshold.",
    category: "financial",
    fields: [pf("campaignId", "string", "Campaign ID"), pf("pctUsed", "number", "% used")],
    status: "active",
    bound: 2,
  },
  {
    key: "first-visit",
    label: "First visit",
    description: "Fires on a new member's first property visit.",
    category: "lifecycle",
    fields: [pf("playerId", "string", "Player ID")],
    status: "active",
    bound: 1,
  },
  {
    key: "birthday",
    label: "Birthday",
    description: "Fires on a player's birthday.",
    category: "lifecycle",
    fields: [pf("playerId", "string", "Player ID")],
    status: "active",
    bound: 2,
  },
  {
    key: "jackpot-hit",
    label: "Jackpot hit",
    description: "Fires when a player hits a jackpot above a threshold.",
    category: "gameplay",
    fields: [pf("amount", "number", "Amount"), pf("machineId", "string", "Machine ID")],
    status: "active",
    bound: 1,
  },
  {
    key: "session-start",
    label: "Session start",
    description: "Fires when a play session begins.",
    category: "gameplay",
    fields: [pf("playerId", "string", "Player ID")],
    status: "active",
    bound: 0,
  },
  {
    key: "session-end",
    label: "Session end",
    description: "Fires when a play session ends.",
    category: "gameplay",
    fields: [pf("playerId", "string", "Player ID"), pf("durationMin", "number", "Duration (min)")],
    status: "active",
    bound: 0,
  },
  {
    key: "points-redeemed",
    label: "Points redeemed",
    description: "Fires when a player redeems loyalty points.",
    category: "financial",
    fields: [pf("points", "number", "Points"), pf("rewardId", "string", "Reward ID")],
    status: "active",
    bound: 2,
  },
  {
    key: "kiosk-checkin",
    label: "Kiosk check-in",
    description: "Fires when a player checks in at a kiosk.",
    category: "gameplay",
    fields: [pf("kioskId", "string", "Kiosk ID")],
    status: "active",
    bound: 1,
  },
  {
    key: "promo-opt-in",
    label: "Promo opt-in",
    description: "Fires when a player opts into a promotion.",
    category: "lifecycle",
    fields: [pf("campaignId", "string", "Campaign ID")],
    status: "draft",
    bound: 0,
  },
  {
    key: "geo-enter",
    label: "Geofence enter",
    description: "Fires when a player enters a property geofence.",
    category: "schedule",
    fields: [pf("zoneId", "string", "Zone ID")],
    status: "draft",
    bound: 0,
  },
  {
    key: "cashout",
    label: "Cashout",
    description: "Fires when a player cashes out above a threshold.",
    category: "financial",
    fields: [pf("amount", "number", "Amount")],
    status: "active",
    bound: 1,
  },
  {
    key: "inactivity-30d",
    label: "Inactivity 30d",
    description: "Fires when a player is inactive for 30 days.",
    category: "schedule",
    fields: [pf("playerId", "string", "Player ID")],
    status: "active",
    bound: 3,
  },
  {
    key: "weekly-reset",
    label: "Weekly reset",
    description: "Fires at the weekly earn-cycle reset.",
    category: "schedule",
    fields: [],
    status: "active",
    bound: 1,
  },
];

function daysAgoIso(days: number): string {
  const NOW = Date.UTC(2026, 6, 23, 12, 0, 0);
  return new Date(NOW - days * 86_400_000).toISOString();
}

export const TRIGGER_DEFINITIONS: TriggerDefinition[] = SPECS.map((s, i) => ({
  id: `trg-${String(i + 1).padStart(3, "0")}`,
  key: s.key,
  label: s.label,
  description: s.description,
  category: s.category,
  payloadFields: s.fields,
  status: s.status,
  boundRuleCount: s.bound,
  propertyIds: i % 4 === 0 ? [ALL[0]] : i % 3 === 0 ? [ALL[0], ALL[2]] : ALL,
  updatedAt: daysAgoIso(1 + (i % 20)),
}));

export function seedTriggerDefinitions(): TriggerDefinition[] {
  return TRIGGER_DEFINITIONS.map((t) => structuredClone(t));
}
