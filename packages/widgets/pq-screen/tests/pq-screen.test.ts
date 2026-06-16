import { fixture, html, expect } from "@open-wc/testing";
import type { CompositionDoc } from "@pq/compositions";
import "../src/index";
import type { PqScreen } from "../src/index";

// A throwaway element we can register and assert props pass through to.
class PqProbe extends HTMLElement {
  payload?: unknown;
}
if (!customElements.get("pq-probe")) customElements.define("pq-probe", PqProbe);

const OBJ = { a: 1, nested: { b: 2 } };

const COMPOSITION: CompositionDoc = {
  id: "test",
  channel: "mobile-web",
  profile: "expanded",
  layout: [
    { widget: "pq-probe", props: { payload: OBJ } },
    { widget: "pq-totally-missing" },
  ],
};

describe("pq-screen", () => {
  it("renders each layout widget into the shadow root in order", async () => {
    const el = await fixture<PqScreen>(html`<pq-screen .composition=${COMPOSITION}></pq-screen>`);
    const layout = el.shadowRoot!.querySelector(".layout")!;
    expect(layout.children.length).to.equal(2);
    expect(layout.children[0].tagName.toLowerCase()).to.equal("pq-probe");
  });

  it("assigns props via the property setter (objects pass through intact)", async () => {
    const el = await fixture<PqScreen>(html`<pq-screen .composition=${COMPOSITION}></pq-screen>`);
    const probe = el.shadowRoot!.querySelector<PqProbe>("pq-probe")!;
    expect(probe.payload).to.equal(OBJ);
  });

  it("renders an inline placeholder for an unregistered widget", async () => {
    const el = await fixture<PqScreen>(html`<pq-screen .composition=${COMPOSITION}></pq-screen>`);
    const missing = el.shadowRoot!.querySelector(".missing");
    expect(missing).to.exist;
    expect(missing!.textContent).to.contain("pq-totally-missing");
  });

  it("applies the composition profile to <html data-pq-profile> in explicit mode", async () => {
    await fixture<PqScreen>(html`<pq-screen .composition=${COMPOSITION}></pq-screen>`);
    expect(document.documentElement.dataset.pqProfile).to.equal("expanded");
  });

  it("repaints when the composition is replaced", async () => {
    const el = await fixture<PqScreen>(html`<pq-screen .composition=${COMPOSITION}></pq-screen>`);
    el.composition = { id: "x", channel: "mobile-web", profile: "compact", layout: [{ widget: "pq-probe" }] };
    await el.updateComplete;
    const layout = el.shadowRoot!.querySelector(".layout")!;
    expect(layout.children.length).to.equal(1);
    expect(document.documentElement.dataset.pqProfile).to.equal("compact");
  });
});
