import { useAppSelector } from "@/app/hooks";
import type { Permission } from "@/shared/contracts";

/**
 * UI-only RBAC check, read straight from the session slice in the store.
 * Feature-local (FSD forbids a feature importing platform/auth) but equivalent
 * to the platform `usePermission`. Never real security — gates affordances only.
 */
export function usePermission(key: Permission): boolean {
  return useAppSelector((s) => s.auth.session?.permissions.includes(key) ?? false);
}
