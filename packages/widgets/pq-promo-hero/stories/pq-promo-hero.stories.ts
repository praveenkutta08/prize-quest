import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import type { Campaign, CampaignStatus, Prize } from "@pq/mock-data";
import "../src/index";
import type { HeroProfile } from "../src/types";

const PRIZES: Prize[] = [
  { id: "airpods-pro", name: "Apple AirPods Pro", category: "Electronics", value: 249, inStock: true },
  { id: "yeti-rambler", name: "YETI Rambler 64oz", category: "Outdoor", value: 80, inStock: true },
  { id: "amazon-100", name: "$100 Amazon", category: "Gift cards", value: 100, inStock: true },
  { id: "visa-250", name: "$250 Visa", category: "Gift cards", value: 250, inStock: true },
];

function makeCampaign(status: CampaignStatus = "eligible"): Campaign {
  return {
    id: "sunday-slot-sprint",
    name: status === "eligible" ? "Sunday Slot Sprint" : "VIP Electronics Quest",
    status,
    progress: status === "eligible" ? 500 : 725,
    goal: status === "eligible" ? 500 : 1000,
    pct: status === "eligible" ? 100 : 72,
    meta: status === "eligible" ? "$500 / $500 · pick any prize" : "$725 / $1,000 · 26 days left",
    expiresAt: "2026-06-07",
    prizeIds: ["airpods-pro", "yeti-rambler", "amazon-100", "visa-250"],
  };
}

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-deep": "#160726",
  "--pq-navy-base": "#241040",
  "--pq-navy-low": "#341A5C",
  "--pq-navy-hairline": "#5B3494",
  "--pq-emerald": "#B14DFF",
  "--pq-gold-bright": "#E0A3FF",
  "--pq-cream": "#E6E1EF",
  "--pq-text": "#F3EFFA",
  "--pq-text-muted": "#C3B6DC",
  "--pq-font-serif": "'Playfair Display', Georgia, serif",
  "--pq-font-body": "'Poppins', system-ui, sans-serif",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv", width = "420px") {
  const tokens = tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  const style = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(";");
  return html`<div style="${style};background:var(--pq-navy-deep);padding:28px;width:${width}">${inner}</div>`;
}

interface Args {
  status: CampaignStatus;
  profile: HeroProfile;
  loading: boolean;
}

const meta: Meta<Args> = {
  title: "Widgets/pq-promo-hero",
  component: "pq-promo-hero",
  tags: ["autodocs"],
  argTypes: {
    status: { control: "inline-radio", options: ["eligible", "in-progress", "expired", "locked"] },
    profile: { control: "inline-radio", options: ["compact", "standard", "expanded"] },
    loading: { control: "boolean" },
  },
  args: { status: "eligible", profile: "standard", loading: false },
  render: (a) =>
    frame(
      html`<pq-promo-hero .campaign=${makeCampaign(a.status)} .prizes=${PRIZES} .profile=${a.profile} .loading=${a.loading}></pq-promo-hero>`,
      "casino-royale-lv",
      a.profile === "expanded" ? "760px" : "420px",
    ),
};
export default meta;

type Story = StoryObj<Args>;

export const Standard: Story = { args: { profile: "standard" } };
export const Expanded: Story = { args: { profile: "expanded" } };
export const Compact: Story = { args: { profile: "compact" } };

export const AllStates: Story = {
  name: "All states (standard)",
  render: () => {
    const statuses: CampaignStatus[] = ["eligible", "in-progress", "expired", "locked"];
    return frame(
      html`<div style="display:flex;flex-direction:column;gap:20px">
        ${statuses.map((s) => html`<pq-promo-hero .campaign=${makeCampaign(s)} .prizes=${PRIZES}></pq-promo-hero>`)}
      </div>`,
    );
  },
};

export const Loading: Story = {
  name: "Loading (skeleton)",
  render: () => frame(html`<pq-promo-hero .loading=${true}></pq-promo-hero>`),
};

export const TenantSwap: StoryObj<Args & { tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { status: "eligible", profile: "standard", loading: false, tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) =>
    frame(html`<pq-promo-hero .campaign=${makeCampaign(a.status)} .prizes=${PRIZES} .profile=${a.profile}></pq-promo-hero>`, a.tenant),
};
