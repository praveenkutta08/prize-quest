import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ErrorState,
  PageHeader,
  Skeleton,
  StatusPill,
  toast,
  type StatusTone,
} from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { usePermission, useCurrentRole } from "./usePermission";
import { useGetRolesQuery, useUpdateRolePermissionsMutation } from "../api";
import type { Permission, Role, RolePermissions } from "../model";
import { ROLE_DESCRIPTION, ROLE_LABEL, roleTone } from "./labels";

const ROLES: Role[] = ["marketing-manager", "approver", "operations", "auditor", "admin"];

export function RolesMatrixPage() {
  const canManage = usePermission("users.manage");
  const currentRole = useCurrentRole();
  const roles = useGetRolesQuery();
  const [updatePermissions] = useUpdateRolePermissionsMutation();
  const [confirm, setConfirm] = useState<{ role: Role; permissions: Permission[] } | null>(null);

  const groups = useMemo(() => roles.data?.groups ?? [], [roles.data]);
  const totalPermissions = useMemo(
    () => groups.reduce((sum, g) => sum + g.permissions.length, 0),
    [groups],
  );
  const byRole = useMemo(() => {
    const map = new Map<Role, RolePermissions>();
    for (const r of roles.data?.roles ?? []) map.set(r.role, r);
    return map;
  }, [roles.data]);

  const has = (role: Role, key: Permission) => byRole.get(role)?.permissions.includes(key) ?? false;

  const applyToggle = async (role: Role, key: Permission, on: boolean) => {
    const current = byRole.get(role)?.permissions ?? [];
    const next = on ? [...current, key] : current.filter((p) => p !== key);
    try {
      await updatePermissions({ role, permissions: next }).unwrap();
      toast.success("Permissions updated", { description: ROLE_LABEL[role] });
    } catch {
      toast.error("Couldn't update permissions", { description: "Please try again." });
    }
  };

  const onToggle = (role: Role, key: Permission, on: boolean) => {
    // Guard: removing users.manage from the role you currently hold.
    if (!on && key === "users.manage" && role === currentRole) {
      const current = byRole.get(role)?.permissions ?? [];
      setConfirm({ role, permissions: current.filter((p) => p !== key) });
      return;
    }
    void applyToggle(role, key, on);
  };

  if (roles.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          breadcrumbs={[
            { label: "Admin" },
            { label: "Users & roles", href: "/users" },
            { label: "Roles & permissions" },
          ]}
          title="Roles & permissions"
        />
        <ErrorState onRetry={() => roles.refetch()} retrying={roles.isFetching} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Admin" },
          { label: "Users & roles", href: "/users" },
          { label: "Roles & permissions" },
        ]}
        title="Roles & permissions"
        subtitle="What each role can do across the console."
      />

      {/* Per-role summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {roles.isLoading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
          : ROLES.map((role) => {
              const c = byRole.get(role)?.permissions.length ?? 0;
              return (
                <div key={role} className="rounded-xl border border-hairline bg-surface-1 p-4">
                  <StatusPill tone={roleTone(role) as StatusTone}>{ROLE_LABEL[role]}</StatusPill>
                  <p className="mt-2 text-2xs text-text-tertiary">{ROLE_DESCRIPTION[role]}</p>
                  <p className="mt-3 font-mono text-xs text-text-secondary">
                    <span className="font-semibold tabular-nums text-text-primary">{c}</span> of{" "}
                    {totalPermissions}
                  </p>
                </div>
              );
            })}
      </div>

      {/* Legend */}
      <div className="flex items-start gap-2.5 rounded-lg border border-info/25 bg-info-soft/40 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-info" />
        <p className="text-xs text-text-secondary">
          These toggles gate <strong className="text-text-primary">UI affordances only</strong> —
          they're read by <code className="font-mono text-2xs">usePermission()</code> and are{" "}
          <strong className="text-text-primary">not backend security</strong>. Mock-only, for this
          session.
        </p>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto rounded-xl border border-hairline bg-surface-1">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-hairline">
              <th className="w-[280px] px-5 py-3 text-left text-2xs uppercase tracking-wide text-text-tertiary">
                Permission
              </th>
              {ROLES.map((role) => (
                <th
                  key={role}
                  className="px-3 py-3 text-center text-2xs font-semibold uppercase tracking-wide text-text-secondary"
                >
                  {ROLE_LABEL[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.isLoading ? (
              <tr>
                <td colSpan={ROLES.length + 1} className="p-5">
                  <Skeleton className="h-40 w-full" />
                </td>
              </tr>
            ) : (
              groups.map((group) => (
                <GroupRows
                  key={group.label}
                  label={group.label}
                  permissions={group.permissions}
                  roles={ROLES}
                  has={has}
                  canManage={canManage}
                  onToggle={onToggle}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(confirm)} onOpenChange={(v) => !v && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lock yourself out?</DialogTitle>
            <DialogDescription>
              You currently hold this role. Removing “Manage users” may lock you out of user
              management. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm) void applyToggle(confirm.role, "users.manage", false);
                setConfirm(null);
              }}
            >
              Remove anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GroupRows({
  label,
  permissions,
  roles,
  has,
  canManage,
  onToggle,
}: {
  label: string;
  permissions: { key: Permission; label: string }[];
  roles: Role[];
  has: (role: Role, key: Permission) => boolean;
  canManage: boolean;
  onToggle: (role: Role, key: Permission, on: boolean) => void;
}) {
  return (
    <>
      <tr className="bg-surface-sunken/60">
        <td
          colSpan={roles.length + 1}
          className="px-5 py-2 text-2xs font-semibold uppercase tracking-wide text-text-tertiary"
        >
          {label}
        </td>
      </tr>
      {permissions.map((perm) => (
        <tr key={perm.key} className="border-b border-hairline/60 last:border-0">
          <td className="px-5 py-2.5">
            <p className="text-sm text-text-secondary">{perm.label}</p>
            <p className="font-mono text-2xs text-text-tertiary">{perm.key}</p>
          </td>
          {roles.map((role) => {
            const on = has(role, perm.key);
            return (
              <td key={role} className={cn("px-3 py-2.5 text-center")}>
                <span className="inline-flex">
                  <Checkbox
                    checked={on}
                    disabled={!canManage}
                    onCheckedChange={(v) => onToggle(role, perm.key, v === true)}
                    aria-label={`${perm.label} for ${ROLE_LABEL[role]}`}
                  />
                </span>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
