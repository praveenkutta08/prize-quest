import { cn } from "@/shared/lib/cn";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export interface EventOption {
  key: string;
  label: string;
  description: string;
}

/**
 * Event trigger picker (plan §8 `EventSelector`). Presentational: the caller
 * feeds it the trigger catalog (from `listTriggers`). Shows the selected event's
 * description for context. Used by event-type rules.
 */
export function EventSelector({
  events,
  value,
  onChange,
  error,
}: {
  events: EventOption[];
  value?: string;
  onChange: (key: string) => void;
  error?: string;
}) {
  const selected = events.find((e) => e.key === value);
  return (
    <div className="space-y-2">
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger aria-invalid={Boolean(error)}>
          <SelectValue placeholder="Choose an event…" />
        </SelectTrigger>
        <SelectContent>
          {events.map((event) => (
            <SelectItem key={event.key} value={event.key}>
              {event.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className={cn("text-2xs", error ? "text-danger" : "text-text-tertiary")}>
        {error ?? selected?.description ?? "The rule runs whenever this event fires."}
      </p>
    </div>
  );
}
