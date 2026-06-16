import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import "../src/index";
import type { PqPinPad } from "../src/index";

function digitKeys(el: PqPinPad): HTMLButtonElement[] {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>(".key:not(.key--util)"));
}
function pressDigit(el: PqPinPad, digit: string): void {
  digitKeys(el).find((b) => b.textContent!.trim() === digit)!.click();
}

describe("pq-pin-pad", () => {
  it("fills cells as digits are pressed", async () => {
    const el = await fixture<PqPinPad>(html`<pq-pin-pad .length=${4}></pq-pin-pad>`);
    pressDigit(el, "1");
    pressDigit(el, "2");
    await el.updateComplete;
    expect(el.value).to.equal("12");
    expect(el.shadowRoot!.querySelectorAll(".cell--filled").length).to.equal(2);
  });

  it("fires pq-pin-complete when length is reached", async () => {
    const el = await fixture<PqPinPad>(html`<pq-pin-pad .length=${4}></pq-pin-pad>`);
    pressDigit(el, "1");
    pressDigit(el, "2");
    pressDigit(el, "3");
    setTimeout(() => pressDigit(el, "4"));
    const ev = (await oneEvent(el, "pq-pin-complete")) as CustomEvent<{ value: string }>;
    expect(ev.detail.value).to.equal("1234");
  });

  it("supports delete and clear", async () => {
    const el = await fixture<PqPinPad>(html`<pq-pin-pad .length=${4}></pq-pin-pad>`);
    pressDigit(el, "9");
    pressDigit(el, "8");
    el.shadowRoot!.querySelectorAll<HTMLButtonElement>(".key--util")[1].click(); // delete
    await el.updateComplete;
    expect(el.value).to.equal("9");
    el.shadowRoot!.querySelectorAll<HTMLButtonElement>(".key--util")[0].click(); // clear
    await el.updateComplete;
    expect(el.value).to.equal("");
  });

  it("shows the error state via the error property", async () => {
    const el = await fixture<PqPinPad>(html`<pq-pin-pad .length=${4} .error=${"Incorrect PIN"}></pq-pin-pad>`);
    expect(el.hasAttribute("data-error")).to.equal(true);
    expect(el.getAttribute("aria-invalid")).to.equal("true");
    expect(el.shadowRoot!.querySelector(".msg")!.textContent).to.contain("Incorrect PIN");
  });

  it("shuffles all ten digits when shuffle is set", async () => {
    const el = await fixture<PqPinPad>(html`<pq-pin-pad .length=${4} .shuffle=${true}></pq-pin-pad>`);
    const labels = digitKeys(el).map((b) => b.textContent!.trim()).sort();
    expect(labels).to.deep.equal(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
  });
});
