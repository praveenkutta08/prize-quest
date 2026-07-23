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
  operations: ["campaign.view", "rule.view", "rule.toggle", "logs.view", "catalog.sync"],
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
