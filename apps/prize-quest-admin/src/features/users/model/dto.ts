import { z } from "zod";
import { OperatorUser, Permission, Role } from "@/shared/contracts";

/**
 * Users & Roles domain contracts (app-local, Zod-first). REUSES `Role`,
 * `Permission`, `OperatorUser`, and `RoleInfo` from `shared/contracts/session.ts`
 * — do not redefine them. Tenant-scoped: no property dimension.
 */

export { Role, Permission };

export const UserStatus = z.enum(["active", "inactive", "pending"]);
export type UserStatus = z.infer<typeof UserStatus>;

export const ManagedUser = OperatorUser.extend({
  status: UserStatus,
  lastActiveAt: z.string().optional(),
  invitedAt: z.string().optional(),
  invitedBy: z.string().optional(),
});
export type ManagedUser = z.infer<typeof ManagedUser>;

export const UserInvite = z.object({
  email: z.string().email("Enter a valid email"),
  role: Role,
});
export type UserInvite = z.infer<typeof UserInvite>;

export const UserUpdate = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  role: Role,
});
export type UserUpdate = z.infer<typeof UserUpdate>;

/** One row per role — the permission matrix source. */
export const RolePermissions = z.object({
  role: Role,
  permissions: z.array(Permission),
});
export type RolePermissions = z.infer<typeof RolePermissions>;

export const PermissionGroup = z.object({
  label: z.string(),
  permissions: z.array(z.object({ key: Permission, label: z.string() })),
});
export type PermissionGroup = z.infer<typeof PermissionGroup>;

// ── List response ─────────────────────────────────────────────────────────────

export const UserStatusCounts = z.object({
  all: z.number(),
  active: z.number(),
  pending: z.number(),
  admins: z.number(),
});
export type UserStatusCounts = z.infer<typeof UserStatusCounts>;

export const UserListResponse = z.object({
  rows: z.array(ManagedUser),
  total: z.number(),
  counts: UserStatusCounts,
});
export type UserListResponse = z.infer<typeof UserListResponse>;

export const RolesResponse = z.object({
  roles: z.array(RolePermissions),
  groups: z.array(PermissionGroup),
});
export type RolesResponse = z.infer<typeof RolesResponse>;
