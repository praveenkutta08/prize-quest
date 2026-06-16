import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import type { Address, Campaign, Prize } from "@pq/mock-data";
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
const ADDRESS: Address = {
  name: "John Smith",
  line1: "123 Casino Blvd",
  city: "Las Vegas",
  state: "NV",
  zip: "89101",
};
const PENDING = { campaignId: "c1", prizeId: "airpods-pro", pin: "1234", address: ADDRESS };

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-deep": "#160726",
  "--pq-navy-base": "#1E0B33",
  "--pq-navy-low": "#341A5C",
  "--pq-navy-hairline": "#5B3494",
  "--pq-emerald": "#B14DFF",
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
  title: "Widgets/pq-claim-summary",
  component: "pq-claim-summary",
  tags: ["autodocs"],
  render: () =>
    frame(html`<pq-claim-summary .prize=${PRIZE} .campaign=${CAMPAIGN} .pending=${PENDING} .address=${ADDRESS}></pq-claim-summary>`),
};
export default meta;

type Story = StoryObj;

export const Physical: Story = {};
export const Digital: Story = {
  name: "Digital (voucher, no shipping row)",
  render: () =>
    frame(html`<pq-claim-summary
      .prize=${{ ...PRIZE, id: "amazon-100", name: "$100 Amazon Gift Card", value: 100, prizeType: "digital" }}
      .campaign=${CAMPAIGN}
      .pending=${PENDING}
    ></pq-claim-summary>`),
};
export const TenantSwap: StoryObj<{ tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) =>
    frame(html`<pq-claim-summary .prize=${PRIZE} .campaign=${CAMPAIGN} .pending=${PENDING} .address=${ADDRESS}></pq-claim-summary>`, a.tenant),
};
