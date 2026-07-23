import type { ReactNode } from "react";
import { FlaskConical, Loader2, RotateCw } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { count, percent } from "@/shared/lib/format";
import { Button } from "./button";

export interface SummaryPreviewRow {
  label: string;
  value: ReactNode;
  /** Emphasize the value (larger, brand color) — e.g. estimated reach. */
  emphasis?: boolean;
}

export interface SummaryPseudocode {
  /** Compiled clause strings, e.g. "tier IN [Gold, Platinum]". */
  whenClauses: string[];
  conjunction: "AND" | "OR";
  /** The consequence line, e.g. "unlock prize choice". */
  thenClause: string;
}

export type ReachTestStatus = "idle" | "loading" | "done" | "error";

export interface SummaryTest {
  title?: string;
  description?: string;
  status: ReachTestStatus;
  result?: { matchedPlayers: number; ofEligible: number };
  onRun: () => void;
  /** CTA label when idle (default "Run preview"). */
  runLabel?: string;
}

export interface SummaryPanelProps {
  title?: string;
  previewRows: SummaryPreviewRow[];
  pseudocode?: SummaryPseudocode;
  test?: SummaryTest;
  /** Save actions rendered at the bottom of the sticky panel. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Sticky right-column authoring companion (plan §8, prototype `.summary-panel`).
 * Renders a live field preview, a compiled `WHEN … AND … THEN` pseudocode block,
 * and a reach-test runner. Fully generic: the promotions form passes campaign
 * preview rows + eligibility pseudocode; the Session 3 rule builder passes a rule
 * summary + a `WHEN trigger … THEN action` block — no component changes.
 */
export function SummaryPanel({
  title = "Live preview",
  previewRows,
  pseudocode,
  test,
  footer,
  className,
}: SummaryPanelProps) {
  return (
    <aside
      className={cn(
        "sticky top-6 flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-5",
        className,
      )}
    >
      <h3 className="font-display text-sm font-semibold text-text-primary">{title}</h3>

      <dl className="space-y-3">
        {previewRows.map((row, i) => (
          <div key={i} className="space-y-0.5">
            <dt className="text-2xs uppercase tracking-wide text-text-tertiary">{row.label}</dt>
            <dd
              className={cn(
                "text-sm text-text-primary",
                row.emphasis && "font-display text-lg font-semibold text-brand-bright",
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {pseudocode ? <PseudocodeBlock pseudocode={pseudocode} /> : null}

      {test ? <ReachTest test={test} /> : null}

      {footer ? <div className="flex flex-col gap-2 pt-1">{footer}</div> : null}
    </aside>
  );
}

function PseudocodeBlock({ pseudocode }: { pseudocode: SummaryPseudocode }) {
  const { whenClauses, conjunction, thenClause } = pseudocode;
  return (
    <div className="space-y-1.5">
      <p className="text-2xs uppercase tracking-wide text-text-tertiary">Rule · pseudocode</p>
      <pre className="overflow-x-auto rounded-lg border border-hairline bg-surface-sunken p-3 font-mono text-xs leading-relaxed text-text-secondary">
        {whenClauses.length === 0 ? (
          <span className="text-text-tertiary">
            Add eligibility conditions to compile the rule…
          </span>
        ) : (
          whenClauses.map((clause, i) => (
            <div key={i}>
              <Keyword>{i === 0 ? "WHEN" : conjunction}</Keyword> {clause}
            </div>
          ))
        )}
        <div>
          <Keyword>THEN</Keyword> {thenClause}
        </div>
      </pre>
    </div>
  );
}

function Keyword({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-brand-bright">{children}</span>;
}

function ReachTest({ test }: { test: SummaryTest }) {
  const { status, result } = test;
  return (
    <div className="space-y-2 rounded-lg border border-hairline bg-surface-sunken p-3.5">
      <div className="flex items-center gap-2">
        <FlaskConical className="size-3.5 text-brand" />
        <h4 className="text-xs font-semibold text-text-primary">
          {test.title ?? "Test against current data"}
        </h4>
      </div>
      <p className="text-2xs leading-relaxed text-text-tertiary">
        {test.description ??
          "Run the rule on yesterday's snapshot to see how many players would have matched."}
      </p>

      {status === "done" && result ? (
        <div className="rounded-md border border-brand/25 bg-brand-subtle px-3 py-2">
          <p className="font-display text-xl font-semibold text-brand-bright">
            {count(result.matchedPlayers)}
          </p>
          <p className="text-2xs text-text-secondary">
            of {count(result.ofEligible)} eligible ·{" "}
            {percent(result.ofEligible === 0 ? 0 : result.matchedPlayers / result.ofEligible)} match
          </p>
        </div>
      ) : null}

      {status === "error" ? (
        <p className="text-2xs text-danger" role="alert">
          Couldn't run the preview. Try again.
        </p>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={test.onRun}
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <Loader2 className="animate-spin" />
        ) : status === "done" || status === "error" ? (
          <RotateCw />
        ) : null}
        {status === "loading"
          ? "Running…"
          : status === "done" || status === "error"
            ? "Run again"
            : (test.runLabel ?? "Run preview")}
      </Button>
    </div>
  );
}
