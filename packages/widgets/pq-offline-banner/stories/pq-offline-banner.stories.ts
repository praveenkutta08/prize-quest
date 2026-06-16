import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import "../src/index";
import type { OfflineState } from "../src/types";

const DEMO_PURPLE: Record<string, string> = {
  "--pq-gold-bright": "#E0A3FF",
  "--pq-gold-deep": "#7A2FB0",
  "--pq-emerald": "#B14DFF",
  "--pq-emerald-dim": "#5B2A8A",
  "--pq-text": "#F3EFFA",
  "--pq-font-mono": "'IBM Plex Mono', ui-monospace, monospace",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv") {
  const tokens = tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  const style = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(";");
  return html`<div style="${style};background:var(--pq-navy-base);width:420px">${inner}</div>`;
}

interface Args {
  state: OfflineState;
}

const meta: Meta<Args> = {
  title: "Widgets/pq-offline-banner",
  component: "pq-offline-banner",
  tags: ["autodocs"],
  argTypes: { state: { control: "inline-radio", options: ["offline", "reconnected"] } },
  args: { state: "offline" },
  render: (a) => frame(html`<pq-offline-banner .state=${a.state}></pq-offline-banner>`),
};
export default meta;

type Story = StoryObj<Args>;

export const Offline: Story = { args: { state: "offline" } };
export const Reconnected: Story = { args: { state: "reconnected" } };

export const TenantSwap: StoryObj<Args & { tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { state: "offline", tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) => frame(html`<pq-offline-banner .state=${a.state}></pq-offline-banner>`, a.tenant),
};
