import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "../button";
import { Input } from "../input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import {
  defaultValueFor,
  emptyRow,
  findField,
  type ConditionGroupValue,
  type ConditionRowValue,
  type FieldDef,
} from "./catalog";

export interface ConditionBuilderProps {
  catalog: FieldDef[];
  value: ConditionGroupValue;
  onChange: (next: ConditionGroupValue) => void;
  /** Per-row error message, aligned by index. */
  errors?: Array<string | undefined>;
  disabled?: boolean;
  /**
   * Display-only preview (Session 5 Segments): disables every editor AND hides
   * the add/remove affordances and the connector toggle, so a saved criteria
   * `ConditionGroup` renders as read-only rows. `onChange` is never called.
   */
  readOnly?: boolean;
  className?: string;
  /** Copy for the empty state (no rows yet). */
  emptyHint?: string;
}

/**
 * Flat AND/OR condition list (plan §8, prototype `.cond-builder`). Each row is a
 * connector · field · operator · typed value editor · remove. A single group
 * conjunction toggles between AND/OR. Controlled — pass a `ConditionGroup` and
 * receive changes; wire into React Hook Form with a `Controller`. Nested groups
 * are intentionally deferred (plan §13). Reused by the Session 3 rule builder.
 */
export function ConditionBuilder({
  catalog,
  value,
  onChange,
  errors,
  disabled,
  readOnly,
  className,
  emptyHint = "No conditions yet — every eligible player qualifies.",
}: ConditionBuilderProps) {
  const rows = value.conditions;
  const locked = disabled || readOnly;

  const setRows = (conditions: ConditionRowValue[]) => onChange({ ...value, conditions });

  const updateRow = (index: number, patch: Partial<ConditionRowValue>) =>
    setRows(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const changeField = (index: number, fieldKey: string) => {
    const field = findField(catalog, fieldKey);
    updateRow(index, {
      field: fieldKey,
      operator: field?.operators[0]?.key ?? "",
      value: defaultValueFor(field),
    });
  };

  const changeOperator = (index: number, operator: string) => {
    const row = rows[index];
    const field = findField(catalog, row.field);
    const wasRange = row.operator === "between";
    const nowRange = operator === "between";
    // Reshape the value when moving into/out of the range editor.
    const value =
      wasRange === nowRange
        ? row.value
        : defaultValueFor({ ...field, editor: nowRange ? "number-range" : "number" } as FieldDef);
    updateRow(index, { operator, value });
  };

  const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index));

  const addRow = () => setRows([...rows, emptyRow(catalog)]);

  const toggleConjunction = () =>
    onChange({ ...value, conjunction: value.conjunction === "AND" ? "OR" : "AND" });

  return (
    <div className={cn("space-y-2.5", className)}>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hairline bg-surface-1/40 px-4 py-6 text-center text-sm text-text-tertiary">
          {emptyHint}
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => {
            const field = findField(catalog, row.field);
            const error = errors?.[index];
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-start gap-2">
                  <Connector
                    index={index}
                    conjunction={value.conjunction}
                    onToggle={toggleConjunction}
                    disabled={locked}
                    readOnly={readOnly}
                  />

                  {/* Field */}
                  <Select
                    value={row.field}
                    onValueChange={(v) => changeField(index, v)}
                    disabled={locked}
                  >
                    <SelectTrigger
                      className="h-9 w-[168px] shrink-0 font-mono text-xs"
                      aria-label={`Condition ${index + 1} field`}
                    >
                      <SelectValue placeholder="Field" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalog.map((f) => (
                        <SelectItem key={f.key} value={f.key} className="font-mono text-xs">
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Operator */}
                  <Select
                    value={row.operator}
                    onValueChange={(v) => changeOperator(index, v)}
                    disabled={locked || !field}
                  >
                    <SelectTrigger
                      className="h-9 w-[112px] shrink-0 text-xs"
                      aria-label={`Condition ${index + 1} operator`}
                    >
                      <SelectValue placeholder="Op" />
                    </SelectTrigger>
                    <SelectContent>
                      {field?.operators.map((op) => (
                        <SelectItem key={op.key} value={op.key} className="text-xs">
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Value editor */}
                  <div className="min-w-0 flex-1">
                    <ValueEditor
                      field={field}
                      operator={row.operator}
                      value={row.value}
                      onChange={(v) => updateRow(index, { value: v })}
                      disabled={locked}
                      invalid={Boolean(error)}
                    />
                  </div>

                  {readOnly ? null : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-0 size-9 shrink-0 text-text-tertiary hover:text-danger"
                      onClick={() => removeRow(index)}
                      disabled={disabled}
                      aria-label={`Remove condition ${index + 1}`}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
                {error ? (
                  <p className="pl-[70px] text-2xs text-danger" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {readOnly ? null : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={disabled}
          className="border-dashed"
        >
          <Plus />
          Add condition
        </Button>
      )}
    </div>
  );
}

function Connector({
  index,
  conjunction,
  onToggle,
  disabled,
  readOnly,
}: {
  index: number;
  conjunction: "AND" | "OR";
  onToggle: () => void;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  if (index === 0) {
    return (
      <span className="flex h-9 w-[52px] shrink-0 items-center justify-center rounded-md bg-surface-1 font-mono text-2xs uppercase tracking-wide text-text-tertiary">
        where
      </span>
    );
  }
  if (readOnly) {
    return (
      <span className="flex h-9 w-[52px] shrink-0 items-center justify-center rounded-md border border-brand/30 bg-brand-subtle font-mono text-2xs font-semibold uppercase tracking-wide text-brand-bright">
        {conjunction}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={`Toggle join, currently ${conjunction}`}
      className="flex h-9 w-[52px] shrink-0 items-center justify-center rounded-md border border-brand/30 bg-brand-subtle font-mono text-2xs font-semibold uppercase tracking-wide text-brand-bright transition-colors hover:bg-brand/20 disabled:opacity-60"
    >
      {conjunction}
    </button>
  );
}

function ValueEditor({
  field,
  operator,
  value,
  onChange,
  disabled,
  invalid,
}: {
  field: FieldDef | undefined;
  operator: string;
  value: unknown;
  onChange: (v: unknown) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  if (!field) return <div className="h-9" />;

  const editor = operator === "between" ? "number-range" : field.editor;

  if (editor === "multi-select") {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    const toggle = (v: string) =>
      onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);
    return (
      <div
        className={cn(
          "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-surface-sunken px-2 py-1.5",
          invalid ? "border-danger" : "border-input",
        )}
      >
        {field.options?.map((opt) => {
          const on = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              disabled={disabled}
              aria-pressed={on}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-2xs font-semibold transition-colors",
                on
                  ? "border-brand/40 bg-brand-subtle text-brand-bright"
                  : "border-hairline bg-surface-2 text-text-tertiary hover:text-text-secondary",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (editor === "keyword") {
    return (
      <Select value={String(value ?? "")} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={cn("h-9 text-xs", invalid && "border-danger")}
          aria-label={`${field.label} value`}
        >
          <SelectValue placeholder="Value" />
        </SelectTrigger>
        <SelectContent>
          {field.keywords?.map((k) => (
            <SelectItem key={k.value} value={k.value} className="text-xs">
              {k.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (editor === "number-range") {
    const tuple = Array.isArray(value) ? (value as (string | number)[]) : ["", ""];
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          className="h-9"
          value={String(tuple[0] ?? "")}
          onChange={(e) => onChange([e.target.value, tuple[1] ?? ""])}
          disabled={disabled}
          aria-invalid={invalid}
          placeholder="min"
        />
        <span className="text-2xs uppercase text-text-tertiary">and</span>
        <Input
          type="number"
          inputMode="numeric"
          className="h-9"
          value={String(tuple[1] ?? "")}
          onChange={(e) => onChange([tuple[0] ?? "", e.target.value])}
          disabled={disabled}
          aria-invalid={invalid}
          placeholder="max"
        />
      </div>
    );
  }

  // number
  return (
    <div className="relative">
      <Input
        type="number"
        inputMode="numeric"
        className={cn("h-9", field.unit && "pr-14")}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={invalid}
        placeholder={field.placeholder ?? "Value"}
      />
      {field.unit ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-2xs uppercase text-text-tertiary">
          {field.unit}
        </span>
      ) : null}
    </div>
  );
}
