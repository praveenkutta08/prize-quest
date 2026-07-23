# Deploying Prize Quest apps to Vercel

Reference guide for redeploying `apps/kiosk-arcade` and `apps/ttd-synkros` to production via Vercel CLI.

**Production URLs:**

- 🎰 Kiosk arcade: `https://kiosk-arcade-praveenkumar-n-projects.vercel.app`
- 📺 TTD: `https://prize-quest-ttd-synkros.vercel.app`

**Architecture context:** Both apps are pnpm-monorepo Vite SPAs deployed as two separate Vercel projects, both linked from the monorepo root (`prize-quest/`). Because both projects share the same Root Directory, the local `.vercel/` link can only point at one at a time → folder-swap pattern is used to switch.

---

## Running the apps locally

Run any app's dev server from the monorepo root:

```powershell
# Luminara web
corepack pnpm --filter @pq/luminara-web dev

# TTD synkros
corepack pnpm --filter @pq/ttd-synkros dev

# Kiosk arcade
corepack pnpm --filter @pq/kiosk-arcade dev

# Playground
corepack pnpm --filter @pq/playground dev
```

---

## Prerequisites (one-time setup, do not skip)

These must exist in the monorepo root or the deploy will fail:

| File                              | Purpose                                      |
| --------------------------------- | -------------------------------------------- |
| `pnpm-lock.yaml`                  | Required by `pnpm install --frozen-lockfile` |
| `pnpm-workspace.yaml`             | Tells pnpm this is a workspace               |
| `vercel.json` (see below)         | SPA rewrites so deep links work              |
| `.vercel/` and `.vercel-<other>/` | The two project links (folder-swap pattern)  |

**Vercel.json content** (must be at monorepo root):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Without this, hitting URLs like `/attract` or `/hub` returns 404 (Vercel looks for a literal file at that path; Vite client router needs `index.html` served instead).

---

## Step 1 · Open terminal at the monorepo root

```powershell
cd C:\Users\prave\Documents\HH\PrizeQuest\prize-quest
```

All commands below run from here.

---

## Step 2 · Check which Vercel project is currently linked

```powershell
ls .vercel*
```

You'll see one of these patterns:

| Output                        | Currently linked to | Stashed      |
| ----------------------------- | ------------------- | ------------ |
| `.vercel/` + `.vercel-kiosk/` | **ttd-synkros**     | kiosk-arcade |
| `.vercel/` + `.vercel-ttd/`   | **kiosk-arcade**    | ttd-synkros  |

The active `.vercel/` folder = the project that'll deploy next.

---

## Step 3 · Deploy the currently-linked app

```powershell
vercel --prod
```

Wait ~1-2 min for build. Success looks like:

```
✅  Production: https://<project-name>.vercel.app
```

If build fails: check `Step 7 · Troubleshooting` below.

---

## Step 4 · Swap and deploy the other app

**If `.vercel/` was ttd-synkros** (and you have `.vercel-kiosk/`):

```powershell
Rename-Item .vercel .vercel-ttd
Rename-Item .vercel-kiosk .vercel
vercel --prod
```

**If `.vercel/` was kiosk-arcade** (and you have `.vercel-ttd/`):

```powershell
Rename-Item .vercel .vercel-kiosk
Rename-Item .vercel-ttd .vercel
vercel --prod
```

Wait for build. Second production URL appears.

---

## Step 5 · Verify in incognito

Open these URLs in an incognito/private window (NOT logged into Vercel — verifies public access):

**TTD synkros:**

- `https://prize-quest-ttd-synkros.vercel.app`
- `https://prize-quest-ttd-synkros.vercel.app/attract?channel=ttd`
- `https://prize-quest-ttd-synkros.vercel.app/hub?channel=ttd`
- `https://prize-quest-ttd-synkros.vercel.app/campaigns`

**Kiosk arcade:**

- `https://kiosk-arcade-praveenkumar-n-projects.vercel.app`
- `https://kiosk-arcade-praveenkumar-n-projects.vercel.app/attract?channel=kiosk-landscape`
- `https://kiosk-arcade-praveenkumar-n-projects.vercel.app/hub`
- `https://kiosk-arcade-praveenkumar-n-projects.vercel.app/campaigns`

Each URL should load the app at the correct screen. **Refresh each page** — it should stay on the same screen (not redirect to attract). If refresh → 404, the `vercel.json` rewrites are missing or the deploy didn't pick them up. Re-check Prerequisites.

---

## Step 6 · Restore folder-swap state (optional)

After both deploys, you have one `.vercel/` (active) + one `.vercel-<other>/` (stashed). For the next deploy, swap to whichever app you want to redeploy.

If you want a stable "default" — leave `.vercel/` pointing at whichever app you deploy most often.

---

## Step 7 · Troubleshooting

### Build fails: "Headless installation requires a pnpm-lock.yaml file"

The lockfile isn't in the uploaded deployment files. Confirm:

```powershell
cat pnpm-lock.yaml
```

If missing, regenerate:

```powershell
pnpm install
```

Then re-run `vercel --prod`.

### Build fails: "EUNSUPPORTEDPROTOCOL workspace:\*"

Vercel is using `npm` instead of `pnpm`. Check the project's Install Command in dashboard:

- Vercel dashboard → project → Settings → General → Build & Development Settings
- Install Command should be: `pnpm install --frozen-lockfile`
- Build Command should be: `pnpm install --frozen-lockfile && pnpm --filter @pq/<app-name> build`
- Output Directory should be: `apps/<app-name>/dist`
- Root Directory (separate section below): `.` (monorepo root)

### Deploy succeeds but URLs return 404

SPA rewrites missing. Check `vercel.json` exists at monorepo root with the rewrites content from Prerequisites. Then redeploy.

### Deploy succeeds but incognito asks for login

Vercel Deployment Protection is enabled on production. Disable:

- Vercel dashboard → project → Settings → **Deployment Protection** (or "Vercel Authentication")
- Set to "Disabled" OR "Only Preview Deployments"
- Save

### URLs work but show old version

Hard refresh: `Ctrl+Shift+R`. Vercel auto-invalidates cache on new deployments but browser may cache. If problem persists after hard refresh, check:

- Vercel dashboard → Deployments → confirm the latest one has the "Production" badge
- If not, the latest deploy wasn't promoted to production. Click ⋯ on it → "Promote to Production"

### Wrong app deployed (deployed kiosk but expected ttd, or vice versa)

You ran `vercel --prod` against the wrong `.vercel/` link. Check Step 2's output again, swap correctly, redeploy.

### vercel.json edits not taking effect

Vercel doesn't apply `vercel.json` changes via existing cache. Force a fresh build:

```powershell
vercel --prod --force
```

---

## Sharing demo URLs with CEO / customers

After verifying in incognito, send these clean URLs:

```
🎰 Kiosk arcade demo:
https://kiosk-arcade-praveenkumar-n-projects.vercel.app

📺 TTD demo:
https://prize-quest-ttd-synkros.vercel.app
```

Optional deep links (force a specific form factor or starting screen):

- Kiosk portrait: `...vercel.app?channel=kiosk-portrait`
- TTD with attract: `...vercel.app/attract?channel=ttd`
- Direct to Order History: `...vercel.app/order-history`

---

## Long-term · stop using folder-swap

The folder-swap pattern is a workaround for CLI deploys with two projects sharing a monorepo root. Cleaner solution:

1. Push the repo to GitHub
2. In Vercel dashboard, link each project to the GitHub repo:
   - Project → Settings → Git → Connect Git Repository
   - Set Production Branch = `main`
3. Both projects auto-deploy on `git push origin main`
4. Delete the `.vercel-*` folders — no more folder swap needed

Each Vercel project pulls from the same GitHub repo but builds its own app via its configured Build Command. Push once, both apps redeploy. The CLI is only needed for ad-hoc preview deploys after that.
