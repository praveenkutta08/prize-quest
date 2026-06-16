# Prize Quest — Patron Module

Multi-tenant, server-driven patron module (casino loyalty / prize redemption) rendered
across many surfaces (TTDs, EGM main screens, kiosks, mobile webviews, web portal).

## Architecture (locked)

- **Lit 3 + TypeScript** Web Components (Custom Elements + Shadow DOM), prefix `pq-`
- **Vite** + `@vitejs/plugin-legacy` (Chromium 60 floor for embedded EGM browsers)
- **pnpm** workspaces monorepo
- **Nanostores** for shared, tenant-namespaced state
- **Storybook** (`@storybook/web-components-vite`) for widget development
- Runtime multi-tenancy: a `tenantId` resolves tokens + config

See [`../repo-structure.md`](../repo-structure.md) for the full architecture, directory
tree, and the `TenantConfig` contract.

## Workspace layout

```
packages/
  tokens/       @pq/tokens      design tokens → CSS custom properties
  tenants/      @pq/tenants     TenantConfig schema + tenant loading
  store/        @pq/store       nanostores shared state
  mock-data/    @pq/mock-data   fake backend (latency + error rates)
  widgets/      one package per pq-* widget (none yet)
apps/
  playground/   @pq/playground  dev harness (tenant / channel switcher)
```

## Prerequisites

- **Node ≥ 20.19**
- **pnpm 11** — provisioned via **Corepack** (bundled with Node). If `pnpm` isn't on your
  PATH, prefix commands with `corepack` (e.g. `corepack pnpm install`) or run
  `corepack enable pnpm` once.

## Quick start

```sh
corepack pnpm install     # install all workspace dependencies
pnpm typecheck            # type-check every package (tsc --noEmit, recursive)
pnpm lint                 # ESLint across the workspace
pnpm storybook            # Storybook dev server → http://localhost:6006
pnpm dev                  # playground dev server (Vite)
pnpm build                # build all packages that define a build script
```

> **Build scripts:** pnpm gates dependency build scripts. Approvals live in
> [`pnpm-workspace.yaml`](pnpm-workspace.yaml) (`esbuild` is built; `core-js`'s postinstall
> notice is skipped). Leave that block in place or install will re-prompt.

## Status

Build-sequence **step 1 (scaffold)** is complete — no widgets, token logic, or tenant
configs yet. Next: `@pq/tokens` `applyTokens()` + sample tenant configs, then the first
widget `<pq-progress-bar>`.
