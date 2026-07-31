# Deploying Prize Quest apps to Vercel

How to ship `apps/ttd-synkros` and `apps/kiosk-arcade` to production.

**Repo:** `C:\Users\prave\Documents\HH\prize-quest` → [`praveenkutta08/prize-quest`](https://github.com/praveenkutta08/prize-quest) · branch `main`

**Production URLs:**

- 📺 TTD / iVIEW: `https://prize-quest-ttd-synkros.vercel.app`
- 🎰 Kiosk arcade: `https://kiosk-arcade-praveenkumar-n-projects.vercel.app`

**How it works:** both apps are Vite SPAs inside one pnpm monorepo, deployed as **two separate Vercel projects** that share the same repo and the same Root Directory (`.`). Each project builds only its own app via a `--filter` in its Build Command. Push to `main` → both redeploy.

> **Historical note.** This repo used to deploy via the Vercel CLI with a `.vercel/` ↔ `.vercel-<other>/` folder-swap, because one local `.vercel/` link can only point at one project at a time. That workaround is obsolete now the repo is on GitHub — the dashboard holds the link, so there is nothing to swap. `.vercel/` is gitignored and does not need to exist. See [CLI deploys](#appendix--cli-deploys-optional) if you still want ad-hoc preview deploys.

---

## Running the apps locally

From the repo root:

```powershell
corepack pnpm --filter @pq/ttd-synkros dev     # TTD / iVIEW  → http://localhost:5175
corepack pnpm --filter @pq/kiosk-arcade dev    # Kiosk arcade
corepack pnpm --filter @pq/playground dev      # Widget playground
```

---

## Step 1 · Connect each Vercel project to GitHub (one-time)

For **each** of the two projects, in the Vercel dashboard:

1. Project → **Settings → Git** → Connect Git Repository → `praveenkutta08/prize-quest`
2. Production Branch: `main`
3. Project → **Settings → Build & Development Settings**:

| Setting          | TTD project                                                             | Kiosk project                                                            |
| ---------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Root Directory   | `.`                                                                     | `.`                                                                      |
| Install Command  | `pnpm install --frozen-lockfile`                                        | `pnpm install --frozen-lockfile`                                         |
| Build Command    | `pnpm install --frozen-lockfile && pnpm --filter @pq/ttd-synkros build` | `pnpm install --frozen-lockfile && pnpm --filter @pq/kiosk-arcade build` |
| Output Directory | `apps/ttd-synkros/dist`                                                 | `apps/kiosk-arcade/dist`                                                 |

Root Directory stays at the **monorepo root**, not the app folder — pnpm needs the workspace root to resolve the `@pq/*` workspace dependencies.

Once connected, delete any leftover `.vercel/` or `.vercel-*` folders. They are no longer used.

---

## Step 2 · Deploy

```powershell
git add .
git commit -m "…"
git push origin main
```

Both projects build in parallel. Watch progress in the Vercel dashboard → Deployments.

---

## Step 3 · Verify in incognito

Use a private window (not logged into Vercel — this also verifies public access).

**TTD / iVIEW:**

| URL                     | Expect                                  |
| ----------------------- | --------------------------------------- |
| `/`                     | Campaign list (Tier Rewards Promotions) |
| `/attract`              | Attract marquee — casino branding       |
| `/hub`                  | 3-tile hub — casino header, vendor tile |
| `/orders`               | Order history                           |
| `/?tenant=resort-style` | Same app, Resort Rewards palette        |

**Kiosk arcade:**

| URL                                | Expect         |
| ---------------------------------- | -------------- |
| `/`                                | Campaign list  |
| `/attract?channel=kiosk-landscape` | Attract screen |
| `/hub`                             | Account hub    |
| `/campaigns`                       | Campaign list  |

**Refresh every page you open.** It must stay on the same screen. A 404 on refresh means the SPA rewrites aren't applied — see prerequisite 3 below.

---

## Monorepo prerequisites — the three things that break the build

These are failure modes this repo has actually hit. Check them before blaming Vercel.

### 1. `pnpm-lock.yaml` must be in sync with **every** workspace package

Vercel installs with `--frozen-lockfile`, which refuses to update the lockfile. Any workspace `package.json` the lockfile doesn't match fails the whole install:

```
ERR_PNPM_OUTDATED_LOCKFILE
Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with
<ROOT>/apps/<something>/package.json
```

Fix: run `pnpm install` locally, then **commit the regenerated `pnpm-lock.yaml`**. You can reproduce a CI install locally at any time with:

```powershell
corepack pnpm install --frozen-lockfile
```

### 2. Two packages must never share a name

`apps/ttd-synkros copy/package.json` declares `"name": "@pq/ttd-synkros"` — identical to the real app. While it was part of the workspace, `pnpm --filter @pq/ttd-synkros build` matched **both** directories and built both on every deploy:

```
$ pnpm --filter @pq/ttd-synkros exec pwd
…/apps/ttd-synkros
…/apps/ttd-synkros copy
```

The right artifact still shipped (Output Directory pins `apps/ttd-synkros/dist`), but a stale snapshot was being compiled on every production deploy — and the day it stops compiling, it takes the deploy down with it.

Fixed by excluding it from the workspace in `pnpm-workspace.yaml`, which keeps the folder in git while removing it from install / build / lint / typecheck:

```yaml
packages:
  - "packages/*"
  - "packages/widgets/*"
  - "apps/*"
  - "!apps/ttd-synkros copy"
```

**If you add another snapshot or scratch copy of an app, exclude it the same way** — or give it a distinct `name` in its `package.json`.

A folder with no `package.json` at all — like `apps/prize-quest-admin` currently — is invisible to pnpm and needs no exclusion.

### 3. `vercel.json` SPA rewrites must exist at the repo root

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Without it, `/attract`, `/hub` and `/campaign/…` return 404 — Vercel looks for a literal file at that path, while the Vite client router needs `index.html` served instead. Vercel caches `vercel.json`, so after editing it force a clean build (`vercel --prod --force`, or redeploy from the dashboard with build cache disabled).

---

## Troubleshooting

**`ERR_PNPM_OUTDATED_LOCKFILE`** → prerequisite 1. Run `pnpm install`, commit the lockfile.

**`EUNSUPPORTEDPROTOCOL workspace:*`** → Vercel is using npm, not pnpm. Set the Install Command to `pnpm install --frozen-lockfile`.

**Build succeeds but URLs 404** → prerequisite 3. Confirm `vercel.json` is at the repo root, then force a fresh build.

**Incognito asks for a login** → Deployment Protection is on. Project → Settings → **Deployment Protection** → Disabled, or "Only Preview Deployments".

**URLs work but show an old version** → hard refresh (`Ctrl+Shift+R`). If it persists, check Deployments and confirm the latest build carries the **Production** badge; if not, ⋯ → Promote to Production.

**The wrong app deployed** → check that project's Build Command `--filter` and Output Directory against the table in Step 1. Under the GitHub flow the two projects are independent, so there is no shared local link to get wrong.

**Deploy didn't trigger on push** → Settings → Git: confirm the repo is connected and Production Branch is `main`.

---

## Sharing demo URLs

```
📺 TTD demo:          https://prize-quest-ttd-synkros.vercel.app
🎰 Kiosk arcade demo: https://kiosk-arcade-praveenkumar-n-projects.vercel.app
```

Optional deep links for a specific tenant or starting screen:

- Attract screen: `…vercel.app/attract`
- Order history: `…vercel.app/orders`
- Resort Rewards palette: `…vercel.app/?tenant=resort-style`
- Station Arcade palette: `…vercel.app/?tenant=station-arcade`
- Kiosk portrait: `…vercel.app/?channel=kiosk-portrait`

Tenant ids: `tier-rewards` (Casino Luxe — the default), `resort-style`, `station-arcade`, `velvet-style`, `emerald-style`. The TTD form factor (Konami 480×234 / L&W iView 640×240) is chosen in the on-screen dev bar, not by URL.

---

## Appendix · CLI deploys (optional)

Only needed for ad-hoc preview deploys outside the GitHub flow.

```powershell
cd C:\Users\prave\Documents\HH\prize-quest
vercel link          # recreates .vercel/ for ONE project
vercel               # preview deploy
vercel --prod        # production deploy
```

`.vercel/` is gitignored, holds the link for a single project, and does not survive moving or re-cloning the repo — which is why `ls .vercel*` returns nothing in a fresh checkout. If you need CLI access to both projects from one working copy you are back to the folder-swap problem; prefer pushing to `main` instead.
