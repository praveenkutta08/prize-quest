// <dm-order-list> — order history inside the Device Manager service window
// (route /orders).
//
// WHY THIS EXISTS. <pq-order-history> in arcade + compact draws each order as
// "grid-template-columns: 118px 1fr" — a fixed 118px art well beside the text. That is
// tuned for the Konami/iVIEW panel, where the card is wide. In the DM rail the card is
// about 245px, so after padding and the gap the text column gets roughly 89px: the
// prize name clamps to "AP... A...", the order number breaks mid-token, and the claim
// date stacks three lines deep. Identical failure to pq-reward-select, identical fix.
//
// The CONTENT is the widget's, unchanged: prize name, confirmation number, carrier or
// tracking when present, "Claimed <date>", and the fulfilment status. Tapping a card
// still fires "pq-order-click" with the order id, so anything downstream is untouched.
// TTD, iVIEW and SYNKROS keep <pq-order-history> exactly as it is.
//
// It is the prize vitrine's sibling, with one deliberate difference: a prize is an
// ACTION (the gold Collect button is the point of the card) while an order is a RECORD.
// So this case has no button — the status is the payload, and it is stated on the lot
// plate and again in the spec table rather than competing with a call to action.
//
// HOUSE RULE: no currency values anywhere, and no progress bars.
//
// Host chrome (NOT a @pq widget), themed by the tenant's --arc-* tokens.
import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { $claims, bindAtom } from "@pq/store";
import type { ClaimStatus, Order } from "@pq/mock-data";

/** Same mapping <pq-order-history> uses, so a status reads identically on every surface. */
const STATUS: Record<ClaimStatus, { label: string; kind: "processing" | "shipped" | "delivered" }> =
  {
    processing: { label: "Processing", kind: "processing" },
    shipped: { label: "Shipped", kind: "shipped" },
    "in-transit": { label: "In transit", kind: "shipped" },
    delivered: { label: "Delivered", kind: "delivered" },
  };

/** Placeholder order art. Production swaps these for the operator's product shots. */
const NAME_ART: ReadonlyArray<readonly [string, string]> = [
  ["airpod", "🎧"],
  ["headphone", "🎧"],
  ["earbud", "🎧"],
  ["speaker", "🔊"],
  ["ipad", "📱"],
  ["tablet", "📱"],
  ["iphone", "📱"],
  ["macbook", "💻"],
  ["laptop", "💻"],
  ["watch", "⌚"],
  ["tv", "📺"],
  ["camera", "📷"],
  ["console", "🎮"],
  ["backpack", "🎒"],
  ["bag", "🎒"],
  ["tumbler", "🥤"],
  ["cooler", "🧊"],
  ["golf", "⛳"],
  ["topgolf", "⛳"],
  ["trip", "✈️"],
  ["vegas", "🎰"],
  ["hotel", "🏨"],
  ["spa", "💆"],
  ["dinner", "🍽️"],
  ["gift card", "💳"],
  ["amazon", "📦"],
];
const CATEGORY_ART: Record<string, string> = {
  electronics: "📱",
  audio: "🎧",
  outdoor: "🏕️",
  "smart-home": "🏠",
  "gift-cards": "🎁",
  wellness: "💆",
  food: "🍽️",
  dining: "🍽️",
  travel: "✈️",
  sports: "⛳",
};

function artFor(o: Order): string {
  const name = (o.prizeName ?? "").toLowerCase();
  for (const [pattern, art] of NAME_ART) if (name.includes(pattern)) return art;
  return CATEGORY_ART[(o.category ?? "").toLowerCase()] ?? "🎁";
}

const pad2 = (n: number): string => String(n).padStart(2, "0");

export class DmOrderList extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      /* Pinned to the rail both ways: fill it, never exceed it. Without the max a long
         promotion pushed the host past the region and the rail grew a scrollbar. */
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
      gap: 14px;
      padding: 22px 24px 18px;
      color: var(--arc-text, #fff);
      font-family: var(--arc-font-body, "Inter", sans-serif);
    }

    /* ---------------- the counter ---------------- */
    .stage {
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .nav {
      flex: none;
      display: grid;
      place-items: center;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      cursor: pointer;
      border: 1px solid var(--arc-display-deep, #a8862a);
      background: linear-gradient(
        180deg,
        var(--arc-display-bright, #ebd08a),
        var(--arc-display, #d4af37) 60%,
        var(--arc-display-deep, #a8862a)
      );
      color: var(--arc-on-tint, rgba(0, 0, 0, 0.88));
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 20px;
      line-height: 1;
      box-shadow: 0 6px 16px -8px var(--arc-display-glow, rgba(212, 175, 55, 0.5));
      transition: transform 180ms ease;
    }
    .nav:hover:not(:disabled) {
      transform: scale(1.06);
    }
    .nav:disabled {
      opacity: 0.28;
      cursor: default;
      background: var(--arc-surface-1, rgba(38, 38, 38, 0.55));
      color: var(--arc-text-faint, #8a8a8a);
      border-color: var(--arc-hairline, rgba(192, 192, 192, 0.18));
      box-shadow: none;
    }
    .track {
      flex: 1;
      min-width: 0;
      height: 100%;
      /* Uncapped. This was 620px, set when the content column was 840 wide and the
         case was tall enough to fill a 1080 column at that cap. At 672 it is not, and
         the cap left ~400px of dead black under the card. The 1024 profile has always
         run uncapped (see the override below) — this makes the two agree. ".box" is
         "flex: 1 1 auto", so the extra height goes to the lit display, not the type. */
      max-height: none;
      display: flex;
      gap: 18px;
      padding: 0 72px;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .track::-webkit-scrollbar {
      display: none;
    }

    /* ---------------- the case ---------------- */
    .case {
      flex: 0 0 100%;
      scroll-snap-align: center;
      scroll-snap-stop: always;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      text-align: left;
      cursor: pointer;
      border-radius: 4px;
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
      font: inherit;
      color: inherit;
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
    /* The status is the whole point of an order card, so it gets the plate. */
    .badge {
      flex: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 999px;
      white-space: nowrap;
      letter-spacing: 0.16em;
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      color: var(--arc-text-dim, #c0c0c0);
    }
    .badge::before {
      content: "";
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    .badge--shipped {
      color: var(--arc-display-bright, #ebd08a);
      border-color: var(--arc-display-deep, #a8862a);
      background: var(--arc-glow-soft, rgba(212, 175, 55, 0.16));
    }
    .badge--delivered {
      color: var(--arc-success, #34d670);
      border-color: rgba(52, 214, 112, 0.45);
      background: rgba(52, 214, 112, 0.12);
    }

    .box {
      position: relative;
      flex: 1;
      min-height: 0;
      display: grid;
      place-items: end center;
      overflow: hidden;
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.05),
        rgba(0, 0, 0, 0.5) 58%,
        rgba(0, 0, 0, 0.86)
      );
      border-bottom: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
    }
    .beam {
      position: absolute;
      inset: 0;
      filter: blur(22px);
      opacity: 0.3;
      pointer-events: none;
    }
    .beam i {
      position: absolute;
      top: -12%;
      left: 50%;
      width: 78%;
      height: 96%;
      transform: translateX(-50%);
      clip-path: polygon(34% 0, 66% 0, 100% 100%, 0 100%);
      background: linear-gradient(
        180deg,
        var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        transparent 78%
      );
    }
    .box::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 38%;
      background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.55));
      pointer-events: none;
    }
    .plinth {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-bottom: 26px;
    }
    .obj {
      display: block;
      font-size: 152px;
      line-height: 1;
      filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.8))
        drop-shadow(0 0 30px var(--arc-display-glow, rgba(212, 175, 55, 0.5)));
    }
    .shelf {
      position: relative;
      width: 200px;
      height: 1px;
      margin-top: 14px;
      background: linear-gradient(90deg, transparent, var(--arc-display, #d4af37), transparent);
      opacity: 0.5;
    }
    .shelf::after {
      content: "";
      position: absolute;
      left: 50%;
      top: -3px;
      width: 120px;
      height: 12px;
      transform: translateX(-50%);
      border-radius: 50%;
      background: radial-gradient(
        ellipse at 50% 50%,
        var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        transparent 70%
      );
      filter: blur(5px);
    }
    .mirror {
      height: 50px;
      overflow: hidden;
      pointer-events: none;
    }
    .mirror span {
      display: block;
      font-size: 152px;
      line-height: 1;
      transform-origin: top center;
      transform: translateY(112px) scaleY(-1);
      opacity: 0.22;
      -webkit-mask-image: linear-gradient(to top, transparent 6%, rgba(0, 0, 0, 0.9) 78%);
      mask-image: linear-gradient(to top, transparent 6%, rgba(0, 0, 0, 0.9) 78%);
    }
    /* A delivered order has arrived — the case light goes cool and calm. */
    .case--delivered .beam i {
      background: linear-gradient(180deg, rgba(52, 214, 112, 0.42), transparent 78%);
    }
    .case--delivered .shelf {
      background: linear-gradient(90deg, transparent, var(--arc-success, #34d670), transparent);
    }
    /* The detail pane. NOTE: this rule was destroyed once by a bulk edit that matched
       CSS selectors by SUBSTRING — stripping the shared header's ".label" also stripped
       this one, and the card's text went flush to its edges. */
    .label {
      flex: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px 18px 18px;
    }
    .name {
      margin: 0;
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 25px;
      line-height: 1.08;
      letter-spacing: 0.01em;
      text-transform: uppercase;
      color: var(--arc-display-bright, #ebd08a);
      /* Long product names WRAP. The widget clamped them to two lines in an 89px
         column, which is how "Apple AirPods Pro" became "AP... A...". */
      overflow-wrap: anywhere;
    }
    .lede {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      color: var(--arc-text-dim, #c0c0c0);
    }
    .spec {
      margin: 2px 0 0;
      display: flex;
      flex-direction: column;
    }
    .spec > div {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 14px;
      padding: 9px 0;
      border-top: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
    }
    .spec dt {
      flex: none;
      font-family: var(--arc-font-mono, monospace);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--arc-text-faint, #8a8a8a);
    }
    .spec dd {
      margin: 0;
      text-align: right;
      font-size: 13.5px;
      line-height: 1.35;
      color: var(--arc-cream, #fff);
      /* Confirmation numbers are long single tokens; let them break rather than
         punch out of the case. */
      overflow-wrap: anywhere;
    }
    .spec dd.mono {
      font-family: var(--arc-font-mono, monospace);
      font-size: 12px;
      letter-spacing: 0.04em;
    }

    /* ---------------- pick strip ---------------- */
    .picks {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      flex-wrap: wrap;
    }
    .pick {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
      background: var(--arc-surface-0, rgba(0, 0, 0, 0.7));
      font-size: 22px;
      line-height: 1;
      opacity: 0.5;
      transition:
        opacity 180ms ease,
        border-color 180ms ease,
        transform 180ms ease;
    }
    .pick:hover {
      opacity: 0.85;
    }
    .pick--on {
      opacity: 1;
      transform: translateY(-2px);
      border-color: var(--arc-display, #d4af37);
      box-shadow:
        0 8px 20px -12px var(--arc-display-glow, rgba(212, 175, 55, 0.5)),
        inset 0 0 18px -8px var(--arc-display-glow, rgba(212, 175, 55, 0.5));
    }
    .foot {
      flex: none;
      margin: 0;
      text-align: center;
      font-family: var(--arc-font-mono, monospace);
      font-size: 10px;
      letter-spacing: 0.14em;
      color: var(--arc-text-mute, #5a5a5a);
    }
    .empty {
      margin: auto;
      color: var(--arc-text-dim, #c0c0c0);
      font-size: 15px;
      text-align: center;
    }

    /* ---------------- 1024x768 ---------------- */
    :host-context([data-dm-ff="1024x768"]) .root {
      gap: 10px;
      padding: 14px 14px 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .stage {
      gap: 6px;
    }
    :host-context([data-dm-ff="1024x768"]) .nav {
      width: 32px;
      height: 32px;
      font-size: 15px;
    }
    :host-context([data-dm-ff="1024x768"]) .track {
      max-height: none;
      gap: 10px;
      padding: 0;
    }
    :host-context([data-dm-ff="1024x768"]) .plate {
      padding: 8px 10px;
      font-size: 8px;
      letter-spacing: 0.14em;
    }
    :host-context([data-dm-ff="1024x768"]) .badge {
      padding: 3px 8px;
      letter-spacing: 0.1em;
    }
    :host-context([data-dm-ff="1024x768"]) .plinth {
      padding-bottom: 16px;
    }
    :host-context([data-dm-ff="1024x768"]) .obj,
    :host-context([data-dm-ff="1024x768"]) .mirror span {
      font-size: 88px;
    }
    :host-context([data-dm-ff="1024x768"]) .mirror {
      height: 38px;
    }
    :host-context([data-dm-ff="1024x768"]) .mirror span {
      transform: translateY(88px) scaleY(-1);
    }
    :host-context([data-dm-ff="1024x768"]) .shelf {
      width: 160px;
      margin-top: 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .label {
      gap: 9px;
      padding: 12px 14px 14px;
    }
    :host-context([data-dm-ff="1024x768"]) .name {
      font-size: 19px;
    }
    :host-context([data-dm-ff="1024x768"]) .lede {
      font-size: 12px;
      line-height: 1.45;
    }
    :host-context([data-dm-ff="1024x768"]) .spec > div {
      padding: 7px 0;
    }
    :host-context([data-dm-ff="1024x768"]) .spec dt {
      font-size: 8px;
      letter-spacing: 0.16em;
    }
    :host-context([data-dm-ff="1024x768"]) .spec dd {
      font-size: 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .spec dd.mono {
      font-size: 11px;
    }
    :host-context([data-dm-ff="1024x768"]) .pick {
      width: 38px;
      height: 38px;
      font-size: 18px;
    }
    :host-context([data-dm-ff="1024x768"]) .foot {
      font-size: 9px;
    }
  `;

  static override properties = {
    orders: { attribute: false },
    index: { type: Number },
  };

  declare orders: Order[] | null;
  declare index: number;

  constructor() {
    super();
    this.orders = null;
    this.index = 0;
    bindAtom(this, $claims, "orders");
  }

  private get list(): Order[] {
    return this.orders ?? [];
  }

  private get track(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(".track");
  }

  private get loops(): boolean {
    return this.list.length > 1;
  }

  private slotFor(real: number): number {
    return this.loops ? real + 1 : real;
  }

  private realFor(slot: number): number {
    const n = this.list.length;
    if (n === 0) return 0;
    if (!this.loops) return Math.max(0, Math.min(n - 1, slot));
    return (((slot - 1) % n) + n) % n;
  }

  /** Rect-based, never offsetLeft — the track is not a positioned element. */
  private slotDelta(slot: number): number | null {
    const track = this.track;
    const card = track?.children[slot] as HTMLElement | undefined;
    if (!track || !card) return null;
    const t = track.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    return c.left + c.width / 2 - (t.left + t.width / 2);
  }

  private nearestSlot(): number {
    const track = this.track;
    if (!track || track.clientWidth === 0) return this.slotFor(this.index);
    let best = 0;
    let bestDist = Infinity;
    for (let n = 0; n < track.children.length; n += 1) {
      const dist = Math.abs(this.slotDelta(n) ?? Infinity);
      if (dist < bestDist) {
        bestDist = dist;
        best = n;
      }
    }
    return best;
  }

  private scrollToSlot(slot: number, behavior: ScrollBehavior): void {
    const track = this.track;
    const delta = this.slotDelta(slot);
    if (!track || delta == null) return;
    track.scrollTo({ left: track.scrollLeft + delta, behavior });
  }

  #step(dir: -1 | 1): void {
    const n = this.list.length;
    if (n === 0) return;
    const slot = this.nearestSlot() + dir;
    if (!this.loops) {
      const i = Math.max(0, Math.min(n - 1, slot));
      this.scrollToSlot(i, "smooth");
      this.index = i;
      return;
    }
    this.scrollToSlot(slot, "smooth");
    this.index = this.realFor(slot);
  }

  #goto(real: number): void {
    this.scrollToSlot(this.slotFor(real), "smooth");
    this.index = real;
  }

  #settle = 0;

  #onScroll = (): void => {
    const track = this.track;
    if (!track || track.clientWidth === 0) return;
    const real = this.realFor(this.nearestSlot());
    if (real !== this.index) this.index = real;
    window.clearTimeout(this.#settle);
    this.#settle = window.setTimeout(() => this.#rebase(), 160);
  };

  #rebase(): void {
    if (!this.loops) return;
    const n = this.list.length;
    const slot = this.nearestSlot();
    if (slot !== 0 && slot !== n + 1) return;
    this.scrollToSlot(slot === 0 ? n : 1, "instant");
  }

  override disconnectedCallback(): void {
    window.clearTimeout(this.#settle);
    super.disconnectedCallback();
  }

  override updated(changed: Map<string, unknown>): void {
    if (!changed.has("orders")) return;
    requestAnimationFrame(() => this.scrollToSlot(this.slotFor(this.index), "instant"));
  }

  /** Same event <pq-order-history> fires, so nothing downstream changes. */
  #open(o: Order): void {
    this.dispatchEvent(
      new CustomEvent("pq-order-click", { detail: { id: o.id }, bubbles: true, composed: true }),
    );
  }

  override render(): TemplateResult {
    const list = this.list;
    const i = Math.min(this.index, Math.max(0, list.length - 1));

    return html`
      <div class="root">
        <!-- No eyebrow: a prize screen needs the campaign name for context, but order
             history is self-describing. -->
        <dm-screen-head label="Order history"></dm-screen-head>

        ${list.length
          ? html`
              <div class="stage">
                <button
                  class="nav"
                  type="button"
                  aria-label="Previous order"
                  ?disabled=${!this.loops}
                  @click=${() => this.#step(-1)}
                >
                  ‹
                </button>
                <div class="track" @scroll=${this.#onScroll} role="list">
                  ${this.loops
                    ? this.renderCase(list[list.length - 1], list.length - 1, list.length, true)
                    : null}
                  ${list.map((o, n) => this.renderCase(o, n, list.length, false))}
                  ${this.loops ? this.renderCase(list[0], 0, list.length, true) : null}
                </div>
                <button
                  class="nav"
                  type="button"
                  aria-label="Next order"
                  ?disabled=${!this.loops}
                  @click=${() => this.#step(1)}
                >
                  ›
                </button>
              </div>

              <div class="picks">
                ${list.map(
                  (o, n) =>
                    html`<button
                      class="pick ${n === i ? "pick--on" : ""}"
                      type="button"
                      aria-label=${o.prizeName}
                      aria-current=${n === i ? "true" : "false"}
                      @click=${() => this.#goto(n)}
                    >
                      ${artFor(o)}
                    </button>`,
                )}
              </div>
              <p class="foot">
                ${list.length === 1 ? "1 order" : `${list.length} orders`} · newest first
              </p>
            `
          : html`<p class="empty">No orders yet — claim a prize to see it here.</p>`}
      </div>
    `;
  }

  private renderCase(o: Order, n: number, total: number, clone: boolean): TemplateResult {
    const s = STATUS[o.status] ?? { label: o.status, kind: "processing" as const };
    const art = artFor(o);
    // Only real tracking/carrier info — the status is already on the plate, and
    // repeating it as a line read as a duplicate.
    const meta = o.tracking ?? o.carrier;
    const lede =
      s.kind === "delivered"
        ? "Delivered. This one is yours — enjoy it."
        : s.kind === "shipped"
          ? "On its way to the address on your account."
          : "We are preparing this order for despatch.";

    return html`
      <article
        class="case case--${s.kind}"
        role=${clone ? "presentation" : "listitem"}
        aria-hidden=${clone ? "true" : "false"}
        tabindex=${clone ? "-1" : "0"}
        @click=${() => this.#open(o)}
      >
        <div class="plate">
          <span>Order <b>${pad2(n + 1)}</b> / ${pad2(total)}</span>
          <span class="badge badge--${s.kind}">${s.label}</span>
        </div>

        <div class="box">
          <span class="beam"><i></i></span>
          <div class="plinth">
            <span class="obj">${art}</span>
            <span class="shelf"></span>
            <span class="mirror" aria-hidden="true"><span>${art}</span></span>
          </div>
        </div>

        <div class="label">
          <h3 class="name">${o.prizeName}</h3>
          <p class="lede">${lede}</p>

          <dl class="spec">
            ${o.confirmation
              ? html`<div>
                  <dt>Order no.</dt>
                  <dd class="mono">${o.confirmation}</dd>
                </div>`
              : nothing}
            <div>
              <dt>Claimed</dt>
              <dd>${o.claimedAt}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>${s.label}</dd>
            </div>
            ${meta
              ? html`<div>
                  <dt>Tracking</dt>
                  <dd class="mono">${meta}</dd>
                </div>`
              : nothing}
            ${o.campaignName
              ? html`<div>
                  <dt>Won with</dt>
                  <dd>${o.campaignName}</dd>
                </div>`
              : nothing}
          </dl>
        </div>
      </article>
    `;
  }
}

if (!customElements.get("dm-order-list")) {
  customElements.define("dm-order-list", DmOrderList);
}

declare global {
  interface HTMLElementTagNameMap {
    "dm-order-list": DmOrderList;
  }
}
