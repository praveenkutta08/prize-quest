# Claude Code — Test Prompts for the PrizeQuest Alignment Changes

Run these in order from inside the `prize-quest/` folder. Each is a copy-paste
prompt for Claude Code. Stop and report if a step fails before moving on.

Context for Claude Code (what changed): widgets were renamed `pq-*` → `@pq/pq-*`;
added Turborepo (`turbo.json`), Prettier, Husky + lint-staged, CI
(`.github/workflows/ci.yml`), and two new shared packages `@pq/tsconfig` and
`@pq/eslint-config`. Custom-element tags (`<pq-…>`, `customElements.define("pq-…")`)
were intentionally left unscoped.

---

## 1. Install & relink (must pass first)

```
We just renamed all widget packages from `pq-*` to `@pq/pq-*` and added new shared
packages `@pq/tsconfig` and `@pq/eslint-config`, plus Turborepo. Run `pnpm install`
to relink the workspace. Then show me the install summary and confirm that
node_modules/.pnpm contains the new `@pq/pq-*` packages and that there are no
unmet workspace dependencies or peer warnings I should worry about.
```

## 2. Typecheck, lint, build, test

```
Run, in order: `pnpm typecheck`, `pnpm lint`, `pnpm build`, then `pnpm test`.
For each, report pass/fail and paste any errors. Do NOT fix anything yet — just
give me the full picture first. I especially want to know if any failure is caused
by the `pq-*` → `@pq/pq-*` rename versus pre-existing issues.
```

## 3. Confirm the rename was surgical (tags untouched)

```
Verify the widget rename only touched package names and import specifiers, not the
runtime custom elements. Confirm: (a) every package under packages/widgets is named
`@pq/pq-*`, (b) there are no remaining unscoped `pq-*` workspace deps or
`import`/`from "pq-*"` specifiers anywhere, and (c) every `customElements.define(...)`
and HTML template tag still uses the unscoped `pq-*` tag. Report counts for each.
```

## 4. Turbo, Prettier, ESLint boundaries actually work

```
Sanity-check the new tooling: run `pnpm exec turbo run build --dry=json` and confirm
the task graph resolves with caching. Run `pnpm format:check` and report violations.
Then confirm `@pq/eslint-config` is the active config by running `pnpm lint` on one
widget and showing me which rules fire — I want to see whether `import/no-cycle` or
`no-restricted-imports` report anything.
```

## 5. Storybook & the apps still run

```
Start Storybook with `pnpm storybook` and tell me if it boots without errors (then
stop it). Then run `pnpm dev` (playground) and `pnpm dev:luminara` one at a time and
confirm each dev server starts and renders without console errors related to missing
`pq-*` / `@pq/pq-*` modules.
```

## 6. Initialise git so Husky activates

```
This folder has no git repo yet. Initialise one, add a sensible first commit of the
current state, and verify the Husky pre-commit hook is installed and runs
`lint-staged` on a staged change. Confirm `.husky/pre-commit` fires by making a
trivial formatting change to one .ts file and committing it.
```

## 7. If anything broke — clean rollback of the rename only

```
If the `pq-*` → `@pq/pq-*` rename caused failures we can't quickly fix, run
`node tooling/scope-widgets.mjs --revert` to undo just the rename, then
`pnpm install` again, and re-run typecheck/build to confirm we're back to green.
Leave the other changes (Turbo, Prettier, Husky, CI, shared configs) in place.
```

---

### What "green" looks like
- `pnpm install` completes with no unmet workspace deps.
- `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test` all pass.
- Zero unscoped `pq-*` package names / deps / import specifiers.
- All `customElements.define("pq-…")` tags still unscoped.
- Storybook + both dev servers boot clean.
