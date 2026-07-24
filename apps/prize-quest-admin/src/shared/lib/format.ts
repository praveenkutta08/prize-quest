/**
 * Presentation formatters. Data flows in as raw numbers/ISO strings and is
 * formatted here so components never hand-roll number/date logic.
 */

const usd0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const int = new Intl.NumberFormat("en-US");

/** Full currency, no cents: 48200 → "$48,200". */
export function money(value: number): string {
  return usd0.format(value);
}

/** Currency with cents: 249 → "$249.00". */
export function moneyPrecise(value: number): string {
  return usd2.format(value);
}

/** Compact currency for KPI tiles: 48200 → "$48.2K", 127400 → "$127.4K". */
export function moneyCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs}`;
}

/** Thousands-separated integer: 24891 → "24,891". */
export function count(value: number): string {
  return int.format(value);
}

/** Compact count for tight labels: 24891 → "24.9K". */
export function countCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}

/** Ratio → percent string. `percent(0.719)` → "71.9%"; `percent(38.8, true)` → "38.8%". */
export function percent(value: number, alreadyScaled = false, digits = 1): string {
  const pct = alreadyScaled ? value : value * 100;
  return `${pct.toFixed(digits)}%`;
}

/** Signed delta for trend chips: 12.5 → "+12.5%", -3.2 → "-3.2%". */
export function signedPercent(value: number, digits = 1): string {
  const s = value > 0 ? "+" : "";
  return `${s}${value.toFixed(digits)}%`;
}

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto", style: "narrow" });

/** ISO string or Date → "2m ago", "1h ago", "3d ago". */
export function relativeTime(input: string | Date, now: Date = new Date()): string {
  const then = typeof input === "string" ? new Date(input) : input;
  const deltaSec = Math.round((then.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(deltaSec);
  for (const [unit, secs] of RELATIVE_UNITS) {
    if (abs >= secs || unit === "second") {
      return rtf.format(Math.round(deltaSec / secs), unit);
    }
  }
  return "just now";
}

/** Time-of-day aware greeting. */
export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Long human date: "Tuesday, July 23". */
export function longDate(now: Date = new Date()): string {
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
