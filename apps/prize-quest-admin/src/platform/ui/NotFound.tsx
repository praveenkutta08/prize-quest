import { Link } from "react-router-dom";
import { Button } from "@/shared/ui";
import { MarkGlyph } from "./BootSplash";

/** Designed 404. */
export function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-8">
      <div className="atmos-mesh pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative flex max-w-md flex-col items-center gap-5 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl border border-hairline bg-surface-2">
          <MarkGlyph className="size-6 text-text-tertiary" />
        </span>
        <p className="font-mono text-5xl font-semibold tabular-nums text-text-primary">404</p>
        <div className="space-y-1.5">
          <h1 className="font-display text-xl font-semibold text-text-primary">
            This screen doesn't exist
          </h1>
          <p className="text-sm text-text-tertiary">
            The page you're after isn't part of the console. Head back to the dashboard.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link to="/">Back to console</Link>
        </Button>
      </div>
    </div>
  );
}
