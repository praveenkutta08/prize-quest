# CLAUDE.md — Prize Quest Operator Console (admin)

Governs the **admin** app at `apps/prize-quest-admin` (package `@pq/admin`). The player packages/apps in this monorepo are **out of scope — do not modify them.**

## What this is

Internal operator console for casino marketing staff. React SPA, **desktop-only**, **mock data only** (MSW). Part of the Prize Quest product but a **separate app** from the LIT `pq-*` player widgets.

## Where things live (two folders — don't confuse them)

- **This repo (code):** `C:\Users\prave\Documents\HH\prize-quest` — a **pnpm + Turborepo** monorepo. Top level: `apps/`, `packages/`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`. Run Claude Code from here (in VS Code: open this as the **primary** workspace folder; attach the docs folder via **File → Add Folder to Workspace** — the extension has no `--add-dir`).
- **This app:** `apps/prize-quest-admin` (package name `@pq/admin`).
- **Spec docs (separate sibling folder, added via `--add-dir`):** `C:\Users\prave\Documents\HH\PrizeQuest` — the plan (`ADMIN_UI_IMPLEMENTATION_PLAN.md`), the session prompts (`claude-code-prompts-admin-session-*.md`), and `admin-app.html`.
- Player source consulted **for shape parity only**: `packages/contracts`, `packages/mock-data` **in this repo** (not a nested `prize-quest/` folder).
- When a spec doc writes a `prize-quest/…` path, it means **this repo root** (e.g. `prize-quest/packages/contracts` = `<repo>/packages/contracts`). Don't double-nest.

## Stack (locked — do not substitute)

React 19 · Vite (its **own** config, **no** `@vitejs/plugin-legacy`) · TS strict · Redux Toolkit + **RTK Query** · React Router v6 · React Hook Form + **Zod** · Tailwind + **shadcn/ui** (Radix) · TanStack Table · Recharts · **MSW** · Vitest + Testing Library.

## Monorepo integration

Register `@pq/admin` in `pnpm-workspace.yaml` (`apps/*` is likely already globbed) and in `turbo.json` (`build`/`lint`/`typecheck`/`test`). Extend `tsconfig.base.json`. Inherit root Prettier + Husky. Give the app its **own** React-oriented ESLint config (with import-boundary rules) — do **not** inherit the LIT/legacy player config. Dev: `pnpm --filter @pq/admin dev`.

## Hard rules (do not violate)

- **UI only, mock data only.** Every network call goes through MSW; no real backend/auth/SSO.
- **World-class design, from scratch.** `admin-app.html` is a _scope_ reference, NOT a visual spec — do not copy its look. No stock/unstyled shadcn. No Inter/Roboto/system-default fonts. Follow the **DESIGN MANDATE** in the active session prompt; establish a documented token system at a `/design-system` route.
- **Tokens, not hex.** All styling flows through design-system tokens (one source of truth). No raw hex in feature code.
- **Feature-Sliced Design.** Imports flow `app → platform → features → shared`. No cross-feature imports except via `shared`. No cycles. Enforce with ESLint.
- **Contracts are app-local (Zod-first).** Do **not** extend or depend on `@pq/contracts` (it's a player-side cycle-breaker full of `--pq-*`/theme render types); consult it for shape parity only. Do **not** stand up a shared package.
- **Property scoping is real.** Active `propertyId` lives in the scope slice + `X-Property-Id` request header; MSW filters by it. Never thread `propertyId` through components.
- **Don't touch** player widgets/apps/LIT packages. **NEVER** touch or import **CDP-UI** (a separate, unrelated application).
- **Desktop-first** (1280–1680 px; degrade to ≥1024). No kiosk/EGM/mobile concerns.

## Build cadence

Follow the **active session prompt** exactly (currently **Session 1** — scaffold + design system + shell + login + dashboard). Pause at its **CHECKPOINT**. `git commit` after each phase for clean rollback points.
