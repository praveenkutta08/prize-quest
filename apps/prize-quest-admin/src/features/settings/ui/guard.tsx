import { useRef, type ReactNode } from "react";
import { GuardContext, type GuardState } from "./guardContext";

/** Provides the dirty-guard registry the Settings sub-nav consults before a switch. */
export function GuardProvider({ children }: { children: ReactNode }) {
  const ref = useRef<GuardState>({ isDirty: false, reset: () => {} });
  return <GuardContext.Provider value={{ ref }}>{children}</GuardContext.Provider>;
}
