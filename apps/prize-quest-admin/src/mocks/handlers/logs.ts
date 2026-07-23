import { http, HttpResponse } from "msw";
import type { ExecutionLogEntry, LogSeverityCounts } from "@/features/rules/model";
import { db } from "../db";
import { resolve, withLatency } from "../latency";
import { synthLogEntry } from "../seed/rules";

const LOG_PAGE = 40;
const NOW_MS = Date.parse("2026-07-23T16:00:00Z");
const RANGE_MS: Record<string, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

function propertyId(request: Request): string {
  return request.headers.get("X-Property-Id") ?? "all";
}

function countBySeverity(rows: ExecutionLogEntry[]): LogSeverityCounts {
  const by = (s: string) => rows.filter((r) => r.severity === s).length;
  return { all: rows.length, ok: by("ok"), warn: by("warn"), err: by("err") };
}

export const logHandlers = [
  // Live tail — synthesize the next entry from the server-side counter.
  http.post("/api/logs/tail", async () => {
    await withLatency();
    const entry = synthLogEntry(db.liveCounter);
    db.liveCounter += 1;
    db.logs = [entry, ...db.logs];
    return HttpResponse.json({ rows: [entry] });
  }),

  http.get("/api/logs", ({ request }) =>
    resolve("logs.list", () => {
      const url = new URL(request.url);
      const severity = url.searchParams.get("severity") ?? "all";
      const range = url.searchParams.get("range") ?? "30d";
      const ruleId = url.searchParams.get("ruleId") ?? "all";
      const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
      const cursor = Math.max(0, Number.parseInt(url.searchParams.get("cursor") ?? "0", 10) || 0);
      const pid = propertyId(request);

      // Scope + range + rule + search define the base set; severity tabs count within it.
      let base = db.logs.filter((l) => pid === "all" || l.propertyId === pid);
      const rangeMs = RANGE_MS[range];
      if (rangeMs) base = base.filter((l) => Date.parse(l.time) >= NOW_MS - rangeMs);
      if (ruleId !== "all") base = base.filter((l) => l.ruleId === ruleId);
      if (q) base = base.filter((l) => l.message.toLowerCase().includes(q));

      const counts = countBySeverity(base);
      const filtered = severity === "all" ? base : base.filter((l) => l.severity === severity);

      const total = filtered.length;
      const rows = filtered.slice(cursor, cursor + LOG_PAGE);
      const nextCursor = cursor + LOG_PAGE < total ? String(cursor + LOG_PAGE) : null;
      return { rows, total, counts, nextCursor };
    }),
  ),
];
