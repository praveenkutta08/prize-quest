import { AlertTriangle, RotateCw } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * Designed error surface — states what went wrong and how to fix it. Reachable
 * in dev with VITE_MOCK_FAILURES=1.
 */
export function ErrorState({
  title = "Couldn't load this data",
  description = "The request didn't come back. Retry, or check the mock backend if this keeps happening.",
  onRetry,
  retrying,
  className,
  compact,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-danger/25 bg-danger-soft/40 text-center",
        compact ? "gap-2 p-8" : "gap-3 p-14",
        className,
      )}
      role="alert"
    >
      <div className="flex size-12 items-center justify-center rounded-full border border-danger/30 bg-danger-soft text-danger">
        <AlertTriangle className="size-5" strokeWidth={1.9} />
      </div>
      <div className="space-y-1">
        <p className="font-display text-md font-semibold text-text-primary">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-text-tertiary">{description}</p>
      </div>
      {onRetry ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          disabled={retrying}
          className="mt-1"
        >
          <RotateCw className={cn("size-3.5", retrying && "animate-spin")} />
          {retrying ? "Retrying…" : "Retry"}
        </Button>
      ) : null}
    </div>
  );
}
