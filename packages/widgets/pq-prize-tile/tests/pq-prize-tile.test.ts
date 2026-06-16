import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import type { Prize } from "@pq/mock-data";
import "../src/index";
import type { PqPrizeTile } from "../src/index";

const PRIZE: Prize = {
  id: "airpods-pro",
  name: "Apple AirPods Pro",
  category: "Electronics",
  value: 249,
  inStock: true,
};

describe("pq-prize-tile", () => {
  it("fires pq-prize-select with prize.id when selectable", async () => {
    const el = await fixture<PqPrizeTile>(html`<pq-prize-tile .prize=${PRIZE}></pq-prize-tile>`);
    setTimeout(() => el.shadowRoot!.querySelector<HTMLElement>(".tile")!.click());
    const ev = (await oneEvent(el, "pq-prize-select")) as CustomEvent<{ id: string }>;
    expect(ev.detail.id).to.equal("airpods-pro");
  });

  it("does not fire when locked or out of stock", async () => {
    const locked = await fixture<PqPrizeTile>(html`<pq-prize-tile .prize=${PRIZE} state="locked"></pq-prize-tile>`);
    let fired = false;
    locked.addEventListener("pq-prize-select", () => (fired = true));
    locked.shadowRoot!.querySelector<HTMLElement>(".tile")!.click();
    await locked.updateComplete;
    expect(fired).to.equal(false);

    const oos = await fixture<PqPrizeTile>(
      html`<pq-prize-tile .prize=${{ ...PRIZE, inStock: false }}></pq-prize-tile>`,
    );
    oos.addEventListener("pq-prize-select", () => (fired = true));
    oos.shadowRoot!.querySelector<HTMLElement>(".tile")!.click();
    await oos.updateComplete;
    expect(fired).to.equal(false);
    expect(oos.getAttribute("state")).to.equal("oos");
  });

  it("shows the check when selected", async () => {
    const el = await fixture<PqPrizeTile>(html`<pq-prize-tile .prize=${PRIZE} selected></pq-prize-tile>`);
    expect(el.hasAttribute("selected")).to.equal(true);
    const check = el.shadowRoot!.querySelector(".check") as HTMLElement;
    expect(getComputedStyle(check).display).to.equal("flex");
  });

  it("reflects the effective state attribute", async () => {
    const el = await fixture<PqPrizeTile>(html`<pq-prize-tile .prize=${PRIZE}></pq-prize-tile>`);
    expect(el.getAttribute("state")).to.equal("selectable");
    el.state = "locked";
    await el.updateComplete;
    expect(el.getAttribute("state")).to.equal("locked");
    expect(el.shadowRoot!.querySelector(".lock")).to.exist;
  });
});
