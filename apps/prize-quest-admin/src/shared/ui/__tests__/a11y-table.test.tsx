import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui";

/** The TableHead primitive defaults to scope="col" and lets callers override. */
describe("TableHead scope", () => {
  it("defaults to scope=col and honors an explicit scope", () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead scope="row">Row header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>a</TableCell>
            <TableCell>b</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const ths = container.querySelectorAll("th");
    expect(ths[0]).toHaveAttribute("scope", "col");
    expect(ths[1]).toHaveAttribute("scope", "row");
  });
});
