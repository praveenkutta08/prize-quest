import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import type { Campaign, CampaignStatus } from "@pq/mock-data";
import "../src/index";
import type { CampaignListVariant } from "../src/types";

function mk(id: string, name: string, status: CampaignStatus, pct: number, meta: string): Campaign {
  return { id, name, status, progress: pct * 10, goal: 1000, pct, meta, expiresAt: "2026-06-30", prizeIds: ["a", "b"] };
}

const CAMPAIGNS: Campaign[] = [
  mk("sunday-slot-sprint", "Sunday Slot Sprint", "eligible", 100, "$500 / $500 · Expires Jun 7"),
  mk("vip-electronics-quest", "VIP Electronics Quest", "in-progress", 72, "$725 / $1,000 · 26 days left"),
  mk("weekend-warrior-bonus", "Weekend Warrior Bonus", "in-progress", 57, "$425 / $750 · Resets Mon"),
  mk("memorial-day-madness", "Memorial Day Madness", "expired", 36, "$180 / $500 · Ended"),
];

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-deep": "#160726",
  "--pq-navy-base": "#241040",
  "--pq-navy-low": "#341A5C",
  "--pq-navy-hairline": "#5B3494",
  "--pq-emerald": "#B14DFF",
  "--pq-cream": "#E6E1EF",
  "--pq-cream-muted": "#B7AECB",
  "--pq-text": "#F3EFFA",
  "--pq-text-muted": "#C3B6DC",
  "--pq-font-serif": "'Playfair Display', Georgia, serif",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv", width = "440px") {
  const tokens = tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  const style = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(";");
  return html`<div style="${style};background:var(--pq-navy-base);padding:28px;width:${width}">${inner}</div>`;
}

interface Args {
  variant: CampaignListVariant;
  loading: boolean;
}

const meta: Meta<Args> = {
  title: "Widgets/pq-campaign-list",
  component: "pq-campaign-list",
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["stack", "carousel"] },
    loading: { control: "boolean" },
  },
  args: { variant: "stack", loading: false },
  render: (a) =>
    frame(
      html`<pq-campaign-list .campaigns=${CAMPAIGNS} .variant=${a.variant} .loading=${a.loading}></pq-campaign-list>`,
      "casino-royale-lv",
      a.variant === "carousel" ? "760px" : "440px",
    ),
};
export default meta;

type Story = StoryObj<Args>;

export const Stack: Story = { args: { variant: "stack" } };
export const Carousel: Story = { args: { variant: "carousel" }, render: (a) => frame(html`<pq-campaign-list .campaigns=${CAMPAIGNS} .variant=${a.variant} heading="This week"></pq-campaign-list>`, "casino-royale-lv", "760px") };

export const Featured: Story = {
  name: "Featured (promo-hero + stack)",
  render: () => frame(html`<pq-campaign-list .campaigns=${CAMPAIGNS} featuredId="sunday-slot-sprint"></pq-campaign-list>`),
};

export const Empty: Story = {
  render: () => frame(html`<pq-campaign-list .campaigns=${[]}></pq-campaign-list>`),
};

export const Loading: Story = {
  render: () => frame(html`<pq-campaign-list .loading=${true}></pq-campaign-list>`),
};

export const TenantSwap: StoryObj<Args & { tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { variant: "stack", loading: false, tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) => frame(html`<pq-campaign-list .campaigns=${CAMPAIGNS} .variant=${a.variant}></pq-campaign-list>`, a.tenant),
};
