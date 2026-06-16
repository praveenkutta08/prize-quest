import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import type { Campaign } from "@pq/mock-data";
import "../src/index";
import type { PqCampaignCard } from "../src/index";

function campaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: "vip-electronics-quest",
    name: "VIP Electronics Quest",
    status: "in-progress",
    progress: 725,
    goal: 1000,
    pct: 72,
    meta: "$725 / $1,000 · 26 days left",
    prizeIds: ["galaxy-tab-s9"],
    ...overrides,
  };
}

describe("pq-campaign-card", () => {
  it("fires pq-card-click with campaign.id in detail", async () => {
    const el = await fixture<PqCampaignCard>(
      html`<pq-campaign-card .campaign=${campaign()}></pq-campaign-card>`,
    );
    const card = el.shadowRoot!.querySelector<HTMLElement>(".card")!;
    setTimeout(() => card.click());
    const ev = (await oneEvent(el, "pq-card-click")) as CustomEvent<{ id: string }>;
    expect(ev.detail.id).to.equal("vip-electronics-quest");
  });

  it("does not fire click for expired campaigns", async () => {
    const el = await fixture<PqCampaignCard>(
      html`<pq-campaign-card .campaign=${campaign({ status: "expired" })}></pq-campaign-card>`,
    );
    let fired = false;
    el.addEventListener("pq-card-click", () => (fired = true));
    el.shadowRoot!.querySelector<HTMLElement>(".card")!.click();
    await el.updateComplete;
    expect(fired).to.equal(false);
    expect(el.hasAttribute("role")).to.equal(false);
  });

  it("changes layout per profile", async () => {
    const compact = await fixture<PqCampaignCard>(
      html`<pq-campaign-card .campaign=${campaign()} profile="compact"></pq-campaign-card>`,
    );
    // Compact is a rich casino card: title + pill + local bar + CTA, no nested progress-bar.
    expect(compact.shadowRoot!.querySelector(".bar-pct")).to.exist;
    expect(compact.shadowRoot!.querySelector(".cta")).to.exist;
    expect(compact.shadowRoot!.querySelector("pq-progress-bar")).to.not.exist;

    const standard = await fixture<PqCampaignCard>(
      html`<pq-campaign-card .campaign=${campaign()} profile="standard"></pq-campaign-card>`,
    );
    expect(standard.shadowRoot!.querySelector("pq-progress-bar")).to.exist;
    expect(standard.shadowRoot!.querySelector(".arrow")).to.exist;
    expect(standard.shadowRoot!.querySelector("pq-status-pill")).to.not.exist;

    const expanded = await fixture<PqCampaignCard>(
      html`<pq-campaign-card .campaign=${campaign()} profile="expanded"></pq-campaign-card>`,
    );
    expect(expanded.shadowRoot!.querySelector("pq-progress-bar")).to.exist;
    expect(expanded.shadowRoot!.querySelector("pq-status-pill")).to.exist;
  });

  it("composes both child widgets in the expanded profile", async () => {
    const el = await fixture<PqCampaignCard>(
      html`<pq-campaign-card .campaign=${campaign({ status: "eligible" })} profile="expanded"></pq-campaign-card>`,
    );
    const pill = el.shadowRoot!.querySelector("pq-status-pill");
    const bar = el.shadowRoot!.querySelector("pq-progress-bar");
    expect(pill).to.exist;
    expect(bar).to.exist;
    // child upgraded to its custom element (shadow content present)
    expect(pill!.shadowRoot).to.exist;
    expect(bar!.shadowRoot).to.exist;
  });
});
