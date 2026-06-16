import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import "../src/index";
import type { PqOfflineBanner } from "../src/index";

describe("pq-offline-banner", () => {
  it("offline shows Retry and fires pq-retry", async () => {
    const el = await fixture<PqOfflineBanner>(html`<pq-offline-banner state="offline"></pq-offline-banner>`);
    expect(el.shadowRoot!.textContent).to.contain("You're offline");
    const retry = el.shadowRoot!.querySelector<HTMLButtonElement>(".retry")!;
    expect(retry).to.exist;
    setTimeout(() => retry.click());
    expect(await oneEvent(el, "pq-retry")).to.exist;
  });

  it("reconnected variant has no retry and emerald text", async () => {
    const el = await fixture<PqOfflineBanner>(html`<pq-offline-banner state="reconnected"></pq-offline-banner>`);
    expect(el.shadowRoot!.querySelector(".retry")).to.not.exist;
    expect(el.shadowRoot!.textContent).to.contain("Back online");
  });

  it("sets role=status", async () => {
    const el = await fixture<PqOfflineBanner>(html`<pq-offline-banner></pq-offline-banner>`);
    expect(el.getAttribute("role")).to.equal("status");
  });

  it("respects showRetry=false", async () => {
    const el = await fixture<PqOfflineBanner>(html`<pq-offline-banner state="offline" .showRetry=${false}></pq-offline-banner>`);
    expect(el.shadowRoot!.querySelector(".retry")).to.not.exist;
  });
});
