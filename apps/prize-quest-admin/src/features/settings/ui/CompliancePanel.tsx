import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector } from "@/app/hooks";
import type { Jurisdiction } from "@/shared/contracts";
import { Field, Input, PresetChips, Toggle, toast } from "@/shared/ui";
import { usePermission } from "./usePermission";
import { useRegisterGuard } from "./guardContext";
import { PanelShell, type SaveState } from "./PanelShell";
import { ComplianceForm } from "../model";
import { useUpdateComplianceMutation } from "../api";

const JURISDICTIONS: { value: Jurisdiction; label: string }[] = [
  { value: "NV", label: "Nevada" },
  { value: "NJ", label: "New Jersey" },
  { value: "MI", label: "Michigan" },
  { value: "PA", label: "Pennsylvania" },
  { value: "tribal", label: "Tribal" },
];

export function CompliancePanel() {
  const compliance = useAppSelector((s) => s.tenant.context?.tenant.compliance);
  const canManage = usePermission("settings.manage");
  const [updateCompliance] = useUpdateComplianceMutation();
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const form = useForm<ComplianceForm>({
    resolver: zodResolver(ComplianceForm),
    values: {
      jurisdiction: compliance?.jurisdiction ?? "NV",
      jurisdictionLabel: compliance?.jurisdictionLabel ?? "",
      budgetCapEnforced: compliance?.budgetCapEnforced ?? true,
    },
    mode: "onBlur",
  });
  const { register, handleSubmit, reset, watch, setValue, formState } = form;
  useRegisterGuard(formState.isDirty, () => reset());

  const jurisdiction = watch("jurisdiction");
  const budgetCapEnforced = watch("budgetCapEnforced");

  useEffect(() => {
    if (formState.isDirty && saveState === "saved") setSaveState("idle");
  }, [formState.isDirty, saveState]);

  const onSave = handleSubmit(async (v) => {
    setSaveState("saving");
    try {
      await updateCompliance(v).unwrap();
      setSaveState("saved");
      reset(v);
      toast.success("Compliance updated");
    } catch {
      setSaveState("error");
      toast.error("Couldn't save compliance", { description: "Please try again." });
    }
  });

  return (
    <PanelShell
      title="Compliance"
      description="Jurisdiction and budget-cap enforcement for this tenant."
      saveState={saveState}
      canSave={formState.isDirty && formState.isValid}
      onSave={onSave}
      readOnly={!canManage}
    >
      <Field label="Jurisdiction">
        <PresetChips
          ariaLabel="Jurisdiction"
          value={jurisdiction}
          chips={JURISDICTIONS}
          onSelect={(v) =>
            canManage && setValue("jurisdiction", v as Jurisdiction, { shouldDirty: true })
          }
        />
      </Field>
      <Field
        label="Jurisdiction label"
        htmlFor="c-label"
        help="The regulator name shown in compliance contexts."
        error={formState.errors.jurisdictionLabel?.message}
      >
        <Input
          id="c-label"
          placeholder="Nevada Gaming Control Board"
          disabled={!canManage}
          {...register("jurisdictionLabel")}
        />
      </Field>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-hairline bg-surface-sunken px-4 py-3">
        <div>
          <p className="text-sm font-medium text-text-primary">Enforce budget caps</p>
          <p className="text-2xs text-text-tertiary">
            Gates campaign budget caps downstream when on.
          </p>
        </div>
        <Toggle
          checked={budgetCapEnforced}
          onCheckedChange={(v) => setValue("budgetCapEnforced", v, { shouldDirty: true })}
          disabled={!canManage}
          label="Enforce budget caps"
        />
      </div>
    </PanelShell>
  );
}
