import type { Role } from "@/shared/contracts";
import type { ManagedUser, RolePermissions } from "@/features/users/model";
import { ROLE_PERMISSIONS } from "./auth";

/**
 * Operator user fixtures (tenant-scoped, no PII concerns — internal staff).
 * ~12 users across the 5 roles + 2 pending invites. Includes the admin session
 * operator (Alex Rivera) so the self-lockout guard has a target.
 */

function daysAgoIso(days: number, hours = 0): string {
  const NOW = Date.UTC(2026, 6, 23, 12, 0, 0);
  return new Date(NOW - days * 86_400_000 - hours * 3_600_000).toISOString();
}

export const MANAGED_USERS: ManagedUser[] = [
  {
    id: "u-alex-rivera",
    name: "Alex Rivera",
    email: "alex.rivera@casinoroyale.com",
    initials: "AR",
    role: "admin",
    title: "Console Administrator",
    status: "active",
    lastActiveAt: daysAgoIso(0, 1),
  },
  {
    id: "u-james-chen",
    name: "James Chen",
    email: "james.chen@casinoroyale.com",
    initials: "JC",
    role: "marketing-manager",
    title: "Marketing Manager",
    status: "active",
    lastActiveAt: daysAgoIso(0, 3),
  },
  {
    id: "u-maya-rodriguez",
    name: "Maya Rodriguez",
    email: "maya.rodriguez@casinoroyale.com",
    initials: "MR",
    role: "approver",
    title: "VP Marketing",
    status: "active",
    lastActiveAt: daysAgoIso(1),
  },
  {
    id: "u-sam-patel",
    name: "Sam Patel",
    email: "sam.patel@casinoroyale.com",
    initials: "SP",
    role: "operations",
    title: "Operations Lead",
    status: "active",
    lastActiveAt: daysAgoIso(0, 6),
  },
  {
    id: "u-nina-okafor",
    name: "Nina Okafor",
    email: "nina.okafor@casinoroyale.com",
    initials: "NO",
    role: "auditor",
    title: "Compliance Auditor",
    status: "active",
    lastActiveAt: daysAgoIso(2),
  },
  {
    id: "u-diego-costa",
    name: "Diego Costa",
    email: "diego.costa@casinoroyale.com",
    initials: "DC",
    role: "marketing-manager",
    title: "Promotions Manager",
    status: "active",
    lastActiveAt: daysAgoIso(3),
  },
  {
    id: "u-lena-voss",
    name: "Lena Voss",
    email: "lena.voss@casinoroyale.com",
    initials: "LV",
    role: "operations",
    title: "Fulfillment Coordinator",
    status: "active",
    lastActiveAt: daysAgoIso(1, 4),
  },
  {
    id: "u-omar-haddad",
    name: "Omar Haddad",
    email: "omar.haddad@casinoroyale.com",
    initials: "OH",
    role: "approver",
    title: "Director of Player Development",
    status: "active",
    lastActiveAt: daysAgoIso(5),
  },
  {
    id: "u-ruby-larsson",
    name: "Ruby Larsson",
    email: "ruby.larsson@casinoroyale.com",
    initials: "RL",
    role: "auditor",
    title: "Internal Audit",
    status: "inactive",
    lastActiveAt: daysAgoIso(48),
  },
  {
    id: "u-theo-marchetti",
    name: "Theo Marchetti",
    email: "theo.marchetti@casinoroyale.com",
    initials: "TM",
    role: "admin",
    title: "IT Administrator",
    status: "active",
    lastActiveAt: daysAgoIso(0, 9),
  },
  // Pending invites
  {
    id: "u-invite-priya",
    name: "Priya Kapoor",
    email: "priya.kapoor@casinoroyale.com",
    initials: "PK",
    role: "operations",
    title: "Invited operator",
    status: "pending",
    invitedAt: daysAgoIso(2),
    invitedBy: "Alex Rivera",
  },
  {
    id: "u-invite-hugo",
    name: "Hugo Sorensen",
    email: "hugo.sorensen@casinoroyale.com",
    initials: "HS",
    role: "marketing-manager",
    title: "Invited operator",
    status: "pending",
    invitedAt: daysAgoIso(5),
    invitedBy: "Maya Rodriguez",
  },
];

export function seedUsers(): ManagedUser[] {
  return MANAGED_USERS.map((u) => structuredClone(u));
}

/** The role → permission matrix, seeded from the shared RBAC map (mutable per session). */
export function seedRolePermissions(): RolePermissions[] {
  return (Object.keys(ROLE_PERMISSIONS) as Role[]).map((role) => ({
    role,
    permissions: [...ROLE_PERMISSIONS[role]],
  }));
}
