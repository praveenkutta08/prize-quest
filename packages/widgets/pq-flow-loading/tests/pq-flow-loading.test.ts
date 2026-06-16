import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import { $claimFlowStep } from "@pq/store";
import "../src/index";
import type { PqFlowLoading, LoadingPhase } from "../src/index";

describe("pq-flow-loading", () => {
  it("shows the PIN step active by default", async () => {
    $claimFlowStep.set("pin");
    const el = await fixture<PqFlowLoading>(html`<pq-flow-loading></pq-flow-loading>`);
    expect(el.shadowRoot!.querySelector(".text")!.textContent).to.contain("Validating PIN");
    expect(el.shadowRoot!.querySelector(".step--active")!.textContent).to.contain("PIN");
  });

  it("advances to the address step", async () => {
    $claimFlowStep.set("address");
    const el = await fixture<PqFlowLoading>(html`<pq-flow-loading></pq-flow-loading>`);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".text")!.textContent).to.contain("Retrieving Address");
    expect(el.shadowRoot!.querySelector(".step--done")!.textContent).to.contain("PIN");
  });

  describe("phases mode (Session 30)", () => {
    const twoPhases: LoadingPhase[] = [
      { id: "pin", label: "PIN", icon: "lock", durationMs: 20 },
      { id: "address", label: "Address", icon: "location", durationMs: 20 },
    ];

    it("renders the active phase title + stepper", async () => {
      const el = await fixture<PqFlowLoading>(
        html`<pq-flow-loading .phases=${twoPhases}></pq-flow-loading>`,
      );
      expect(el.shadowRoot!.querySelector(".load-title")!.textContent).to.contain("PIN");
      expect(el.shadowRoot!.querySelector(".phase--active .phase__label")!.textContent).to.contain(
        "PIN",
      );
      expect(el.shadowRoot!.querySelector(".phase--pending")).to.exist;
    });

    it("advancePhase() advances and marks the previous phase done", async () => {
      const el = await fixture<PqFlowLoading>(
        html`<pq-flow-loading .phases=${[
          { id: "pin", label: "PIN", icon: "lock" },
          { id: "address", label: "Address", icon: "location" },
        ] satisfies LoadingPhase[]}></pq-flow-loading>`,
      );
      expect(el.activePhaseIndex).to.equal(0);
      el.advancePhase();
      await el.updateComplete;
      expect(el.activePhaseIndex).to.equal(1);
      expect(el.completedPhases.has("pin")).to.equal(true);
      expect(el.shadowRoot!.querySelector(".phase--done .phase__label")!.textContent).to.contain(
        "PIN ✓",
      );
    });

    it("auto-advances through phases and fires pq-flow-loading-done once", async () => {
      const el = await fixture<PqFlowLoading>(
        html`<pq-flow-loading .phases=${twoPhases}></pq-flow-loading>`,
      );
      const ev = (await oneEvent(el, "pq-flow-loading-done")) as CustomEvent;
      expect(ev.bubbles).to.equal(true);
      expect(ev.composed).to.equal(true);
      expect(el.completedPhases.has("pin")).to.equal(true);
      expect(el.completedPhases.has("address")).to.equal(true);
    });

    it("keeps steps/$claimFlowStep back-compat when phases is absent", async () => {
      $claimFlowStep.set("pin");
      const el = await fixture<PqFlowLoading>(html`<pq-flow-loading></pq-flow-loading>`);
      expect(el.shadowRoot!.querySelector(".loading")).to.exist;
      expect(el.shadowRoot!.querySelector(".load-wrap")).to.not.exist;
    });
  });
});
