import { fixture, html, expect } from "@open-wc/testing";
import "../src/index";
import type { PqTrustStrip } from "../src/index";

describe("pq-trust-strip", () => {
  it("renders four default badges with icons", async () => {
    const el = await fixture<PqTrustStrip>(html`<pq-trust-strip></pq-trust-strip>`);
    const badges = el.shadowRoot!.querySelectorAll(".badge");
    expect(badges.length).to.equal(4);
    expect(el.shadowRoot!.querySelectorAll(".icon svg").length).to.equal(4);
    expect(el.shadowRoot!.textContent).to.contain("Insured fulfillment");
  });

  it("honors custom badges", async () => {
    const el = await fixture<PqTrustStrip>(
      html`<pq-trust-strip .badges=${[{ icon: "shield", title: "Custom one", sub: "x" }, { icon: "truck", title: "Custom two", sub: "y" }]}></pq-trust-strip>`,
    );
    expect(el.shadowRoot!.querySelectorAll(".badge").length).to.equal(2);
    expect(el.shadowRoot!.textContent).to.contain("Custom one");
  });
});
