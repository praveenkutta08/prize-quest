import type { Session } from "@/shared/contracts";
import { TENANTS } from "./seed/tenant";

/**
 * In-memory, session-persistent mock store. Mutable so future create/edit/toggle
 * mutations (Sessions 2–3) stick until reload. This session persists the auth
 * session and serves tenant context; dashboard data is derived from seed builders.
 */
export const db = {
  tenants: TENANTS,
  session: null as Session | null,
};

export type MockDb = typeof db;
