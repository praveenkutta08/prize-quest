import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import type { Campaign, Prize } from "@pq/mock-data";
import "../src/index";
import type { PqCampaignDetail } from "../src/index";

const PRIZES: Prize[] = [
  { id: "galaxy-tab-s9", name: "Galaxy Tab S9", category: "Electronics", value: 799, inStock: true },
  { id: "sony-xm5", name: "Sony WH-1000XM5", category: "Electronics", value: 399, inStock: true },
];

function campaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: "vip-electronics-quest",
    name: "VIP Electronics Quest",
    status: "eligible",
    progress: 1000,
    goal: 1000,
    pct: 100,
    meta: "meta",
    expiresAt: "2026-06-30",
    prizeIds: PRIZES.map((p) => p.id),
    ...overrides,
  };
}

describe("pq-campaign-detail", () => {
  it("renders a prize tile per prize and composes progress + pill", async () => {
    const el = await fixture<PqCampaignDetail>(
      html`<pq-campaign-detail .campaign=${campaign()} .prizes=${PRIZES}></pq-campaign-detail>`,
    );
    expect(el.shadowRoot!.querySelectorAll("pq-prize-tile").length).to.equal(2);
    expect(el.shadowRoot!.querySelector("pq-progress-bar")).to.exist;
    expect(el.shadowRoot!.querySelector("pq-status-pill")).to.exist;
  });

  it("updates selection and enables claim, then fires pq-claim-start", async () => {
    const el = await fixture<PqCampaignDetail>(
      html`<pq-campaign-detail .campaign=${campaign()} .prizes=${PRIZES}></pq-campaign-detail>`,
    );
    const claim = () => el.shadowRoot!.querySelector<HTMLButtonElement>(".claim")!;
    expect(claim().disabled).to.equal(true);

    // select the first prize tile
    const tile = el.shadowRoot!.querySelector("pq-prize-tile")!;
    tile.shadowRoot!.querySelector<HTMLElement>(".tile")!.click();
    await el.updateComplete;
    expect(el.selectedPrizeId).to.equal("galaxy-tab-s9");
    expect(claim().disabled).to.equal(false);

    setTimeout(() => claim().click());
    const ev = (await oneEvent(el, "pq-claim-start")) as CustomEvent<{ campaignId: string; prizeId: string }>;
    expect(ev.detail.campaignId).to.equal("vip-electronics-quest");
    expect(ev.detail.prizeId).to.equal("galaxy-tab-s9");
  });

  it("locks tiles and disables claim when not eligible", async () => {
    const el = await fixture<PqCampaignDetail>(
      html`<pq-campaign-detail .campaign=${campaign({ status: "in-progress", pct: 72 })} .prizes=${PRIZES}></pq-campaign-detail>`,
    );
    const tile = el.shadowRoot!.querySelector("pq-prize-tile")!;
    await tile.updateComplete;
    expect(tile.getAttribute("state")).to.equal("locked");
    expect(el.shadowRoot!.querySelector<HTMLButtonElement>(".claim")!.disabled).to.equal(true);
  });

  it("uses a two-column hero in the expanded profile", async () => {
    const el = await fixture<PqCampaignDetail>(
      html`<pq-campaign-detail .campaign=${campaign()} .prizes=${PRIZES} profile="expanded"></pq-campaign-detail>`,
    );
    // Expanded is a dedicated rich layout: a 2-column hero (text + illustration) above
    // the prize grid, rather than the standard single column.
    const hero = el.shadowRoot!.querySelector<HTMLElement>(".exp-hero")!;
    expect(hero).to.exist;
    expect(getComputedStyle(hero).display).to.equal("grid");
    expect(el.shadowRoot!.querySelectorAll("pq-prize-tile").length).to.be.greaterThan(0);
  });
});
