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
//   [ ‹ BACK ]              ONE TITLE               [ BRANDMARK ]
//   ────────────────────────── hairline ──────────────────────────
//
//   · Back pill hard left, always the same size, at the same y.
//   · ONE title, optically centred.
//   · Brandmark hard right on its dark plate.
//
// TITLE RULE — ported verbatim from <pq-screen-header> (packages/widgets), which is
// what the TTD and iVIEW panels render. The DM screens are the same product on a
// different panel, so the two must not title themselves differently:
//
//   · When the title IS the product name, a gold trophy leads it and the LAST WORD
//     renders in gold — "TIER REWARDS *PROMOTIONS*". That treatment marks the
//     promotions surface specifically.
//   · Every other title — a campaign name, or a step name like "Enter PIN" — renders
//     PLAIN. No trophy, no gold.
//
// This replaced an `eyebrow` + `label` pair that always drew the trophy and always
// gilded the label, so the prize screen read "SUNDAY SLOT SPRINT PRIZES" against TTD's
// "SUNDAY SLOT SPRINT". A note here used to argue FOR that label, on the grounds that a
// bare campaign name does not say where you are. That is a fair point and it lost on
// purpose: consistency with the panel the patron already knows beats a wayfinding word
// that only exists on one of the two surfaces.
//
// `noBack` HIDES the pill but keeps its footprint, so the centred title does not shift
// sideways between a step that can go back and one that cannot.
//
// Host chrome (NOT a @pq widget), themed by the tenant's --arc-* tokens.
import { LitElement, css, html, nothing, type TemplateResult } from "lit";

/** The filled mark <pq-screen-header> uses — same glyph, so the two surfaces match. */
const trophyIcon = html`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path
    d="M6 3h12v2h3v3a4 4 0 0 1-4 4h-.35A6 6 0 0 1 13 15.9V18h3v2H8v-2h3v-2.1A6 6 0 0 1 7.35 12H7a4 4 0 0 1-4-4V5h3V3Zm-1 4v1a2 2 0 0 0 2 2V7H5Zm14 0h-2v3a2 2 0 0 0 2-2V7Z"
  />
</svg>`;

export class DmScreenHead extends LitElement {
  static override styles = css`
    :host {
      display: block;
      flex: none;

      /* TYPE SCALE — one knob per form factor, matching the pattern the two DM list
         screens now use. The header sits directly above cards whose body copy is 22px
         at 1920; at 17px the screen LABEL — the one element that tells a patron where
         they are — had become the quietest type on the screen rather than the loudest.
         The bump is modest on purpose: this is chrome, and it must not out-shout the
         promotion or the prize it introduces. */
      --dm-fs-head: 21px;
      --dm-fs-back: 12px;
      --dm-sz-mid: 24px;
      --dm-sz-ico: 22px;
      --dm-fs-wordmark: 17px;
      --dm-sz-mark: 30px;
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
      padding: 10px 17px;
      border-radius: 999px;
      border: 1px solid var(--arc-hairline, rgba(192, 192, 192, 0.2));
      background: var(--arc-surface-0, rgba(0, 0, 0, 0.6));
      color: var(--arc-text-dim, #c0c0c0);
      font-family: var(--arc-font-mono, monospace);
      font-size: var(--dm-fs-back);
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
      height: var(--dm-sz-mid);
    }
    /* Mono, 700, wide tracking — the face and rhythm <pq-screen-header> sets, at the
       size this panel needs rather than the 9px a 640x240 TTD strip needs. */
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.5em;
      min-width: 0;
      font-family: var(--arc-font-mono, monospace);
      font-weight: 700;
      font-size: var(--dm-fs-head);
      line-height: 1;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--arc-cream, #fff);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .brand-ico {
      flex: none;
      display: inline-grid;
      place-items: center;
      width: var(--dm-sz-ico);
      height: var(--dm-sz-ico);
      color: var(--arc-display, #d4af37);
      filter: drop-shadow(0 0 4px var(--arc-display-glow, rgba(212, 175, 55, 0.5)));
    }
    .brand-ico svg {
      width: 100%;
      height: 100%;
    }
    /* Gilded by a clipped gradient, not a flat fill — same as the TTD title. */
    .brand-gold {
      background: linear-gradient(
        180deg,
        var(--arc-display-bright, #ebd08a),
        var(--arc-display, #d4af37) 60%,
        var(--arc-display-deep, #a8862a)
      );
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
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
      height: var(--dm-sz-mark);
      max-width: 128px;
      object-fit: contain;
    }
    .wordmark {
      font-family: var(--arc-font-display, sans-serif);
      font-weight: var(--arc-font-display-weight, 900);
      font-size: var(--dm-fs-wordmark);
      line-height: 1;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--arc-display-bright, #ebd08a);
    }

    /* ---------------- 1024x768 ---------------- */
    :host-context([data-dm-ff="1024x768"]) {
      --dm-fs-head: 14px;
      --dm-fs-back: 10px;
      --dm-sz-mid: 17px;
      --dm-sz-ico: 15px;
      --dm-fs-wordmark: 12px;
      --dm-sz-mark: 22px;
    }
    :host-context([data-dm-ff="1024x768"]) .head {
      gap: 8px;
      padding-bottom: 10px;
    }
    :host-context([data-dm-ff="1024x768"]) .back {
      padding: 7px 12px;
    }
    :host-context([data-dm-ff="1024x768"]) .mid {
      gap: 7px;
    }
    :host-context([data-dm-ff="1024x768"]) .mark img {
      max-width: 96px;
    }
  `;

  static override properties = {
    title: { type: String },
    noBack: { type: Boolean },
    logoBroken: { state: true },
  };

  // NB: `title` shadows HTMLElement.title, so it must stay a plain `string` — the same
  // caveat <pq-screen-header> carries. Callers bind it as a PROPERTY (.title=) so it
  // never lands in the attribute and never becomes a browser tooltip.
  declare title: string;
  declare noBack: boolean;
  declare logoBroken: boolean;

  constructor() {
    super();
    this.title = "";
    this.noBack = false;
    this.logoBroken = false;
  }

  /** The PRODUCT name, published by the host before boot. */
  private get brand(): string {
    return document.documentElement.dataset.pqProductName ?? "Tier Rewards Promotions";
  }

  /** An empty title falls back to the product name — which is what gilds it. */
  private get displayTitle(): string {
    return this.title || this.brand;
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
        <div class="mid"><span class="brand">${this.renderTitle()}</span></div>
        ${this.renderMark()}
      </div>
    `;
  }

  /**
   * Trophy + gold last word when the title IS the product name; plain otherwise.
   * Lifted from <pq-screen-header>.renderTitle so the two cannot drift.
   */
  private renderTitle(): TemplateResult {
    const title = this.displayTitle;
    if (title !== this.brand) return html`${title}`;
    const words = title.trim().split(/\s+/);
    const last = words.pop() ?? "";
    return html`<span class="brand-ico">${trophyIcon}</span>${words.length
        ? html`<span>${words.join(" ")}</span>`
        : nothing}<span class="brand-gold">${last}</span>`;
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
