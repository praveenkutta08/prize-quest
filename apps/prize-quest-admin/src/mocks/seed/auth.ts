import type { OperatorUser, Permission, Role, Session } from "@/shared/contracts";

/** UI-only RBAC: which affordances each role may see. Never real security. */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  "marketing-manager": [
    "campaign.view",
    "campaign.create",
    "rule.view",
    "rule.create",
    "logs.view",
    "catalog.sync",
    "notifications.manage",
  ],
  approver: [
    "campaign.view",
    "campaign.create",
    "campaign.activate",
    "rule.view",
    "rule.create",
    "rule.toggle",
    "logs.view",
  ],
  operations: [
    "campaign.view",
    "rule.view",
    "rule.toggle",
    "logs.view",
    "catalog.sync",
    "players.adjust",
    "fulfillment.manage",
    "notifications.manage",
    "triggers.manage",
  ],
  auditor: ["campaign.view", "rule.view", "logs.view", "logs.export", "audit.export"],
  admin: [
    "campaign.view",
    "campaign.create",
    "campaign.activate",
    "rule.view",
    "rule.create",
    "rule.toggle",
    "logs.view",
    "logs.export",
    "catalog.sync",
    "audit.export",
    "users.manage",
    "settings.manage",
    "players.adjust",
    "fulfillment.manage",
    "notifications.manage",
    "triggers.manage",
  ],
};

export const OPERATORS: OperatorUser[] = [
  {
    id: "u-james-chen",
    name: "James Chen",
    email: "james.chen@casinoroyale.com",
    initials: "JC",
    role: "marketing-manager",
    title: "Marketing Manager",
  },
  {
    id: "u-maya-rodriguez",
    name: "Maya Rodriguez",
    email: "maya.rodriguez@casinoroyale.com",
    initials: "MR",
    role: "approver",
    title: "VP Marketing",
  },
  {
    id: "u-alex-rivera",
    name: "Alex Rivera",
    email: "alex.rivera@casinoroyale.com",
    initials: "AR",
    role: "admin",
    title: "Console Administrator",
  },
  {
    id: "u-sam-patel",
    name: "Sam Patel",
    email: "sam.patel@casinoroyale.com",
    initials: "SP",
    role: "operations",
    title: "Operations Lead",
  },
];

const DEFAULT_OPERATOR = OPERATORS[0];

/** Build a mock session for a login email (falls back to the default operator). */
export function buildSession(email?: string): Session {
  const user =
    OPERATORS.find((o) => o.email.toLowerCase() === (email ?? "").toLowerCase()) ??
    DEFAULT_OPERATOR;
  return {
    token: `mock-${user.id}-${Math.random().toString(36).slice(2, 10)}`,
    user,
    role: user.role,
    permissions: ROLE_PERMISSIONS[user.role],
    tenantId: "casino-royale",
    defaultPropertyId: "cr-lv",
  };
}
