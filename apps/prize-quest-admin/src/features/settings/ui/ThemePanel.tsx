import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import {
  Button,
  Field,
  FormRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from "@/shared/ui";
import {
  applyTenantTheme,
  clearTenantTheme,
  hexToChannels,
  relativeLuminance,
  tokenToHex,
} from "@/shared/lib";
import { usePermission } from "./usePermission";
import { useRegisterGuard } from "./guardContext";
import { PanelShell, type SaveState } from "./PanelShell";
import { THEME_TOKEN_KEYS, THEME_TOKEN_LABEL, type ThemeTokenKey } from "../model";
import { useUpdateThemeMutation } from "../api";

const FONT_OPTIONS: Record<"display" | "body" | "mono", { value: string; label: string }[]> = {
  display: [
    { value: "Bricolage Grotesque Variable", label: "Bricolage Grotesque" },
    { value: "Hanken Grotesk Variable", label: "Hanken Grotesk" },
  ],
  body: [
    { value: "Hanken Grotesk Variable", label: "Hanken Grotesk" },
    { value: "Bricolage Grotesque Variable", label: "Bricolage Grotesque" },
  ],
  mono: [{ value: "JetBrains Mono Variable", label: "JetBrains Mono" }],
};

const DEFAULT_FONTS = {
  display: "Bricolage Grotesque Variable",
  body: "Hanken Grotesk Variable",
  mono: "JetBrains Mono Variable",
};

export function ThemePanel() {
  const persisted = useAppSelector((s) => s.tenant.context?.theme);
  const canManage = usePermission("settings.manage");
  const [updateTheme] = useUpdateThemeMutation();
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const persistedOverrides = useMemo(() => persisted?.tokenOverrides ?? {}, [persisted]);
  const persistedFonts = useMemo(
    () => ({ ...DEFAULT_FONTS, ...(persisted?.fonts ?? {}) }),
    [persisted],
  );

  const [overrides, setOverrides] = useState<Record<string, string>>(persistedOverrides);
  const [fonts, setFonts] = useState(persistedFonts);

  // Re-sync local editor state if the persisted theme changes underneath us.
  useEffect(() => {
    setOverrides(persistedOverrides);
    setFonts(persistedFonts);
  }, [persistedOverrides, persistedFonts]);

  const isDirty =
    JSON.stringify(overrides) !== JSON.stringify(persistedOverrides) ||
    JSON.stringify(fonts) !== JSON.stringify(persistedFonts);

  // Live preview against the running tokens.css (debounced).
  const debounce = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      applyTenantTheme({ tokenOverrides: overrides, fonts });
    }, 120);
    return () => window.clearTimeout(debounce.current);
  }, [overrides, fonts]);

  // Guard reset: revert local edits AND re-apply the persisted theme (never leave the console tinted).
  const reset = useCallback(() => {
    setOverrides(persistedOverrides);
    setFonts(persistedFonts);
    clearTenantTheme([...THEME_TOKEN_KEYS]);
    applyTenantTheme({ tokenOverrides: persistedOverrides, fonts: persistedFonts });
  }, [persistedOverrides, persistedFonts]);
  useRegisterGuard(isDirty, reset);

  const setToken = (token: ThemeTokenKey, hex: string) => {
    const channels = hexToChannels(hex);
    if (!channels) return;
    setOverrides((prev) => ({ ...prev, [token]: channels }));
  };

  const resetToken = (token: ThemeTokenKey) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[token];
      return next;
    });
    clearTenantTheme([token]);
  };

  const resetAll = () => {
    setOverrides({});
    setFonts(DEFAULT_FONTS);
    clearTenantTheme([...THEME_TOKEN_KEYS]);
    applyTenantTheme({ tokenOverrides: {}, fonts: DEFAULT_FONTS });
  };

  const onSave = async () => {
    setSaveState("saving");
    try {
      await updateTheme({ tokenOverrides: overrides, fonts }).unwrap();
      setSaveState("saved");
      toast.success("Theme saved", {
        description: "The console keeps this palette for the session.",
      });
    } catch {
      setSaveState("error");
      toast.error("Couldn't save theme", { description: "Please try again." });
    }
  };

  return (
    <PanelShell
      title="Theme & appearance"
      description="Override the base Nocturne tokens. Edits re-tint the whole console live; Save persists them."
      saveState={saveState}
      canSave={isDirty}
      onSave={onSave}
      readOnly={!canManage}
    >
      <div className="flex items-center justify-between">
        <p className="text-2xs uppercase tracking-wide text-text-tertiary">Color tokens</p>
        {canManage ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            disabled={
              Object.keys(overrides).length === 0 &&
              JSON.stringify(fonts) === JSON.stringify(DEFAULT_FONTS)
            }
          >
            <RotateCcw /> Reset to defaults
          </Button>
        ) : null}
      </div>

      <div className="space-y-2">
        {THEME_TOKEN_KEYS.map((token) => {
          const hex = overrides[token] ? channelsToHex(overrides[token]) : tokenToHex(token);
          const overridden = Boolean(overrides[token]);
          const lum = relativeLuminance(hex);
          const lowContrast = lum !== null && lum > 0.7; // bright token on a dark ground
          return (
            <div
              key={token}
              className="flex items-center gap-3 rounded-lg border border-hairline bg-surface-sunken px-3 py-2.5"
            >
              <label
                className="relative flex size-8 shrink-0 items-center justify-center rounded-md border border-hairline"
                style={{ backgroundColor: hex }}
                title={token}
              >
                <input
                  type="color"
                  value={hex}
                  disabled={!canManage}
                  onChange={(e) => setToken(token, e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  aria-label={`${THEME_TOKEN_LABEL[token]} color`}
                />
              </label>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-secondary">{THEME_TOKEN_LABEL[token]}</p>
                <p className="font-mono text-2xs text-text-tertiary">
                  {token} · {hex}
                  {lowContrast ? (
                    <span className="ml-2 text-warning">low contrast on dark UI</span>
                  ) : null}
                </p>
              </div>
              {overridden && canManage ? (
                <button
                  type="button"
                  onClick={() => resetToken(token)}
                  className="text-2xs text-text-tertiary underline-offset-2 hover:text-text-secondary hover:underline"
                >
                  reset
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <FormRow>
        {(["display", "body", "mono"] as const).map((role) => (
          <Field key={role} label={`${role} font`}>
            <Select
              value={fonts[role]}
              onValueChange={(v) => setFonts((prev) => ({ ...prev, [role]: v }))}
              disabled={!canManage}
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS[role].map((f) => (
                  <SelectItem key={f.value} value={f.value} className="text-xs">
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ))}
      </FormRow>
    </PanelShell>
  );
}

/** "143 199 232" → "#8FC7E8". */
function channelsToHex(channels: string): string {
  const parts = channels
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (parts.length < 3 || parts.some(Number.isNaN)) return "#000000";
  const [r, g, b] = parts;
  const h = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}
