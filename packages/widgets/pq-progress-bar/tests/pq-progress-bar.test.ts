import { fixture, html, expect } from "@open-wc/testing";
import "../src/index";
import type { PqProgressBar } from "../src/index";

describe("pq-progress-bar", () => {
  it("renders the element with a track", async () => {
    const el = await fixture<PqProgressBar>(
      html`<pq-progress-bar></pq-progress-bar>`,
    );
    expect(el).to.be.instanceOf(customElements.get("pq-progress-bar")!);
    expect(el.shadowRoot!.querySelector(".track")).to.exist;
  });

  it("applies the correct fill width from value/max", async () => {
    const el = await fixture<PqProgressBar>(
      html`<pq-progress-bar value="50" max="200"></pq-progress-bar>`,
    );
    const fill = el.shadowRoot!.querySelector(".fill") as HTMLElement;
    expect(el.percent).to.equal(25);
    expect(fill.style.width).to.equal("25%");
  });

  it('sets aria-busy="true" for variant="loading"', async () => {
    const el = await fixture<PqProgressBar>(
      html`<pq-progress-bar variant="loading"></pq-progress-bar>`,
    );
    expect(el.getAttribute("aria-busy")).to.equal("true");
    expect(el.shadowRoot!.querySelector(".shimmer")).to.exist;
    expect(el.shadowRoot!.querySelector(".fill")).to.not.exist;
  });

  it("clamps value above max", async () => {
    const el = await fixture<PqProgressBar>(
      html`<pq-progress-bar value="150" max="100"></pq-progress-bar>`,
    );
    expect(el.clampedValue).to.equal(100);
    expect(el.percent).to.equal(100);
    const fill = el.shadowRoot!.querySelector(".fill") as HTMLElement;
    expect(fill.style.width).to.equal("100%");
    expect(el.getAttribute("aria-valuenow")).to.equal("100");
  });
});
