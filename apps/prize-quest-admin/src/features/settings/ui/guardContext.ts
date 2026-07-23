import { createContext, useContext, useEffect } from "react";
import type { MutableRefObject } from "react";

export interface GuardState {
  isDirty: boolean;
  /** Reset the panel form (and, for Theme, revert the live preview). */
  reset: () => void;
}

export interface GuardContextValue {
  ref: MutableRefObject<GuardState>;
}

export const GuardContext = createContext<GuardContextValue | null>(null);

/** Panels register their live dirty-state + reset so the sub-nav can guard a switch. */
export function useRegisterGuard(isDirty: boolean, reset: () => void) {
  const ctx = useContext(GuardContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.ref.current = { isDirty, reset };
    return () => {
      ctx.ref.current = { isDirty: false, reset: () => {} };
    };
  }, [ctx, isDirty, reset]);
}

/** The sub-nav reads the currently-registered panel guard. */
export function useGuard(): MutableRefObject<GuardState> {
  const ctx = useContext(GuardContext);
  if (!ctx) throw new Error("useGuard must be used within GuardProvider");
  return ctx.ref;
}
