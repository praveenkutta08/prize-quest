import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CardTitle, DetailCard, DetailHero, FormSection } from "@/shared/ui";
import { headingLevels, expectNoSkippedHeadings } from "@/test/a11y";

/**
 * Guards the Phase 5 heading-level fixes that made the document outline never
 * skip a level (WCAG 1.3.1 / heading-order).
 */
describe("Heading levels of scaffolding components", () => {
  it("DetailCard renders an h2 by default", () => {
    const { container } = render(<DetailCard title="Details">body</DetailCard>);
    expect(container.querySelector("h2")?.textContent).toBe("Details");
  });

  it("DetailCard drops to h3 when nested under an existing h2", () => {
    const { container } = render(
      <DetailCard title="Details" headingLevel="h3">
        body
      </DetailCard>,
    );
    expect(container.querySelector("h3")?.textContent).toBe("Details");
    expect(container.querySelector("h2")).toBeNull();
  });

  it("CardTitle defaults to h3 and accepts as=h2", () => {
    const { container, rerender } = render(<CardTitle>Title</CardTitle>);
    expect(container.querySelector("h3")?.textContent).toBe("Title");
    rerender(<CardTitle as="h2">Title</CardTitle>);
    expect(container.querySelector("h2")?.textContent).toBe("Title");
  });

  it("FormSection titles are h2 (top-level page sections)", () => {
    const { container } = render(
      <FormSection step={1} title="Basics">
        fields
      </FormSection>,
    );
    expect(container.querySelector("h2")?.textContent).toContain("Basics");
  });

  it("DetailHero is h2 — the page h1 belongs to PageHeader", () => {
    const { container } = render(<DetailHero title="AirPods Pro" />);
    expect(container.querySelector("h1")).toBeNull();
    expect(container.querySelector("h2")?.textContent).toBe("AirPods Pro");
  });
});

describe("heading-order helpers", () => {
  it("passes a clean outline and catches a skipped level", () => {
    const clean = document.createElement("div");
    clean.innerHTML = "<h1>a</h1><h2>b</h2><h2>c</h2><h3>d</h3>";
    expect(() => expectNoSkippedHeadings(clean)).not.toThrow();

    const skipped = document.createElement("div");
    skipped.innerHTML = "<h1>a</h1><h3>c</h3>";
    expect(() => expectNoSkippedHeadings(skipped)).toThrow(/skips a level/);
  });

  it("ignores headings inside inert / aria-hidden subtrees", () => {
    const el = document.createElement("div");
    el.innerHTML = "<h1>a</h1><div inert><h1>dup</h1></div><h2>b</h2>";
    expect(headingLevels(el)).toEqual([1, 2]);
  });
});
