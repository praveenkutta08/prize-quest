import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import type { Campaign, Prize } from "@pq/mock-data";
import "../src/index";
import type { PqPromoHero } from "../src/index";

const PRIZES: Prize[] = [
  { id: "a", name: "AirPods", category: "Electronics", value: 249, inStock: true },
  { id: "b", name: "YETI", category: "Outdoor", value: 80, inStock: true },
  { id: "c", name: "Amazon", category: "Gift", value: 100, inStock: true },
  { id: "d", name: "Visa", category: "Gift", value: 250, inStock: true },
];

function campaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: "sunday-slot-sprint",
    name: "Sunday Slot Sprint",
    status: "eligible",
    progress: 500,
    goal: 500,
    pct: 100,
    meta: "$500 / $500",
    expiresAt: "2026-06-07",
    prizeIds: ["a", "b", "c", "d"],
    ...overrides,
  };
}

describe("pq-promo-hero", () => {
  it("fires pq-hero-cta with campaign.id from the CTA", async () => {
    const el = await fixture<PqPromoHero>(html`<pq-promo-hero .campaign=${campaign()} .prizes=${PRIZES}></pq-promo-hero>`);
    setTimeout(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".cta")!.click());
    const ev = (await oneEvent(el, "pq-hero-cta")) as CustomEvent<{ id: string }>;
    expect(ev.detail.id).to.equal("sunday-slot-sprint");
  });

  it("disables CTA and does not fire for expired", async () => {
    const el = await fixture<PqPromoHero>(html`<pq-promo-hero .campaign=${campaign({ status: "expired" })}></pq-promo-hero>`);
    const cta = el.shadowRoot!.querySelector<HTMLButtonElement>(".cta")!;
    expect(cta.disabled).to.equal(true);
    let fired = false;
    el.addEventListener("pq-hero-cta", () => (fired = true));
    cta.click();
    await el.updateComplete;
    expect(fired).to.equal(false);
    expect(el.hasAttribute("dimmed")).to.equal(true);
  });

  it("composes pq-status-pill and pq-progress-bar", async () => {
    const el = await fixture<PqPromoHero>(html`<pq-promo-hero .campaign=${campaign()}></pq-promo-hero>`);
    expect(el.shadowRoot!.querySelector("pq-status-pill")).to.exist;
    expect(el.shadowRoot!.querySelector("pq-progress-bar")).to.exist;
  });

  it("compact profile omits CTA and thumbnails", async () => {
    const el = await fixture<PqPromoHero>(html`<pq-promo-hero .campaign=${campaign()} .prizes=${PRIZES} profile="compact"></pq-promo-hero>`);
    expect(el.shadowRoot!.querySelector(".cta")).to.not.exist;
    expect(el.shadowRoot!.querySelector(".thumbs")).to.not.exist;
    expect(el.shadowRoot!.querySelector("pq-progress-bar")).to.exist;
  });

  it("honors maxThumbs with a +N more chip", async () => {
    const el = await fixture<PqPromoHero>(
      html`<pq-promo-hero .campaign=${campaign()} .prizes=${PRIZES} .maxThumbs=${2}></pq-promo-hero>`,
    );
    const thumbs = el.shadowRoot!.querySelectorAll(".thumb");
    // 2 shown + 1 "+more"
    expect(thumbs.length).to.equal(3);
    expect(el.shadowRoot!.querySelector(".thumb--more")!.textContent!.trim()).to.equal("+2");
  });
});
