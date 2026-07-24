import { useState } from "react";
import { Boxes, Coins, Gift, Pencil, Ticket, Trophy, Users, Zap } from "lucide-react";
import {
  ActivityFeed,
  Avatar,
  AvatarFallback,
  Badge,
  BarChart,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DescriptionList,
  DetailCard,
  DetailHero,
  Field,
  FormRow,
  FormSection,
  FormWizardLayout,
  Funnel,
  Input,
  PageHeader,
  PresetChips,
  PrizeThumbGrid,
  QuickActions,
  RowActionMenu,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  StatCard,
  StatCardSkeleton,
  StatusPill,
  toast,
  type ActivityFeedItem,
  type BarDatum,
  type PrizeLike,
} from "@/shared/ui";

const BADGE_VARIANTS = [
  "brand",
  "neutral",
  "outline",
  "success",
  "warning",
  "danger",
  "info",
] as const;

const CHART_DATA: BarDatum[] = [
  { label: "Mon", value: 128 },
  { label: "Tue", value: 196 },
  { label: "Wed", value: 172 },
  { label: "Thu", value: 240, highlight: true },
  { label: "Fri", value: 208 },
  { label: "Sat", value: 152 },
  { label: "Sun", value: 96 },
];

const PRIZES: PrizeLike[] = [
  {
    id: "p1",
    name: "AirPods Pro",
    category: "electronics",
    value: 249,
    rarity: "epic",
    stockCount: 8,
  },
  { id: "p2", name: "$50 Dining", category: "comp", value: 50, rarity: "common", stockCount: 999 },
  {
    id: "p3",
    name: "Suite Night",
    category: "experience",
    value: 420,
    rarity: "legendary",
    stockCount: 3,
  },
  { id: "p4", name: "Free Play", category: "free-play", value: 25, rarity: "rare", inStock: false },
];

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const ACTIVITY: ActivityFeedItem[] = [
  {
    id: "a1",
    type: "offer",
    title: "Birthday Bonus sent",
    subtitle: "298 players · Casino Royale LV",
    timestamp: ago(2),
  },
  {
    id: "a2",
    type: "rule",
    title: "Tier-up reward fired",
    subtitle: "Platinum welcome · 14 players",
    timestamp: ago(18),
  },
  {
    id: "a3",
    type: "catalog",
    title: "Catalog synced",
    subtitle: "42 prizes refreshed from vendor",
    timestamp: ago(72),
  },
];

/**
 * Component catalog — the reusable building blocks introduced across Sessions
 * 4–9 (metrics, charts, rewards, activity) plus the page/detail/form scaffolding
 * every surface is assembled from. Rendered live so the catalog stays honest:
 * it imports the same `@/shared/ui` the product does.
 */
export function ShowcaseCatalog() {
  const [range, setRange] = useState("7d");

  return (
    <div className="flex flex-col gap-4">
      {/* Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Metric cards · StatCard</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active campaigns"
            value="12"
            delta={{ trend: "up", label: "+3 wk" }}
            icon={<Zap className="size-4" />}
          />
          <StatCard
            label="Liability outstanding"
            value="$84,120"
            delta={{ trend: "down", label: "-6%" }}
            icon={<Coins className="size-4" />}
          />
          <StatCard
            label="Redemption rate"
            value="71.9%"
            progress={{ pct: 72, label: "of budget cap" }}
            icon={<Trophy className="size-4" />}
          />
          <StatCardSkeleton />
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bar chart</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={CHART_DATA} unit=" claims" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversion funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <Funnel data={{ eligible: 4200, started: 2850, completed: 1920, claimed: 1610 }} />
          </CardContent>
        </Card>
      </div>

      {/* Badges, avatar, separator */}
      <Card>
        <CardHeader>
          <CardTitle>Badges, avatars &amp; dividers</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {BADGE_VARIANTS.map((v) => (
              <Badge key={v} variant={v} className="capitalize">
                {v}
              </Badge>
            ))}
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            {["JC", "AR", "SP", "MK"].map((initials, i) => (
              <Avatar key={initials} className={i === 0 ? "size-9" : "size-7"}>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            ))}
            <span className="text-xs text-text-tertiary">AvatarFallback · initials</span>
          </div>
        </CardContent>
      </Card>

      {/* Rewards grid */}
      <Card>
        <CardHeader>
          <CardTitle>Prize grid · rarity &amp; stock</CardTitle>
        </CardHeader>
        <CardContent>
          <PrizeThumbGrid prizes={PRIZES} showValue showRarity showStock />
        </CardContent>
      </Card>

      {/* Activity + quick actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity feed</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={ACTIVITY} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActions
              actions={[
                {
                  icon: Gift,
                  title: "New campaign",
                  subtitle: "Launch a promotion",
                  onClick: () => toast("New campaign"),
                },
                {
                  icon: Ticket,
                  title: "Add reward",
                  subtitle: "Extend the catalog",
                  onClick: () => toast("Add reward"),
                },
                {
                  icon: Users,
                  title: "Invite operator",
                  subtitle: "Grant console access",
                  onClick: () => toast("Invite operator"),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Row actions + filter chips */}
      <Card>
        <CardHeader>
          <CardTitle>Row actions &amp; filter chips</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">RowActionMenu</span>
            <RowActionMenu
              actions={[
                { label: "Edit", icon: Pencil, onSelect: () => toast("Edit") },
                { label: "Duplicate", icon: Boxes, onSelect: () => toast("Duplicate") },
                {
                  label: "Archive",
                  onSelect: () => toast("Archive"),
                  danger: true,
                  separatorBefore: true,
                },
              ]}
            />
          </div>
          <PresetChips
            ariaLabel="Date range"
            value={range}
            onSelect={setRange}
            chips={[
              { value: "24h", label: "24h" },
              { value: "7d", label: "7 days" },
              { value: "30d", label: "30 days" },
              { value: "qtr", label: "Quarter" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Page scaffolding — PageHeader emits the page h1, so this visual demo is
          marked `inert`: removed from the a11y tree (no second h1) and from the
          tab order (its Edit button won't be a focus trap). */}
      <div className="rounded-xl border border-hairline bg-surface-1 p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
          Page header
        </p>
        <div inert className="rounded-lg border border-hairline bg-background p-4">
          <PageHeader
            breadcrumbs={[
              { label: "Engagement" },
              { label: "Rewards", href: "#" },
              { label: "AirPods Pro" },
            ]}
            title="AirPods Pro (2nd gen)"
            subtitle="Electronics · epic"
            actions={<Button size="sm">Edit</Button>}
          />
        </div>
      </div>

      {/* Detail scaffolding */}
      <div className="rounded-xl border border-hairline bg-surface-1 p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
          Detail scaffolding · DetailHero · DetailCard · DescriptionList
        </p>
        <div className="flex flex-col gap-4">
          <DetailHero
            pills={
              <>
                <StatusPill tone="active" pulse>
                  Active
                </StatusPill>
                <Badge variant="brand">Epic</Badge>
              </>
            }
            title="AirPods Pro (2nd gen)"
            subtitle="Wireless earbuds with active noise cancellation."
            meta={[
              { label: "Retail value", value: "$249.00" },
              { label: "Margin", value: <span className="text-success">38%</span> },
              { label: "Stock", value: "8" },
            ]}
            actions={<Button variant="secondary">Edit</Button>}
          />
          <DetailCard title="Details" headingLevel="h3">
            <DescriptionList
              items={[
                { label: "Category", value: "Electronics" },
                { label: "Vendor", value: "Apple Retail" },
                { label: "SKU", value: <span className="font-mono">APP-2ND-GEN</span> },
              ]}
            />
          </DetailCard>
        </div>
      </div>

      {/* Form scaffolding */}
      <div className="rounded-xl border border-hairline bg-surface-1 p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
          Form scaffolding · FormWizardLayout · FormSection · Field
        </p>
        <p className="mb-4 max-w-2xl text-xs text-text-tertiary">
          A <code className="font-mono text-text-secondary">Field</code> publishes its label id via
          context, so the <code className="font-mono text-text-secondary">Select</code> below is
          named for assistive tech with no{" "}
          <code className="font-mono text-text-secondary">aria-label</code>.
        </p>
        <FormWizardLayout
          sections={
            <FormSection step={1} title="Basics" subtitle="Name and category">
              <FormRow>
                <Field label="Reward name" htmlFor="cat-name">
                  <Input id="cat-name" placeholder="AirPods Pro" />
                </Field>
                <Field label="Category">
                  <Select defaultValue="electronics">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="experience">Experience</SelectItem>
                      <SelectItem value="comp">Comp</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FormRow>
            </FormSection>
          }
          summary={
            <DetailCard title="Live preview" headingLevel="h3">
              <DescriptionList
                items={[
                  { label: "Name", value: "AirPods Pro" },
                  { label: "Category", value: "Electronics" },
                ]}
              />
            </DetailCard>
          }
        />
      </div>
    </div>
  );
}
