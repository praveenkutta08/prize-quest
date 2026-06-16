import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import "../src/index";
import type { PqScreenHeader } from "../src/index";

describe("pq-screen-header", () => {
  it("renders the title and points from props", async () => {
    const el = await fixture<PqScreenHeader>(
      html`<pq-screen-header title="Order History" .points=${12540}></pq-screen-header>`,
    );
    expect(el.shadowRoot!.querySelector(".brand")!.textContent).to.contain("Order History");
    expect(el.shadowRoot!.querySelector(".pts")!.textContent).to.contain("12,540");
  });

  it("omits the back button unless showBack is set", async () => {
    const el = await fixture<PqScreenHeader>(html`<pq-screen-header title="Home"></pq-screen-header>`);
    expect(el.shadowRoot!.querySelector(".back")).to.not.exist;
  });

  it("fires pq-back when the back button is pressed", async () => {
    const el = await fixture<PqScreenHeader>(
      html`<pq-screen-header title="Confirm" showBack></pq-screen-header>`,
    );
    setTimeout(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".back")!.click());
    const ev = await oneEvent(el, "pq-back");
    expect(ev).to.exist;
  });
});
