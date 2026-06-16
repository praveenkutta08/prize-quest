import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import "../src/index";
import type { PinLength } from "../src/types";

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-base": "#241040",
  "--pq-navy-low": "#341A5C",
  "--pq-navy-mid": "#44236F",
  "--pq-navy-hairline": "#5B3494",
  "--pq-emerald": "#B14DFF",
  "--pq-emerald-dim": "#5B2A8A",
  "--pq-danger": "#FF5C8A",
  "--pq-text": "#F3EFFA",
  "--pq-text-muted": "#C3B6DC",
  "--pq-font-display": "'Poppins', system-ui, sans-serif",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv") {
  const tokens = tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  const style = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(";");
  return html`<div style="${style};background:var(--pq-navy-deep);padding:32px;width:360px">${inner}</div>`;
}

interface Args {
  length: PinLength;
  shuffle: boolean;
  error?: string;
}

const meta: Meta<Args> = {
  title: "Widgets/pq-pin-pad",
  component: "pq-pin-pad",
  tags: ["autodocs"],
  argTypes: {
    length: { control: "inline-radio", options: [4, 5, 6] },
    shuffle: { control: "boolean" },
    error: { control: "text" },
  },
  args: { length: 4, shuffle: false },
  render: (a) => frame(html`<pq-pin-pad .length=${a.length} .shuffle=${a.shuffle} .error=${a.error}></pq-pin-pad>`),
};
export default meta;

type Story = StoryObj<Args>;

export const FourDigit: Story = { args: { length: 4 } };
export const FiveDigit: Story = { args: { length: 5 } };
export const SixDigit: Story = { args: { length: 6 } };
export const Error: Story = { name: "Error state", args: { length: 4, error: "Incorrect PIN · 2 attempts remaining" } };
export const Shuffled: Story = { args: { length: 4, shuffle: true } };

export const TenantSwap: StoryObj<Args & { tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { length: 4, shuffle: false, tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) => frame(html`<pq-pin-pad .length=${a.length}></pq-pin-pad>`, a.tenant),
};
