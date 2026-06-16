import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import type { Campaign, Prize } from "@pq/mock-data";
import "../src/index";

const PRIZE: Prize = {
  id: "airpods-pro",
  name: "Apple AirPods Pro",
  category: "Electronics",
  value: 249,
  inStock: true,
  prizeType: "physical",
};
const CAMPAIGN = { id: "c1", name: "Sunday Slot Sprint" } as Campaign;

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-deep": "#160726",
  "--pq-navy-base": "#1E0B33",
  "--pq-navy-low": "#341A5C",
  "--pq-navy-hairline": "#5B3494",
  "--pq-emerald": "#B14DFF",
  "--pq-gold-bright": "#F2A65A",
  "--pq-cream": "#E9D7FF",
  "--pq-text": "#F3EFFA",
  "--pq-text-muted": "#C3B6DC",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv") {
  const tokens = tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  const style = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(";");
  return html`<div style="${style};background:var(--pq-navy-base);padding:28px;max-width:460px">${inner}</div>`;
}

const meta: Meta = {
  title: "Widgets/pq-claim-confirm",
  component: "pq-claim-confirm",
  tags: ["autodocs"],
  render: () => frame(html`<pq-claim-confirm .prize=${PRIZE} .campaign=${CAMPAIGN}></pq-claim-confirm>`),
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};
export const NoPrize: Story = {
  name: "No prize selected",
  render: () => frame(html`<pq-claim-confirm></pq-claim-confirm>`),
};
export const TenantSwap: StoryObj<{ tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) => frame(html`<pq-claim-confirm .prize=${PRIZE} .campaign=${CAMPAIGN}></pq-claim-confirm>`, a.tenant),
};
