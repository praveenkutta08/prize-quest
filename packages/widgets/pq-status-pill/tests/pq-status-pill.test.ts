import { fixture, html, expect } from "@open-wc/testing";
import "../src/index";
import type { PqStatusPill } from "../src/index";

describe("pq-status-pill", () => {
  it("renders a dot and a label", async () => {
    const el = await fixture<PqStatusPill>(
      html`<pq-status-pill variant="eligible"></pq-status-pill>`,
    );
    expect(el.shadowRoot!.querySelector(".dot")).to.exist;
    expect(el.shadowRoot!.querySelector(".label")!.textContent).to.equal("Eligible");
  });

  it("shows the default label for each variant", async () => {
    const cases: Array<[string, string]> = [
      ["in-progress", "In progress"],
      ["expired", "Expired"],
      ["claimed", "Claimed"],
      ["shipped", "Shipped"],
      ["delivered", "Delivered"],
      ["locked", "Locked"],
      ["danger", "Action needed"],
    ];
    for (const [variant, label] of cases) {
      const el = await fixture<PqStatusPill>(
        html`<pq-status-pill variant="${variant}"></pq-status-pill>`,
      );
      expect(el.text, variant).to.equal(label);
    }
  });

  it("lets label override the default text", async () => {
    const el = await fixture<PqStatusPill>(
      html`<pq-status-pill variant="eligible" label="Ready to claim"></pq-status-pill>`,
    );
    expect(el.text).to.equal("Ready to claim");
    expect(el.shadowRoot!.querySelector(".label")!.textContent).to.equal(
      "Ready to claim",
    );
  });

  it("reflects variant and sets role=status", async () => {
    const el = await fixture<PqStatusPill>(
      html`<pq-status-pill variant="danger"></pq-status-pill>`,
    );
    expect(el.getAttribute("variant")).to.equal("danger");
    expect(el.getAttribute("role")).to.equal("status");
    expect(el.getAttribute("aria-label")).to.equal("Action needed");
  });
});
