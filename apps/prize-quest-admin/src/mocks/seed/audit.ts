import type { AuditAction, AuditEntry, AuditTargetType } from "@/features/audit/model";

/**
 * Audit fixtures — ~150 entries echoing real console actions across actors,
 * actions, and targets. Deterministic (index math), time-ordered most-recent
 * first. Login / permission-change / invite carry no propertyId.
 */

const ACTORS = [
  { id: "u-alex-rivera", name: "Alex Rivera" },
  { id: "u-james-chen", name: "James Chen" },
  { id: "u-maya-rodriguez", name: "Maya Rodriguez" },
  { id: "u-sam-patel", name: "Sam Patel" },
  { id: "u-nina-okafor", name: "Nina Okafor" },
];

interface Template {
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  targetLabel: string;
  summary: (actor: string) => string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  scoped?: boolean;
}

const TEMPLATES: Template[] = [
  {
    action: "activate",
    targetType: "campaign",
    targetId: "cmp-summer-bash",
    targetLabel: "Summer Bash 2026",
    summary: () => "activated campaign Summer Bash 2026",
    before: { status: "scheduled" },
    after: { status: "active" },
    scoped: true,
  },
  {
    action: "pause",
    targetType: "rule",
    targetId: "rl-high-roller",
    targetLabel: "High Roller Weekly",
    summary: () => "paused rule High Roller Weekly",
    before: { status: "active" },
    after: { status: "paused" },
    scoped: true,
  },
  {
    action: "export",
    targetType: "rule",
    targetId: "logs",
    targetLabel: "Execution logs",
    summary: () => "exported execution logs",
    scoped: true,
  },
  {
    action: "permission-change",
    targetType: "user",
    targetId: "u-james-chen",
    targetLabel: "J. Chen",
    summary: () => "changed role for J. Chen",
    before: { role: "operations" },
    after: { role: "marketing-manager" },
  },
  {
    action: "login",
    targetType: "user",
    targetId: "u-alex-rivera",
    targetLabel: "session",
    summary: (a) => `${a} signed in`,
  },
  {
    action: "create",
    targetType: "campaign",
    targetId: "cmp-new",
    targetLabel: "Fall Kickoff",
    summary: () => "created campaign Fall Kickoff",
    after: { status: "draft" },
    scoped: true,
  },
  {
    action: "update",
    targetType: "reward",
    targetId: "rw-airpods",
    targetLabel: "AirPods Pro",
    summary: () => "updated reward AirPods Pro stock",
    before: { stock: 64 },
    after: { stock: 89 },
    scoped: true,
  },
  {
    action: "delete",
    targetType: "trigger",
    targetId: "tr-old",
    targetLabel: "Legacy Kiosk Tap",
    summary: () => "deleted trigger Legacy Kiosk Tap",
    before: { status: "draft" },
  },
  {
    action: "invite",
    targetType: "user",
    targetId: "u-invite-priya",
    targetLabel: "P. Kapoor",
    summary: () => "invited P. Kapoor as Operations",
  },
  {
    action: "activate",
    targetType: "reward",
    targetId: "rw-suite",
    targetLabel: "Weekend Suite Stay",
    summary: () => "activated reward Weekend Suite Stay",
    before: { status: "draft" },
    after: { status: "active" },
    scoped: true,
  },
  {
    action: "update",
    targetType: "setting",
    targetId: "theme",
    targetLabel: "Theme tokens",
    summary: () => "updated theme tokens",
    before: { "--brand": "8FC7E8" },
    after: { "--brand": "D4AF7A" },
  },
  {
    action: "update",
    targetType: "fulfillment",
    targetId: "fo-0004",
    targetLabel: "Order fo-0004",
    summary: () => "advanced order fo-0004 to shipped",
    before: { status: "processing" },
    after: { status: "shipped" },
    scoped: true,
  },
  {
    action: "create",
    targetType: "rule",
    targetId: "rl-birthday",
    targetLabel: "Birthday Bonus",
    summary: () => "created rule Birthday Bonus",
    after: { status: "draft" },
    scoped: true,
  },
  {
    action: "update",
    targetType: "player",
    targetId: "pl-001",
    targetLabel: "Ava Reyes",
    summary: () => "adjusted points for Ava Reyes",
    before: { points: 500 },
    after: { points: 3000 },
    scoped: true,
  },
  {
    action: "export",
    targetType: "campaign",
    targetId: "reports",
    targetLabel: "Campaign report",
    summary: () => "exported campaign report CSV",
    scoped: true,
  },
];

const PROPERTIES = ["cr-lv", "cr-reno", "cr-tahoe"];

function stamp(i: number): string {
  const NOW = Date.UTC(2026, 6, 23, 12, 0, 0);
  // ~3h apart, most-recent first.
  return new Date(NOW - i * 3 * 3_600_000 - (i % 5) * 600_000).toISOString();
}

function buildEntry(i: number): AuditEntry {
  const tpl = TEMPLATES[i % TEMPLATES.length];
  const actor = ACTORS[i % ACTORS.length];
  const noProperty =
    tpl.action === "login" || tpl.action === "permission-change" || tpl.action === "invite";
  return {
    id: `au-${String(i + 1).padStart(4, "0")}`,
    actorId: actor.id,
    actorName: actor.name,
    action: tpl.action,
    targetType: tpl.targetType,
    targetId: tpl.targetId,
    targetLabel: tpl.targetLabel,
    summary: tpl.summary(actor.name),
    time: stamp(i),
    ip: `10.${i % 4}.${(i * 7) % 255}.${(i * 13) % 255}`,
    propertyId: noProperty || !tpl.scoped ? undefined : PROPERTIES[i % PROPERTIES.length],
    before: tpl.before,
    after: tpl.after,
  };
}

export const AUDIT_ENTRIES: AuditEntry[] = Array.from({ length: 150 }, (_, i) => buildEntry(i));

export function seedAudit(): AuditEntry[] {
  return AUDIT_ENTRIES.map((e) => structuredClone(e));
}
