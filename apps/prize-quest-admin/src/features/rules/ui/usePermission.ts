import { useAppSelector } from "@/app/hooks";
import type { Permission } from "@/shared/contracts";

/**
 * UI-only RBAC check, read from the session slice. Feature-local (FSD forbids a
 * feature importing platform/auth). Rules gate creation on `rule.create` and
 * status changes on `rule.toggle`. Never real security.
 */
export function usePermission(key: Permission): boolean {
  return useAppSelector((s) => s.auth.session?.permissions.includes(key) ?? false);
}
