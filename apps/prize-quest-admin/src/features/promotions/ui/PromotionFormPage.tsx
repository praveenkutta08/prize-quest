import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, Loader2, Plus } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { usePermission } from "./usePermission";
import {
  Button,
  ConditionBuilder,
  Field,
  FormRow,
  FormSection,
  FormWizardLayout,
  Input,
  PageHeader,
  PresetChips,
  PrizePicker,
  PrizeThumbGrid,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  SummaryPanel,
  Textarea,
  compileClauses,
  toast,
  type ConditionGroupValue,
  type ReachTestStatus,
} from "@/shared/ui";
import { moneyPrecise } from "@/shared/lib/format";
import {
  useCreateCampaignMutation,
  useGetCampaignQuery,
  useListPrizesQuery,
  usePreviewReachMutation,
  useSetCampaignStatusMutation,
  useUpdateCampaignMutation,
} from "../api";
import {
  CampaignFormValues,
  DEFAULT_FORM_VALUES,
  buildEligibilityCatalog,
  toCampaignBody,
  toFormValues,
  type CampaignType,
  type CountsToward,
  type EarnActivity,
  type Recurrence,
} from "../model";
import {
  ACTIVITY_LABEL,
  COUNTS_TOWARD_LABEL,
  RECURRENCE_LABEL,
  TYPE_LABEL,
  scheduleLabel,
} from "./labels";

const OWNERS = [
  { id: "u-james-chen", name: "James Chen" },
  { id: "u-maya-rodriguez", name: "Maya Rodriguez" },
];
const APPROVERS = [{ id: "u-maya-rodriguez", name: "Maya Rodriguez (VP Marketing)" }];

const TYPE_OPTIONS: CampaignType[] = ["goal-based", "milestone", "repeating-multi-tier"];
const RECURRENCE_OPTIONS: Recurrence[] = ["one-shot", "weekly-reset", "daily-reset"];
const ACTIVITY_OPTIONS: EarnActivity[] = [
  "slot-wager",
  "table-avg-bet",
  "fnb-spend",
  "hotel-night",
];
const COUNTS_OPTIONS: CountsToward[] = ["coin-in", "theoretical-win", "actual-win"];

const SCHEDULE_PRESETS = [
  { value: "q3-2026", label: "Q3 2026", start: "2026-07-01", end: "2026-09-30" },
  { value: "month", label: "This month", start: "2026-07-01", end: "2026-07-31" },
  { value: "week", label: "This week", start: "2026-07-20", end: "2026-07-26" },
];

type SaveState = "idle" | "saving" | "saved" | "error";

export function PromotionFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const fromId = searchParams.get("from") ?? undefined;
  const isEdit = Boolean(id);
  const sourceId = id ?? fromId;

  const navigate = useNavigate();
  const canActivate = usePermission("campaign.activate");
  const properties = useAppSelector((s) => s.tenant.context?.properties ?? []);
  const catalog = useMemo(
    () => buildEligibilityCatalog(properties.map((p) => ({ value: p.id, label: p.name }))),
    [properties],
  );

  const source = useGetCampaignQuery(sourceId ?? "", { skip: !sourceId });
  const prizes = useListPrizesQuery();

  const [createCampaign] = useCreateCampaignMutation();
  const [updateCampaign] = useUpdateCampaignMutation();
  const [setStatus] = useSetCampaignStatusMutation();
  const [previewReach, previewState] = usePreviewReachMutation();

  const campaignIdRef = useRef<string | undefined>(isEdit ? id : undefined);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [reachResult, setReachResult] = useState<{ matchedPlayers: number; ofEligible: number }>();

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(CampaignFormValues),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onBlur",
  });
  const { control, register, reset, getValues, watch, formState } = form;

  // Seed edit/duplicate mode once the source campaign loads.
  const seededRef = useRef(false);
  useEffect(() => {
    if (!sourceId || seededRef.current || !source.data) return;
    seededRef.current = true;
    const values = toFormValues(source.data);
    reset(isEdit ? values : { ...values, name: `Copy of ${values.name}` });
  }, [sourceId, source.data, isEdit, reset]);

  // Debounced autosave: create on first change, then update.
  const saveTimer = useRef<number | undefined>(undefined);
  const persist = async (): Promise<string | undefined> => {
    const body = toCampaignBody(getValues());
    setSaveState("saving");
    try {
      if (!campaignIdRef.current) {
        const created = await createCampaign(body).unwrap();
        campaignIdRef.current = created.id;
      } else {
        await updateCampaign({ id: campaignIdRef.current, body }).unwrap();
      }
      setSaveState("saved");
      return campaignIdRef.current;
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

  // Deep-link to a section (from the detail card "Edit" links).
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [source.data]);

  const onSaveDraft = async () => {
    const cid = await persist();
    if (cid) {
      toast.success("Draft saved", { description: "Your changes persist for this session." });
      navigate(`/promotions/${cid}`);
    } else {
      toast.error("Couldn't save draft", { description: "Please try again." });
    }
  };

  const onActivate = form.handleSubmit(async () => {
    const cid = await persist();
    if (!cid) {
      toast.error("Couldn't save before activating");
      return;
    }
    try {
      await setStatus({ id: cid, status: "active" }).unwrap();
      toast.success("Campaign activated", { description: getValues("name") });
      navigate(`/promotions/${cid}`);
    } catch {
      toast.error("Couldn't activate", { description: "Please try again." });
    }
  });

  const runReach = async () => {
    setReachResult(undefined);
    try {
      const body = toCampaignBody(getValues());
      const res = await previewReach({
        eligibility: getValues("eligibility"),
        earnRule: body.earnRule,
      }).unwrap();
      setReachResult(res);
    } catch {
      /* summary panel shows the error state via previewState */
    }
  };

  // Live summary bindings.
  const values = watch();
  const selectedPrizes = (prizes.data ?? []).filter((p) => values.prizeIds?.includes(p.id));
  const clauses = useMemo(
    () => compileClauses(values.eligibility as ConditionGroupValue, catalog),
    [values.eligibility, catalog],
  );
  const earnClause =
    values.earnRule?.threshold && Number(values.earnRule.threshold) > 0
      ? `${values.earnRule.activity.replace(/-/g, "_")} ≥ ${moneyPrecise(Number(values.earnRule.threshold))}`
      : null;
  const testStatus: ReachTestStatus = previewState.isLoading
    ? "loading"
    : previewState.isError
      ? "error"
      : reachResult
        ? "done"
        : "idle";

  const err = formState.errors;

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
          { label: "Operator" },
          { label: "Promotions", href: "/promotions" },
          { label: isEdit ? "Edit campaign" : "New campaign" },
        ]}
        title={isEdit ? "Edit campaign" : "Create campaign"}
        subtitle="Configure a Prize Quest promotion · changes save as draft automatically."
        actions={<SaveIndicator state={saveState} />}
      />

      <FormWizardLayout
        summary={
          <SummaryPanel
            previewRows={[
              { label: "Campaign", value: values.name || "Untitled campaign" },
              {
                label: "Type · Schedule",
                value: `${TYPE_LABEL[values.type]} · ${scheduleLabel(values.schedule?.start ?? "", values.schedule?.end ?? "")}`,
              },
              {
                label: "Estimated reach",
                value: reachResult
                  ? `~${reachResult.matchedPlayers.toLocaleString()} players`
                  : "Run a preview",
                emphasis: true,
              },
            ]}
            pseudocode={{
              whenClauses: earnClause ? [...clauses, earnClause] : clauses,
              conjunction: (values.eligibility?.conjunction as "AND" | "OR") ?? "AND",
              thenClause: "unlock prize choice",
            }}
            test={{ status: testStatus, result: reachResult, onRun: runReach }}
            footer={
              <>
                <Button
                  onClick={onActivate}
                  disabled={!canActivate}
                  title={!canActivate ? "Requires approver role" : undefined}
                >
                  Activate campaign
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
            {/* 1 · Basics */}
            <FormSection
              id="section-basics"
              step={1}
              title="Basics"
              subtitle="Name, type, and description"
              complete={Boolean(values.name && values.ownerId)}
            >
              <Field label="Campaign name" htmlFor="f-name" error={err.name?.message}>
                <Input
                  id="f-name"
                  placeholder="Summer Bash 2026"
                  aria-invalid={Boolean(err.name)}
                  {...register("name")}
                />
              </Field>
              <FormRow>
                <Field label="Campaign type">
                  <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TYPE_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>
                              {TYPE_LABEL[t]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field label="Internal owner" error={err.ownerId?.message}>
                  <Controller
                    control={control}
                    name="ownerId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OWNERS.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </FormRow>
              <Field
                label="Player-facing description"
                htmlFor="f-desc"
                help="Shown in the patron module · keep under 280 characters."
                error={err.description?.message}
              >
                <Textarea
                  id="f-desc"
                  placeholder="Wager $500 on slots to choose your prize…"
                  {...register("description")}
                />
              </Field>
            </FormSection>

            {/* 2 · Schedule */}
            <FormSection
              id="section-schedule"
              step={2}
              title="Schedule"
              subtitle="Active window and recurrence"
              complete={Boolean(values.schedule?.start && values.schedule?.end)}
            >
              <FormRow>
                <Field label="Start date" htmlFor="f-start" error={err.schedule?.start?.message}>
                  <Input
                    id="f-start"
                    type="date"
                    aria-invalid={Boolean(err.schedule?.start)}
                    {...register("schedule.start")}
                  />
                </Field>
                <Field label="End date" htmlFor="f-end" error={err.schedule?.end?.message}>
                  <Input
                    id="f-end"
                    type="date"
                    aria-invalid={Boolean(err.schedule?.end)}
                    {...register("schedule.end")}
                  />
                </Field>
              </FormRow>
              <Field label="Recurrence">
                <Controller
                  control={control}
                  name="schedule.recurrence"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RECURRENCE_OPTIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {RECURRENCE_LABEL[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <PresetChips
                ariaLabel="Schedule presets"
                chips={SCHEDULE_PRESETS}
                onSelect={(value) => {
                  const preset = SCHEDULE_PRESETS.find((p) => p.value === value);
                  if (!preset) return;
                  form.setValue("schedule.start", preset.start, { shouldDirty: true });
                  form.setValue("schedule.end", preset.end, { shouldDirty: true });
                }}
              />
            </FormSection>

            {/* 3 · Eligibility */}
            <FormSection
              id="section-eligibility"
              step={3}
              title="Eligibility"
              subtitle="Who qualifies for this campaign"
              complete={(values.eligibility?.conditions?.length ?? 0) > 0}
            >
              <Controller
                control={control}
                name="eligibility"
                render={({ field }) => (
                  <ConditionBuilder
                    catalog={catalog}
                    value={field.value as ConditionGroupValue}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormSection>

            {/* 4 · Earn rules */}
            <FormSection
              id="section-earn"
              step={4}
              title="Earn rules"
              subtitle="What players do to qualify"
              complete={Number(values.earnRule?.threshold) > 0}
            >
              <FormRow>
                <Field label="Activity">
                  <Controller
                    control={control}
                    name="earnRule.activity"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIVITY_OPTIONS.map((a) => (
                            <SelectItem key={a} value={a}>
                              {ACTIVITY_LABEL[a]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field
                  label="Threshold ($)"
                  htmlFor="f-threshold"
                  error={err.earnRule?.threshold?.message}
                >
                  <Input
                    id="f-threshold"
                    type="number"
                    inputMode="numeric"
                    placeholder="500"
                    {...register("earnRule.threshold")}
                  />
                </Field>
              </FormRow>
              <FormRow>
                <Field label="Currency">
                  <Input value="USD" disabled readOnly />
                </Field>
                <Field label="Counts toward">
                  <Controller
                    control={control}
                    name="earnRule.countsToward"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTS_OPTIONS.map((cw) => (
                            <SelectItem key={cw} value={cw}>
                              {COUNTS_TOWARD_LABEL[cw]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </FormRow>
              <Field label="Time window (optional)" htmlFor="f-window">
                <Input
                  id="f-window"
                  placeholder="12:00 AM – 11:59 PM Sunday"
                  {...register("earnRule.timeWindow")}
                />
              </Field>
            </FormSection>

            {/* 5 · Prize catalog */}
            <FormSection
              id="section-prizes"
              step={5}
              title="Prize catalog"
              subtitle="Rewards players can claim"
              complete={(values.prizeIds?.length ?? 0) > 0}
            >
              <Controller
                control={control}
                name="prizeIds"
                render={({ field }) => (
                  <div className="space-y-3">
                    <PrizeThumbGrid
                      prizes={selectedPrizes}
                      showValue
                      onRemove={(pid) => field.onChange(field.value.filter((x) => x !== pid))}
                      emptyHint="No prizes selected yet — add from the catalog."
                    />
                    {err.prizeIds ? (
                      <p className="text-2xs text-danger" role="alert">
                        {err.prizeIds.message}
                      </p>
                    ) : null}
                    <PrizePicker
                      prizes={prizes.data ?? []}
                      loading={prizes.isLoading}
                      selectedIds={field.value}
                      onChange={field.onChange}
                      trigger={
                        <Button type="button" variant="secondary" size="sm">
                          <Plus /> Add prize from catalog
                        </Button>
                      }
                    />
                  </div>
                )}
              />
            </FormSection>

            {/* 6 · Compliance */}
            <FormSection
              id="section-compliance"
              step={6}
              title="Compliance"
              subtitle="Budget, approval, and filing"
              complete={Number(values.compliance?.budgetCap) > 0}
            >
              <FormRow>
                <Field
                  label="Budget cap ($)"
                  htmlFor="f-budget"
                  error={err.compliance?.budgetCap?.message}
                >
                  <Input
                    id="f-budget"
                    type="number"
                    inputMode="numeric"
                    placeholder="35000"
                    {...register("compliance.budgetCap")}
                  />
                </Field>
                <Field label="Approver">
                  <Controller
                    control={control}
                    name="compliance.approverId"
                    render={({ field }) => (
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select approver" />
                        </SelectTrigger>
                        <SelectContent>
                          {APPROVERS.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </FormRow>
              <Field label="Gaming filing reference" htmlFor="f-filing">
                <Input
                  id="f-filing"
                  placeholder="NV-CR-2026-Q3-PQ-101"
                  {...register("compliance.filingRef")}
                />
              </Field>
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
