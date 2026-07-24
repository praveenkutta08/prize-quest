import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { TooltipProvider, Toaster } from "@/shared/ui";
import { store } from "./store";

/** Composition root providers: Redux store, tooltip context, toast surface. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <TooltipProvider delayDuration={200} skipDelayDuration={300}>
        {children}
        <Toaster />
      </TooltipProvider>
    </Provider>
  );
}
