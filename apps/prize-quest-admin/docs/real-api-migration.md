# Real-API migration guide

How to take the Prize Quest operator console (`@pq/admin`) from its MSW mock backend to a
real REST API. The app was built **swap-ready**: components never touch mock data — they read
through RTK Query hooks that call real `/api/*` paths, which MSW happens to intercept in
dev/demo. Going live is mostly _deleting_ the mock layer and pointing the base URL at a server.

---

## 1 · The one-line switch

The data layer is [`src/shared/lib/baseApi.ts`](../src/shared/lib/baseApi.ts):

```ts
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api", // ← point at the backend (env-driven, see §7)
  prepareHeaders: (headers, { getState }) => {
    const pid = getState().scope?.activePropertyId;
    if (pid) headers.set("X-Property-Id", pid); // property scoping — keep this
    return headers;
  },
});
```

To go live:

1. **Stop starting the worker.** In [`src/main.tsx`](../src/main.tsx), `startMockBackend()` only
   runs when `VITE_MOCK === "1"`. Set `VITE_MOCK=0` (or delete the branch) and the app makes real
   network calls. No component changes.
2. **Set the base URL.** Either serve the API under the same origin at `/api` (simplest — the
   relative `baseUrl` just works behind a reverse proxy) or make `baseUrl` read
   `import.meta.env.VITE_API_BASE_URL` for a cross-origin backend (add CORS + credentials then).
3. **Wire real auth** (see §5) — replace the in-memory mock session with your token/cookie flow.

Everything else in this document is about matching the **contract** the UI already expects.

---

## 2 · Cross-cutting response conventions

MSW's handlers ([`src/mocks/handlers/`](../src/mocks/handlers/)) are the executable spec for what
the backend must return. The shared conventions the UI depends on:

### Property scoping — `X-Property-Id`

Every request carries `X-Property-Id` (the active property, or the literal `all` for the
cross-property roll-up). The backend **must** filter list/detail/aggregate responses by it, and
treat `all` as "every property this user may see". The UI never passes `propertyId` in the body or
query — it is header-only and RTK Query keys its cache on it, so switching property auto-refetches.

### List envelope

Page/filter list endpoints return:

```jsonc
{
  "rows": [
    /* the page of records */
  ],
  "total": 128, // total matching the filters (for the pager)
  "counts": { "all": 128, "active": 40, "draft": 12 }, // per-status tab counts (pre-filter)
  "stats": {
    /* optional per-surface KPIs, e.g. lowStock, boundRules */
  },
}
```

`counts` drives the status tabs and the sidebar badges; compute it over the **property-scoped but
pre-status-filter** set. `stats` is surface-specific (see each handler).

### Cursor lists (log streams)

The high-volume log surfaces (**audit**, **rules execution logs**) use cursor infinite-scroll, not
page numbers: request `?cursor=<n>&limit=40`, respond `{ rows, next }` where `next` is the cursor
for the following page (`null` at the end). See [`mocks/handlers/audit.ts`](../src/mocks/handlers/audit.ts).

### Query params

Handlers read `page` (0-based), `q` (search), `sort`, and per-surface filters (`status`,
`category`, `actor`, `range`, …). Keep the same names, or update the feature's `*Api.ts`
`query` builders and the `useTableUrlState` param keys together.

### Status codes & retry

[`baseApi`](../src/shared/lib/baseApi.ts) retries **only** transient failures (network/parse errors
and `5xx`, up to 5 attempts) and **fails 4xx fast**. Two contracts to honor:

- `401` on `GET /api/auth/session` is the normal "not signed in" signal — return it plainly; the
  app redirects to `/login` without retrying.
- Return real `4xx` for validation/permission errors so the UI surfaces them immediately
  (e.g. the self-lockout guard returns `409`).

---

## 3 · Endpoint inventory

One handler file per domain; each maps 1:1 to a feature's `injectEndpoints` api (18 in total).
Implement these route groups (all under `/api`):

| Domain        | Handler            | Representative routes                                              |
| ------------- | ------------------ | ------------------------------------------------------------------ |
| Auth/session  | `auth.ts`          | `POST /auth/login`, `GET /auth/session`, `GET /auth/brand-stats`   |
| Tenant/theme  | `tenant.ts`        | `GET /tenant/context` (brand, theme channels, modules, properties) |
| Dashboard     | `dashboard.ts`     | KPIs, activity feed, top campaigns                                 |
| Promotions    | `promotions.ts`    | list/detail/create/update/status, `/campaigns` (badge)             |
| Rules         | `rules.ts`         | rules CRUD, `GET /triggers` (event catalog), logs                  |
| Rewards       | `rewards.ts`       | catalog list/detail/form, categories, vendor sync                  |
| Players       | `players.ts`       | directory, profile, activity feed, segments, points adjust         |
| Settings      | `settings.ts`      | general/theme/properties/modules/compliance/vendor panels          |
| Users & roles | `users.ts`         | user CRUD (self-lockout `409`), role permission matrix             |
| Fulfillment   | `fulfillment.ts`   | queue, order detail, bulk status transitions                       |
| Audit         | `audit.ts`         | cursor log stream, before/after diff                               |
| Notifications | `notifications.ts` | center, templates CRUD, delivery log                               |
| Reports       | `reports.ts`       | overview/campaigns/players/rewards series + funnel                 |
| Triggers      | `triggers.ts`      | trigger CRUD (`/triggers-admin`), bound rules                      |

> The `logs`/`index` handler files are the registry + execution-log stream. `index.ts` composes
> all handlers into the worker; there is no `index` endpoint to build.

For each route, the **request/response shapes are defined by the feature's Zod schemas**
(`features/<x>/model/*.ts`), not by hand — see §4.

---

## 4 · Contracts are Zod-first — validate against them

Types flow **schema → `z.infer` type → MSW validation → RTKQ typing → RHF `zodResolver`**. The Zod
schemas in `features/<domain>/model/` (and shared ones in `shared/contracts/`) are the single
source of truth for every payload. When you build the backend:

- Treat each `model/dto.ts` schema as the **response contract** — your serializer must produce data
  that `Schema.parse()` accepts. Consider parsing responses in dev to catch drift early.
- Numeric form fields use `z.coerce.number()` because they arrive as strings from inputs — the API
  should still return real numbers.
- These are **app-local** contracts. Do **not** repoint them at the player-side `@pq/contracts`
  package (it is a render-type cycle-breaker for the LIT widgets, unrelated to this app).

---

## 5 · Authentication

The mock uses an **in-memory session** (`db.session` in [`mocks/seed/auth.ts`](../src/mocks/seed/auth.ts)),
which is why a full page reload logs out. Replacing it:

- **Login:** `POST /auth/login` → set an httpOnly session cookie (preferred) or return a token.
- **Resume:** `GET /auth/session` → `200 {user, permissions}` when authenticated, `401` when not.
  [`RequireAuth`](../src/platform/auth/) gates the app on this; keep the `401` semantics from §2.
- **Tokens (if not cookie-based):** add an `Authorization` header in `baseApi.prepareHeaders`
  alongside `X-Property-Id`, reading the token from the auth slice.
- **RBAC:** permissions are UI-gated via `usePermission` against the `Permission` enum in
  [`shared/contracts/session.ts`](../src/shared/contracts/session.ts). The server is the real
  authority — **re-check every permission server-side**; the UI gating is convenience only.

---

## 6 · Tenant context & theming

`GET /tenant/context` returns the brand, **theme channels** (RGB triples the runtime writes to CSS
custom properties), enabled **modules**, and **properties**. On boot, `main.tsx` applies the theme
before first paint; `AppShell` re-syncs the slice when Settings saves. To make theming real, back
`tenant/context` with per-tenant config (the demo seeds it from
[`tenants/casino-royale/config.json`](../tenants/casino-royale/config.json)) and have the Settings
panels persist to it. Resolve the tenant from host/subdomain instead of the `?tenant=` / `VITE_TENANT`
dev shortcut.

---

## 7 · Environment variables

| Var                  | Dev value                   | Production                                              |
| -------------------- | --------------------------- | ------------------------------------------------------- |
| `VITE_MOCK`          | `1` (start MSW)             | `0` — disables the worker                               |
| `VITE_MOCK_FAILURES` | `0`                         | remove — injects 5% 503s to exercise error/retry states |
| `VITE_TENANT`        | `casino-royale`             | replace with host-based tenant resolution               |
| `VITE_API_BASE_URL`  | _(unused; relative `/api`)_ | set if the API is cross-origin                          |

---

## 8 · Migration checklist

1. Stand up the API under `/api` (or set `VITE_API_BASE_URL`); implement §3 route by route,
   validating each response against its Zod schema (§4).
2. Enforce `X-Property-Id` scoping and the list/cursor envelopes (§2) on the server.
3. Implement real auth (§5); keep the `401`-on-session contract; add `Authorization` to
   `prepareHeaders` if token-based.
4. Back `tenant/context` + Settings persistence with real config (§6).
5. Set `VITE_MOCK=0`; smoke-test each surface.
6. **Delete the mock layer** once green: `src/mocks/` and the `startMockBackend()` branch +
   `msw` devDependency. Nothing else imports from `mocks/`.
7. Keep the tag-invalidation and optimistic-update logic in the feature `*Api.ts` files — it is
   backend-agnostic and gives the UI its instant feel; just ensure your responses/`4xx`s are
   accurate so rollbacks fire correctly.

---

## What you do **not** need to change

- Components, pages, routing, and the `usePermission` gates.
- RTK Query hooks, tag types, optimistic `onQueryStarted` handlers, cursor merge logic.
- The design system / tokens / multi-tenant theming mechanism.
- The Zod schemas (unless the real contract genuinely differs — then update the schema and the
  types, validation, and forms follow automatically).
