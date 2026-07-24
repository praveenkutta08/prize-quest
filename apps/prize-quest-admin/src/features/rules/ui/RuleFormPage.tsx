import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { usePermission } from "./usePermission";
import {
  ActionConfig,
  Button,
  ConditionBuilder,
  CronField,
  EventSelector,
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
  StatusPill,
  SummaryPanel,
  Textarea,
  compileClauses,
  describeCron,
  toast,
  type ActionConfigValue,
  type ConditionGroupValue,
  type ReachTestStatus,
} from "@/shared/ui";
import {
  DEFAULT_RULE_FORM,
  RULE_CONDITION_CATALOG,
  RuleFormValues,
  toRuleBody,
  toRuleFormValues,
  type TriggerType,
} from "../model";
import {
  useCreateRuleMutation,
  useGetRuleQuery,
  useListCampaignOptionsQuery,
  useListTriggersQuery,
  useSetRuleStatusMutation,
  useTestRuleMutation,
  useUpdateRuleMutation,
} from "../api";
import { ACTION_THEN } from "./labels";

const TRIGGER_OPTIONS: { value: TriggerType; label: string }[] = [
  { value: "scheduled", label: "Scheduled" },
  { value: "event", label: "Event" },
];

type SaveState = "idle" | "saving" | "saved" | "error";

export function RuleFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const fromId = searchParams.get("from") ?? undefined;
  const isEdit = Boolean(id);
  const sourceId = id ?? fromId;

  const navigate = useNavigate();
  const canActivate = usePermission("rule.toggle");

  const source = useGetRuleQuery(sourceId ?? "", { skip: !sourceId });
  const triggers = useListTriggersQuery();
  const campaignOptions = useListCampaignOptionsQuery("all");

  const [createRule] = useCreateRuleMutation();
  const [updateRule] = useUpdateRuleMutation();
  const [setStatus] = useSetRuleStatusMutation();
  const [testRule, testState] = useTestRuleMutation();

  const ruleIdRef = useRef<string | undefined>(isEdit ? id : undefined);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [matched, setMatched] = useState<number>();

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(RuleFormValues),
    defaultValues: DEFAULT_RULE_FORM,
    mode: "onBlur",
  });
  const { control, register, reset, getValues, watch, formState } = form;
  const err = formState.errors;

  const seededRef = useRef(false);
  useEffect(() => {
    if (!sourceId || seededRef.current || !source.data) return;
    seededRef.current = true;
    const values = toRuleFormValues(source.data);
    reset(isEdit ? values : { ...values, name: `Copy of ${values.name}` });
  }, [sourceId, source.data, isEdit, reset]);

  const saveTimer = useRef<number | undefined>(undefined);
  const persist = async (): Promise<string | undefined> => {
    const body = toRuleBody(getValues());
    setSaveState("saving");
    try {
      if (!ruleIdRef.current) {
        const created = await createRule(body).unwrap();
        ruleIdRef.current = created.id;
      } else {
        await updateRule({ id: ruleIdRef.current, body }).unwrap();
      }
      setSaveState("saved");
      return ruleIdRef.current;
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
    const rid = await persist();
    if (rid) {
      toast.success("Draft saved", { description: "Your changes persist for this session." });
      navigate("/rules");
    } else {
      toast.error("Couldn't save draft");
    }
  };

  const onActivate = form.handleSubmit(async () => {
    const rid = await persist();
    if (!rid) return toast.error("Couldn't save before activating");
    try {
      await setStatus({ id: rid, status: "active" }).unwrap();
      toast.success("Rule activated", { description: getValues("name") });
      navigate("/rules");
    } catch {
      toast.error("Couldn't activate");
    }
  });

  const runTest = async () => {
    setMatched(undefined);
    try {
      const res = await testRule({
        conditions: getValues("conditions"),
        triggerType: getValues("triggerType"),
      }).unwrap();
      setMatched(res.matchedPlayers);
    } catch {
      /* summary shows error via testState */
    }
  };

  const values = watch();
  const clauses = useMemo(
    () => compileClauses(values.conditions as ConditionGroupValue, RULE_CONDITION_CATALOG),
    [values.conditions],
  );
  const testStatus: ReachTestStatus = testState.isLoading
    ? "loading"
    : testState.isError
      ? "error"
      : matched !== undefined
        ? "done"
        : "idle";

  const triggerEvents = (triggers.data ?? []).map((t) => ({
    key: t.key,
    label: t.label,
    description: t.description,
  }));
  const scheduleLine =
    values.triggerType === "scheduled"
      ? describeCron(values.cron ?? "")
      : (triggerEvents.find((e) => e.key === values.eventKey)?.label ?? "No event selected");

  if (sourceId && source.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Automation" },
          { label: "Rules Engine", href: "/rules" },
          { label: isEdit ? "Edit rule" : "New rule" },
        ]}
        title={isEdit ? "Edit rule" : "Create rule"}
        subtitle="Set up an automation rule · changes save as draft automatically."
        actions={<SaveIndicator state={saveState} />}
      />

      <FormWizardLayout
        summary={
          <SummaryPanel
            title="Rule summary"
            previewRows={[
              {
                label: "Trigger",
                value:
                  values.triggerType === "event" ? (
                    <StatusPill tone="event">Event</StatusPill>
                  ) : (
                    <StatusPill tone="scheduled">Scheduled</StatusPill>
                  ),
              },
              {
                label: "Schedule",
                value: <span className="font-mono text-xs">{scheduleLine}</span>,
              },
              { label: "Priority", value: `${values.priority || 1} / 10` },
              {
                label: "Estimated match",
                value:
                  matched !== undefined ? `~${matched.toLocaleString()} players` : "Run a test",
                emphasis: true,
              },
            ]}
            pseudocode={{
              whenClauses: clauses,
              conjunction: (values.conditions?.conjunction as "AND" | "OR") ?? "AND",
              thenClause:
                ACTION_THEN[values.action.type as keyof typeof ACTION_THEN] ?? "run action",
            }}
            test={{
              status: testStatus,
              result:
                matched !== undefined
                  ? { matchedPlayers: matched, ofEligible: matched }
                  : undefined,
              onRun: runTest,
              runLabel: "Test rule",
            }}
            footer={
              <>
                <Button
                  onClick={onActivate}
                  disabled={!canActivate}
                  title={!canActivate ? "Requires approver/ops role" : undefined}
                >
                  Activate rule
                </Button>
                <Button variant="secondary" onClick={onSaveDraft}>
                  Save as draft
                </Button>
              </>
            }
          />
        }
        sections={
          <>
            {/* 1 · Rule information */}
            <FormSection
              id="section-info"
              step={1}
              title="Rule information"
              subtitle="Name, description, trigger, priority"
              complete={Boolean(values.name)}
            >
              <Field label="Rule name" htmlFor="r-name" error={err.name?.message}>
                <Input
                  id="r-name"
                  placeholder="Birthday Bonus"
                  aria-invalid={Boolean(err.name)}
                  {...register("name")}
                />
              </Field>
              <Field label="Description" htmlFor="r-desc" error={err.description?.message}>
                <Textarea
                  id="r-desc"
                  placeholder="Send a special offer to players on their birthday…"
                  {...register("description")}
                />
              </Field>
              <FormRow>
                <Field label="Trigger type">
                  <Controller
                    control={control}
                    name="triggerType"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TRIGGER_OPTIONS.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field
                  label="Priority (1–10)"
                  htmlFor="r-priority"
                  help="Higher priority runs first when multiple match."
                  error={err.priority?.message}
                >
                  <Input
                    id="r-priority"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={10}
                    {...register("priority")}
                  />
                </Field>
              </FormRow>
            </FormSection>

            {/* 2 · Trigger */}
            <FormSection
              id="section-trigger"
              step={2}
              title="Trigger"
              subtitle="When this rule runs"
              complete={
                values.triggerType === "scheduled" ? Boolean(values.cron) : Boolean(values.eventKey)
              }
            >
              {values.triggerType === "scheduled" ? (
                <Field label="Cron expression">
                  <Controller
                    control={control}
                    name="cron"
                    render={({ field }) => (
                      <CronField
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        error={err.cron?.message}
                      />
                    )}
                  />
                </Field>
              ) : (
                <Field label="Event">
                  <Controller
                    control={control}
                    name="eventKey"
                    render={({ field }) => (
                      <EventSelector
                        events={triggerEvents}
                        value={field.value}
                        onChange={field.onChange}
                        error={err.eventKey?.message}
                      />
                    )}
                  />
                </Field>
              )}
            </FormSection>

            {/* 3 · Conditions */}
            <FormSection
              id="section-conditions"
              step={3}
              title="Conditions"
              subtitle="Define when this rule should trigger"
              complete={(values.conditions?.conditions?.length ?? 0) > 0}
            >
              <Controller
                control={control}
                name="conditions"
                render={({ field }) => (
                  <ConditionBuilder
                    catalog={RULE_CONDITION_CATALOG}
                    value={field.value as ConditionGroupValue}
                    onChange={field.onChange}
                    emptyHint="No conditions — the rule fires for every triggered player."
                  />
                )}
              />
            </FormSection>

            {/* 4 · Actions */}
            <FormSection
              id="section-actions"
              step={4}
              title="Actions"
              subtitle="What happens when conditions match"
              complete={Boolean(values.action?.type)}
            >
              <Controller
                control={control}
                name="action"
                render={({ field }) => (
                  <ActionConfig
                    value={field.value as ActionConfigValue}
                    onChange={field.onChange}
                    campaignOptions={campaignOptions.data ?? []}
                    errors={{
                      offerType: err.action?.offerType?.message,
                      points: err.action?.points?.message,
                      campaignId: err.action?.campaignId?.message,
                    }}
                  />
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
