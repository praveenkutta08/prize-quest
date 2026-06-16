import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import "../src/index";

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-hairline": "#5B3494",
  "--pq-cream": "#E6E1EF",
  "--pq-cream-muted": "#B7AECB",
  "--pq-text-muted": "#C3B6DC",
  "--pq-font-mono": "'IBM Plex Mono', ui-monospace, monospace",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv") {
  const tokens = tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  const style = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(";");
  return html`<div style="${style};background:var(--pq-navy-deep);padding:28px">${inner}</div>`;
}

const meta: Meta = {
  title: "Widgets/pq-tier-progress",
  component: "pq-tier-progress",
  tags: ["autodocs"],
  render: () => frame(html`<pq-tier-progress tier="Gold" nextTier="Platinum" .pointsToNext=${2400}></pq-tier-progress>`),
};
export default meta;

type Story = StoryObj;

export const Chip: Story = {};
export const WithBar: Story = {
  name: "With progress bar",
  render: () => frame(html`<pq-tier-progress tier="Gold" nextTier="Platinum" .pointsToNext=${2400} .progressPct=${68}></pq-tier-progress>`),
};
export const TopTier: Story = {
  name: "Top tier (no next)",
  render: () => frame(html`<pq-tier-progress tier="Platinum"></pq-tier-progress>`),
};

export const TenantSwap: StoryObj<{ tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) => frame(html`<pq-tier-progress tier="Gold" nextTier="Platinum" .pointsToNext=${2400} .progressPct=${68}></pq-tier-progress>`, a.tenant),
};
