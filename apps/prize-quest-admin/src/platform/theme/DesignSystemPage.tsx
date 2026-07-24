import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Command as CommandIcon,
  Download,
  Gauge,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  ErrorState,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  StatusPill,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
} from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { tokenToHex } from "./applyTenantTheme";
import { ShowcaseSessionTwo } from "./ShowcaseSessionTwo";
import { ShowcaseSessionThree } from "./ShowcaseSessionThree";
import { ShowcaseCatalog } from "./ShowcaseCatalog";
import { MarkGlyph } from "@/platform/ui/BootSplash";

interface Swatch {
  token: string;
  name: string;
}

const SURFACES: Swatch[] = [
  { token: "--background", name: "Canvas" },
  { token: "--surface-sunken", name: "Sunken" },
  { token: "--surface-1", name: "Card" },
  { token: "--surface-2", name: "Raised" },
  { token: "--surface-3", name: "Overlay" },
  { token: "--border", name: "Hairline" },
  { token: "--input", name: "Edge" },
];

const BRAND: Swatch[] = [
  { token: "--brand", name: "Ice-steel" },
  { token: "--brand-bright", name: "Bright" },
  { token: "--brand-strong", name: "Strong" },
  { token: "--brand-subtle", name: "Subtle" },
];

const SEMANTIC: Swatch[] = [
  { token: "--success", name: "Success" },
  { token: "--warning", name: "Warning · money" },
  { token: "--danger", name: "Danger" },
  { token: "--info", name: "Info · scheduled" },
  { token: "--draft", name: "Draft" },
];

const TEXT: Swatch[] = [
  { token: "--text-primary", name: "Primary" },
  { token: "--text-secondary", name: "Secondary" },
  { token: "--text-tertiary", name: "Tertiary" },
  { token: "--text-disabled", name: "Disabled" },
];

const TYPE_SCALE = [
  { cls: "text-5xl", label: "Display 5xl", sample: "Prize Quest" },
  { cls: "text-3xl", label: "Heading 3xl", sample: "Good morning, James" },
  { cls: "text-xl", label: "Title xl", sample: "Top performing campaigns" },
  { cls: "text-md", label: "Body md", sample: "Manage promotions across every property." },
  { cls: "text-sm", label: "Body sm", sample: "By redemption rate · last 7 days" },
  { cls: "text-2xs uppercase tracking-wide", label: "Label 2xs", sample: "Liability outstanding" },
];

function SwatchCell({ token, name }: Swatch) {
  const [hex, setHex] = useState("—");
  useEffect(() => setHex(tokenToHex(token)), [token]);
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 rounded-lg border border-hairline"
        style={{ background: `rgb(var(${token}))` }}
      />
      <div>
        <p className="text-xs font-medium text-text-secondary">{name}</p>
        <p className="font-mono text-2xs text-text-tertiary">{hex}</p>
      </div>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-5 flex flex-col gap-1">
        <span className="font-mono text-2xs uppercase tracking-[0.2em] text-brand">{eyebrow}</span>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
          {title}
        </h2>
        {description ? <p className="max-w-2xl text-sm text-text-tertiary">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

const NAV = [
  ["direction", "Direction"],
  ["color", "Color"],
  ["type", "Typography"],
  ["elevation", "Elevation & motion"],
  ["components", "Components"],
  ["catalog", "Catalog"],
  ["session-two", "Promotions kit"],
  ["session-three", "Automation kit"],
] as const;

export function DesignSystemPage() {
  const [checked, setChecked] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-hairline">
        <div className="atmos-mesh pointer-events-none absolute inset-0 opacity-80" />
        <div className="grain pointer-events-none absolute inset-0" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-8 py-14">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl border border-brand/30 bg-brand-subtle">
              <MarkGlyph className="size-6 text-brand-bright" />
            </span>
            <div>
              <p className="font-mono text-2xs uppercase tracking-[0.22em] text-text-tertiary">
                Prize Quest · Operator Console
              </p>
              <p className="font-display text-lg font-semibold text-text-primary">
                Design System — Nocturne
              </p>
            </div>
            <Link
              to="/"
              className="ml-auto text-xs text-text-tertiary underline-offset-4 hover:text-text-primary hover:underline"
            >
              ← Back to console
            </Link>
          </div>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-balance font-display text-4xl font-semibold tracking-tight text-text-primary">
              A cool near-black control room for casino marketing operations.
            </h1>
            <p className="text-md text-text-secondary">
              The surface is a chosen cool neutral — crisp and calm under load — with one restrained{" "}
              <span className="text-brand-bright">ice-steel</span> accent for primary, active, and
              focus, and a controlled <span className="text-warning">amber</span> reserved for money
              and warnings. Distinctiveness comes from the type and craft, not a loud palette. Every
              value is a token; a tenant re-skins the whole console by overriding channels — no
              component change.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="brand">
                <Sparkles className="size-3" /> Ice-steel accent
              </Badge>
              <Badge variant="neutral">Bricolage Grotesque · Hanken Grotesk · JetBrains Mono</Badge>
              <Badge variant="neutral">Dark-first · WCAG AA</Badge>
              <Badge variant="neutral">Multi-tenant tokens</Badge>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1.5 pt-2">
            {NAV.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-full border border-hairline bg-surface-1 px-3 py-1 text-xs text-text-secondary transition-colors hover:border-hairline-strong hover:text-text-primary"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-8 py-14">
        {/* Direction */}
        <Section
          id="direction"
          eyebrow="01 · Point of view"
          title="Precision over intensity"
          description="Refined, confident, information-dense — a tool professionals trust with money and compliance."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                font: "font-display",
                name: "Bricolage Grotesque",
                role: "Display · headings, brand",
                sample: "Aa Gg 24,891",
              },
              {
                font: "font-sans",
                name: "Hanken Grotesk",
                role: "UI text · the workhorse",
                sample: "Aa Gg 24,891",
              },
              {
                font: "font-mono",
                name: "JetBrains Mono",
                role: "Mono · IDs, metrics, cron",
                sample: "Aa Gg 24,891",
              },
            ].map((f) => (
              <Card key={f.name}>
                <CardContent className="pt-5">
                  <p className={cn(f.font, "text-3xl text-text-primary")}>{f.sample}</p>
                  <p className="mt-4 text-sm font-medium text-text-primary">{f.name}</p>
                  <p className="text-xs text-text-tertiary">{f.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {/* Color */}
        <Section
          id="color"
          eyebrow="02 · Color"
          title="One accent, disciplined signals"
          description="A five-step surface ramp, a single ice-steel accent, and semantic signals kept separate from the brand hue."
        >
          <div className="space-y-8">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Surface ramp
              </p>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-7">
                {SURFACES.map((s) => (
                  <SwatchCell key={s.token} {...s} />
                ))}
              </div>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                  Brand · ice-steel
                </p>
                <div className="grid grid-cols-4 gap-4">
                  {BRAND.map((s) => (
                    <SwatchCell key={s.token} {...s} />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                  Text ramp
                </p>
                <div className="grid grid-cols-4 gap-4">
                  {TEXT.map((s) => (
                    <SwatchCell key={s.token} {...s} />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Semantic signals
              </p>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
                {SEMANTIC.map((s) => (
                  <SwatchCell key={s.token} {...s} />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Typography */}
        <Section
          id="type"
          eyebrow="03 · Typography"
          title="A deliberate scale"
          description="Tabular numerals everywhere data lines up. Headings balance; labels get letter-spacing."
        >
          <Card>
            <CardContent className="divide-y divide-hairline pt-0">
              {TYPE_SCALE.map((t) => (
                <div key={t.label} className="flex items-baseline justify-between gap-6 py-4">
                  <p className={cn(t.cls, "font-display text-text-primary")}>{t.sample}</p>
                  <span className="shrink-0 font-mono text-2xs text-text-tertiary">{t.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </Section>

        {/* Elevation & motion */}
        <Section
          id="elevation"
          eyebrow="04 · Elevation, radius & motion"
          title="Depth without noise"
          description="Dark-tuned shadows, a rounded scale, and a single easing curve for calm, orchestrated motion."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["shadow-sm", "Small"],
              ["shadow-md", "Medium"],
              ["shadow-lg", "Large"],
            ].map(([cls, label]) => (
              <div
                key={cls}
                className={cn("rounded-xl border border-hairline bg-surface-1 p-6", cls)}
              >
                <p className="text-sm font-medium text-text-primary">{label}</p>
                <p className="font-mono text-2xs text-text-tertiary">{cls}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl"].map((r) => (
              <div
                key={r}
                className={cn(
                  "flex size-16 items-center justify-center border border-hairline bg-surface-2",
                  r,
                )}
              >
                <span className="font-mono text-2xs text-text-tertiary">
                  {r.replace("rounded-", "")}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Components */}
        <Section
          id="components"
          eyebrow="05 · Components"
          title="Primitives, restyled to the system"
          description="Every shadcn/Radix primitive is mapped to the tokens — no stock defaults ship."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2.5">
                <Button>
                  <Plus /> New campaign
                </Button>
                <Button variant="secondary">
                  <Download /> Export
                </Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="subtle">Subtle</Button>
                <Button variant="danger">Delete</Button>
                <Button disabled>Disabled</Button>
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
              </CardContent>
            </Card>

            {/* Form controls */}
            <Card>
              <CardHeader>
                <CardTitle>Form controls</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="ds-email">Email</Label>
                  <Input id="ds-email" placeholder="james.chen@casinoroyale.com" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Activity source</Label>
                  <Select defaultValue="slot">
                    <SelectTrigger aria-label="Activity source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slot">Slot wager</SelectItem>
                      <SelectItem value="table">Table avg bet</SelectItem>
                      <SelectItem value="fnb">F&amp;B spend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <Checkbox checked={checked} onCheckedChange={(v) => setChecked(Boolean(v))} />
                  Remember me on this device
                </label>
              </CardContent>
            </Card>

            {/* Status + badges */}
            <Card>
              <CardHeader>
                <CardTitle>Status &amp; badges</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <StatusPill tone="active" pulse>
                  Active
                </StatusPill>
                <StatusPill tone="scheduled">Scheduled</StatusPill>
                <StatusPill tone="draft">Draft</StatusPill>
                <StatusPill tone="paused">Paused</StatusPill>
                <StatusPill tone="ended">Ended</StatusPill>
                <StatusPill tone="event">Event</StatusPill>
                <StatusPill tone="danger">Failed</StatusPill>
              </CardContent>
            </Card>

            {/* Overlays */}
            <Card>
              <CardHeader>
                <CardTitle>Overlays &amp; feedback</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2.5">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary">Open dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Activate campaign?</DialogTitle>
                      <DialogDescription>
                        Sunday Slot Sprint will go live across all three properties immediately.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="ghost">Cancel</Button>
                      <Button>Activate</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Campaign</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <ArrowUpRight /> View detail
                    </DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-danger">Pause</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Gauge example">
                      <Gauge />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>67% of budget cap</TooltipContent>
                </Tooltip>
                <Button variant="subtle" onClick={() => setCmdOpen(true)}>
                  <CommandIcon /> Command palette
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    toast.success("Catalog synced", { description: "42 prizes refreshed." })
                  }
                >
                  Fire toast
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Loading / empty / error */}
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Loading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
            <EmptyState
              compact
              title="No campaigns yet"
              description="This property has no active promotions. Create one to get started."
              action={
                <Button size="sm">
                  <Plus /> New campaign
                </Button>
              }
            />
            <ErrorState compact onRetry={() => toast("Retrying…")} />
          </div>

          {/* Table */}
          <Card className="mt-4 overflow-hidden">
            <CardHeader>
              <CardTitle>Data table</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead className="text-right">Redeemed</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Sunday Slot Sprint", "1,240", "892", "71.9%"],
                    ["Birthday Bonus", "342", "298", "87.1%"],
                    ["Comeback Special", "856", "312", "36.4%"],
                  ].map(([name, sent, red, rate]) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium text-text-primary">{name}</TableCell>
                      <TableCell className="text-right tnum">{sent}</TableCell>
                      <TableCell className="text-right tnum">{red}</TableCell>
                      <TableCell className="text-right tnum text-text-primary">{rate}</TableCell>
                      <TableCell>
                        <StatusPill tone="active">Active</StatusPill>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Section>

        {/* Component catalog — Sessions 4–9 building blocks + scaffolding */}
        <Section
          id="catalog"
          eyebrow="06 · Component catalog"
          title="Building blocks, Sessions 4–9"
          description="The reusable pieces every surface is assembled from — metrics, charts, rewards, activity, and the page / detail / form scaffolding. Rendered live from the same @/shared/ui the product imports."
        >
          <ShowcaseCatalog />
        </Section>

        {/* Session 2 · Promotions kit — the reused trio */}
        <Section
          id="session-two"
          eyebrow="07 · Promotions kit"
          title="The reused trio, on the system"
          description="DataTable, ConditionBuilder, and SummaryPanel — built generic in Session 2 and reused by the Session 3 Rules Engine with zero changes beyond props."
        >
          <ShowcaseSessionTwo />
        </Section>

        {/* Session 3 · Automation kit — the new rule/log components */}
        <Section
          id="session-three"
          eyebrow="08 · Automation kit"
          title="Rules Engine components"
          description="Toggle, CronField, EventSelector, ActionConfig, and the virtualized LogStream — Session 3's new pieces, reusing the same trio (DataTable · ConditionBuilder · SummaryPanel) for the rest."
        >
          <ShowcaseSessionThree />
        </Section>

        <footer className="border-t border-hairline pt-8 text-xs text-text-tertiary">
          Nocturne · the living design reference. Sessions 2–3 inherit every token and primitive
          here.
        </footer>
      </main>

      <CommandPaletteDemo open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}

// Local command-palette demo (the wired ⌘K palette ships with the AppShell in Part B).
function CommandPaletteDemo({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search campaigns, rules, prizes…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem>
            <Plus /> New campaign
          </CommandItem>
          <CommandItem>
            <Download /> Export dashboard
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Go to">
          <CommandItem>Dashboard</CommandItem>
          <CommandItem>Promotions</CommandItem>
          <CommandItem>Rules Engine</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
