import { cn } from "@/shared/lib/cn";
import { Input } from "./input";
import { PresetChips } from "./preset-chips";

/**
 * Cron schedule input (plan §8 `CronField`): a mono expression field, quick
 * presets, and a live human-readable description. Hand-rolled describe/validate
 * (no cron lib) covering the common operator patterns. Used by the rule builder;
 * `describeCron` is also consumed by the `SummaryPanel` rule summary.
 */

const PRESETS = [
  { value: "0 6 * * *", label: "Daily 6AM" },
  { value: "0 6 * * 1", label: "Weekly Monday" },
  { value: "0 6 1 * *", label: "Monthly 1st" },
  { value: "custom", label: "Custom" },
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TOKEN = /^(\*|(\d+)(-\d+)?)(\/\d+)?(,(\d+)(-\d+)?)*$/;

/** Five space-separated fields, each a plausible cron token. */
export function isValidCron(expr: string): boolean {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return false;
  return parts.every((p) => TOKEN.test(p));
}

function formatTime(hour: number, minute: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${period}`;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Human-readable summary of a cron expression, e.g. "Runs every day at 6:00 AM". */
export function describeCron(expr: string): string {
  if (!isValidCron(expr)) return "Enter a valid cron expression.";
  const [min, hour, dom, mon, dow] = expr.trim().split(/\s+/);
  const time =
    /^\d+$/.test(min) && /^\d+$/.test(hour)
      ? formatTime(Number(hour), Number(min))
      : "the scheduled time";

  let when: string;
  if (dow !== "*" && /^\d+$/.test(dow)) {
    when = `every ${DAYS[Number(dow) % 7]}`;
  } else if (dom !== "*" && /^\d+$/.test(dom)) {
    const monthPart =
      mon !== "*" && /^\d+$/.test(mon)
        ? ` of ${MONTHS[(Number(mon) - 1) % 12]}`
        : " of every month";
    when = `on the ${ordinal(Number(dom))}${monthPart}`;
  } else {
    when = "every day";
  }
  return `Runs ${when} at ${time} property time.`;
}

export function CronField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const valid = isValidCron(value);
  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0 6 * * *"
        aria-invalid={Boolean(error) || (value.length > 0 && !valid)}
        className="font-mono text-sm"
      />
      <p
        className={cn(
          "text-2xs",
          error ? "text-danger" : valid ? "text-text-tertiary" : "text-warning",
        )}
      >
        {error ?? describeCron(value)}
      </p>
      <PresetChips
        ariaLabel="Schedule presets"
        chips={PRESETS}
        value={PRESETS.some((p) => p.value === value) ? value : "custom"}
        onSelect={(v) => {
          if (v !== "custom") onChange(v);
        }}
      />
    </div>
  );
}
