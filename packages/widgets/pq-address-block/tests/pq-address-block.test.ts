import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import type { Address } from "@pq/mock-data";
import "../src/index";
import type { PqAddressBlock } from "../src/index";

const ADDRESS: Address = {
  name: "John Smith",
  line1: "123 Casino Boulevard",
  line2: "Apt 4B",
  city: "Las Vegas",
  state: "NV",
  zip: "89101",
  phone: "(702) 555-0123",
  email: "john.smith@email.com",
};

describe("pq-address-block", () => {
  it("renders the address fields", async () => {
    const el = await fixture<PqAddressBlock>(html`<pq-address-block .address=${ADDRESS}></pq-address-block>`);
    const text = el.shadowRoot!.textContent!;
    expect(el.shadowRoot!.querySelector(".name")!.textContent).to.contain("John Smith");
    expect(text).to.contain("123 Casino Boulevard");
    expect(text).to.contain("Las Vegas, NV 89101");
    expect(text).to.contain("(702) 555-0123");
  });

  it("toggles the verified badge", async () => {
    const el = await fixture<PqAddressBlock>(html`<pq-address-block .address=${ADDRESS}></pq-address-block>`);
    expect(el.shadowRoot!.querySelector(".verified")).to.not.exist;
    el.verified = true;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".verified")).to.exist;
  });

  it("fires pq-address-edit from the link", async () => {
    const el = await fixture<PqAddressBlock>(html`<pq-address-block .address=${ADDRESS} verified></pq-address-block>`);
    setTimeout(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".edit button")!.click());
    const ev = await oneEvent(el, "pq-address-edit");
    expect(ev).to.exist;
  });

  it("renders the hero + two-column layout in the expanded profile", async () => {
    const el = await fixture<PqAddressBlock>(
      html`<pq-address-block
        .address=${ADDRESS}
        .verified=${true}
        .showConfirm=${true}
        profile="expanded"
      ></pq-address-block>`,
    );
    expect(el.shadowRoot!.querySelector(".hero")).to.exist; // verified hero
    expect(el.shadowRoot!.querySelector(".addr-2col")).to.exist; // two columns
    expect(el.shadowRoot!.querySelector(".next-panel")).to.exist; // right panel
    expect(el.shadowRoot!.querySelectorAll(".next-step").length).to.equal(3);
    expect(el.shadowRoot!.querySelector(".confirm--xl")).to.exist; // strong Continue
    expect(el.shadowRoot!.querySelector(".ghost-btn")).to.exist; // strong Edit
  });

  it("fires pq-address-confirm from the expanded Continue button", async () => {
    const el = await fixture<PqAddressBlock>(
      html`<pq-address-block .address=${ADDRESS} .verified=${true} .showConfirm=${true} profile="expanded"></pq-address-block>`,
    );
    setTimeout(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".confirm--xl")!.click());
    const ev = await oneEvent(el, "pq-address-confirm");
    expect(ev).to.exist;
  });
});
