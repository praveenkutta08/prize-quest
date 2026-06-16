import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import type { Notification } from "@pq/mock-data";
import "../src/index";
import type { PqNotifications } from "../src/index";

const NOTIFS: Notification[] = [
  { id: "n1", type: "shipping", title: "Shipped", body: "b", time: "2m", read: false, ctaLabel: "Track" },
  { id: "n2", type: "campaign", title: "New campaign", body: "b", time: "3h", read: true },
];

describe("pq-notifications", () => {
  it("shows the unread dot when there are unread items", async () => {
    const el = await fixture<PqNotifications>(html`<pq-notifications .notifications=${NOTIFS}></pq-notifications>`);
    expect(el.shadowRoot!.querySelector(".bell__dot")).to.exist;
  });

  it("toggles the tray open and closed", async () => {
    const el = await fixture<PqNotifications>(html`<pq-notifications .notifications=${NOTIFS}></pq-notifications>`);
    expect(el.shadowRoot!.querySelector(".tray")).to.not.exist;
    el.shadowRoot!.querySelector<HTMLButtonElement>(".bell")!.click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".tray")).to.exist;
    expect(el.shadowRoot!.querySelectorAll(".item").length).to.equal(2);
  });

  it("fires pq-notification-action from an item CTA", async () => {
    const el = await fixture<PqNotifications>(html`<pq-notifications .notifications=${NOTIFS} open></pq-notifications>`);
    setTimeout(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".item__cta")!.click());
    const ev = (await oneEvent(el, "pq-notification-action")) as CustomEvent<{ id: string }>;
    expect(ev.detail.id).to.equal("n1");
  });

  it("marks all read and fires pq-notifications-read", async () => {
    const el = await fixture<PqNotifications>(html`<pq-notifications .notifications=${NOTIFS} open></pq-notifications>`);
    setTimeout(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".head__action")!.click());
    await oneEvent(el, "pq-notifications-read");
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".bell__dot")).to.not.exist;
  });
});
