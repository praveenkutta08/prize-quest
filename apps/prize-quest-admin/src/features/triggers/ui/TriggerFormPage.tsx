import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { usePermission } from "./usePermission";
import {
  Button,
  Checkbox,
  DetailCard,
  Field,
  FormRow,
  FormSection,
  FormWizardLayout,
  Input,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
  toast,
} from "@/shared/ui";
import {
  DEFAULT_TRIGGER_FORM,
  TriggerFormValues,
  toTriggerBody,
  toTriggerFormValues,
  type PayloadFieldType,
  type TriggerCategory,
} from "../model";
import {
  useCreateTriggerMutation,
  useGetTriggerDefQuery,
  useSetTriggerStatusMutation,
  useUpdateTriggerMutation,
} from "../api";
import { CATEGORY_LABEL } from "./labels";

const CATEGORIES: TriggerCategory[] = ["gameplay", "lifecycle", "financial", "schedule"];
const FIELD_TYPES: PayloadFieldType[] = ["string", "number", "boolean", "enum"];

type SaveState = "idle" | "saving" | "saved" | "error";

export function TriggerFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const fromId = searchParams.get("from") ?? undefined;
  const isEdit = Boolean(id);
  const sourceId = id ?? fromId;
  const navigate = useNavigate();
  const canManage = usePermission("triggers.manage");
  const properties = useAppSelector((s) => s.tenant.context?.properties ?? []);

  const source = useGetTriggerDefQuery(sourceId ?? "", { skip: !sourceId });
  const [createTrigger] = useCreateTriggerMutation();
  const [updateTrigger] = useUpdateTriggerMutation();
  const [setStatus] = useSetTriggerStatusMutation();

  const triggerIdRef = useRef<string | undefined>(isEdit ? id : undefined);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const form = useForm<TriggerFormValues>({
    resolver: zodResolver(TriggerFormValues),
    defaultValues: DEFAULT_TRIGGER_FORM,
    mode: "onBlur",
  });
  const { control, register, reset, getValues, watch, formState } = form;
  const err = formState.errors;
  const fields = useFieldArray({ control, name: "payloadFields" });

  const seededRef = useRef(false);
  useEffect(() => {
    if (!sourceId || seededRef.current || !source.data) return;
    seededRef.current = true;
    const values = toTriggerFormValues(source.data);
    reset(
      isEdit ? values : { ...values, label: `Copy of ${values.label}`, key: `${values.key}-copy` },
    );
  }, [sourceId, source.data, isEdit, reset]);

  // Debounced autosave.
  const saveTimer = useRef<number | undefined>(undefined);
  const persist = async (): Promise<string | undefined> => {
    const body = toTriggerBody(getValues());
    setSaveState("saving");
    try {
      if (!triggerIdRef.current) {
        const created = await createTrigger(body).unwrap();
        triggerIdRef.current = created.id;
      } else {
        await updateTrigger({ id: triggerIdRef.current, body }).unwrap();
      }
      setSaveState("saved");
      return triggerIdRef.current;
    } catch {
      setSaveState("error");
      return undefined;
    }
  };

  useEffect(() => {
    const sub = watch(() => {
      if (!formState.isDirty) return;
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(persist, 900);
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, formState.isDirty]);

  const onSaveDraft = async () => {
    const tid = await persist();
    if (tid) {
      toast.success("Draft saved", { description: "Your changes persist for this session." });
      navigate(`/triggers/${tid}`);
    } else {
      toast.error("Couldn't save draft", { description: "Please try again." });
    }
  };

  const onActivate = form.handleSubmit(async () => {
    const tid = await persist();
    if (!tid) {
      toast.error("Couldn't save before activating");
      return;
    }
    try {
      await setStatus({ id: tid, status: "active" }).unwrap();
      toast.success("Trigger activated", { description: getValues("label") });
      navigate(`/triggers/${tid}`);
    } catch {
      toast.error("Couldn't activate", { description: "Please try again." });
    }
  });

  const values = watch();

  if (sourceId && source.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Automation" },
          { label: "Triggers", href: "/triggers" },
          { label: isEdit ? "Edit trigger" : "New trigger" },
        ]}
        title={isEdit ? "Edit trigger" : "Create trigger"}
        subtitle="Define an event trigger the Rules Engine can bind to · changes save as draft automatically."
        actions={<SaveIndicator state={saveState} />}
      />

      <FormWizardLayout
        summary={
          <DetailCard title="Summary">
            <div className="space-y-2 text-sm">
              <p className="font-medium text-text-primary">{values.label || "Untitled trigger"}</p>
              <p className="font-mono text-2xs text-text-tertiary">{values.key || "trigger-key"}</p>
              <p className="text-text-tertiary">{CATEGORY_LABEL[values.category]}</p>
              <p className="text-2xs text-text-tertiary">
                {values.payloadFields.filter((f) => f.name).length} payload fields
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-hairline pt-4">
              <Button
                onClick={onActivate}
                disabled={!canManage}
                title={!canManage ? "Requires triggers.manage" : undefined}
              >
                Activate trigger
              </Button>
              <Button variant="secondary" onClick={onSaveDraft}>
                Save as draft
              </Button>
            </div>
          </DetailCard>
        }
        sections={
          <>
            <FormSection
              step={1}
              title="Basics"
              subtitle="Label, key, category"
              complete={Boolean(values.label && values.key)}
            >
              <FormRow>
                <Field label="Label" htmlFor="t-label" error={err.label?.message}>
                  <Input id="t-label" placeholder="Card tap" {...register("label")} />
                </Field>
                <Field label="Key" htmlFor="t-key" help="Lowercase slug" error={err.key?.message}>
                  <Input
                    id="t-key"
                    className="font-mono"
                    placeholder="card-tap"
                    {...register("key")}
                  />
                </Field>
              </FormRow>
              <Field label="Category">
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {CATEGORY_LABEL[c]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field label="Description" htmlFor="t-desc" error={err.description?.message}>
                <Textarea
                  id="t-desc"
                  placeholder="Fires when a player taps their loyalty card…"
                  {...register("description")}
                />
              </Field>
            </FormSection>

            <FormSection
              step={2}
              title="Payload fields"
              subtitle="The data this event carries"
              complete={values.payloadFields.some((f) => f.name)}
            >
              <div className="space-y-2">
                {fields.fields.map((f, i) => (
                  <div key={f.id} className="flex items-start gap-2">
                    <Input
                      placeholder="name"
                      className="font-mono"
                      {...register(`payloadFields.${i}.name`)}
                    />
                    <Controller
                      control={control}
                      name={`payloadFields.${i}.type`}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-[120px] shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPES.map((ft) => (
                              <SelectItem key={ft} value={ft} className="capitalize">
                                {ft}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Input placeholder="Label" {...register(`payloadFields.${i}.label`)} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-text-tertiary hover:text-danger"
                      onClick={() => fields.remove(i)}
                      aria-label={`Remove field ${i + 1}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-dashed"
                  onClick={() => fields.append({ name: "", type: "string", label: "" })}
                >
                  <Plus /> Add field
                </Button>
              </div>
            </FormSection>

            <FormSection
              step={3}
              title="Availability"
              subtitle="Which properties this trigger fires at"
              complete={(values.propertyIds?.length ?? 0) > 0}
            >
              <Controller
                control={control}
                name="propertyIds"
                render={({ field }) => (
                  <div className="space-y-2">
                    {properties.map((p) => {
                      const checked = field.value?.includes(p.id) ?? false;
                      return (
                        <label
                          key={p.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border border-hairline bg-surface-sunken px-3 py-2.5 text-sm transition-colors hover:border-hairline-strong"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              const next = v
                                ? [...(field.value ?? []), p.id]
                                : (field.value ?? []).filter((x) => x !== p.id);
                              field.onChange(next);
                            }}
                          />
                          <span className="flex-1 text-text-secondary">{p.name}</span>
                          <span className="font-mono text-2xs text-text-tertiary">{p.code}</span>
                        </label>
                      );
                    })}
                    {err.propertyIds ? (
                      <p className="text-2xs text-danger" role="alert">
                        {err.propertyIds.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
            </FormSection>
          </>
        }
      />
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
      {state === "saving" ? (
        <>
          <Loader2 className="size-3.5 animate-spin" /> Saving…
        </>
      ) : state === "saved" ? (
        <>
          <Check className="size-3.5 text-success" /> Draft saved
        </>
      ) : (
        <span className="text-danger">Couldn&apos;t save — retry a change</span>
      )}
    </span>
  );
}
