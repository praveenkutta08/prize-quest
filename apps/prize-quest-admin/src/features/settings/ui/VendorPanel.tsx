import { useEffect, useMemo, useState } from "react";
import { Lock, Pencil } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import type { TenantVendor } from "@/shared/contracts";
import {
  Button,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusPill,
  toast,
} from "@/shared/ui";
import { usePermission } from "./usePermission";
import { useRegisterGuard } from "./guardContext";
import { PanelShell, type SaveState } from "./PanelShell";
import { useUpdateVendorMutation } from "../api";

const VENDOR_LABEL: Record<TenantVendor["type"], string> = {
  konami: "Konami Gaming",
  igt: "IGT",
  aristocrat: "Aristocrat",
  lw: "Light & Wonder",
};

const VENDOR_TYPES: TenantVendor["type"][] = ["konami", "igt", "aristocrat", "lw"];
const ENVIRONMENTS = ["sandbox", "staging", "production"] as const;

export function VendorPanel() {
  const vendor = useAppSelector((s) => s.tenant.context?.tenant.vendor);
  const canManage = usePermission("settings.manage");
  const [updateVendor] = useUpdateVendorMutation();
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const persistedType = useMemo(() => vendor?.type ?? "konami", [vendor]);
  const [type, setType] = useState<TenantVendor["type"]>(persistedType);
  // Integration fields are a managed, demo-only affordance (not persisted to the contract).
  const [reveal, setReveal] = useState(false);
  const [baseUrl, setBaseUrl] = useState("https://api.konami-gaming.example.com/v2");
  const [environment, setEnvironment] = useState<(typeof ENVIRONMENTS)[number]>("sandbox");

  useEffect(() => setType(persistedType), [persistedType]);

  const isDirty = type !== persistedType;
  useRegisterGuard(isDirty, () => setType(persistedType));

  const onSave = async () => {
    setSaveState("saving");
    try {
      await updateVendor({ type }).unwrap();
      setSaveState("saved");
      toast.success("Vendor updated", { description: VENDOR_LABEL[type] });
    } catch {
      setSaveState("error");
      toast.error("Couldn't save vendor", { description: "Please try again." });
    }
  };

  return (
    <PanelShell
      title="Vendor / integration"
      description="The gaming-system vendor and its managed integration endpoint."
      saveState={saveState}
      canSave={isDirty}
      onSave={onSave}
      readOnly={!canManage}
    >
      <div className="flex items-center justify-between gap-4">
        <Field label="Vendor">
          <Select
            value={type}
            onValueChange={(v) => setType(v as TenantVendor["type"])}
            disabled={!canManage}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VENDOR_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {VENDOR_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="pt-5">
          <StatusPill tone="active" pulse>
            Connected
          </StatusPill>
        </div>
      </div>

      <div className="rounded-lg border border-hairline bg-surface-sunken p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-2xs uppercase tracking-wide text-text-tertiary">
            <Lock className="size-3" /> Managed integration
          </p>
          {canManage ? (
            <Button variant="ghost" size="sm" onClick={() => setReveal((v) => !v)}>
              <Pencil /> {reveal ? "Done" : "Edit"}
            </Button>
          ) : null}
        </div>
        <div className="space-y-3">
          <Field label="Base URL">
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              readOnly={!reveal}
              disabled={!reveal}
            />
          </Field>
          <Field label="Environment">
            <Select
              value={environment}
              onValueChange={(v) => setEnvironment(v as (typeof ENVIRONMENTS)[number])}
              disabled={!reveal}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENVIRONMENTS.map((e) => (
                  <SelectItem key={e} value={e} className="capitalize">
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <p className="text-2xs text-text-tertiary">
            Integration endpoint is managed — these fields are a demo affordance and aren't
            persisted.
          </p>
        </div>
      </div>
    </PanelShell>
  );
}
