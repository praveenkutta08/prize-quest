import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import type { Voucher } from "@pq/mock-data";
import "../src/index";

const ISSUED: Voucher = {
  id: "voucher-1",
  code: "PQ-9F4A-E2C9-X742",
  prizeId: "dining-credit-100",
  amount: 100,
  brand: "Casino Royale · Dining credit",
  name: "Sunday Slot Sprint reward",
  issuedAt: "2026-06-04",
  expiresAt: "December 31, 2026",
  redeemed: false,
};

const REDEEMED: Voucher = { ...ISSUED, redeemed: true, redeemedAt: "Jun 4, 2026 · 8:42 PM" };

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-base": "#241040",
  "--pq-navy-low": "#341A5C",
  "--pq-navy-hairline": "#5B3494",
  "--pq-emerald": "#B14DFF",
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
  return html`<div style="${style};background:var(--pq-navy-deep);width:380px">${inner}</div>`;
}

const meta: Meta = {
  title: "Widgets/pq-voucher",
  component: "pq-voucher",
  tags: ["autodocs"],
  render: () => frame(html`<pq-voucher .voucher=${ISSUED}></pq-voucher>`),
};
export default meta;

type Story = StoryObj;

export const Issued: Story = {};
export const Redeemed: Story = { render: () => frame(html`<pq-voucher .voucher=${REDEEMED}></pq-voucher>`) };

export const TenantSwap: StoryObj<{ tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) => frame(html`<pq-voucher .voucher=${ISSUED}></pq-voucher>`, a.tenant),
};
