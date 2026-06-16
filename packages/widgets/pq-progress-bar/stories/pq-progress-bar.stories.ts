import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import "../src/index";

/**
 * The casino-royale-lv (premium) palette is `TOKEN_DEFAULTS`. demo-purple's
 * overrides are inlined here so the stories are self-contained (no @pq/tenants
 * dependency) — they mirror packages/tenants/src/configs/demo-purple.json.
 */
const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-deep": "#160726",
  "--pq-navy-base": "#241040",
  "--pq-navy-low": "#341A5C",
  "--pq-navy-hairline": "#5B3494",
  "--pq-cream": "#E6E1EF",
  "--pq-cream-muted": "#B7AECB",
  "--pq-text": "#F3EFFA",
  "--pq-text-muted": "#C3B6DC",
  "--pq-font-serif": "'Playfair Display', Georgia, serif",
  "--pq-font-body": "'Poppins', system-ui, sans-serif",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function tokenStyle(tenant: Tenant): string {
  const tokens =
    tenant === "demo-purple"
      ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE }
      : TOKEN_DEFAULTS;
  return Object.entries(tokens)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

/** Render the widget inside a tenant-themed frame so --pq-* vars resolve. */
function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv") {
  return html`
    <div
      style="${tokenStyle(tenant)};background:var(--pq-navy-base);padding:32px;border-radius:12px;max-width:420px"
    >
      ${inner}
    </div>
  `;
}

interface Args {
  value: number;
  max: number;
  variant: "default" | "complete" | "loading";
  label?: string;
}

const meta: Meta<Args> = {
  title: "Widgets/pq-progress-bar",
  component: "pq-progress-bar",
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    max: { control: { type: "number" } },
    variant: { control: "inline-radio", options: ["default", "complete", "loading"] },
    label: { control: "text" },
  },
  args: { value: 50, max: 100, variant: "default" },
  render: (a) =>
    frame(
      html`<pq-progress-bar
        .value=${a.value}
        .max=${a.max}
        .variant=${a.variant}
        .label=${a.label}
      ></pq-progress-bar>`,
    ),
};
export default meta;

type Story = StoryObj<Args>;

export const Empty: Story = { name: "Default · 0%", args: { value: 0 } };
export const Half: Story = { name: "Default · 50%", args: { value: 50 } };
export const Full: Story = { name: "Default · 100%", args: { value: 100 } };

export const Complete: Story = {
  name: "Complete (one-time fill)",
  args: { value: 100, variant: "complete" },
};

export const Loading: Story = {
  name: "Loading (shimmer)",
  args: { variant: "loading" },
};

export const WithLabel: Story = {
  name: 'With label "PROGRESS"',
  args: { value: 72, label: "PROGRESS" },
};

/**
 * Tenant swap — the SAME widget under both tenants. Toggle `tenant` in Controls:
 * the fill color follows `--pq-cream-muted` (cream → silver) and fonts swap,
 * with no hardcoded colors anywhere in the widget.
 */
export const TenantSwap: StoryObj<Args & { tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { value: 72, label: "PROGRESS", variant: "default", max: 100, tenant: "casino-royale-lv" },
  argTypes: {
    tenant: {
      control: "inline-radio",
      options: ["casino-royale-lv", "demo-purple"],
    },
  },
  render: (a) =>
    frame(
      html`<pq-progress-bar
        .value=${a.value}
        .max=${a.max}
        .variant=${a.variant}
        .label=${a.label}
      ></pq-progress-bar>`,
      a.tenant,
    ),
};
