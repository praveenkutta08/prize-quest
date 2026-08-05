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
    const el = await fixture<PqScreenHeader>(
      html`<pq-screen-header title="Home"></pq-screen-header>`,
    );
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

  // REGRESSION GUARD. `.right { justify-content: flex-end }` was once deleted by a
  // range-based edit that replaced everything between the `.left,.right` rule and the
  // `.brand` rule. Nothing failed to compile and no class went missing — the brandmark
  // simply packed to the START of its track and floated mid-header on the 480px TTD
  // panel. A deleted declaration is invisible to lint, so it is pinned here.
  it("keeps the logo hard right in its track", async () => {
    const el = await fixture<PqScreenHeader>(
      html`<pq-screen-header title="Tier Rewards Promotions" showBack></pq-screen-header>`,
    );
    const right = el.shadowRoot!.querySelector(".right")!;
    expect(getComputedStyle(right).justifyContent).to.equal("flex-end");
  });
});
