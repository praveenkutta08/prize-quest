import { useAppSelector } from "@/app/hooks";
import type { Permission } from "@/shared/contracts";

/**
 * UI-only RBAC. Gate affordances with this — it reflects the mock session's
 * permissions and never implies real backend security.
 */
export function usePermission(key: Permission): boolean {
  return useAppSelector((s) => s.auth.session?.permissions.includes(key) ?? false);
}
