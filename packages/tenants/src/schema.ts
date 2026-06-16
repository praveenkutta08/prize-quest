// packages/tenants/src/schema.ts
//
// Re-export of the tenant contract from @pq/contracts.
//
// The canonical source of truth for `TenantConfig` and `TokenOverrides`
// lives in @pq/contracts/src/tenant.ts — extracted to break the
// @pq/tokens ↔ @pq/tenants workspace cycle. Keeping this re-export here
// means existing consumers (`import { TenantConfig } from '@pq/tenants'`
// and `import ... from '@pq/tenants/schema'`) keep working unchanged.

export type { TenantConfig, TokenOverrides } from "@pq/contracts";
