import { useAppSelector } from "@/app/hooks";
import type { Permission } from "@/shared/contracts";

/** UI-only RBAC check (feature-local, mirrors platform usePermission). */
export function usePermission(key: Permission): boolean {
  return useAppSelector((s) => s.auth.session?.permissions.includes(key) ?? false);
}

/** The current operator's id (for the self-lockout guard). */
export function useCurrentOperatorId(): string | undefined {
  return useAppSelector((s) => s.auth.session?.user.id);
}

/** The current operator's role. */
export function useCurrentRole() {
  return useAppSelector((s) => s.auth.session?.role);
}
