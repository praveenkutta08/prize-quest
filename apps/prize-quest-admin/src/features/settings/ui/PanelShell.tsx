import type { ReactNode } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui";

export type SaveState = "idle" | "saving" | "saved" | "error";

/** Consistent panel frame: header, body, and a per-panel Save footer. */
export function PanelShell({
  title,
  description,
  children,
  saveState,
  canSave,
  onSave,
  readOnly,
  saveLabel = "Save changes",
}: {
  title: string;
  description: string;
  children: ReactNode;
  saveState?: SaveState;
  /** Enabled only when dirty + valid. */
  canSave?: boolean;
  onSave?: () => void;
  /** Viewer (no settings.manage) — hides the save footer. */
  readOnly?: boolean;
  saveLabel?: string;
}) {
  return (
    <section className="rounded-xl border border-hairline bg-surface-1">
      <div className="border-b border-hairline px-6 py-5">
        <h2 className="font-display text-lg font-semibold text-text-primary">{title}</h2>
        <p className="mt-0.5 text-sm text-text-tertiary">{description}</p>
      </div>
      <div className="space-y-5 px-6 py-6">{children}</div>
      {!readOnly && onSave ? (
        <div className="flex items-center justify-between gap-3 border-t border-hairline px-6 py-4">
          <SaveIndicator state={saveState ?? "idle"} />
          <Button onClick={onSave} disabled={!canSave}>
            {saveLabel}
          </Button>
        </div>
      ) : null}
      {readOnly ? (
        <div className="border-t border-hairline px-6 py-4">
          <p className="text-xs text-text-tertiary">
            You have read-only access. Editing requires the{" "}
            <code className="font-mono">settings.manage</code> permission.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
        <Loader2 className="size-3.5 animate-spin" /> Saving…
      </span>
    );
  if (state === "saved")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-success">
        <Check className="size-3.5" /> Saved
      </span>
    );
  if (state === "error")
    return <span className="text-xs text-danger">Couldn&apos;t save — try again</span>;
  return <span className="text-xs text-text-tertiary">Changes are saved per panel.</span>;
}
