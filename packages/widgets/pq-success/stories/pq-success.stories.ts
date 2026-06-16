import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import "../src/index";

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-base": "#241040",
  "--pq-navy-low": "#341A5C",
  "--pq-navy-mid": "#44236F",
  "--pq-navy-hairline": "#5B3494",
  "--pq-emerald": "#B14DFF",
  "--pq-emerald-dim": "#5B2A8A",
  "--pq-cream": "#E6E1EF",
  "--pq-cream-muted": "#B7AECB",
  "--pq-text": "#F3EFFA",
  "--pq-text-muted": "#C3B6DC",
  "--pq-font-serif": "'Playfair Display', Georgia, serif",
  "--pq-font-body": "'Poppins', system-ui, sans-serif",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv") {
  const tokens = tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  const style = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(";");
  return html`<div style="${style};background:var(--pq-navy-deep);padding:24px;width:380px">${inner}</div>`;
}

const meta: Meta = {
  title: "Widgets/pq-success",
  component: "pq-success",
  tags: ["autodocs"],
  render: () =>
    frame(html`<pq-success
      prizeName="Apple AirPods Pro"
      shipMeta="Ships 5–7 days · UPS"
      referenceCode="PQ-96521571"
    ></pq-success>`),
};
export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const GiftCard: Story = {
  name: "Gift card (no shipping)",
  render: () => frame(html`<pq-success prizeName="$100 Amazon Gift Card" referenceCode="PQ-44120098" ctaLabel="View gift card"></pq-success>`),
};

export const TenantSwap: StoryObj<{ tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) =>
    frame(
      html`<pq-success prizeName="Apple AirPods Pro" shipMeta="Ships 5–7 days · UPS" referenceCode="PQ-96521571"></pq-success>`,
      a.tenant,
    ),
};
