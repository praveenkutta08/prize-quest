import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import type { Address } from "@pq/mock-data";
import "../src/index";

const ADDRESS: Address = {
  name: "John Smith",
  line1: "123 Casino Boulevard",
  line2: "Apt 4B",
  city: "Las Vegas",
  state: "NV",
  zip: "89101",
  phone: "(702) 555-0123",
  email: "john.smith@email.com",
};

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-low": "#341A5C",
  "--pq-navy-hairline": "#5B3494",
  "--pq-emerald": "#B14DFF",
  "--pq-text": "#F3EFFA",
  "--pq-text-muted": "#C3B6DC",
  "--pq-font-display": "'Poppins', system-ui, sans-serif",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv") {
  const tokens = tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  const style = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(";");
  return html`<div style="${style};background:var(--pq-navy-deep);padding:28px;width:380px">${inner}</div>`;
}

interface Args {
  verified: boolean;
}

const meta: Meta<Args> = {
  title: "Widgets/pq-address-block",
  component: "pq-address-block",
  tags: ["autodocs"],
  argTypes: { verified: { control: "boolean" } },
  args: { verified: true },
  render: (a) => frame(html`<pq-address-block .address=${ADDRESS} .verified=${a.verified}></pq-address-block>`),
};
export default meta;

type Story = StoryObj<Args>;

export const Verified: Story = { args: { verified: true } };
export const Unverified: Story = { args: { verified: false } };
export const Minimal: Story = {
  name: "No contact details",
  render: () =>
    frame(html`<pq-address-block .address=${{ name: "Jane Doe", line1: "9 Skyline Ave", city: "Reno", state: "NV", zip: "89501" }} verified></pq-address-block>`),
};

export const TenantSwap: StoryObj<Args & { tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { verified: true, tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) => frame(html`<pq-address-block .address=${ADDRESS} .verified=${a.verified}></pq-address-block>`, a.tenant),
};
