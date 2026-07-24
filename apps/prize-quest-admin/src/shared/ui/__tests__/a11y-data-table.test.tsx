import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/ui";

type Row = { name: string };

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "name", header: "Name" },
  // A display column with no header text (row actions, etc.).
  { id: "actions", header: "" },
];

/**
 * Guards two Phase 5 DataTable a11y fixes:
 *  - every `<th>` defaults to `scope="col"` (WCAG 1.3.1 / td-has-header)
 *  - an empty display-column header gets an sr-only label from its id, so its
 *    data cells stay associated with a named header.
 */
describe("DataTable header accessibility", () => {
  it("gives every column header scope=col", () => {
    const { container } = render(<DataTable columns={columns} data={[{ name: "Alpha" }]} />);
    const ths = container.querySelectorAll("th");
    expect(ths.length).toBeGreaterThan(0);
    ths.forEach((th) => expect(th).toHaveAttribute("scope", "col"));
  });

  it("labels an empty display-column header sr-only from its id", () => {
    render(<DataTable columns={columns} data={[{ name: "Alpha" }]} />);
    const srLabel = screen.getByText("Actions");
    expect(srLabel).toHaveClass("sr-only");
    expect(srLabel.tagName).toBe("SPAN");
  });
});
