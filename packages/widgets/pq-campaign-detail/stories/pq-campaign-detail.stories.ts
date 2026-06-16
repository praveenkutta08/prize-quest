import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import type { Campaign, CampaignStatus, Prize } from "@pq/mock-data";
import "../src/index";
import type { DetailProfile } from "../src/types";

const PRIZES: Prize[] = [
  { id: "galaxy-tab-s9", name: "Samsung Galaxy Tab S9", category: "Electronics", value: 799, inStock: true },
  { id: "sony-xm5", name: "Sony WH-1000XM5", category: "Electronics", value: 399, inStock: true },
  { id: "echo-show-15", name: "Amazon Echo Show 15", category: "Smart Home", value: 280, inStock: false },
  { id: "visa-250", name: "$250 Visa Gift Card", category: "Gift cards", value: 250, inStock: true },
];

function makeCampaign(status: CampaignStatus = "eligible"): Campaign {
  return {
    id: "vip-electronics-quest",
    name: "VIP Electronics Quest",
    status,
    progress: status === "eligible" ? 1000 : 725,
    goal: 1000,
    pct: status === "eligible" ? 100 : 72,
    meta: "Wager $1,000 between Jun 1–30 to choose from premium electronics.",
    expiresAt: "2026-06-30",
    prizeIds: PRIZES.map((p) => p.id),
  };
}

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-deep": "#160726",
  "--pq-navy-base": "#241040",
  "--pq-navy-low": "#341A5C",
  "--pq-navy-hairline": "#5B3494",
  "--pq-emerald": "#B14DFF",
  "--pq-gold-bright": "#E0A3FF",
  "--pq-cream-muted": "#B7AECB",
  "--pq-text": "#F3EFFA",
  "--pq-text-muted": "#C3B6DC",
  "--pq-text-faint": "#7A6E96",
  "--pq-font-serif": "'Playfair Display', Georgia, serif",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv", width = "440px") {
  const tokens = tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  const style = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(";");
  return html`<div style="${style};background:var(--pq-navy-deep);padding:28px;width:${width}">${inner}</div>`;
}

interface Args {
  status: CampaignStatus;
  profile: DetailProfile;
  loading: boolean;
}

const meta: Meta<Args> = {
  title: "Widgets/pq-campaign-detail",
  component: "pq-campaign-detail",
  tags: ["autodocs"],
  argTypes: {
    status: { control: "inline-radio", options: ["eligible", "in-progress", "expired"] },
    profile: { control: "inline-radio", options: ["standard", "expanded"] },
    loading: { control: "boolean" },
  },
  args: { status: "eligible", profile: "standard", loading: false },
  render: (a) =>
    frame(
      html`<pq-campaign-detail .campaign=${makeCampaign(a.status)} .prizes=${PRIZES} .profile=${a.profile} .loading=${a.loading}></pq-campaign-detail>`,
      "casino-royale-lv",
      a.profile === "expanded" ? "860px" : "440px",
    ),
};
export default meta;

type Story = StoryObj<Args>;

export const StandardReady: Story = { name: "Standard · ready", args: { status: "eligible", profile: "standard" } };
export const StandardLocked: Story = { name: "Standard · in-progress (locked)", args: { status: "in-progress", profile: "standard" } };
export const Expanded: Story = { name: "Expanded · two-column", args: { status: "eligible", profile: "expanded" } };
export const Loading: Story = { render: () => frame(html`<pq-campaign-detail .loading=${true}></pq-campaign-detail>`) };

export const TenantSwap: StoryObj<Args & { tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { status: "eligible", profile: "standard", loading: false, tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) => frame(html`<pq-campaign-detail .campaign=${makeCampaign(a.status)} .prizes=${PRIZES} .profile=${a.profile}></pq-campaign-detail>`, a.tenant),
};
