import * as React from "react";
import { cn } from "@/shared/lib/cn";

/** Multi-line field, styled to match `Input` (same border/focus/invalid tokens). */
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[92px] w-full rounded-md border border-input bg-surface-sunken px-3 py-2 text-sm",
          "text-text-primary placeholder:text-text-tertiary",
          "transition-[border-color,box-shadow] duration-fast ease-out",
          "focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-ring/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/30",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
