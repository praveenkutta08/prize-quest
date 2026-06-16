import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import type { Campaign, CampaignStatus } from "@pq/mock-data";
import "../src/index";
import type { CardProfile } from "../src/types";

/** Build a sample campaign for a given status. */
function makeCampaign(status: CampaignStatus, name = "VIP Electronics Quest"): Campaign {
  const base: Campaign = {
    id: "vip-electronics-quest",
    name,
    status,
    progress: 725,
    goal: 1000,
    pct: 72,
    meta: "$725 / $1,000 · 26 days left",
    expiresAt: "2026-06-30",
    prizeIds: ["galaxy-tab-s9", "sony-xm5"],
  };
  if (status === "eligible") {
    return { ...base, progress: 1000, pct: 100, meta: "$500 / $500 · Expires Jun 7", name: name === "VIP Electronics Quest" ? "Sunday Slot Sprint" : name };
  }
  if (status === "expired") {
    return { ...base, progress: 180, goal: 500, pct: 36, meta: "$180 / $500 · Ended", name: name === "VIP Electronics Quest" ? "Memorial Day Madness" : name };
  }
  if (status === "locked") {
    return { ...base, progress: 0, pct: 0, meta: "Unlocks at Platinum tier", name: name === "VIP Electronics Quest" ? "Platinum Vault" : name };
  }
  return base;
}

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-deep": "#160726",
  "--pq-navy-base": "#241040",
  "--pq-navy-low": "#341A5C",
  "--pq-navy-mid": "#44236F",
  "--pq-navy-hairline": "#5B3494",
  "--pq-emerald": "#B14DFF",
  "--pq-cream": "#E6E1EF",
  "--pq-cream-muted": "#B7AECB",
  "--pq-info": "#5BA8FF",
  "--pq-text": "#F3EFFA",
  "--pq-text-muted": "#C3B6DC",
  "--pq-text-faint": "#7A6E96",
  "--pq-font-serif": "'Playfair Display', Georgia, serif",
  "--pq-font-body": "'Poppins', system-ui, sans-serif",
  "--pq-font-display": "'Poppins', system-ui, sans-serif",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv", width = "360px") {
  const tokens = tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  const style = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(";");
  return html`<div style="${style};background:var(--pq-navy-base);padding:28px;border-radius:12px;width:${width}">${inner}</div>`;
}

interface Args {
  status: CampaignStatus;
  profile: CardProfile;
  loading: boolean;
}

const meta: Meta<Args> = {
  title: "Widgets/pq-campaign-card",
  component: "pq-campaign-card",
  tags: ["autodocs"],
  argTypes: {
    status: { control: "inline-radio", options: ["in-progress", "eligible", "expired", "locked", "claimed"] },
    profile: { control: "inline-radio", options: ["compact", "standard", "expanded"] },
    loading: { control: "boolean" },
  },
  args: { status: "in-progress", profile: "standard", loading: false },
  render: (a) =>
    frame(
      html`<pq-campaign-card
        .campaign=${makeCampaign(a.status)}
        .profile=${a.profile}
        .loading=${a.loading}
      ></pq-campaign-card>`,
    ),
};
export default meta;

type Story = StoryObj<Args>;

/** All three profiles, same campaign data, side by side. */
export const AllProfiles: Story = {
  name: "All profiles (same data)",
  render: () => {
    const c = makeCampaign("in-progress");
    const profiles: CardProfile[] = ["compact", "standard", "expanded"];
    return frame(
      html`<div style="display:flex;flex-direction:column;gap:28px">
        ${profiles.map(
          (p) => html`<div>
            <p style="font-family:var(--pq-font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.18em;color:var(--pq-text-faint);margin:0 0 8px">${p}</p>
            <pq-campaign-card .campaign=${c} .profile=${p}></pq-campaign-card>
          </div>`,
        )}
      </div>`,
      "casino-royale-lv",
      "420px",
    );
  },
};

/** All four states in the expanded profile. */
export const AllStates: Story = {
  name: "All states (in-progress / ready / expired / locked)",
  render: () => {
    const statuses: CampaignStatus[] = ["in-progress", "eligible", "expired", "locked"];
    return frame(
      html`<div style="display:flex;flex-direction:column;gap:16px">
        ${statuses.map(
          (s) => html`<pq-campaign-card .campaign=${makeCampaign(s)} profile="expanded"></pq-campaign-card>`,
        )}
      </div>`,
      "casino-royale-lv",
      "360px",
    );
  },
};

export const Loading: Story = {
  name: "Loading (skeleton)",
  render: () =>
    frame(
      html`<div style="display:flex;flex-direction:column;gap:24px">
        <pq-campaign-card profile="standard" .loading=${true}></pq-campaign-card>
        <pq-campaign-card profile="expanded" .loading=${true}></pq-campaign-card>
        <pq-campaign-card profile="compact" .loading=${true}></pq-campaign-card>
      </div>`,
      "casino-royale-lv",
      "360px",
    ),
};

/** Same expanded cards under both tenants — tokens + (renamed) data both swap. */
export const TenantSwap: StoryObj<Args & { tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { tenant: "casino-royale-lv", status: "eligible", profile: "expanded", loading: false },
  argTypes: {
    tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] },
  },
  render: (a) => {
    const name = a.tenant === "demo-purple" ? "Neon Jackpot Rush" : "Sunday Slot Sprint";
    const c = { ...makeCampaign("eligible"), name };
    return frame(
      html`<pq-campaign-card .campaign=${c} profile="expanded"></pq-campaign-card>`,
      a.tenant,
      "360px",
    );
  },
};
