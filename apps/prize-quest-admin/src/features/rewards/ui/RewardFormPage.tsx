import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { usePermission } from "./usePermission";
import {
  Badge,
  Button,
  Checkbox,
  DetailCard,
  Field,
  FormRow,
  FormSection,
  FormWizardLayout,
  Input,
  PageHeader,
  PrizeThumbGrid,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  StatusPill,
  Textarea,
  toast,
  type PrizeLike,
} from "@/shared/ui";
import { money, percent } from "@/shared/lib/format";
import {
  useCreateRewardMutation,
  useGetRewardQuery,
  useListVendorsQuery,
  useSetRewardStatusMutation,
  useUpdateRewardMutation,
} from "../api";
import {
  DEFAULT_REWARD_FORM,
  RewardFormValues,
  deriveMargin,
  toRewardBody,
  toRewardFormValues,
  type FulfillmentMethod,
  type Rarity,
  type RewardCategory,
  type RewardType,
} from "../model";
import { CATEGORY_LABEL, FULFILLMENT_LABEL, RARITY_LABEL, TYPE_LABEL } from "./labels";

const CATEGORY_OPTIONS: RewardCategory[] = [
  "electronics",
  "gift-card",
  "experience",
  "free-play",
  "comp",
  "merchandise",
  "points",
];
const TYPE_OPTIONS: RewardType[] = ["physical", "digital", "free-play", "comp", "points"];
const FULFILLMENT_OPTIONS: FulfillmentMethod[] = ["ship", "pickup", "auto", "manual"];
const RARITY_OPTIONS: Rarity[] = ["common", "rare", "epic", "legendary"];

type SaveState = "idle" | "saving" | "saved" | "error";

export function RewardFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const fromId = searchParams.get("from") ?? undefined;
  const isEdit = Boolean(id);
  const sourceId = id ?? fromId;

  const navigate = useNavigate();
  const canSync = usePermission("catalog.sync");
  const properties = useAppSelector((s) => s.tenant.context?.properties ?? []);

  const source = useGetRewardQuery(sourceId ?? "", { skip: !sourceId });
  const vendors = useListVendorsQuery();

  const [createReward] = useCreateRewardMutation();
  const [updateReward] = useUpdateRewardMutation();
  const [setStatus] = useSetRewardStatusMutation();

  const rewardIdRef = useRef<string | undefined>(isEdit ? id : undefined);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const form = useForm<RewardFormValues>({
    resolver: zodResolver(RewardFormValues),
    defaultValues: DEFAULT_REWARD_FORM,
    mode: "onBlur",
  });
  const { control, register, reset, getValues, watch, formState } = form;
  const err = formState.errors;

  // Seed edit/duplicate mode once the source reward loads.
  const seededRef = useRef(false);
  useEffect(() => {
    if (!sourceId || seededRef.current || !source.data) return;
    seededRef.current = true;
    const values = toRewardFormValues(source.data);
    reset(isEdit ? values : { ...values, name: `Copy of ${values.name}` });
  }, [sourceId, source.data, isEdit, reset]);

  // Debounced autosave: create on first change, then update.
  const saveTimer = useRef<number | undefined>(undefined);
  const persist = async (): Promise<string | undefined> => {
    const body = toRewardBody(getValues());
    setSaveState("saving");
    try {
      if (!rewardIdRef.current) {
        const created = await createReward(body).unwrap();
        rewardIdRef.current = created.id;
      } else {
        await updateReward({ id: rewardIdRef.current, body }).unwrap();
      }
      setSaveState("saved");
      return rewardIdRef.current;
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
    const rid = await persist();
    if (rid) {
      toast.success("Draft saved", { description: "Your changes persist for this session." });
      navigate(`/rewards/${rid}`);
    } else {
      toast.error("Couldn't save draft", { description: "Please try again." });
    }
  };

  const onActivate = form.handleSubmit(async () => {
    const rid = await persist();
    if (!rid) {
      toast.error("Couldn't save before activating");
      return;
    }
    try {
      await setStatus({ id: rid, status: "active" }).unwrap();
      toast.success("Reward activated", { description: getValues("name") });
      navigate(`/rewards/${rid}`);
    } catch {
      toast.error("Couldn't activate", { description: "Please try again." });
    }
  });

  const values = watch();
  const margin = deriveMargin(Number(values.value) || 0, Number(values.cost) || 0);

  const previewItem: PrizeLike = {
    id: "preview",
    name: values.name || "Untitled reward",
    category: values.category,
    value: Number(values.value) || 0,
    rarity: values.rarity,
    stockCount: Number(values.stockCount) || 0,
    inStock: (Number(values.stockCount) || 0) > 0,
  };

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
          { label: "Engagement" },
          { label: "Rewards catalog", href: "/rewards" },
          { label: isEdit ? "Edit reward" : "New reward" },
        ]}
        title={isEdit ? "Edit reward" : "Create reward"}
        subtitle="Configure a catalog reward · changes save as draft automatically."
        actions={<SaveIndicator state={saveState} />}
      />

      <FormWizardLayout
        summary={
          <DetailCard title="Live preview">
            <div className="space-y-4">
              <PrizeThumbGrid
                prizes={[previewItem]}
                showValue
                showRarity
                showStock
                className="grid-cols-1"
              />
              <dl className="space-y-2 border-t border-hairline pt-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-text-tertiary">Value</dt>
                  <dd className="tabular-nums">{money(Number(values.value) || 0)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-text-tertiary">Cost</dt>
                  <dd className="tabular-nums text-text-secondary">
                    {money(Number(values.cost) || 0)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-text-tertiary">Margin</dt>
                  <dd className="font-mono tabular-nums text-success">{percent(margin)}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
                <StatusPill tone="draft">Draft</StatusPill>
                <Badge variant="brand" className="capitalize">
                  {RARITY_LABEL[values.rarity]}
                </Badge>
                <Badge variant="neutral">{TYPE_LABEL[values.rewardType]}</Badge>
              </div>
              <div className="flex flex-col gap-2 border-t border-hairline pt-4">
                <Button
                  onClick={onActivate}
                  disabled={!canSync}
                  title={!canSync ? "Requires catalog.sync permission" : undefined}
                >
                  {isEdit ? "Publish reward" : "Activate reward"}
                </Button>
                <Button variant="secondary" onClick={onSaveDraft}>
                  Save as draft
                </Button>
              </div>
            </div>
          </DetailCard>
        }
        sections={
          <>
            {/* 1 · Basics */}
            <FormSection
              id="section-basics"
              step={1}
              title="Basics"
              subtitle="Name, category, and description"
              complete={Boolean(values.name)}
            >
              <Field label="Reward name" htmlFor="f-name" error={err.name?.message}>
                <Input id="f-name" placeholder="AirPods Pro (2nd gen)" {...register("name")} />
              </Field>
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
                        {CATEGORY_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {CATEGORY_LABEL[c]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field label="Description" htmlFor="f-desc" error={err.description?.message}>
                <Textarea
                  id="f-desc"
                  placeholder="A short description shown in the catalog…"
                  {...register("description")}
                />
              </Field>
            </FormSection>

            {/* 2 · Type & value */}
            <FormSection
              id="section-value"
              step={2}
              title="Type & value"
              subtitle="Retail value, operator cost, and derived margin"
              complete={Number(values.value) > 0}
            >
              <Field label="Reward type">
                <Controller
                  control={control}
                  name="rewardType"
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
              <FormRow>
                <Field label="Retail value ($)" htmlFor="f-value" error={err.value?.message}>
                  <Input
                    id="f-value"
                    type="number"
                    inputMode="numeric"
                    placeholder="249"
                    {...register("value")}
                  />
                </Field>
                <Field label="Operator cost ($)" htmlFor="f-cost" error={err.cost?.message}>
                  <Input
                    id="f-cost"
                    type="number"
                    inputMode="numeric"
                    placeholder="189"
                    {...register("cost")}
                  />
                </Field>
              </FormRow>
              <div className="flex items-center justify-between rounded-lg border border-hairline bg-surface-sunken px-4 py-3">
                <span className="text-xs uppercase tracking-wide text-text-tertiary">
                  Derived margin
                </span>
                <span className="font-mono text-lg font-semibold tabular-nums text-success">
                  {percent(margin)}
                </span>
              </div>
            </FormSection>

            {/* 3 · Stock & vendor */}
            <FormSection
              id="section-stock"
              step={3}
              title="Stock & vendor"
              subtitle="Inventory and sourcing"
              complete={Number(values.stockCount) > 0}
            >
              <FormRow>
                <Field label="Stock count" htmlFor="f-stock" error={err.stockCount?.message}>
                  <Input
                    id="f-stock"
                    type="number"
                    inputMode="numeric"
                    placeholder="64"
                    {...register("stockCount")}
                  />
                </Field>
                <Field label="Low-stock threshold" htmlFor="f-lowstock">
                  <Input
                    id="f-lowstock"
                    type="number"
                    inputMode="numeric"
                    placeholder="15"
                    {...register("lowStockThreshold")}
                  />
                </Field>
              </FormRow>
              <FormRow>
                <Field label="Vendor">
                  <Controller
                    control={control}
                    name="vendorId"
                    render={({ field }) => (
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          {(vendors.data ?? []).map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field label="Vendor SKU" htmlFor="f-sku">
                  <Input id="f-sku" placeholder="APL-APP-2" {...register("vendorSku")} />
                </Field>
              </FormRow>
            </FormSection>

            {/* 4 · Fulfillment */}
            <FormSection
              id="section-fulfillment"
              step={4}
              title="Fulfillment"
              subtitle="How the reward reaches the player"
              complete
            >
              <FormRow>
                <Field label="Fulfillment method">
                  <Controller
                    control={control}
                    name="fulfillmentMethod"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FULFILLMENT_OPTIONS.map((m) => (
                            <SelectItem key={m} value={m}>
                              {FULFILLMENT_LABEL[m]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field label="Rarity">
                  <Controller
                    control={control}
                    name="rarity"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RARITY_OPTIONS.map((rr) => (
                            <SelectItem key={rr} value={rr}>
                              {RARITY_LABEL[rr]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </FormRow>
            </FormSection>

            {/* 5 · Availability */}
            <FormSection
              id="section-availability"
              step={5}
              title="Availability"
              subtitle="Which properties offer this reward"
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

            {/* 6 · Media */}
            <FormSection
              id="section-media"
              step={6}
              title="Media"
              subtitle="Image or asset reference"
              complete={Boolean(values.imageRef)}
            >
              <Field
                label="Image reference"
                htmlFor="f-image"
                help="A URL or asset ref — the catalog renders a category icon when empty."
              >
                <Input
                  id="f-image"
                  placeholder="https://cdn.example.com/rewards/airpods.png"
                  {...register("imageRef")}
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
