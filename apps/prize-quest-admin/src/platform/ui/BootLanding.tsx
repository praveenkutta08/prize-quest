import { Link } from "react-router-dom";
import { ArrowRight, Check, CircleDot, Palette } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { Badge, Button, Card, CardContent } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { MarkGlyph } from "./BootSplash";

/**
 * Part-A landing — the booting shell. Proves the console is alive: MSW is
 * intercepting, the tenant context resolved, and the design system is live.
 * Part B replaces this with the authenticated Login → Dashboard flow.
 */
export function BootLanding() {
  const context = useAppSelector((s) => s.tenant.context);
  const brand = context?.tenant.brand;
  const properties = context?.properties ?? [];
  const liveModules = ["dashboard", "promotions", "rules"];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="atmos-mesh pointer-events-none absolute inset-0 opacity-70" />
      <div className="grain pointer-events-none absolute inset-0" />

      <div className="relative mx-auto flex max-w-4xl flex-col gap-10 px-8 py-20">
        <header className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl border border-brand/30 bg-brand-subtle">
            <MarkGlyph className="size-6 text-brand-bright" />
          </span>
          <div>
            <p className="font-mono text-2xs uppercase tracking-[0.22em] text-text-tertiary">
              {brand?.operatorName ?? "Casino Royale"} · Operator Console
            </p>
            <p className="font-display text-lg font-semibold text-text-primary">
              {brand?.productName ?? "Prize Quest"}
            </p>
          </div>
          <Badge variant="success" className="ml-auto">
            <CircleDot className="size-3" /> Console online
          </Badge>
        </header>

        <div className="space-y-3">
          <h1 className="text-balance font-display text-4xl font-semibold tracking-tight text-text-primary">
            Scaffold &amp; design system are live.
          </h1>
          <p className="max-w-2xl text-md text-text-secondary">
            The mock backend is intercepting every request, the tenant context resolved, and the
            bespoke <span className="text-brand-bright">Nocturne</span> design system is
            established. Login, the app shell, and the operator dashboard arrive in Part B.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Tenant resolved
              </p>
              <p className="font-display text-xl text-text-primary">
                {context?.tenant.name ?? "—"}
              </p>
              <p className="text-sm text-text-tertiary">
                {context?.tenant.compliance.jurisdictionLabel} · vendor{" "}
                <span className="font-mono text-text-secondary">{context?.tenant.vendor.type}</span>
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {properties.map((p) => (
                  <Badge key={p.id} variant="neutral">
                    <span className="font-mono">{p.code}</span> {p.name.split(" ").slice(-1)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Modules
              </p>
              <ul className="space-y-2 text-sm">
                {(context?.modules ?? []).slice(0, 6).map((m) => {
                  const live = liveModules.includes(m.key);
                  return (
                    <li key={m.key} className="flex items-center justify-between">
                      <span className={cn(live ? "text-text-primary" : "text-text-tertiary")}>
                        {m.key}
                      </span>
                      {live ? (
                        <span className="inline-flex items-center gap-1 text-2xs text-success">
                          <Check className="size-3" /> live
                        </span>
                      ) : (
                        <span className="text-2xs text-text-tertiary">soon</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link to="/design-system">
              <Palette /> View the design system <ArrowRight />
            </Link>
          </Button>
          <span className="text-xs text-text-tertiary">
            The living token + component reference — where design quality is judged.
          </span>
        </div>
      </div>
    </div>
  );
}
