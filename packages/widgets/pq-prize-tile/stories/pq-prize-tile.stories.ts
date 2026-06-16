import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import type { Prize } from "@pq/mock-data";
import "../src/index";
import type { PrizeTileState } from "../src/types";

const PRIZE: Prize = {
  id: "airpods-pro",
  name: "Apple AirPods Pro",
  category: "Electronics",
  value: 249,
  inStock: true,
};

const DEMO_PURPLE: Record<string, string> = {
  "--pq-navy-deep": "#160726",
  "--pq-navy-low": "#341A5C",
  "--pq-navy-hairline": "#5B3494",
  "--pq-gold-bright": "#E0A3FF",
  "--pq-emerald": "#B14DFF",
  "--pq-text": "#F3EFFA",
  "--pq-text-muted": "#C3B6DC",
  "--pq-text-faint": "#7A6E96",
  "--pq-danger": "#FF5C8A",
  "--pq-font-display": "'Poppins', system-ui, sans-serif",
};

type Tenant = "casino-royale-lv" | "demo-purple";

function frame(inner: TemplateResult, tenant: Tenant = "casino-royale-lv") {
  const tokens = tenant === "demo-purple" ? { ...TOKEN_DEFAULTS, ...DEMO_PURPLE } : TOKEN_DEFAULTS;
  const style = Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(";");
  return html`<div style="${style};background:var(--pq-navy-base);padding:28px;display:grid;grid-template-columns:repeat(2,160px);gap:16px">${inner}</div>`;
}

interface Args {
  selected: boolean;
  state: PrizeTileState;
}

const meta: Meta<Args> = {
  title: "Widgets/pq-prize-tile",
  component: "pq-prize-tile",
  tags: ["autodocs"],
  argTypes: {
    selected: { control: "boolean" },
    state: { control: "inline-radio", options: ["selectable", "locked", "oos"] },
  },
  args: { selected: false, state: "selectable" },
  render: (a) =>
    frame(html`<pq-prize-tile .prize=${PRIZE} .selected=${a.selected} .state=${a.state}></pq-prize-tile>`),
};
export default meta;

type Story = StoryObj<Args>;

export const Selectable: Story = { args: { state: "selectable" } };
export const Selected: Story = { args: { state: "selectable", selected: true } };
export const Locked: Story = { args: { state: "locked" } };
export const OutOfStock: Story = { name: "Out of stock", args: { state: "oos" } };

export const AllStates: Story = {
  name: "All states",
  render: () =>
    frame(html`
      <pq-prize-tile .prize=${PRIZE}></pq-prize-tile>
      <pq-prize-tile .prize=${PRIZE} .selected=${true}></pq-prize-tile>
      <pq-prize-tile .prize=${{ ...PRIZE, name: "Samsung Galaxy Tab S9", value: 799 }} state="locked"></pq-prize-tile>
      <pq-prize-tile .prize=${{ ...PRIZE, name: "Echo Show 15", value: 280, inStock: false }}></pq-prize-tile>
    `),
};

export const TenantSwap: StoryObj<Args & { tenant: Tenant }> = {
  name: "Tenant swap (casino-royale-lv ⇄ demo-purple)",
  args: { selected: true, state: "selectable", tenant: "casino-royale-lv" },
  argTypes: { tenant: { control: "inline-radio", options: ["casino-royale-lv", "demo-purple"] } },
  render: (a) =>
    frame(html`<pq-prize-tile .prize=${PRIZE} .selected=${a.selected} .state=${a.state}></pq-prize-tile>`, a.tenant),
};
