import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import type { Campaign, Prize } from "@pq/mock-data";
import "../src/index";
import type { PqClaimConfirm } from "../src/index";

const PRIZE: Prize = {
  id: "airpods-pro",
  name: "Apple AirPods Pro",
  category: "Electronics",
  value: 249,
  inStock: true,
  prizeType: "physical",
};
const CAMPAIGN = { id: "c1", name: "Sunday Slot Sprint" } as Campaign;

async function mount(): Promise<PqClaimConfirm> {
  return fixture<PqClaimConfirm>(
    html`<pq-claim-confirm .prize=${PRIZE} .campaign=${CAMPAIGN}></pq-claim-confirm>`,
  );
}

describe("pq-claim-confirm", () => {
  it("renders the selected prize from props (store fallback)", async () => {
    const el = await mount();
    expect(el.shadowRoot!.querySelector(".card__name")!.textContent).to.contain("AirPods");
  });

  it("disables continue until terms are accepted", async () => {
    const el = await mount();
    const cta = el.shadowRoot!.querySelector<HTMLButtonElement>(".cta")!;
    expect(cta.disabled).to.equal(true);
    el.shadowRoot!.querySelector<HTMLInputElement>("input[type=checkbox]")!.click();
    await el.updateComplete;
    expect(cta.disabled).to.equal(false);
  });

  it("fires pq-claim-confirm once accepted + continued", async () => {
    const el = await mount();
    el.shadowRoot!.querySelector<HTMLInputElement>("input[type=checkbox]")!.click();
    await el.updateComplete;
    setTimeout(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".cta")!.click());
    const ev = await oneEvent(el, "pq-claim-confirm");
    expect(ev).to.exist;
  });
});
