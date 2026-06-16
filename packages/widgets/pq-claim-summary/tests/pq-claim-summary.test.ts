import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import type { Address, Campaign, Prize } from "@pq/mock-data";
import "../src/index";
import type { PqClaimSummary } from "../src/index";

const PRIZE: Prize = {
  id: "airpods-pro",
  name: "Apple AirPods Pro",
  category: "Electronics",
  value: 249,
  inStock: true,
  prizeType: "physical",
};
const CAMPAIGN = { id: "c1", name: "Sunday Slot Sprint" } as Campaign;
const ADDRESS: Address = { name: "John Smith", line1: "123", city: "Las Vegas", state: "NV", zip: "89101" };
const PENDING = { campaignId: "c1", prizeId: "airpods-pro", pin: "1234", address: ADDRESS };

describe("pq-claim-summary", () => {
  it("renders prize, campaign, masked PIN and shipping (physical)", async () => {
    const el = await fixture<PqClaimSummary>(
      html`<pq-claim-summary .prize=${PRIZE} .campaign=${CAMPAIGN} .pending=${PENDING} .address=${ADDRESS}></pq-claim-summary>`,
    );
    const text = el.shadowRoot!.textContent!;
    expect(text).to.contain("AirPods");
    expect(text).to.contain("Sunday Slot Sprint");
    expect(text).to.contain("••••");
    expect(text).to.contain("Las Vegas");
  });

  it("omits the shipping row for digital prizes", async () => {
    const el = await fixture<PqClaimSummary>(
      html`<pq-claim-summary
        .prize=${{ ...PRIZE, prizeType: "digital" }}
        .campaign=${CAMPAIGN}
        .pending=${PENDING}
      ></pq-claim-summary>`,
    );
    expect(el.shadowRoot!.textContent).to.contain("Digital voucher");
    expect(el.shadowRoot!.querySelectorAll(".row").length).to.equal(4);
  });

  it("fires pq-claim-submit on submit", async () => {
    const el = await fixture<PqClaimSummary>(
      html`<pq-claim-summary .prize=${PRIZE} .campaign=${CAMPAIGN} .pending=${PENDING}></pq-claim-summary>`,
    );
    setTimeout(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".cta")!.click());
    const ev = await oneEvent(el, "pq-claim-submit");
    expect(ev).to.exist;
  });
});
