import { expect } from "vitest";

/**
 * Heading levels in document order, ignoring `aria-hidden` / `inert` subtrees
 * (which assistive tech and axe skip). Used to guard against skipped levels —
 * the WCAG 1.3.1 "heading-order" rule the Phase 5 a11y pass fixed.
 */
export function headingLevels(root: HTMLElement): number[] {
  return Array.from(root.querySelectorAll("h1,h2,h3,h4,h5,h6"))
    .filter((h) => !h.closest("[aria-hidden='true'],[inert]"))
    .map((h) => Number(h.tagName[1]));
}

/** Assert the heading outline never jumps down by more than one level. */
export function expectNoSkippedHeadings(root: HTMLElement): void {
  const levels = headingLevels(root);
  for (let i = 1; i < levels.length; i++) {
    const jump = levels[i] - levels[i - 1];
    expect(
      jump <= 1,
      `Heading order skips a level: h${levels[i - 1]} → h${levels[i]} at index ${i}. Order: [${levels.join(", ")}]`,
    ).toBe(true);
  }
}
