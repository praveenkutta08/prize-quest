import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import type { Order } from "@pq/mock-data";
import "../src/index";
import type { OrderHistoryProfile } from "../src/types";

const ORDERS: Order[] = [
  { id: "o1", prizeName: "Apple AirPods Pro", campaignName: "Sunday Slot Sprint", status: "in-transit", claimedAt: "Jun 1, 2026", tracking: "1Z999AA10123456784", value: 249 },
  { id: "o2", prizeName: "YETI Rambler 64oz", campaignName: "Weekend Warrior Bonus", status: "processing", claimedAt: "Jun 4, 2026", confirmation: "PQ-44120098", value: 80 },
  { id: "o3", prizeName: "$100 Amazon Gift Card", campaignName: "Memorial Day Madness", status: "delivered", claimedAt: "May 20, 2026", confirmation: "PQ-31882204", value: 100 },
];

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-low": "#341A5C",
  "--pq-navy-hairline": "#5B3494",
  "--pq-emerald": "#B14DFF",
  "--pq-info": "#5BA8FF",
  "--pq-gold-bright": "#E0A3FF",
  "--pq-text": "#F3EFFA",
  "--pq-text-muted": "#C3B6DC",
  "--pq-text-faint": "#7A6E96",
  "--pq-font-display": "'Poppins', system-ui, sans-serif",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv", width = "420px") {
  const tokens = tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  const style = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(";");
  return html`<div style="${style};background:var(--pq-navy-base);padding:24px;width:${width}">${inner}</div>`;
}

interface Args {
  profile: OrderHistoryProfile;
  loading: boolean;
}

const meta: Meta<Args> = {
  title: "Widgets/pq-order-history",
  component: "pq-order-history",
  tags: ["autodocs"],
  argTypes: {
    profile: { control: "inline-radio", options: ["standard", "expanded"] },
    loading: { control: "boolean" },
  },
  args: { profile: "standard", loading: false },
  render: (a) =>
    frame(
      html`<pq-order-history .orders=${ORDERS} .profile=${a.profile} .loading=${a.loading}></pq-order-history>`,
      "casino-royale-lv",
      a.profile === "expanded" ? "720px" : "420px",
    ),
};
export default meta;

type Story = StoryObj<Args>;

export const Stack: Story = { args: { profile: "standard" } };
export const Table: Story = { args: { profile: "expanded" }, render: (a) => frame(html`<pq-order-history .orders=${ORDERS} .profile=${a.profile}></pq-order-history>`, "casino-royale-lv", "720px") };
export const Empty: Story = { render: () => frame(html`<pq-order-history .orders=${[]}></pq-order-history>`) };
export const Loading: Story = { render: () => frame(html`<pq-order-history .loading=${true}></pq-order-history>`) };

export const TenantSwap: StoryObj<Args & { tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { profile: "standard", loading: false, tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) => frame(html`<pq-order-history .orders=${ORDERS} .profile=${a.profile}></pq-order-history>`, a.tenant),
};
