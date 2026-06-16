# PrizeQuest — Architecture Alignment Changes

Applied to bring PrizeQuest's *conventions* in line with the CDP-UI standard.
None of these change the Lit / Web-Components model or the per-widget packaging.

## What changed

**1. Turborepo**
- Added `turbo.json` (build / typecheck / lint / test / dev with `^build` ordering + output caching).
- Root scripts now run through Turbo: `build`, `test`, `typecheck` → `turbo run …`.

**2. Prettier + Husky + lint-staged**
- Added `.prettierrc.json`, `.prettierignore`.
- Added `format` / `format:check` scripts.
- Added `lint-staged` config + `.husky/pre-commit` (runs `lint-staged`).
- Added `prepare: "husky || true"` (no-ops safely if git isn't initialized).

**3. Shared config as packages** (mirrors `@platform/*`)
- New `packages/tsconfig` → `@pq/tsconfig` (holds `base.json`).
  Root `tsconfig.base.json` now `extends "@pq/tsconfig/base.json"`; per-widget
  tsconfigs are unchanged (they still extend the root base, inheriting transitively).
- New `packages/eslint-config` → `@pq/eslint-config` (flat config + **import-boundary**
  rules: `import/no-cycle` as warn, and a `no-restricted-imports` rule banning deep
  imports into `@pq/*/src/*`). Root `eslint.config.mjs` now delegates to it.

**4. CI**
- Added `.github/workflows/ci.yml`: install → format:check → lint → typecheck → test → build.

**5. Consistent package scoping**
- All 25 widget packages renamed `pq-*` → `@pq/pq-*` (matches `@pq/tokens`, `@pq/store`, …).
- Updated every cross-package `workspace:*` dependency key and every `import`/`from`
  module specifier.
- **Custom-element tags are unchanged** — `<pq-campaign-card>`, `customElements.define("pq-…")`,
  CSS vars (`--pq-…`) and event names (`pq-card-click`) all stay as-is. Only the *package
  name* changed, not the runtime tag.
- This was done by `tooling/scope-widgets.mjs` (idempotent; `--dry` to preview, `--revert` to undo).

## Required next step (must run on a machine with pnpm)

The sandbox here can't run pnpm, so dependencies were **not** re-linked. Run once:

```bash
cd prize-quest
pnpm install          # relinks renamed widgets + new @pq/tsconfig & @pq/eslint-config
pnpm typecheck
pnpm lint
pnpm build
```

## Recommended

- **Initialise git** in `prize-quest/` (it currently has no repo): `git init && git add -A && git commit -m "align tooling with CDP-UI"`. This also activates the Husky hook.
- Once the codebase is clean, promote `import/no-cycle` from `warn` to `error` in
  `packages/eslint-config/index.mjs`.
- Consider an ADR log under `docs/architecture/adr/` (port the decisions already in
  `repo-structure.md`).
