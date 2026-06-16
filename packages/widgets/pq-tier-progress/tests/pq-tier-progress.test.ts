import { fixture, html, expect } from "@open-wc/testing";
import "../src/index";
import type { PqTierProgress } from "../src/index";

describe("pq-tier-progress", () => {
  it("renders tier and the pts-to sub", async () => {
    const el = await fixture<PqTierProgress>(
      html`<pq-tier-progress tier="Gold" nextTier="Platinum" .pointsToNext=${2400}></pq-tier-progress>`,
    );
    expect(el.shadowRoot!.querySelector(".chip")!.textContent).to.contain("Gold tier");
    expect(el.shadowRoot!.querySelector(".sub")!.textContent).to.contain("2,400 pts to Platinum");
  });

  it("embeds a progress bar when progressPct is set", async () => {
    const el = await fixture<PqTierProgress>(
      html`<pq-tier-progress tier="Gold" nextTier="Platinum" .pointsToNext=${2400} .progressPct=${68}></pq-tier-progress>`,
    );
    const bar = el.shadowRoot!.querySelector("pq-progress-bar")!;
    expect(bar).to.exist;
    expect(bar.percent).to.equal(68);
  });

  it("hides the sub at the top tier", async () => {
    const el = await fixture<PqTierProgress>(html`<pq-tier-progress tier="Platinum"></pq-tier-progress>`);
    expect(el.shadowRoot!.querySelector(".sub")).to.not.exist;
    expect(el.shadowRoot!.querySelector(".chip")!.textContent).to.contain("Platinum tier");
  });
});
