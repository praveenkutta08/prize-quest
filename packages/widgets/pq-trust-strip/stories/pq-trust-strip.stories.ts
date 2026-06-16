import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import "../src/index";

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-base": "#241040",
  "--pq-navy-hairline": "#5B3494",
  "--pq-emerald": "#B14DFF",
  "--pq-emerald-dim": "#5B2A8A",
  "--pq-text": "#F3EFFA",
  "--pq-text-muted": "#C3B6DC",
  "--pq-font-display": "'Poppins', system-ui, sans-serif",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv", width = "820px") {
  const tokens = tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  const style = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(";");
  return html`<div style="${style};background:var(--pq-navy-deep);width:${width}">${inner}</div>`;
}

const meta: Meta = {
  title: "Widgets/pq-trust-strip",
  component: "pq-trust-strip",
  tags: ["autodocs"],
  render: () => frame(html`<pq-trust-strip></pq-trust-strip>`),
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};
export const TwoColumn: Story = {
  name: "Two columns (narrow)",
  render: () => frame(html`<pq-trust-strip .columns=${2}></pq-trust-strip>`, "casino-royale-lv", "420px"),
};

export const TenantSwap: StoryObj<{ tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) => frame(html`<pq-trust-strip></pq-trust-strip>`, a.tenant),
};
