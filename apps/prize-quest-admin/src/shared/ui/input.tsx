import * as React from "react";
import { cn } from "@/shared/lib/cn";
import { useFieldLabelId } from "./field-label-context";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    // When the enclosing Field labels via context (no `htmlFor`), adopt it as the
    // accessible name unless the caller already provided one.
    const fieldLabelId = useFieldLabelId();
    const ariaLabelledBy =
      props["aria-labelledby"] ?? (props["aria-label"] ? undefined : (fieldLabelId ?? undefined));
    return (
      <input
        ref={ref}
        type={type}
        aria-labelledby={ariaLabelledBy}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-surface-sunken px-3 py-2 text-sm",
          "text-text-primary placeholder:text-text-tertiary",
          "transition-[border-color,box-shadow] duration-fast ease-out",
          "focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-ring/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/30",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
