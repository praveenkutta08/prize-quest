import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import type { CompositionDoc } from "@pq/compositions";
import "../src/index";
// Register the child widgets the sample compositions reference.
import "@pq/pq-tier-progress";
import "@pq/pq-trust-strip";

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-deep": "#160726",
  "--pq-navy-base": "#1E0B33",
  "--pq-navy-low": "#341A5C",
  "--pq-navy-hairline": "#5B3494",
  "--pq-emerald": "#B14DFF",
  "--pq-cream": "#E9D7FF",
  "--pq-cream-muted": "#B79BD8",
  "--pq-text": "#F3EFFA",
  "--pq-text-muted": "#C3B6DC",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv") {
  const tokens = tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  const style = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(";");
  return html`<div style="${style};background:var(--pq-navy-base);padding:32px;min-height:280px">${inner}</div>`;
}

const HOME: CompositionDoc = {
  id: "home",
  channel: "mobile-web",
  profile: "standard",
  layout: [
    { widget: "pq-tier-progress", props: { tier: "Gold", nextTier: "Platinum", pointsToNext: 2400, progressPct: 68 } },
    { widget: "pq-trust-strip" },
  ],
};

const WITH_MISSING: CompositionDoc = {
  id: "demo-missing",
  channel: "mobile-web",
  profile: "standard",
  layout: [
    { widget: "pq-tier-progress", props: { tier: "Gold", nextTier: "Platinum", pointsToNext: 2400 } },
    { widget: "pq-not-a-real-widget" },
  ],
};

const meta: Meta = {
  title: "Widgets/pq-screen",
  component: "pq-screen",
  tags: ["autodocs"],
  render: () => frame(html`<pq-screen .composition=${HOME}></pq-screen>`),
};
export default meta;

type Story = StoryObj;

export const HomeComposition: Story = { name: "Home composition" };

export const UnknownWidget: Story = {
  name: "Unknown widget (placeholder)",
  render: () => frame(html`<pq-screen .composition=${WITH_MISSING}></pq-screen>`),
};

export const TenantSwap: StoryObj<{ tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) => frame(html`<pq-screen .composition=${HOME}></pq-screen>`, a.tenant),
};
