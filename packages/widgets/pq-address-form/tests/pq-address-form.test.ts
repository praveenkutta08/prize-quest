import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import type { AddressData } from "@pq/contracts";
import "../src/index";
import type { PqAddressForm } from "../src/index";

const ADDRESS: AddressData = {
  name: "James Morrison",
  line1: "123 Casino Boulevard, Apt 1208",
  city: "Las Vegas",
  state: "NV",
  postalCode: "89109",
  phone: "(702) 555-0123",
  email: "james.morrison@example.com",
};

describe("pq-address-form", () => {
  it("seeds formValues from initialAddress and pre-fills inputs (compact)", async () => {
    const el = await fixture<PqAddressForm>(
      html`<pq-address-form .initialAddress=${ADDRESS} profile="compact"></pq-address-form>`,
    );
    const inputs = el.shadowRoot!.querySelectorAll<HTMLInputElement>(".addr-form-input");
    expect(inputs[0].value).to.equal("123 Casino Boulevard, Apt 1208");
    expect(el.isValid).to.equal(true);
  });

  it("renders the verbatim arcade selectors in compact", async () => {
    const el = await fixture<PqAddressForm>(
      html`<pq-address-form .initialAddress=${ADDRESS} profile="compact"></pq-address-form>`,
    );
    expect(el.shadowRoot!.querySelector(".addr-form")).to.exist;
    expect(el.shadowRoot!.querySelector(".addr-retrieved-pill")).to.exist;
    expect(el.shadowRoot!.querySelector(".addr-form-input--retrieved")).to.exist;
  });

  it("renders the kiosk addr-form-wrap + name field in expanded", async () => {
    const el = await fixture<PqAddressForm>(
      html`<pq-address-form .initialAddress=${ADDRESS} profile="expanded"></pq-address-form>`,
    );
    expect(el.shadowRoot!.querySelector(".addr-form-wrap")).to.exist;
    const labels = [...el.shadowRoot!.querySelectorAll(".addr-form-label")].map((l) => l.textContent!.trim());
    expect(labels).to.include("Recipient name");
  });

  it("disables OK when invalid", async () => {
    const el = await fixture<PqAddressForm>(
      html`<pq-address-form .initialAddress=${{ ...ADDRESS, postalCode: "abc", state: "X" }} profile="compact"></pq-address-form>`,
    );
    expect(el.isValid).to.equal(false);
    const ok = el.shadowRoot!.querySelector<HTMLButtonElement>(".arc-btn--primary")!;
    expect(ok.disabled).to.equal(true);
  });

  it("emits pq-address-submit with the entered values on OK", async () => {
    const el = await fixture<PqAddressForm>(
      html`<pq-address-form .initialAddress=${ADDRESS} profile="compact"></pq-address-form>`,
    );
    setTimeout(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".arc-btn--primary")!.click());
    const ev = await oneEvent(el, "pq-address-submit");
    expect(ev).to.exist;
    expect((ev as CustomEvent).detail.city).to.equal("Las Vegas");
  });

  it("emits pq-back from the Back button", async () => {
    const el = await fixture<PqAddressForm>(
      html`<pq-address-form .initialAddress=${ADDRESS} profile="compact"></pq-address-form>`,
    );
    setTimeout(() => el.shadowRoot!.querySelector<HTMLButtonElement>(".arc-btn--ghost")!.click());
    const ev = await oneEvent(el, "pq-back");
    expect(ev).to.exist;
  });
});
