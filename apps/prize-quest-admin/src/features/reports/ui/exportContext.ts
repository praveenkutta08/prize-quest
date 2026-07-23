import { createContext, useContext, useEffect } from "react";
import type { MutableRefObject } from "react";

export interface ExportSpec {
  filename: string;
  /** Returns CSV rows (array of arrays) for the current view, or null if nothing to export. */
  build: () => (string | number)[][] | null;
}

export interface ExportContextValue {
  ref: MutableRefObject<ExportSpec | null>;
}

export const ReportExportContext = createContext<ExportContextValue | null>(null);

/** A report page registers its current-view CSV builder so the hub's Export CSV can serialize it. */
export function useRegisterExport(spec: ExportSpec) {
  const ctx = useContext(ReportExportContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.ref.current = spec;
    return () => {
      ctx.ref.current = null;
    };
  });
}

export function useReportExport(): MutableRefObject<ExportSpec | null> {
  const ctx = useContext(ReportExportContext);
  if (!ctx) throw new Error("useReportExport must be used within the Reports hub");
  return ctx.ref;
}
