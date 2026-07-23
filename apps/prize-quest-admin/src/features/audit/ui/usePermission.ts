import { useAppSelector } from "@/app/hooks";
import type { Permission } from "@/shared/contracts";

/** UI-only RBAC check (feature-local, mirrors platform usePermission). */
export function usePermission(key: Permission): boolean {
  return useAppSelector((s) => s.auth.session?.permissions.includes(key) ?? false);
}
