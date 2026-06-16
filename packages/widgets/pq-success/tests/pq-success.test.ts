import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import "../src/index";
import type { PqSuccess } from "../src/index";

describe("pq-success", () => {
  it("renders the title with the prize name", async () => {
    const el = await fixture<PqSuccess>(
      html`<pq-success prizeName="Apple AirPods Pro" referenceCode="PQ-1"></pq-success>`,
    );
    expect(el.shadowRoot!.querySelector(".title")!.textContent).to.contain("Apple AirPods Pro");
    expect(el.shadowRoot!.querySelector(".card__name")!.textContent).to.contain("Apple AirPods Pro");
  });

  it("fires pq-copy with the reference code", async () => {
    const el = await fixture<PqSuccess>(
      html`<pq-success prizeName="X" referenceCode="PQ-96521571"></pq-success>`,
    );
    setTimeout(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".ref")!.click());
    const ev = (await oneEvent(el, "pq-copy")) as CustomEvent<{ value: string }>;
    expect(ev.detail.value).to.equal("PQ-96521571");
  });

  it("fires cta and dismiss events", async () => {
    const el = await fixture<PqSuccess>(html`<pq-success prizeName="X" referenceCode="PQ-1"></pq-success>`);
    setTimeout(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".cta")!.click());
    expect(await oneEvent(el, "pq-success-cta")).to.exist;
    setTimeout(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".cta--ghost")!.click());
    expect(await oneEvent(el, "pq-success-dismiss")).to.exist;
  });
});
