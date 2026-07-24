import { useId, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { FieldLabelContext } from "./field-label-context";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

/** Structural action value (the feature's Zod `RuleAction` assigns to it). */
export interface ActionConfigValue {
  type: string;
  offerType?: string;
  channel?: string;
  points?: number | string;
  campaignId?: string;
  recipients?: string[];
}

export interface ActionConfigOption {
  value: string;
  label: string;
}

const ACTION_TYPES: ActionConfigOption[] = [
  { value: "send-offer", label: "Send offer" },
  { value: "award-points", label: "Award points" },
  { value: "notify-ops", label: "Notify ops" },
  { value: "auto-enroll", label: "Auto-enroll in campaign" },
  { value: "auto-pause", label: "Auto-pause campaign" },
];

const OFFER_TYPES = [
  "Birthday Bonus offer",
  "VIP weekly offer",
  "Comeback offer",
  "Welcome offer",
  "Weekend invite",
  "Tier unlock notification",
];

const CHANNELS = [
  "Patron HTML5",
  "Patron HTML5 + Email",
  "Email + SMS",
  "Host outreach",
  "Patron HTML5 + Push",
];

/**
 * Action configurator (plan §8 `ActionConfig`): an action-type select that
 * reveals the conditional fields each type needs. Controlled — wire into RHF via
 * a `Controller`. Reusable across authoring flows; the caller passes campaign
 * options for `auto-enroll`.
 */
export function ActionConfig({
  value,
  onChange,
  campaignOptions = [],
  errors,
}: {
  value: ActionConfigValue;
  onChange: (next: ActionConfigValue) => void;
  campaignOptions?: ActionConfigOption[];
  errors?: Partial<Record<keyof ActionConfigValue, string>>;
}) {
  const set = (patch: Partial<ActionConfigValue>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <Labeled label="Action">
        <Select value={value.type} onValueChange={(v) => onChange({ type: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map((a) => (
              <SelectItem key={a.value} value={a.value}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Labeled>

      {value.type === "send-offer" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Labeled label="Offer type" error={errors?.offerType}>
            <Select value={value.offerType ?? ""} onValueChange={(v) => set({ offerType: v })}>
              <SelectTrigger aria-invalid={Boolean(errors?.offerType)}>
                <SelectValue placeholder="Select offer" />
              </SelectTrigger>
              <SelectContent>
                {OFFER_TYPES.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Labeled>
          <Labeled label="Channel">
            <Select value={value.channel ?? ""} onValueChange={(v) => set({ channel: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                {CHANNELS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Labeled>
        </div>
      ) : null}

      {value.type === "award-points" ? (
        <Labeled label="Points to award" error={errors?.points}>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="500"
            value={value.points === undefined ? "" : String(value.points)}
            onChange={(e) => set({ points: e.target.value })}
            aria-invalid={Boolean(errors?.points)}
          />
        </Labeled>
      ) : null}

      {value.type === "auto-enroll" ? (
        <Labeled label="Campaign" error={errors?.campaignId}>
          {campaignOptions.length === 0 ? (
            <p className="rounded-md border border-dashed border-hairline bg-surface-1/40 px-3 py-2 text-2xs text-text-tertiary">
              No campaigns available to enroll into.
            </p>
          ) : (
            <Select value={value.campaignId ?? ""} onValueChange={(v) => set({ campaignId: v })}>
              <SelectTrigger aria-invalid={Boolean(errors?.campaignId)}>
                <SelectValue placeholder="Select campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaignOptions.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Labeled>
      ) : null}

      {value.type === "notify-ops" ? (
        <Labeled label="Recipients" help="Comma-separated email addresses.">
          <Input
            placeholder="ops@casinoroyale.com, compliance@casinoroyale.com"
            value={(value.recipients ?? []).join(", ")}
            onChange={(e) =>
              set({
                recipients: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </Labeled>
      ) : null}

      {value.type === "auto-pause" ? (
        <p className="rounded-md border border-hairline bg-surface-sunken px-3 py-2.5 text-2xs text-text-tertiary">
          Pauses the triggering campaign and notifies operations. No further configuration needed.
        </p>
      ) : null}
    </div>
  );
}

function Labeled({
  label,
  help,
  error,
  children,
}: {
  label: string;
  help?: string;
  error?: string;
  children: ReactNode;
}) {
  // Publish the label id so the wrapped control (a Radix Select here) adopts it
  // as its accessible name via FieldLabelContext — same mechanism as `Field`.
  const labelId = `${useId()}-label`;
  return (
    <div className="space-y-1.5">
      <label id={labelId} className="text-xs uppercase tracking-wide text-text-secondary">
        {label}
      </label>
      <FieldLabelContext.Provider value={labelId}>{children}</FieldLabelContext.Provider>
      {error ? (
        <p className="text-2xs text-danger" role="alert">
          {error}
        </p>
      ) : help ? (
        <p className={cn("text-2xs text-text-tertiary")}>{help}</p>
      ) : null}
    </div>
  );
}
