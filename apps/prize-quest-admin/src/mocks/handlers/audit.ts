import { http } from "msw";
import type { AuditEntry } from "@/features/audit/model";
import { db } from "../db";
import { resolve } from "../latency";

const PAGE_SIZE = 40;

function withinRange(iso: string, range: string): boolean {
  if (range === "all" || !range) return true;
  const NOW = Date.UTC(2026, 6, 23, 12, 0, 0);
  const delta = NOW - new Date(iso).getTime();
  const day = 86_400_000;
  if (range === "24h") return delta <= day;
  if (range === "7d") return delta <= 7 * day;
  if (range === "30d") return delta <= 30 * day;
  return true;
}

export const auditHandlers = [
  // Tenant-level, read-only, cursor-paginated (mirrors logsApi).
  http.get("/api/audit", ({ request }) =>
    resolve("audit.list", () => {
      const url = new URL(request.url);
      const actor = url.searchParams.get("actor") ?? "all";
      const action = url.searchParams.get("action") ?? "all";
      const target = url.searchParams.get("target") ?? "all";
      const range = url.searchParams.get("range") ?? "all";
      const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
      const cursor = Math.max(0, Number.parseInt(url.searchParams.get("cursor") ?? "0", 10) || 0);

      let rows: AuditEntry[] = db.audit;
      if (actor !== "all") rows = rows.filter((e) => e.actorId === actor);
      if (action !== "all") rows = rows.filter((e) => e.action === action);
      if (target !== "all") rows = rows.filter((e) => e.targetType === target);
      rows = rows.filter((e) => withinRange(e.time, range));
      if (q) {
        rows = rows.filter(
          (e) =>
            e.summary.toLowerCase().includes(q) ||
            e.actorName.toLowerCase().includes(q) ||
            e.targetLabel.toLowerCase().includes(q),
        );
      }

      const total = rows.length;
      const pageRows = rows.slice(cursor, cursor + PAGE_SIZE);
      const next = cursor + PAGE_SIZE;
      return {
        rows: pageRows,
        total,
        counts: { all: total },
        nextCursor: next < total ? String(next) : undefined,
      };
    }),
  ),
];
