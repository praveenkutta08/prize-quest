// <dm-flow-panel> — the service panel the embedded claim flow runs inside on the
// Device Manager.
//
// THE PROBLEM IT SOLVES. The claim screens (confirm → PIN → address → review →
// success, plus order history) are the shared @pq widgets, authored for a short,
// landscape iVIEW panel. Dropped straight into a DM rail — 604×768 at 1024, 1240×1080
// at 1920 — each one renders as a ~270px block of content marooned in a black field.
// Nothing is broken; it just looks unfinished, and on a cabinet an unfinished-looking
// claim screen is the moment a patron stops trusting the transaction.
//
// THE FIX IS CHROME, NOT COPY. Every word, every field and every button still comes
// from the same composition and the same widgets — this component does not render any
// flow content itself. What it adds is the frame around it:
//
//   · a VITRINE, matching dm-prize-list, so the claim reads as the same object the
//     patron was just choosing from rather than a different application;
//   · a measured column — the panel is capped and centred, so a 1240px rail does not
//     stretch a PIN pad to the width of a desk;
//   · a STEP RAIL, which is what actually earns the vertical space: mid-transaction,
//     "where am I and how much is left" is the one thing the flow never told them.
//
// The step labels are the screens' own names. No new copy is invented.
//
// It also owns the fit for its slotted <pq-screen>: the flow is measured at several
// candidate widths and scaled to fill the panel, since a narrower layout wraps taller
// and can then be scaled further before it hits an edge.
//
// HOUSE RULE: no currency values anywhere, and no progress bars. (The step rail is
// wayfinding — discrete named stops — not a progress bar against a goal.)
//
// Host chrome (NOT a @pq widget), themed by the tenant's --arc-* tokens.
import { LitElement, css, html, type TemplateResult } from "lit";
import { FLOW_DESIGN_WIDTH, FLOW_MIN_WIDTH } from "../dm/stage";

/** How far the flow may be scaled up to fill the panel. */
const FLOW_MAX_ZOOM = 1.85;

/**
 * Narrowest layout width at which <pq-screen-header> still seats Back + campaign name +
 * brandmark without truncating the name to initials. Measured, not guessed.
 */
const HEADER_COMFORT_WIDTH = 400;

interface Step {
  id: string;
  label: string;
  /** Routes that land on this step. */
  match: (path: string) => boolean;
}

/**
 * The claim ring, in the order the router walks it (see bindFlow in main.ts).
 * PIN and its two-phase loader are one stop as far as the patron is concerned — they
 * tapped a code and the machine is checking it.
 */
const STEPS: readonly Step[] = [
  { id: "confirm", label: "Confirm", match: (p) => p === "/confirm" },
  { id: "verify", label: "Verify", match: (p) => p === "/pin" || p === "/loading" },
  { id: "address", label: "Address", match: (p) => p === "/address" },
  { id: "review", label: "Review", match: (p) => p === "/submit" },
  {
    id: "done",
    label: "Done",
    match: (p) => p.startsWith("/success") || p.startsWith("/voucher"),
  },
];

const pad2 = (n: number): string => String(n).padStart(2, "0");

export class DmFlowPanel extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      /* Pinned to the region, both ways. Without the max, a composition taller than the
         rail pushes the host past it: the panel grows instead of scrolling, the stage
         scrolls instead, and — worse — the fit's height ceiling is measured off a box
         that just grew, so it never scales the flow back down. */
      min-height: 100%;
      max-height: 100%;
    }
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    .root {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      padding: 26px 24px 22px;
      color: var(--arc-text, #fff);
      font-family: var(--arc-font-body, "Inter", sans-serif);
    }
    /* Capped and centred. A claim is a reading-width task; a rail nearly 1240px wide
       would stretch a four-column keypad into something nobody can thumb. */
    /* The panel TAKES the column. Hugging its content left a third of a 768px rail as
       bare black, which is the complaint that started all of this; the case is lit —
       beam, floor, shelf — so a generous interior reads as a display case rather than
       as a screen that failed to fill. */
    .wrap {
      flex: 1;
      min-height: 0;
      width: min(100%, 740px);
      max-height: 100%;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    /* ---------------- the panel ---------------- */
    .panel {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-radius: 4px;
      /* Platinum, like the prize vitrine — gold stays on the actions inside it. */
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      background-color: var(--arc-bg-base, #0a0a0a);
      background-image: linear-gradient(
        180deg,
        var(--arc-bg-glass, rgba(34, 34, 34, 0.6)),
        var(--arc-bg-glass-2, rgba(12, 12, 12, 0.94)) 62%
      );
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.09),
        0 30px 60px -34px rgba(0, 0, 0, 0.95);
    }
    .plate {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 11px 16px;
      border-bottom: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      background: rgba(0, 0, 0, 0.42);
      font-family: var(--arc-font-mono, monospace);
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--arc-text-faint, #8a8a8a);
    }
    .plate b {
      color: var(--arc-display, #d4af37);
      font-weight: 700;
    }
    .plate__r {
      color: var(--arc-text-dim, #c0c0c0);
      white-space: nowrap;
    }

    /* The lit interior. Same beam as the vitrine, so a patron moving from picking a
       prize into claiming it never leaves the room. */
    /* The interior sizes to what is IN it — in CSS, not from a measured pixel height.
       A JS-set height is a snapshot, and the composition finishes loading AFTER that
       snapshot: the case stayed at the empty-screen size and quietly clipped the keypad
       and the SUBMIT button. Flexbox re-solves this every frame for free. */
    .box {
      position: relative;
      flex: 1;
      min-height: 0;
      display: flex;
      overflow: auto;
      scrollbar-width: none;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.05),
        rgba(0, 0, 0, 0.42) 62%,
        rgba(0, 0, 0, 0.78)
      );
    }
    /* Case floor — the same grounding the prize vitrine uses. */
    .box::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 34%;
      background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.5));
      pointer-events: none;
    }
    .box::-webkit-scrollbar {
      display: none;
    }
    /* Shelf — the content stands ON something instead of hovering in a void. */
    .shelf {
      position: absolute;
      left: 12%;
      right: 12%;
      bottom: 34px;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--arc-display, #d4af37), transparent);
      opacity: 0.28;
      pointer-events: none;
    }
    .shelf::after {
      content: "";
      position: absolute;
      left: 50%;
      top: -4px;
      width: 46%;
      height: 14px;
      transform: translateX(-50%);
      border-radius: 50%;
      background: radial-gradient(
        ellipse at 50% 50%,
        var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        transparent 70%
      );
      filter: blur(6px);
      opacity: 0.5;
    }
    .beam {
      position: absolute;
      inset: 0;
      filter: blur(22px);
      opacity: 0.34;
      pointer-events: none;
    }
    .beam i {
      position: absolute;
      top: -12%;
      left: 50%;
      width: 74%;
      height: 92%;
      transform: translateX(-50%);
      clip-path: polygon(34% 0, 66% 0, 100% 100%, 0 100%);
      background: linear-gradient(
        180deg,
        var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        transparent 78%
      );
    }
    .fitbox {
      position: relative;
      z-index: 1;
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      /* Deeper bottom padding pulls the block to the OPTICAL centre and clears the
         shelf, so the content stands on the case floor instead of hovering over it. */
      padding: 26px 22px 88px;
    }
    /* The flow keeps its own layout; the panel only bounds and scales it. */
    ::slotted(pq-screen) {
      display: block;
      flex: 0 0 auto;
      max-width: 100%;
    }

    /* ---------------- step rail ---------------- */
    /* Wayfinding, not decoration: this is the only place the claim tells a patron how
       many stops are left, which is exactly what a person mid-transaction wants to
       know before they hand over a PIN. */
    .rail {
      flex: none;
      display: flex;
      align-items: flex-start;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .node {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
      min-width: 0;
    }
    /* Connector between stops — drawn from the node so it never outlives the list. */
    .node + .node::before {
      content: "";
      position: absolute;
      top: 6px;
      right: 50%;
      left: -50%;
      height: 1px;
      background: var(--arc-hairline, rgba(192, 192, 192, 0.18));
    }
    .node--done + .node::before,
    .node--now + .node::before {
      background: var(--arc-display-deep, #a8862a);
    }
    .dot {
      position: relative;
      z-index: 1;
      width: 13px;
      height: 13px;
      border-radius: 50%;
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      background: var(--arc-bg-deep, #000);
    }
    .node--done .dot {
      border-color: var(--arc-display-deep, #a8862a);
      background: var(--arc-display-deep, #a8862a);
    }
    .node--now .dot {
      border-color: var(--arc-display, #d4af37);
      background: var(--arc-display, #d4af37);
      box-shadow:
        0 0 0 4px var(--arc-glow-soft, rgba(212, 175, 55, 0.16)),
        0 0 16px -2px var(--arc-display-glow, rgba(212, 175, 55, 0.5));
    }
    .lbl {
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--arc-text-mute, #5a5a5a);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .node--done .lbl {
      color: var(--arc-text-dim, #c0c0c0);
    }
    .node--now .lbl {
      color: var(--arc-display-bright, #ebd08a);
    }

    /* ---------------- 1024×768 ---------------- */
    /* In a 400px rail every pixel of chrome is a pixel the flow does not get. */
    :host-context([data-dm-ff="1024x768"]) .root {
      gap: 12px;
      padding: 14px 10px 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .wrap {
      width: 100%;
      gap: 13px;
    }
    :host-context([data-dm-ff="1024x768"]) .plate {
      padding: 8px 12px;
      font-size: 8.5px;
      letter-spacing: 0.18em;
    }
    :host-context([data-dm-ff="1024x768"]) .fitbox {
      padding: 16px 10px 56px;
    }
    :host-context([data-dm-ff="1024x768"]) .shelf {
      bottom: 26px;
    }
    :host-context([data-dm-ff="1024x768"]) .dot {
      width: 11px;
      height: 11px;
    }
    :host-context([data-dm-ff="1024x768"]) .node + .node::before {
      top: 5px;
    }
    :host-context([data-dm-ff="1024x768"]) .lbl {
      font-size: 8px;
      letter-spacing: 0.14em;
    }
  `;

  static override properties = {
    route: { type: String },
  };

  declare route: string;

  #frame = 0;
  #resize: ResizeObserver | null = null;
  /** Set while #fit is cycling candidate widths, so its own writes are not re-entrant. */
  #busy = false;
  constructor() {
    super();
    this.route = "/";
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#resize = new ResizeObserver(() => {
      if (this.#busy) return;
      this.#scheduleFit();
    });
  }

  override disconnectedCallback(): void {
    if (this.#frame) cancelAnimationFrame(this.#frame);
    this.#resize?.disconnect();
    this.#resize = null;
    super.disconnectedCallback();
  }

  override updated(): void {
    this.#scheduleFit();
  }

  /** Which stop we are on; -1 for screens outside the claim ring (order history). */
  private get step(): number {
    return STEPS.findIndex((s) => s.match(this.route));
  }

  #scheduleFit = (): void => {
    if (this.#frame) cancelAnimationFrame(this.#frame);
    this.#frame = requestAnimationFrame(() => this.#fit());
  };

  /**
   * Fit the embedded flow to the panel.
   *
   * The flow is authored for a landscape panel, so inside a DM panel it is short and
   * wide while the panel is tall — uniform scaling alone can never fill it. What DOES
   * fill it is choosing the layout WIDTH: a narrower layout wraps taller, and can then
   * be scaled up further before it hits an edge. Measure a few candidate widths and
   * keep whichever fills both axes best. Width stays a hard ceiling.
   */
  #fit(): void {
    const screen = this.querySelector<HTMLElement>("pq-screen");
    const box = this.renderRoot.querySelector<HTMLElement>(".fitbox");
    if (!screen || !box) return;
    this.#busy = true;
    try {
      this.#measure(screen, box);
    } finally {
      // Release on the next frame: the writes above land as layout, and the observer
      // fires for them one tick later.
      requestAnimationFrame(() => {
        this.#busy = false;
      });
    }
  }

  #measure(screen: HTMLElement, box: HTMLElement): void {
    const style = getComputedStyle(box);
    const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const availW = box.clientWidth - padX;
    // The height CEILING comes from the wrap minus the fixed chrome, never from the
    // box itself — the box is what this method resizes, so measuring it here would
    // feed its own output back in and shrink the flow a little on every pass.
    const availH = this.ceiling() - padY;
    if (availW <= 0 || availH <= 0) return;

    // A NARROW layout wraps taller and can then be scaled further before it hits an
    // edge — the only lever that fills a tall column, since the rendered width is
    // pinned to the panel either way. Hence the narrow candidates at the front.
    //
    // But there is a floor the fit cannot see: below roughly 400 CSS px the screen
    // header has to ellipsis the campaign name down to a couple of letters to seat the
    // Back button and the brandmark. Trading a readable title for a few percent of
    // vertical fill is the wrong trade, so the search never goes below the comfort
    // width — or below the panel's own width, whichever is smaller.
    const floor = Math.max(FLOW_MIN_WIDTH, Math.min(availW, HEADER_COMFORT_WIDTH));
    const candidates = [floor, 440, 520, 580, 640, 768, 896, FLOW_DESIGN_WIDTH].filter(
      (w, i, a) => w >= floor && w <= FLOW_DESIGN_WIDTH && a.indexOf(w) === i,
    );

    let best = {
      width: Math.min(FLOW_DESIGN_WIDTH, Math.max(floor, availW)),
      zoom: 1,
      score: -1,
    };
    for (const width of candidates) {
      screen.style.width = `${width}px`;
      screen.style.zoom = "1";
      const naturalH = screen.scrollHeight || 1;
      const zoom = Math.min(availW / width, availH / naturalH, FLOW_MAX_ZOOM);
      if (zoom <= 0) continue;
      // Balance both axes: the worst-filled dimension is what reads as dead space.
      const score = Math.min((width * zoom) / availW, (naturalH * zoom) / availH);
      if (score > best.score) best = { width, zoom, score };
    }

    screen.style.width = `${best.width}px`;
    screen.style.zoom =
      best.zoom >= 0.999 && best.zoom <= 1.001 ? "1" : String(Number(best.zoom.toFixed(3)));
  }

  /**
   * Tallest the interior may be: the column, less the plate, the rail and the gaps.
   * Measured from .root, which is sized by the stage region — .wrap now hugs its own
   * content, so measuring THAT would make the ceiling depend on the thing it bounds.
   */
  private ceiling(): number {
    const root = this.renderRoot.querySelector<HTMLElement>(".root");
    const wrap = this.renderRoot.querySelector<HTMLElement>(".wrap");
    if (!root || !wrap) return 0;
    const rs = getComputedStyle(root);
    const avail = root.clientHeight - parseFloat(rs.paddingTop) - parseFloat(rs.paddingBottom);
    const plate = this.renderRoot.querySelector<HTMLElement>(".plate");
    const rail = this.renderRoot.querySelector<HTMLElement>(".rail");
    const gap = parseFloat(getComputedStyle(wrap).rowGap) || 0;
    const chrome =
      (plate?.offsetHeight ?? 0) + (rail ? rail.offsetHeight + gap : 0) + 2; /* panel border */
    return Math.max(0, avail - chrome);
  }

  #onSlotChange = (): void => {
    const box = this.renderRoot.querySelector<HTMLElement>(".fitbox");
    const screen = this.querySelector<HTMLElement>("pq-screen");
    this.#resize?.disconnect();
    if (box) this.#resize?.observe(box);
    // The flow itself is what changes late: <pq-screen> fetches its composition
    // asynchronously, so the first measurement is of an empty element. Watch it.
    if (screen) this.#resize?.observe(screen);
    this.#scheduleFit();
  };

  override render(): TemplateResult {
    const step = this.step;
    const inRing = step >= 0;

    return html`
      <div class="root">
        <div class="wrap">
          <section class="panel">
            <div class="plate">
              <span>${inRing ? "Claim" : "Account"}</span>
              <span class="plate__r">
                ${inRing
                  ? html`Step <b>${pad2(step + 1)}</b> / ${pad2(STEPS.length)}`
                  : "Order history"}
              </span>
            </div>
            <div class="box">
              <span class="beam"><i></i></span>
              <span class="shelf"></span>
              <div class="fitbox">
                <slot @slotchange=${this.#onSlotChange}></slot>
              </div>
            </div>
          </section>

          ${inRing
            ? html`
                <ol class="rail" aria-label="Claim progress">
                  ${STEPS.map(
                    (s, n) =>
                      html`<li
                        class="node ${n < step ? "node--done" : ""} ${n === step
                          ? "node--now"
                          : ""}"
                        aria-current=${n === step ? "step" : "false"}
                      >
                        <span class="dot"></span>
                        <span class="lbl">${s.label}</span>
                      </li>`,
                  )}
                </ol>
              `
            : null}
        </div>
      </div>
    `;
  }
}

if (!customElements.get("dm-flow-panel")) {
  customElements.define("dm-flow-panel", DmFlowPanel);
}

declare global {
  interface HTMLElementTagNameMap {
    "dm-flow-panel": DmFlowPanel;
  }
}
