import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector } from "@/app/hooks";
import { Field, FormRow, Input, toast } from "@/shared/ui";
import { usePermission } from "./usePermission";
import { useRegisterGuard } from "./guardContext";
import { PanelShell, type SaveState } from "./PanelShell";
import { BrandForm } from "../model";
import { useUpdateBrandMutation } from "../api";

export function GeneralPanel() {
  const brand = useAppSelector((s) => s.tenant.context?.tenant.brand);
  const canManage = usePermission("settings.manage");
  const [updateBrand] = useUpdateBrandMutation();
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const form = useForm<BrandForm>({
    resolver: zodResolver(BrandForm),
    values: {
      productName: brand?.productName ?? "",
      operatorName: brand?.operatorName ?? "",
      initials: brand?.initials ?? "",
      tagline: brand?.tagline ?? "",
      logoRef: "",
    },
    mode: "onBlur",
  });
  const { register, handleSubmit, reset, watch, formState } = form;
  useRegisterGuard(formState.isDirty, () => reset());

  const values = watch();

  const onSave = handleSubmit(async (v) => {
    setSaveState("saving");
    try {
      await updateBrand({
        productName: v.productName,
        operatorName: v.operatorName,
        initials: v.initials.toUpperCase(),
        tagline: v.tagline ?? "",
      }).unwrap();
      setSaveState("saved");
      reset(v);
      toast.success("Brand updated", { description: "The console lockup reflects your changes." });
    } catch {
      setSaveState("error");
      toast.error("Couldn't save brand", { description: "Please try again." });
    }
  });

  // Clear the saved indicator once the operator edits again.
  useEffect(() => {
    if (formState.isDirty && saveState === "saved") setSaveState("idle");
  }, [formState.isDirty, saveState]);

  return (
    <PanelShell
      title="General / Brand"
      description="Product and operator identity. Saving updates the console brand lockup live."
      saveState={saveState}
      canSave={formState.isDirty && formState.isValid}
      onSave={onSave}
      readOnly={!canManage}
    >
      <FormRow>
        <Field
          label="Product name"
          htmlFor="s-product"
          error={formState.errors.productName?.message}
        >
          <Input id="s-product" disabled={!canManage} {...register("productName")} />
        </Field>
        <Field
          label="Operator name"
          htmlFor="s-operator"
          error={formState.errors.operatorName?.message}
        >
          <Input id="s-operator" disabled={!canManage} {...register("operatorName")} />
        </Field>
      </FormRow>
      <FormRow>
        <Field
          label="Brand initials"
          htmlFor="s-initials"
          help="The topbar lockup mark (≤3 chars)."
          error={formState.errors.initials?.message}
        >
          <Input id="s-initials" maxLength={3} disabled={!canManage} {...register("initials")} />
        </Field>
        <Field label="Tagline" htmlFor="s-tagline">
          <Input id="s-tagline" disabled={!canManage} {...register("tagline")} />
        </Field>
      </FormRow>
      <Field label="Logo / media reference" htmlFor="s-logo" help="A mock ref — no real upload.">
        <Input
          id="s-logo"
          placeholder="https://cdn.example.com/brand/logo.svg"
          disabled={!canManage}
          {...register("logoRef")}
        />
      </Field>

      {/* Live preview tile */}
      <div className="flex items-center gap-3 rounded-lg border border-hairline bg-surface-sunken px-4 py-3">
        <span className="flex size-9 items-center justify-center rounded-lg border border-brand/30 bg-brand-subtle font-display text-sm font-semibold text-brand-bright">
          {(values.initials || "CR").slice(0, 3).toUpperCase()}
        </span>
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold text-text-primary">
            {values.productName || "Prize Quest"}
          </p>
          <p className="text-2xs text-text-tertiary">{values.operatorName || "Operator"}</p>
        </div>
      </div>
    </PanelShell>
  );
}
