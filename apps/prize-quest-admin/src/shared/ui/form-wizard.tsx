import { forwardRef, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";

/**
 * Authoring layout (plan §8 `FormWizardLayout`, prototype `.form-grid`):
 * numbered sections on the left, a sticky summary column on the right.
 */
export function FormWizardLayout({
  sections,
  summary,
}: {
  sections: ReactNode;
  summary: ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="space-y-5">{sections}</div>
      <div className="lg:sticky lg:top-6">{summary}</div>
    </div>
  );
}

/**
 * A numbered form section (prototype `.form-section`). Forwards a ref so the
 * summary/detail "Edit" deep-links can scroll to it.
 */
export const FormSection = forwardRef<
  HTMLElement,
  {
    step: number;
    title: string;
    subtitle?: string;
    complete?: boolean;
    children: ReactNode;
    id?: string;
  }
>(({ step, title, subtitle, complete, children, id }, ref) => {
  return (
    <section
      ref={ref}
      id={id}
      className="scroll-mt-24 rounded-xl border border-hairline bg-surface-1 p-5"
    >
      <div className="mb-4 flex items-center gap-3">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
            complete
              ? "border-success/40 bg-success-soft text-success"
              : "border-brand/35 bg-brand-subtle text-brand-bright",
          )}
          aria-hidden="true"
        >
          {complete ? <Check className="size-3.5" /> : step}
        </span>
        <div>
          <h3 className="font-display text-sm font-semibold text-text-primary">{title}</h3>
          {subtitle ? <p className="text-2xs text-text-tertiary">{subtitle}</p> : null}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
});
FormSection.displayName = "FormSection";

/** A responsive two-up field row (single column on narrow widths). */
export function FormRow({ children, single }: { children: ReactNode; single?: boolean }) {
  return (
    <div className={cn("grid gap-4", single ? "grid-cols-1" : "sm:grid-cols-2")}>{children}</div>
  );
}

/** Label + control + optional help/error wrapper for RHF fields. */
export function Field({
  label,
  htmlFor,
  help,
  error,
  children,
}: {
  label: ReactNode;
  htmlFor?: string;
  help?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={htmlFor} className="text-xs uppercase tracking-wide text-text-secondary">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-2xs text-danger" role="alert">
          {error}
        </p>
      ) : help ? (
        <p className="text-2xs text-text-tertiary">{help}</p>
      ) : null}
    </div>
  );
}
