import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LogStream, type LogStreamRow } from "@/shared/ui";

const rows: LogStreamRow[] = [
  { id: "1", severity: "err", time: "10:00:00", message: "boom", meta: "scheduler" },
];

/**
 * The severity dot conveys state via an `aria-label`, which is only valid on an
 * element with a role — Phase 5 gave it `role="img"` (fixes axe aria-prohibited-attr
 * on the audit + rules-logs pages).
 */
describe("LogStream severity dot", () => {
  it("exposes the severity as a labelled img role", () => {
    const { container } = render(<LogStream rows={rows} />);
    const dot = container.querySelector('[role="img"]');
    expect(dot).not.toBeNull();
    expect(dot).toHaveAttribute("aria-label", "err");
  });
});
