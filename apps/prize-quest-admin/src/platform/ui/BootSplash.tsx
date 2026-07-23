import { cn } from "@/shared/lib/cn";

/** Full-screen boot/loading surface — skeleton pulse, never a spinner. */
export function BootSplash({ label = "Starting console…" }: { label?: string }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background">
      <div className="atmos-mesh pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative flex flex-col items-center gap-5">
        <div className="relative flex size-14 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-2xl bg-brand/20" />
          <span className="relative flex size-14 items-center justify-center rounded-2xl border border-brand/30 bg-brand-subtle">
            <MarkGlyph className="size-7 text-brand-bright" />
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="font-display text-lg font-semibold tracking-tight text-text-primary">
            Prize Quest
          </p>
          <p className="text-xs text-text-tertiary">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function MarkGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn(className)} aria-hidden="true">
      <path
        d="M16 5 L25 10.5 V21.5 L16 27 L7 21.5 V10.5 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <path
        d="M16 11 L20.5 13.7 V19.3 L16 22 L11.5 19.3 V13.7 Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16.4" r="1.7" fill="currentColor" />
    </svg>
  );
}
