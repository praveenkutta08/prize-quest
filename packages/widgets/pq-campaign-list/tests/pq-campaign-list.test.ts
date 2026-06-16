import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import type { Campaign } from "@pq/mock-data";
import "../src/index";
import type { PqCampaignList } from "../src/index";

function mk(id: string, status: Campaign["status"] = "in-progress"): Campaign {
  return { id, name: id, status, progress: 720, goal: 1000, pct: 72, meta: "m", prizeIds: ["a"] };
}

const CAMPAIGNS: Campaign[] = [mk("a"), mk("b"), mk("c")];

describe("pq-campaign-list", () => {
  it("renders one card per campaign in a stack", async () => {
    const el = await fixture<PqCampaignList>(html`<pq-campaign-list .campaigns=${CAMPAIGNS}></pq-campaign-list>`);
    expect(el.shadowRoot!.querySelectorAll("pq-campaign-card").length).to.equal(3);
  });

  it("renders a carousel rail with controls when opted in via variant", async () => {
    const el = await fixture<PqCampaignList>(
      html`<pq-campaign-list .campaigns=${CAMPAIGNS} variant="carousel"></pq-campaign-list>`,
    );
    expect(el.shadowRoot!.querySelector(".rail")).to.exist;
    expect(el.shadowRoot!.querySelectorAll(".rail-ctl").length).to.equal(2);
    expect(el.shadowRoot!.querySelectorAll("pq-campaign-card").length).to.equal(3);
  });

  it("renders the expanded profile as a grid of expanded cards (no carousel)", async () => {
    const el = await fixture<PqCampaignList>(
      html`<pq-campaign-list .campaigns=${CAMPAIGNS} profile="expanded"></pq-campaign-list>`,
    );
    const grid = el.shadowRoot!.querySelector(".grid");
    expect(grid).to.exist;
    expect(el.shadowRoot!.querySelector(".rail")).to.not.exist;
    const cards = grid!.querySelectorAll("pq-campaign-card");
    expect(cards.length).to.equal(3);
    expect(cards[0]!.getAttribute("profile")).to.equal("expanded");
  });

  it("shows an empty state with no campaigns", async () => {
    const el = await fixture<PqCampaignList>(html`<pq-campaign-list .campaigns=${[]}></pq-campaign-list>`);
    expect(el.shadowRoot!.querySelector(".empty")).to.exist;
    expect(el.shadowRoot!.querySelector("pq-campaign-card")).to.not.exist;
  });

  it("lets child pq-card-click bubble through (composed)", async () => {
    const el = await fixture<PqCampaignList>(html`<pq-campaign-list .campaigns=${CAMPAIGNS}></pq-campaign-list>`);
    const firstCard = el.shadowRoot!.querySelector("pq-campaign-card")!;
    const innerCard = firstCard.shadowRoot!.querySelector<HTMLElement>(".card")!;
    setTimeout(() => innerCard.click());
    const ev = (await oneEvent(el, "pq-card-click")) as CustomEvent<{ id: string }>;
    expect(ev.detail.id).to.equal("a");
  });

  it("renders a featured promo-hero when featuredId is set", async () => {
    const el = await fixture<PqCampaignList>(
      html`<pq-campaign-list .campaigns=${CAMPAIGNS} featuredId="a"></pq-campaign-list>`,
    );
    expect(el.shadowRoot!.querySelector("pq-promo-hero")).to.exist;
    // featured one is excluded from the stack below
    expect(el.shadowRoot!.querySelectorAll("pq-campaign-card").length).to.equal(2);
  });
});
