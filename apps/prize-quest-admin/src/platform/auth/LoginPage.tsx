import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setActiveProperty } from "@/platform/scope";
import { Button, Checkbox, Input, Label } from "@/shared/ui";
import { countCompact, count } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { LoginRequest, type Session } from "@/shared/contracts";
import { MarkGlyph } from "@/platform/ui/BootSplash";
import { useGetBrandStatsQuery, useLoginMutation } from "./authApi";
import { setSession } from "./authSlice";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const brand = useAppSelector((s) => s.tenant.context?.tenant.brand);
  const [login, { isLoading }] = useLoginMutation();
  const brandStats = useGetBrandStatsQuery();
  const [formError, setFormError] = useState<string | null>(null);
  const [ssoPending, setSsoPending] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequest),
    defaultValues: { email: "james.chen@casinoroyale.com", password: "", remember: true },
  });

  const remember = watch("remember");

  const completeLogin = (session: Session) => {
    dispatch(setSession(session));
    dispatch(setActiveProperty(session.defaultPropertyId));
    navigate(from ?? "/dashboard", { replace: true });
  };

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    try {
      const session = await login(data).unwrap();
      completeLogin(session);
    } catch {
      setFormError("Those credentials didn't match. Check your email and password.");
    }
  });

  const onSso = async (provider: string) => {
    setFormError(null);
    setSsoPending(provider);
    try {
      const session = await login({
        email: "james.chen@casinoroyale.com",
        password: "sso",
      }).unwrap();
      completeLogin(session);
    } catch {
      setFormError("Single sign-on failed. Try again.");
      setSsoPending(null);
    }
  };

  const stats = brandStats.data;

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-hairline bg-surface-sunken p-12 lg:flex">
        <div className="atmos-mesh pointer-events-none absolute inset-0" />
        <div className="grain pointer-events-none absolute inset-0" />
        <div className="hairline-grid pointer-events-none absolute inset-0 opacity-[0.35]" />

        <div className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl border border-brand/30 bg-brand-subtle">
            <MarkGlyph className="size-6 text-brand-bright" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold text-text-primary">
              {brand?.productName ?? "Prize Quest"}
            </p>
            <p className="text-xs text-text-tertiary">
              {brand?.operatorName ?? "Operator Console"}
            </p>
          </div>
        </div>

        <div className="relative max-w-lg space-y-5">
          <p className="font-mono text-2xs uppercase tracking-[0.22em] text-brand">
            {brand?.tagline ?? "Player engagement platform"}
          </p>
          <h1 className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-text-primary">
            Build campaigns. Reward players. Track the rest.
          </h1>
          <p className="text-md text-text-secondary">
            Manage promotions, configure earn rules, and monitor fulfillment across every property —
            from one operator console.
          </p>

          {stats ? (
            <div className="grid grid-cols-3 gap-3 pt-4">
              <LoginStat label="Active campaigns" value={count(stats.activeCampaigns)} />
              <LoginStat label="Players this month" value={countCompact(stats.playersThisMonth)} />
              <LoginStat label="Claims today" value={count(stats.claimsToday)} />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 pt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg border border-hairline bg-surface-1/50" />
              ))}
            </div>
          )}
        </div>

        <p className="relative text-2xs text-text-tertiary">
          Internal tool · mock environment · {brand?.operatorName ?? "Casino Royale"}
        </p>
      </aside>

      {/* Form */}
      <main className="relative flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 space-y-1.5">
            <p className="font-mono text-2xs uppercase tracking-[0.22em] text-text-tertiary">
              Sign in
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
              Welcome back
            </h2>
            <p className="text-sm text-text-tertiary">Use your operator credentials to continue.</p>
          </div>

          {formError ? (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-sm text-danger"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email ? <FieldError>{errors.email.message}</FieldError> : null}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-2xs text-text-tertiary underline-offset-4 hover:text-text-secondary hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter any password"
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              {errors.password ? <FieldError>{errors.password.message}</FieldError> : null}
            </div>

            <label className="flex items-center gap-2.5 text-sm text-text-secondary">
              <Checkbox
                checked={remember}
                onCheckedChange={(v) => setValue("remember", Boolean(v))}
              />
              Remember me on this device
            </label>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : null}
              Sign in
              {!isLoading ? <ArrowRight /> : null}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-hairline" />
            <span className="text-2xs uppercase tracking-wide text-text-tertiary">
              or continue with
            </span>
            <span className="h-px flex-1 bg-hairline" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SsoButton
              label="Microsoft"
              pending={ssoPending === "Microsoft"}
              onClick={() => onSso("Microsoft")}
              logo={<MicrosoftMark />}
            />
            <SsoButton
              label="Okta"
              pending={ssoPending === "Okta"}
              onClick={() => onSso("Okta")}
              logo={<OktaMark />}
            />
          </div>

          <p className="mt-8 text-center text-2xs text-text-tertiary">
            By signing in you agree to the operator terms and acceptable-use policy.
          </p>
        </div>
      </main>
    </div>
  );
}

function LoginStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-1/70 p-3 backdrop-blur">
      <p className="font-display text-2xl font-semibold tabular-nums text-text-primary">{value}</p>
      <p className="text-2xs text-text-tertiary">{label}</p>
    </div>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return <p className="text-2xs text-danger">{children}</p>;
}

function SsoButton({
  label,
  logo,
  pending,
  onClick,
}: {
  label: string;
  logo: ReactNode;
  pending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        "flex h-10 items-center justify-center gap-2 rounded-md border border-hairline-strong bg-surface-1 text-sm font-medium text-text-secondary",
        "transition-colors duration-fast ease-out hover:bg-surface-2 hover:text-text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60",
      )}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : logo}
      {label}
    </button>
  );
}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
      <rect x="1" y="1" width="8" height="8" fill="#F25022" />
      <rect x="11" y="1" width="8" height="8" fill="#7FBA00" />
      <rect x="1" y="11" width="8" height="8" fill="#00A4EF" />
      <rect x="11" y="11" width="8" height="8" fill="#FFB900" />
    </svg>
  );
}

function OktaMark() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="3.4" />
    </svg>
  );
}
