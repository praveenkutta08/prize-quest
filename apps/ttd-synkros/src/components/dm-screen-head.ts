// <dm-screen-head> — THE header for every screen in the Device Manager service window.
//
// WHY IT EXISTS. Promotions, prize selection, order history and the claim flow each
// carried their own copy of this bar. Four copies of the same CSS drift, and they had:
// the centre title was 13px on promotions and 12px everywhere else, which pushed the
// Back button 1px up on that one screen. A pixel is nothing on its own — but it is
// proof that the copies had already diverged, and the next edit would have diverged
// them further. There is now one definition, so drift is not possible.
//
// The contract every screen in the window keeps:
//
//   [ ‹ BACK ]        [ trophy ]  EYEBROW  LABEL        [ BRANDMARK ]
//   ────────────────────────── hairline ──────────────────────────
//
//   · Back pill hard left, always the same size, at the same y.
//   · Eyebrow (the campaign, when there is one) then the screen LABEL, optically
//     centred. The label never yields to the eyebrow — a header reading
//     "SUNDAY SLOT..." tells a patron nothing about where they are.
//   · Brandmark hard right on its dark plate.
//
// `noBack` HIDES the pill but keeps its footprint, so the centred title does not shift
// sideways between a step that can go back and one that cannot.
//
// Host chrome (NOT a @pq widget), themed by the tenant's --arc-* tokens.
import { LitElement, css, html, nothing, type TemplateResult } from "lit";

const trophyIcon = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.6"
  aria-hidden="true"
>
  <path d="M6 4h12v3a6 6 0 0 1-12 0V4Z" />
  <path d="M6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3M9 15h6M12 13v2M8 20h8" />
</svg>`;

export class DmScreenHead extends LitElement {
  static override styles = css`
    :host {
      display: block;
      flex: none;
    }
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    .head {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.18));
    }
    .back {
      flex: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 15px;
      border-radius: 999px;
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.2));
      background: var(--arc-surface-0, rgba(0, 0, 0, 0.6));
      color: var(--arc-text-dim, #c0c0c0);
      font-family: var(--arc-font-mono, monospace);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      line-height: 1;
      cursor: pointer;
    }
    .back:hover {
      color: var(--arc-display-bright, #ebd08a);
      border-color: var(--arc-display-deep, #a8862a);
    }
    /* Reserved, not removed — see the note at the top of the file. */
    .back--hidden {
      visibility: hidden;
      pointer-events: none;
    }
    .mid {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 auto;
      min-width: 0;
      /* Pinned so a taller or shorter centre block cannot nudge the row's vertical
         centring — that is exactly how the 1px drift showed up. */
      height: 20px;
    }
    .mid svg {
      width: 20px;
      height: 20px;
      flex: none;
      color: var(--arc-display, #d4af37);
    }
    .eyebrow {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 17px;
      line-height: 1;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--arc-cream, #fff);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 26ch;
    }
    .label {
      flex: none;
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 17px;
      line-height: 1;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--arc-display, #d4af37);
      white-space: nowrap;
    }
    .mark {
      flex: none;
      display: grid;
      place-items: center;
      padding: 5px 11px;
      border-radius: 6px;
      background: var(--arc-bg-deep, #000);
      border: 1px solid rgba(255, 255, 255, 0.14);
    }
    .mark img {
      display: block;
      height: 26px;
      max-width: 128px;
      object-fit: contain;
    }
    .wordmark {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: 14px;
      line-height: 1;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--arc-display-bright, #ebd08a);
    }

    /* ---------------- 1024x768 ---------------- */
    :host-context([data-dm-ff="1024x768"]) .head {
      gap: 8px;
      padding-bottom: 10px;
    }
    :host-context([data-dm-ff="1024x768"]) .back {
      padding: 7px 11px;
      font-size: 9px;
    }
    :host-context([data-dm-ff="1024x768"]) .mid {
      gap: 7px;
      height: 15px;
    }
    :host-context([data-dm-ff="1024x768"]) .mid svg {
      display: none;
    }
    /* 11ch was the cap when the content column was 358-412px wide and the campaign
       name had to yield to the Back pill and the brandmark. At 666 there is room to
       read it, and a truncated campaign name tells a patron nothing. */
    :host-context([data-dm-ff="1024x768"]) .eyebrow {
      font-size: 12px;
      max-width: 26ch;
    }
    :host-context([data-dm-ff="1024x768"]) .label {
      font-size: 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .mark img {
      height: 20px;
      max-width: 96px;
    }
  `;

  static override properties = {
    eyebrow: { type: String },
    label: { type: String },
    noBack: { type: Boolean },
    logoBroken: { state: true },
  };

  declare eyebrow: string;
  declare label: string;
  declare noBack: boolean;
  declare logoBroken: boolean;

  constructor() {
    super();
    this.eyebrow = "";
    this.label = "";
    this.noBack = false;
    this.logoBroken = false;
  }

  #back = (): void => {
    this.dispatchEvent(new CustomEvent("pq-back", { bubbles: true, composed: true }));
  };

  override render(): TemplateResult {
    return html`
      <div class="head">
        <button
          class="back ${this.noBack ? "back--hidden" : ""}"
          type="button"
          ?disabled=${this.noBack}
          aria-hidden=${this.noBack ? "true" : "false"}
          @click=${this.#back}
        >
          ‹ Back
        </button>
        <div class="mid">
          ${trophyIcon}
          ${this.eyebrow ? html`<span class="eyebrow">${this.eyebrow}</span>` : nothing}
          ${this.label ? html`<span class="label">${this.label}</span>` : nothing}
        </div>
        ${this.renderMark()}
      </div>
    `;
  }

  /** The product mark — reads <html data-pq-product-*>; degrades to a wordmark. */
  private renderMark(): TemplateResult {
    const root = document.documentElement.dataset;
    const src = this.logoBroken ? null : root.pqProductLogo || null;
    if (!src) {
      return html`<span class="mark">
        <span class="wordmark">${root.pqProductAlt ?? "Tier Rewards"}</span>
      </span>`;
    }
    return html`<span class="mark">
      <img
        src=${src}
        alt=${root.pqProductAlt ?? "Tier Rewards"}
        @error=${() => {
          this.logoBroken = true;
        }}
      />
    </span>`;
  }
}

if (!customElements.get("dm-screen-head")) {
  customElements.define("dm-screen-head", DmScreenHead);
}

declare global {
  interface HTMLElementTagNameMap {
    "dm-screen-head": DmScreenHead;
  }
}
