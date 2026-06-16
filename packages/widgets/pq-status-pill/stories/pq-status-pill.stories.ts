import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import "../src/index";
import type { StatusPillVariant } from "../src/types";

const VARIANTS: StatusPillVariant[] = [
  "eligible",
  "in-progress",
  "expired",
  "claimed",
  "shipped",
  "delivered",
  "locked",
  "danger",
];

/** demo-purple overrides (mirrors packages/tenants/src/configs/demo-purple.json). */
const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-base": "#241040",
  "--pq-emerald": "#B14DFF",
  "--pq-info": "#5BA8FF",
  "--pq-cream-muted": "#B7AECB",
  "--pq-danger": "#FF5C8A",
  "--pq-text-faint": "#7A6E96",
  "--pq-text-muted": "#C3B6DC",
  "--pq-font-mono": "'IBM Plex Mono', ui-monospace, monospace",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function tokenStyle(tenant: Tenant): string {
  const tokens =
    tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  return Object.entries(tokens)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv") {
  return html`
    <div
      style="${tokenStyle(tenant)};background:var(--pq-navy-base);padding:28px;border-radius:12px;display:flex;flex-direction:column;gap:16px;align-items:flex-start"
    >
      ${inner}
    </div>
  `;
}

interface Args {
  variant: StatusPillVariant;
  label?: string;
}

const meta: Meta<Args> = {
  title: "Widgets/pq-status-pill",
  component: "pq-status-pill",
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    label: { control: "text" },
  },
  args: { variant: "in-progress" },
  render: (a) =>
    frame(
      html`<pq-status-pill .variant=${a.variant} .label=${a.label}></pq-status-pill>`,
    ),
};
export default meta;

type Story = StoryObj<Args>;

/** All 8 variants stacked, default labels. */
export const AllVariants: Story = {
  name: "All variants",
  render: () =>
    frame(html`${VARIANTS.map((v) => html`<pq-status-pill .variant=${v}></pq-status-pill>`)}`),
};

export const Eligible: Story = { args: { variant: "eligible" } };
export const InProgress: Story = { args: { variant: "in-progress" } };
export const Expired: Story = { args: { variant: "expired" } };
export const Claimed: Story = { args: { variant: "claimed" } };
export const Shipped: Story = { args: { variant: "shipped" } };
export const Delivered: Story = { args: { variant: "delivered" } };
export const Locked: Story = { args: { variant: "locked" } };
export const Danger: Story = { args: { variant: "danger" } };

export const CustomLabel: Story = {
  name: "Custom label override",
  args: { variant: "eligible", label: "Ready to claim" },
};

/** Same pills under both tenants — colors track tenant tokens, no hardcoded values. */
export const TenantSwap: StoryObj<Args & { tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { variant: "eligible", tenant: "casino-royale-lv" },
  argTypes: {
    tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] },
  },
  render: (a) =>
    frame(
      html`${VARIANTS.map((v) => html`<pq-status-pill .variant=${v}></pq-status-pill>`)}`,
      a.tenant,
    ),
};
