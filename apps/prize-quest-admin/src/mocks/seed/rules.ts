import type { ExecutionLogEntry, Rule, Severity, TriggerCatalogItem } from "@/features/rules/model";

/**
 * Rules Engine + Execution Logs fixtures. Rule names/conditions/messages lifted
 * from `admin-app.html` Screens 06/08. Rules spread across trigger types and
 * statuses and properties so tabs + scoping visibly change the list. The DB
 * clones these on boot so create/edit/toggle persist for the session.
 */

const ALL_PROPS = ["cr-lv", "cr-reno", "cr-tahoe"];

// ── Trigger catalog (read-only; full Triggers screen is v2) ───────────────────

export const TRIGGERS: TriggerCatalogItem[] = [
  {
    key: "card-tap",
    label: "Card tap",
    description: "A player taps their loyalty card at a device.",
  },
  {
    key: "tier-change",
    label: "Tier change",
    description: "A player's tier is upgraded or downgraded.",
  },
  {
    key: "budget-cap",
    label: "Budget cap reached",
    description: "A campaign's liability crosses a budget threshold.",
  },
  { key: "first-visit", label: "First visit", description: "A player's first visit this period." },
  { key: "birthday", label: "Birthday", description: "A player's birthday (evaluated daily)." },
  {
    key: "big-win",
    label: "Big win",
    description: "A player records a jackpot or large win event.",
  },
];

// ── Rules (10) ────────────────────────────────────────────────────────────────

export const RULES: Rule[] = [
  {
    id: "rule-birthday-bonus",
    name: "Birthday Bonus",
    description:
      "Send a special offer to players on their birthday if they're Gold tier or higher.",
    triggerType: "scheduled",
    cron: "0 8 * * *",
    priority: 5,
    conditions: {
      conjunction: "AND",
      conditions: [
        { field: "player.birthday", operator: "eq", value: "today" },
        { field: "player.tier", operator: "in", value: ["Gold", "Platinum", "VIP"] },
      ],
    },
    action: {
      type: "send-offer",
      offerType: "Birthday Bonus offer",
      channel: "Patron HTML5 + Email",
    },
    status: "active",
    lastRun: "2026-07-23T08:00:00Z",
    nextRun: "2026-07-24T08:00:00Z",
    propertyIds: ALL_PROPS,
  },
  {
    id: "rule-high-roller-weekly",
    name: "High Roller Weekly",
    description: "Reward the highest-volume players each week with a VIP offer.",
    triggerType: "scheduled",
    cron: "0 6 * * 1",
    priority: 8,
    conditions: {
      conjunction: "AND",
      conditions: [{ field: "player.weeklyCoinIn", operator: "gte", value: 10000 }],
    },
    action: { type: "send-offer", offerType: "VIP weekly offer", channel: "Host outreach" },
    status: "active",
    lastRun: "2026-07-20T06:00:00Z",
    nextRun: "2026-07-27T06:00:00Z",
    propertyIds: ALL_PROPS,
  },
  {
    id: "rule-comeback-special",
    name: "Comeback Special",
    description: "Win back lapsed players who haven't visited in over a month.",
    triggerType: "scheduled",
    cron: "0 7 * * *",
    priority: 4,
    conditions: {
      conjunction: "AND",
      conditions: [
        { field: "player.lastVisitDays", operator: "gte", value: 30 },
        { field: "player.tier", operator: "in", value: ["Silver", "Gold", "Platinum", "Diamond"] },
      ],
    },
    action: { type: "send-offer", offerType: "Comeback offer", channel: "Email + SMS" },
    status: "active",
    lastRun: "2026-07-23T07:30:00Z",
    nextRun: "2026-07-24T07:30:00Z",
    propertyIds: ALL_PROPS,
  },
  {
    id: "rule-first-visit-month",
    name: "First Visit of Month",
    description: "Greet players on their first visit of the month with a welcome-back offer.",
    triggerType: "event",
    eventKey: "first-visit",
    priority: 6,
    conditions: { conjunction: "AND", conditions: [] },
    action: { type: "send-offer", offerType: "Welcome back offer", channel: "Patron HTML5" },
    status: "active",
    lastRun: "2026-07-23T14:15:00Z",
    propertyIds: ALL_PROPS,
  },
  {
    id: "rule-budget-cap-warning",
    name: "Budget cap warning",
    description: "Notify operations and auto-pause a campaign when it nears its budget cap.",
    triggerType: "event",
    eventKey: "budget-cap",
    priority: 10,
    conditions: { conjunction: "AND", conditions: [] },
    action: { type: "auto-pause", recipients: ["ops@casinoroyale.com"] },
    status: "active",
    lastRun: "2026-07-22T22:08:00Z",
    propertyIds: ALL_PROPS,
  },
  {
    id: "rule-tier-upgrade",
    name: "Tier upgrade celebration",
    description: "Celebrate a player reaching Gold or Platinum with an unlock notification.",
    triggerType: "event",
    eventKey: "tier-change",
    priority: 3,
    conditions: {
      conjunction: "AND",
      conditions: [{ field: "player.tierChangedTo", operator: "in", value: ["Gold", "Platinum"] }],
    },
    action: {
      type: "send-offer",
      offerType: "Tier unlock notification",
      channel: "Patron HTML5 + Push",
    },
    status: "paused",
    lastRun: "2026-06-28T16:42:00Z",
    propertyIds: ALL_PROPS,
  },
  {
    id: "rule-vip-weekend",
    name: "VIP weekend reminder",
    description: "Invite Diamond players to the property each Friday for the weekend.",
    triggerType: "scheduled",
    cron: "0 9 * * 5",
    priority: 5,
    conditions: {
      conjunction: "AND",
      conditions: [
        { field: "player.tier", operator: "eq", value: ["Diamond"] },
        { field: "player.dayOfWeek", operator: "in", value: ["Fri"] },
      ],
    },
    action: { type: "send-offer", offerType: "Weekend invite", channel: "Host outreach" },
    status: "draft",
    propertyIds: ["cr-lv"],
  },
  {
    id: "rule-card-tap-welcome",
    name: "Card-tap welcome",
    description: "Greet a player the moment they tap in at a device.",
    triggerType: "event",
    eventKey: "card-tap",
    priority: 2,
    conditions: { conjunction: "AND", conditions: [] },
    action: { type: "send-offer", offerType: "Welcome offer", channel: "Patron HTML5" },
    status: "active",
    lastRun: "2026-07-23T15:02:00Z",
    propertyIds: ALL_PROPS,
  },
  {
    id: "rule-dormant-winback",
    name: "Dormant winback points",
    description: "Award bonus points to dormant players to re-engage them.",
    triggerType: "scheduled",
    cron: "0 6 1 * *",
    priority: 4,
    conditions: {
      conjunction: "AND",
      conditions: [{ field: "player.segment", operator: "in", value: ["dormant"] }],
    },
    action: { type: "award-points", points: 250 },
    status: "paused",
    lastRun: "2026-07-01T06:00:00Z",
    nextRun: "2026-08-01T06:00:00Z",
    propertyIds: ["cr-reno"],
  },
  {
    id: "rule-new-member-points",
    name: "New member points",
    description: "Award starter points to brand-new members on their first visit.",
    triggerType: "event",
    eventKey: "first-visit",
    priority: 6,
    conditions: {
      conjunction: "AND",
      conditions: [{ field: "player.segment", operator: "in", value: ["new"] }],
    },
    action: { type: "award-points", points: 100 },
    status: "active",
    lastRun: "2026-07-23T13:40:00Z",
    propertyIds: ["cr-lv", "cr-tahoe"],
  },
];

// ── Execution logs (~140, echoing Screen 08) ──────────────────────────────────

interface LogTemplate {
  ruleId: string;
  severity: Severity;
  message: (matched: number, sent: number) => string;
  source: "scheduler" | "event";
}

const ruleName = (id: string) => RULES.find((r) => r.id === id)?.name ?? "Rule";

const LOG_TEMPLATES: LogTemplate[] = [
  {
    ruleId: "rule-birthday-bonus",
    severity: "ok",
    source: "scheduler",
    message: (m, s) => `${m} players matched · ${s} offers sent · runtime 0.32s`,
  },
  {
    ruleId: "rule-first-visit-month",
    severity: "ok",
    source: "event",
    message: (m, s) => `${m} players matched · ${s} welcome offers sent · runtime 0.18s`,
  },
  {
    ruleId: "rule-budget-cap-warning",
    severity: "warn",
    source: "event",
    message: () =>
      `Easter Extravaganza at 91% of $40K cap · ops notified, NOT paused (under limit)`,
  },
  {
    ruleId: "rule-high-roller-weekly",
    severity: "ok",
    source: "scheduler",
    message: (m, s) =>
      `${m} players matched · ${s} VIP offers + ${m * 500} points awarded · runtime 1.04s`,
  },
  {
    ruleId: "rule-tier-upgrade",
    severity: "ok",
    source: "event",
    message: (m, s) => `${m} players matched · ${s} unlock notifications sent`,
  },
  {
    ruleId: "rule-comeback-special",
    severity: "err",
    source: "scheduler",
    message: () => `Failed to send · CDP timeout after 5s · 3 retries · ops alerted`,
  },
  {
    ruleId: "rule-comeback-special",
    severity: "ok",
    source: "scheduler",
    message: (m, s) => `Retry succeeded · ${m} players matched · ${s} offers sent · runtime 2.18s`,
  },
  {
    ruleId: "rule-comeback-special",
    severity: "warn",
    source: "scheduler",
    message: (m) =>
      `${m} players matched (high volume) · throttled to 200/min · ETA 4m to complete`,
  },
  {
    ruleId: "rule-card-tap-welcome",
    severity: "ok",
    source: "event",
    message: (m, s) => `${m} players matched · ${s} welcome offers sent · runtime 0.09s`,
  },
  {
    ruleId: "rule-new-member-points",
    severity: "ok",
    source: "event",
    message: (m) => `${m} players matched · ${m * 100} starter points awarded · runtime 0.14s`,
  },
];

/** Deterministic pseudo-value from an index (no Math.random — keeps seeds stable). */
function pick(index: number, spread: number, base: number): number {
  return base + ((index * 37) % spread);
}

const LOG_BASE_MS = Date.parse("2026-07-23T10:08:42Z");
const PROPS_CYCLE = ["cr-lv", "cr-reno", "cr-tahoe"];

/** Build ~140 log entries across templates, time-ordered newest-first. */
export function buildLogs(): ExecutionLogEntry[] {
  const rows: ExecutionLogEntry[] = [];
  const count = 140;
  for (let i = 0; i < count; i++) {
    const tpl = LOG_TEMPLATES[i % LOG_TEMPLATES.length];
    const matched = pick(i, 90, 8);
    const sent = tpl.severity === "err" ? 0 : matched;
    const time = new Date(LOG_BASE_MS - i * 6 * 60 * 1000).toISOString();
    rows.push({
      id: `log-${i}`,
      ruleId: tpl.ruleId,
      ruleName: ruleName(tpl.ruleId),
      severity: tpl.severity,
      time,
      message: `${ruleName(tpl.ruleId)} · ${tpl.message(matched, sent)}`,
      matched,
      sent,
      runtimeMs: pick(i, 2000, 80),
      source: tpl.source,
      env: "prod-us-east",
      propertyId: PROPS_CYCLE[i % PROPS_CYCLE.length],
    });
  }
  return rows;
}

/**
 * Live-tail generator: synthesize a plausible newer entry from a monotonically
 * increasing counter (mostly `ok`, some `warn`, rare `err`). Deterministic by
 * counter — no `Math.random`. The client calls this on its live-tail interval.
 */
export function synthLogEntry(counter: number): ExecutionLogEntry {
  const tpl = LOG_TEMPLATES[counter % LOG_TEMPLATES.length];
  const severity: Severity = counter % 17 === 0 ? "err" : counter % 6 === 0 ? "warn" : "ok";
  const matched = pick(counter, 120, 5);
  const sent = severity === "err" ? 0 : matched;
  return {
    id: `log-live-${counter}-${LOG_BASE_MS + counter}`,
    ruleId: tpl.ruleId,
    ruleName: ruleName(tpl.ruleId),
    severity,
    time: new Date(LOG_BASE_MS + (counter + 1) * 4000).toISOString(),
    message: `${ruleName(tpl.ruleId)} · ${tpl.message(matched, sent)}`,
    matched,
    sent,
    runtimeMs: pick(counter, 1800, 60),
    source: tpl.source,
    env: "prod-us-east",
    propertyId: PROPS_CYCLE[counter % PROPS_CYCLE.length],
  };
}

export function seedRules(): Rule[] {
  return RULES.map((r) => structuredClone(r));
}
export function seedLogs(): ExecutionLogEntry[] {
  return buildLogs();
}
