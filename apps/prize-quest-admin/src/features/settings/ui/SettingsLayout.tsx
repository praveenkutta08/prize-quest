import { useState, type ComponentType } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Building2, Palette, Plug, ShieldCheck, SlidersHorizontal, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  PageHeader,
} from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { GuardProvider } from "./guard";
import { useGuard } from "./guardContext";
import { GeneralPanel } from "./GeneralPanel";
import { ThemePanel } from "./ThemePanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { ModulesPanel } from "./ModulesPanel";
import { CompliancePanel } from "./CompliancePanel";
import { VendorPanel } from "./VendorPanel";

const PANEL_COMPONENT: Record<string, ComponentType> = {
  general: GeneralPanel,
  theme: ThemePanel,
  properties: PropertiesPanel,
  modules: ModulesPanel,
  compliance: CompliancePanel,
  vendor: VendorPanel,
};

interface PanelDef {
  key: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const PANELS: PanelDef[] = [
  {
    key: "general",
    label: "General / Brand",
    icon: Store,
    description: "Product & operator identity",
  },
  {
    key: "theme",
    label: "Theme & appearance",
    icon: Palette,
    description: "Runtime token overrides",
  },
  { key: "properties", label: "Properties", icon: Building2, description: "The property registry" },
  {
    key: "modules",
    label: "Modules",
    icon: SlidersHorizontal,
    description: "Enabled console surfaces",
  },
  {
    key: "compliance",
    label: "Compliance",
    icon: ShieldCheck,
    description: "Jurisdiction & budget caps",
  },
  { key: "vendor", label: "Vendor", icon: Plug, description: "Integration configuration" },
];

const PANEL_LABEL = Object.fromEntries(PANELS.map((p) => [p.key, p.label]));

export function SettingsLayout() {
  return (
    <GuardProvider>
      <SettingsLayoutInner />
    </GuardProvider>
  );
}

function SettingsLayoutInner() {
  const { panel } = useParams();
  const navigate = useNavigate();
  const guard = useGuard();
  const [pending, setPending] = useState<string | null>(null);

  if (!panel || !PANEL_COMPONENT[panel]) return <Navigate to="/settings/general" replace />;

  const activeLabel = PANEL_LABEL[panel] ?? "Settings";
  const ActivePanel = PANEL_COMPONENT[panel];

  const goTo = (key: string) => {
    if (key === panel) return;
    if (guard.current?.isDirty) {
      setPending(key);
    } else {
      navigate(`/settings/${key}`);
    }
  };

  const discardAndGo = () => {
    guard.current?.reset();
    const target = pending;
    setPending(null);
    if (target) navigate(`/settings/${target}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Admin" }, { label: "Settings" }, { label: activeLabel }]}
        title="Settings"
        subtitle="Tenant-level configuration — branding, theme, properties, modules, compliance, and integrations."
      />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
        {/* Sub-nav */}
        <nav aria-label="Settings panels" className="flex flex-col gap-1">
          {PANELS.map((p) => {
            const active = p.key === panel;
            const dirty = active && Boolean(guard.current?.isDirty);
            const Icon = p.icon;
            return (
              <button
                key={p.key}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => goTo(p.key)}
                className={cn(
                  "group flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  active
                    ? "border-brand/30 bg-brand-subtle"
                    : "border-transparent hover:border-hairline hover:bg-surface-1",
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    active ? "text-brand-bright" : "text-text-tertiary",
                  )}
                  strokeWidth={1.8}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        active ? "text-text-primary" : "text-text-secondary",
                      )}
                    >
                      {p.label}
                    </span>
                    {dirty ? (
                      <span
                        className="size-1.5 rounded-full bg-warning"
                        aria-label="Unsaved changes"
                      />
                    ) : null}
                  </span>
                  <span className="block truncate text-2xs text-text-tertiary">
                    {p.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Active panel */}
        <div className="min-w-0">
          <ActivePanel />
        </div>
      </div>

      <Dialog open={Boolean(pending)} onOpenChange={(v) => !v && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes on the {activeLabel} panel. Leaving will discard them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPending(null)}>
              Keep editing
            </Button>
            <Button variant="danger" onClick={discardAndGo}>
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
