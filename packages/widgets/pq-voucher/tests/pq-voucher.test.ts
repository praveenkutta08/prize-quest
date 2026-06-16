import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import type { Voucher } from "@pq/mock-data";
import "../src/index";
import type { PqVoucher } from "../src/index";

const ISSUED: Voucher = {
  id: "voucher-1",
  code: "PQ-9F4A-E2C9-X742",
  prizeId: "dining-credit-100",
  amount: 100,
  brand: "Casino Royale · Dining credit",
  name: "Sunday Slot Sprint reward",
  issuedAt: "2026-06-04",
  expiresAt: "December 31, 2026",
  redeemed: false,
};

describe("pq-voucher", () => {
  it("renders code, value and QR when issued", async () => {
    const el = await fixture<PqVoucher>(html`<pq-voucher .voucher=${ISSUED}></pq-voucher>`);
    expect(el.shadowRoot!.querySelector(".card__value")!.textContent).to.contain("$100");
    expect(el.shadowRoot!.querySelector(".code")!.textContent).to.contain("PQ-9F4A-E2C9-X742");
    expect(el.shadowRoot!.querySelector(".qr svg")).to.exist;
    expect(el.shadowRoot!.querySelector(".how")).to.exist;
    expect(el.shadowRoot!.querySelector(".stamp")).to.not.exist;
  });

  it("fires pq-copy with the code", async () => {
    const el = await fixture<PqVoucher>(html`<pq-voucher .voucher=${ISSUED}></pq-voucher>`);
    setTimeout(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".code")!.click());
    const ev = (await oneEvent(el, "pq-copy")) as CustomEvent<{ value: string }>;
    expect(ev.detail.value).to.equal("PQ-9F4A-E2C9-X742");
  });

  it("shows the redeemed stamp and hides redemption steps", async () => {
    const el = await fixture<PqVoucher>(
      html`<pq-voucher .voucher=${{ ...ISSUED, redeemed: true, redeemedAt: "Jun 4" }}></pq-voucher>`,
    );
    expect(el.hasAttribute("redeemed")).to.equal(true);
    expect(el.shadowRoot!.querySelector(".stamp")).to.exist;
    expect(el.shadowRoot!.querySelector(".how")).to.not.exist;
    expect(el.shadowRoot!.querySelector(".expiry")!.textContent).to.contain("Redeemed");
  });

  it("fires pq-voucher-action from action buttons", async () => {
    const el = await fixture<PqVoucher>(html`<pq-voucher .voucher=${ISSUED}></pq-voucher>`);
    setTimeout(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".cta")!.click());
    const ev = (await oneEvent(el, "pq-voucher-action")) as CustomEvent<{ action: string }>;
    expect(ev.detail.action).to.equal("wallet");
  });
});
