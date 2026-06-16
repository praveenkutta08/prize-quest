import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { TOKEN_DEFAULTS } from "@pq/tokens";
import type { AddressData } from "@pq/contracts";
import "../src/index";

const ADDRESS: AddressData = {
  name: "James Morrison",
  line1: "123 Casino Boulevard, Apt 1208",
  city: "Las Vegas",
  state: "NV",
  postalCode: "89109",
  phone: "(702) 555-0123",
  email: "james.morrison@example.com",
};

/** initialAddress carrying an invalid state + ZIP so validation errors surface on blur. */
const INVALID_ADDRESS: AddressData = {
  ...ADDRESS,
  state: "X",
  postalCode: "abc",
};

type Profile = "compact" | "standard" | "expanded";

function frame(inner: TemplateResult, width = "520px") {
  const style = Object.entries(TOKEN_DEFAULTS)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
  return html`<div style="${style};background:var(--pq-navy-deep);padding:28px;width:${width}">
    ${inner}
  </div>`;
}

interface Args {
  profile: Profile;
}

const meta: Meta<Args> = {
  title: "Widgets/pq-address-form",
  component: "pq-address-form",
  tags: ["autodocs"],
  argTypes: {
    profile: { control: "inline-radio", options: ["compact", "standard", "expanded"] },
  },
  args: { profile: "compact" },
  render: (a) =>
    frame(html`<pq-address-form .initialAddress=${ADDRESS} profile=${a.profile}></pq-address-form>`),
};
export default meta;

type Story = StoryObj<Args>;

/** Empty form (no initialAddress) — compact. */
export const Empty: Story = {
  args: { profile: "compact" },
  render: (a) => frame(html`<pq-address-form profile=${a.profile}></pq-address-form>`),
};

/** Pre-filled from a full initialAddress — compact. */
export const Prefilled: Story = {
  args: { profile: "compact" },
  render: (a) =>
    frame(html`<pq-address-form .initialAddress=${ADDRESS} profile=${a.profile}></pq-address-form>`),
};

/** Pre-filled, expanded kiosk layout (the player edits inline). */
export const PrefilledEdited: Story = {
  name: "Prefilled (expanded)",
  args: { profile: "expanded" },
  render: (a) =>
    frame(
      html`<pq-address-form .initialAddress=${ADDRESS} profile=${a.profile}></pq-address-form>`,
      "1100px",
    ),
};

/** initialAddress with an invalid state ("X") + ZIP ("abc") — errors show once blurred. */
export const ValidationErrors: Story = {
  args: { profile: "compact" },
  render: (a) =>
    frame(
      html`<pq-address-form .initialAddress=${INVALID_ADDRESS} profile=${a.profile}></pq-address-form>`,
    ),
};
