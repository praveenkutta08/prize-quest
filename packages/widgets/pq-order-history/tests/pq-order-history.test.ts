import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import type { Order } from "@pq/mock-data";
import "../src/index";
import type { PqOrderHistory } from "../src/index";

const ORDERS: Order[] = [
  { id: "o1", prizeName: "AirPods Pro", campaignName: "Sunday Slot Sprint", status: "in-transit", claimedAt: "Jun 1", tracking: "1Z999" },
  { id: "o2", prizeName: "YETI", campaignName: "Weekend Warrior", status: "delivered", claimedAt: "May 20" },
];

describe("pq-order-history", () => {
  it("renders a row per order and composes status pills", async () => {
    const el = await fixture<PqOrderHistory>(html`<pq-order-history .orders=${ORDERS}></pq-order-history>`);
    expect(el.shadowRoot!.querySelectorAll(".row").length).to.equal(2);
    expect(el.shadowRoot!.querySelectorAll("pq-status-pill").length).to.equal(2);
  });

  it("renders a card grid in the expanded profile", async () => {
    const el = await fixture<PqOrderHistory>(html`<pq-order-history .orders=${ORDERS} profile="expanded"></pq-order-history>`);
    expect(el.shadowRoot!.querySelector(".exp-grid")).to.exist;
    expect(el.shadowRoot!.querySelectorAll(".exp-card").length).to.equal(2);
    expect(el.shadowRoot!.querySelectorAll("pq-status-pill").length).to.equal(2);
    expect(el.shadowRoot!.querySelector("table")).to.not.exist;
    expect(el.shadowRoot!.querySelector(".row")).to.not.exist;
  });

  it("fires pq-order-click with the order id", async () => {
    const el = await fixture<PqOrderHistory>(html`<pq-order-history .orders=${ORDERS}></pq-order-history>`);
    setTimeout(() => el.shadowRoot!.querySelector<HTMLElement>(".row")!.click());
    const ev = (await oneEvent(el, "pq-order-click")) as CustomEvent<{ id: string }>;
    expect(ev.detail.id).to.equal("o1");
  });

  it("shows an empty state with no orders", async () => {
    const el = await fixture<PqOrderHistory>(html`<pq-order-history .orders=${[]}></pq-order-history>`);
    expect(el.shadowRoot!.querySelector(".empty")).to.exist;
  });
});
