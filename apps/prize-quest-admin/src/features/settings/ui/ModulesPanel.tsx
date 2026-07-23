import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/app/hooks";
import type { Module, ModuleKey, TenantFeatures } from "@/shared/contracts";
import { Toggle, toast } from "@/shared/ui";
import { usePermission } from "./usePermission";
import { useRegisterGuard } from "./guardContext";
import { PanelShell, type SaveState } from "./PanelShell";
import { useUpdateModulesMutation } from "../api";

const MODULE_LABEL: Record<ModuleKey, string> = {
  dashboard: "Dashboard",
  reports: "Reports",
  promotions: "Promotions",
  rewards: "Rewards catalog",
  players: "Players",
  rules: "Rules Engine",
  triggers: "Triggers",
  fulfillment: "Fulfillment",
  audit: "Audit logs",
  notifications: "Notifications",
  settings: "Settings",
  users: "Users & roles",
};

const MODULE_DESC: Record<ModuleKey, string> = {
  dashboard: "The operator overview home.",
  reports: "Performance and liability analytics.",
  promotions: "Campaign management.",
  rewards: "The managed reward inventory.",
  players: "Player directory and segments.",
  rules: "Automation rules engine.",
  triggers: "The event/trigger catalog.",
  fulfillment: "The physical reward queue.",
  audit: "Console-wide operator action trail.",
  notifications: "Operator notification center.",
  settings: "This configuration surface.",
  users: "Operator user management.",
};

/** Modules that map to a licensed feature flag. */
const FEATURE_FOR: Partial<Record<ModuleKey, keyof TenantFeatures>> = {
  reports: "reports",
  rewards: "rewardsCatalog",
  players: "players",
  triggers: "triggers",
  fulfillment: "fulfillment",
  audit: "auditLogs",
};

/** Core modules that can never be disabled (guards against locking yourself out). */
const CORE: ModuleKey[] = ["dashboard", "settings"];

export function ModulesPanel() {
  const context = useAppSelector((s) => s.tenant.context);
  const canManage = usePermission("settings.manage");
  const [updateModules] = useUpdateModulesMutation();
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const persisted = useMemo(() => context?.modules ?? [], [context]);
  const features = context?.tenant.features;
  const [modules, setModules] = useState<Module[]>(persisted);

  useEffect(() => setModules(persisted), [persisted]);

  const isDirty = JSON.stringify(modules) !== JSON.stringify(persisted);
  useRegisterGuard(isDirty, () => setModules(persisted));

  const licensed = (key: ModuleKey): boolean => {
    const flag = FEATURE_FOR[key];
    return flag ? Boolean(features?.[flag]) : true;
  };

  const toggle = (key: ModuleKey, enabled: boolean) => {
    setModules((prev) => prev.map((m) => (m.key === key ? { ...m, enabled } : m)));
  };

  const onSave = async () => {
    setSaveState("saving");
    try {
      await updateModules(modules).unwrap();
      setSaveState("saved");
      toast.success("Modules updated", { description: "The sidebar reflects your changes." });
    } catch {
      setSaveState("error");
      toast.error("Couldn't save modules", { description: "Please try again." });
    }
  };

  return (
    <PanelShell
      title="Modules"
      description="Enable or disable console surfaces. Saving re-renders the sidebar live."
      saveState={saveState}
      canSave={isDirty}
      onSave={onSave}
      readOnly={!canManage}
    >
      <ul className="divide-y divide-hairline">
        {modules.map((m) => {
          const key = m.key as ModuleKey;
          const isCore = CORE.includes(key);
          const isLicensed = licensed(key);
          const disabled = !canManage || isCore || !isLicensed;
          return (
            <li
              key={m.key}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium text-text-primary">
                  {MODULE_LABEL[key]}
                  {isCore ? (
                    <span className="rounded-full border border-hairline bg-surface-2 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-text-tertiary">
                      core
                    </span>
                  ) : null}
                  {!isLicensed ? (
                    <span className="rounded-full border border-warning/30 bg-warning-soft px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-warning">
                      not licensed
                    </span>
                  ) : null}
                </p>
                <p className="text-2xs text-text-tertiary">{MODULE_DESC[key]}</p>
              </div>
              <Toggle
                checked={isCore ? true : m.enabled && isLicensed}
                onCheckedChange={(v) => toggle(key, v)}
                disabled={disabled}
                label={`Toggle ${MODULE_LABEL[key]}`}
              />
            </li>
          );
        })}
      </ul>
    </PanelShell>
  );
}
