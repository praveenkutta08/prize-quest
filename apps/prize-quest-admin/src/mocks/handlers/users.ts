import { http, HttpResponse } from "msw";
import type { Permission, Role } from "@/shared/contracts";
import type { ManagedUser, UserStatusCounts } from "@/features/users/model";
import { PERMISSION_GROUPS } from "@/features/users/model";
import { db } from "../db";
import { resolve, withLatency, maybeFail } from "../latency";

const PAGE_SIZE = 8;

/** Tenant-scoped — no X-Property-Id filtering here. */
function counts(rows: ManagedUser[]): UserStatusCounts {
  return {
    all: rows.length,
    active: rows.filter((u) => u.status === "active").length,
    pending: rows.filter((u) => u.status === "pending").length,
    admins: rows.filter((u) => u.role === "admin").length,
  };
}

function currentOperatorId(): string | undefined {
  return db.session?.user.id;
}

function findUser(id: string): ManagedUser | undefined {
  return db.users.find((u) => u.id === id);
}

export const userHandlers = [
  // List — role/status/q/page. Tenant-wide.
  http.get("/api/users", ({ request }) =>
    resolve("users.list", () => {
      const url = new URL(request.url);
      const role = url.searchParams.get("role") ?? "all";
      const status = url.searchParams.get("status") ?? "all";
      const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
      const page = Math.max(0, Number.parseInt(url.searchParams.get("page") ?? "0", 10) || 0);

      const base = db.users;
      const c = counts(base);

      let rows = status === "all" ? base : base.filter((u) => u.status === status);
      if (role !== "all") rows = rows.filter((u) => u.role === role);
      if (q) {
        rows = rows.filter(
          (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
        );
      }
      const total = rows.length;
      const pageRows = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
      return { rows: pageRows, total, counts: c };
    }),
  ),

  // Invite → creates a pending user
  http.post("/api/users/invite", async ({ request }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: invite failed" }, { status: 503 });
    const { email, role } = (await request.json()) as { email: string; role: Role };
    const name = email
      .split("@")[0]
      .split(/[._]/)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
    const invitedByName = db.users.find((u) => u.id === currentOperatorId())?.name ?? "Admin";
    const created: ManagedUser = {
      id: `u-invite-${Date.now().toString(36)}`,
      name,
      email,
      initials: name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      role,
      title: "Invited operator",
      status: "pending",
      invitedAt: new Date().toISOString(),
      invitedBy: invitedByName,
    };
    db.users = [created, ...db.users];
    return HttpResponse.json(created, { status: 201 });
  }),

  // Resend invite
  http.post("/api/users/:id/resend-invite", async ({ params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: resend failed" }, { status: 503 });
    const user = findUser(String(params.id));
    if (!user) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    return HttpResponse.json({ ok: true });
  }),

  // Edit (name/title/role) — GUARD against de-admining self
  http.put("/api/users/:id", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: update failed" }, { status: 503 });
    const id = String(params.id);
    const body = (await request.json()) as { name: string; title: string; role: Role };
    const existing = findUser(id);
    if (!existing) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    if (id === currentOperatorId() && existing.role === "admin" && body.role !== "admin") {
      return HttpResponse.json(
        { error: "You can't change the role of your own admin account." },
        { status: 409 },
      );
    }
    const updated: ManagedUser = { ...existing, ...body };
    db.users = db.users.map((u) => (u.id === id ? updated : u));
    return HttpResponse.json(updated);
  }),

  // Status (activate/deactivate) — GUARD against deactivating self
  http.patch("/api/users/:id/status", async ({ request, params }) => {
    await withLatency();
    if (maybeFail()) return HttpResponse.json({ error: "mock: status failed" }, { status: 503 });
    const id = String(params.id);
    const { status } = (await request.json()) as { status: ManagedUser["status"] };
    const existing = findUser(id);
    if (!existing) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    if (id === currentOperatorId() && status === "inactive") {
      return HttpResponse.json(
        { error: "You can't deactivate your own account." },
        { status: 409 },
      );
    }
    const updated = { ...existing, status };
    db.users = db.users.map((u) => (u.id === id ? updated : u));
    return HttpResponse.json(updated);
  }),

  // Roles + permission groups
  http.get("/api/roles", () =>
    resolve("users.roles", () => ({ roles: db.rolePermissions, groups: PERMISSION_GROUPS })),
  ),

  // Update a role's permission set
  http.put("/api/roles/:role/permissions", async ({ request, params }) => {
    await withLatency();
    if (maybeFail())
      return HttpResponse.json({ error: "mock: role update failed" }, { status: 503 });
    const role = String(params.role) as Role;
    const { permissions } = (await request.json()) as { permissions: Permission[] };
    const existing = db.rolePermissions.find((r) => r.role === role);
    if (!existing) return HttpResponse.json({ error: "not-found" }, { status: 404 });
    const updated = { role, permissions };
    db.rolePermissions = db.rolePermissions.map((r) => (r.role === role ? updated : r));
    return HttpResponse.json(updated);
  }),
];
