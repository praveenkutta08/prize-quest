import { getActiveTenant } from "./provider";

/** The six arcade per-category accent color names. */
export type CategoryColor = "purple" | "blue" | "orange" | "pink" | "green" | "teal";

/**
 * Resolve a prize/campaign `category` string → an arcade color name using the active
 * tenant's `theme.categoryMap`. Falls back to `"purple"` when the category is unmapped,
 * absent, or no tenant is active. Data-driven: widgets pass their `category` prop and
 * get back the modifier color without hardcoding any mapping.
 */
export function getCategoryColor(category: string | undefined): CategoryColor {
  const map = getActiveTenant()?.theme.categoryMap;
  const color = category ? map?.[category] : undefined;
  return color ?? "purple";
}
