import { createContext, useContext } from "react";

/**
 * The id of the nearest `Field`'s visible `<label>`. Non-native form controls
 * that can't be associated via `htmlFor` (e.g. a Radix Select's `<button>`)
 * read this to set `aria-labelledby`, so the visible label becomes their
 * accessible name without a duplicated `aria-label`. `null` outside a Field.
 */
export const FieldLabelContext = createContext<string | null>(null);

export function useFieldLabelId(): string | null {
  return useContext(FieldLabelContext);
}
