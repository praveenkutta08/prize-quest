import { http, HttpResponse } from "msw";
import { LoginRequest } from "@/shared/contracts";
import { db } from "../db";
import { buildSession } from "../seed/auth";
import { buildBrandStats } from "../seed/dashboard";
import { resolve, withLatency } from "../latency";

export const authHandlers = [
  // Mock credentials sign-in. Any well-formed email/password succeeds; a blank
  // password fails so the error path is demoable.
  http.post("/api/auth/login", async ({ request }) => {
    await withLatency();
    const body = await request.json().catch(() => null);
    const parsed = LoginRequest.safeParse(body);
    if (!parsed.success || parsed.data.password.length < 1) {
      return HttpResponse.json(
        { error: "Those credentials didn't match. Check your email and password." },
        { status: 401 },
      );
    }
    const session = buildSession(parsed.data.email);
    db.session = session;
    return HttpResponse.json(session);
  }),

  // Current session, or 401 if not signed in.
  http.get("/api/auth/session", async () => {
    await withLatency();
    if (!db.session) {
      return HttpResponse.json({ error: "No active session" }, { status: 401 });
    }
    return HttpResponse.json(db.session);
  }),

  // Live figures for the login brand panel.
  http.get("/api/auth/brand-stats", () => resolve("brand-stats", buildBrandStats)),
];
