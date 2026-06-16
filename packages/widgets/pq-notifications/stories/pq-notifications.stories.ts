import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import type { Notification } from "@pq/mock-data";
import "../src/index";

const NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "shipping", title: "Your AirPods Pro shipped", body: "UPS · arriving June 7 · tracking 1Z999AA10123456784", time: "2m", read: false, ctaLabel: "Track shipment" },
  { id: "n2", type: "time", title: "Birthday Bonus expires soon", body: "Claim before 11:59 PM tonight · 1 prize ready", time: "1h", read: false, ctaLabel: "Claim now" },
  { id: "n3", type: "campaign", title: "New Gold-tier campaign", body: "Summer Bash 2026 just launched · $500 wager = premium prize", time: "3h", read: true, ctaLabel: "View campaign" },
];

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-deep": "#160726",
  "--pq-navy-low": "#341A5C",
  "--pq-navy-mid": "#44236F",
  "--pq-navy-hairline": "#5B3494",
  "--pq-emerald": "#B14DFF",
  "--pq-emerald-dim": "#5B2A8A",
  "--pq-info": "#5BA8FF",
  "--pq-text": "#F3EFFA",
  "--pq-text-muted": "#C3B6DC",
  "--pq-font-display": "'Poppins', system-ui, sans-serif",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv") {
  const tokens = tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  const style = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(";");
  // extra height so the open tray is visible in the story frame
  return html`<div style="${style};background:var(--pq-navy-deep);padding:24px;height:520px;display:flex;justify-content:flex-end">${inner}</div>`;
}

const meta: Meta = {
  title: "Widgets/pq-notifications",
  component: "pq-notifications",
  tags: ["autodocs"],
  render: () => frame(html`<pq-notifications .notifications=${NOTIFICATIONS}></pq-notifications>`),
};
export default meta;

type Story = StoryObj;

export const BellWithUnread: Story = { name: "Bell (unread)" };
export const TrayOpen: Story = {
  name: "Tray open",
  render: () => frame(html`<pq-notifications .notifications=${NOTIFICATIONS} open></pq-notifications>`),
};
export const Empty: Story = {
  render: () => frame(html`<pq-notifications .notifications=${[]} open></pq-notifications>`),
};

export const TenantSwap: StoryObj<{ tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) => frame(html`<pq-notifications .notifications=${NOTIFICATIONS} open></pq-notifications>`, a.tenant),
};
