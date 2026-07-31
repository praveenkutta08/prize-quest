import { LitElement, html, type TemplateResult } from "lit";
import { styles } from "./styles";

const chevronLeft = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.8"
  aria-hidden="true"
>
  <polyline points="15 18 9 12 15 6" />
</svg>`;
const chevronRight = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.8"
  aria-hidden="true"
>
  <polyline points="9 18 15 12 9 6" />
</svg>`;

const SWIPE_THRESHOLD = 40;

/**
 * `<pq-list-carousel>` — a paged carousel over its slotted children.
 *
 * Splits children into pages of `itemsPerPage` (1 for campaigns, 3 for rewards),
 * one `<slot>` in a flex track translated by a JS-measured page offset. Side
 * arrows (disabled at the ends), stretching dot indicators, touch swipe and
 * keyboard (Arrow/Home/End) navigation. Profile-agnostic — only compact arcade
 * list templates wire it in. Visual: `.carousel2__*` in the direction preview.
 */
export class PqListCarousel extends LitElement {
  static override styles = styles;

  static override properties = {
    itemsPerPage: { type: Number, attribute: "items-per-page" },
    loop: { type: Boolean },
    _page: { state: true },
    _pageCount: { state: true },
  };

  declare itemsPerPage: number;
  /** Continuous wrap-around paging: next from the last page returns to the first
   *  (and prev from the first jumps to the last). Arrows never disable. */
  declare loop: boolean;
  declare private _page: number;
  declare private _pageCount: number;

  #resize?: ResizeObserver;
  #viewportWidth = 0;
  #touchX: number | null = null;

  constructor() {
    super();
    this.itemsPerPage = 1;
    this.loop = false;
    this._page = 0;
    this._pageCount = 1;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // role=region; the consumer-provided `aria-label` attribute labels it directly.
    this.setAttribute("role", "region");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    this.addEventListener("keydown", this.#onKeydown);
    this.addEventListener("touchstart", this.#onTouchStart, { passive: true });
    this.addEventListener("touchend", this.#onTouchEnd, { passive: true });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this.#onKeydown);
    this.removeEventListener("touchstart", this.#onTouchStart);
    this.removeEventListener("touchend", this.#onTouchEnd);
    this.#resize?.disconnect();
    this.#resize = undefined;
  }

  override firstUpdated(): void {
    const viewport = this.renderRoot.querySelector(".viewport");
    if (viewport) {
      this.#resize = new ResizeObserver(() => {
        this.#viewportWidth = (viewport as HTMLElement).clientWidth;
        this.#applyTransform();
      });
      this.#resize.observe(viewport);
      this.#viewportWidth = (viewport as HTMLElement).clientWidth;
    }
  }

  override updated(): void {
    this.#applyTransform();
  }

  /** Recompute page count from the slotted children and clamp the current page. */
  #onSlotChange = (e: Event): void => {
    const slot = e.target as HTMLSlotElement;
    const count = slot.assignedElements().length;
    const per = Math.max(1, this.itemsPerPage || 1);
    this._pageCount = Math.max(1, Math.ceil(count / per));
    if (this._page > this._pageCount - 1) this._page = this._pageCount - 1;
  };

  #gap(): number {
    const v = getComputedStyle(this).getPropertyValue("--carousel-gap");
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 6;
  }

  #applyTransform(): void {
    const track = this.renderRoot.querySelector(".track") as HTMLElement | null;
    if (!track) return;
    const offset = this._page * (this.#viewportWidth + this.#gap());
    track.style.transform = `translateX(${-offset}px)`;
  }

  #go(page: number): void {
    // Loop mode wraps modulo the page count; clamp mode pins to the ends.
    const n = this._pageCount;
    const next = this.loop ? ((page % n) + n) % n : Math.max(0, Math.min(n - 1, page));
    if (next !== this._page) this._page = next;
  }

  #prev = (): void => this.#go(this._page - 1);
  #next = (): void => this.#go(this._page + 1);

  #onKeydown = (e: KeyboardEvent): void => {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        this.#prev();
        break;
      case "ArrowRight":
        e.preventDefault();
        this.#next();
        break;
      case "Home":
        e.preventDefault();
        this.#go(0);
        break;
      case "End":
        e.preventDefault();
        this.#go(this._pageCount - 1);
        break;
      default:
        break;
    }
  };

  #onTouchStart = (e: TouchEvent): void => {
    this.#touchX = e.changedTouches[0]?.clientX ?? null;
  };

  #onTouchEnd = (e: TouchEvent): void => {
    if (this.#touchX == null) return;
    const delta = (e.changedTouches[0]?.clientX ?? this.#touchX) - this.#touchX;
    this.#touchX = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) this.#next();
    else this.#prev();
  };

  override render(): TemplateResult {
    const atStart = !this.loop && this._page <= 0;
    const atEnd = !this.loop && this._page >= this._pageCount - 1;
    const dots = Array.from({ length: this._pageCount });
    return html`
      <button
        class="arrow arrow--prev"
        type="button"
        aria-label="Previous page"
        ?disabled=${atStart}
        @click=${this.#prev}
      >
        ${chevronLeft}
      </button>
      <button
        class="arrow arrow--next"
        type="button"
        aria-label="Next page"
        ?disabled=${atEnd}
        @click=${this.#next}
      >
        ${chevronRight}
      </button>
      <div class="viewport">
        <div class="track" style="--ipp:${Math.max(1, this.itemsPerPage || 1)}">
          <slot @slotchange=${this.#onSlotChange}></slot>
        </div>
      </div>
      <div class="dots" role="status" aria-label="Page ${this._page + 1} of ${this._pageCount}">
        ${dots.map(
          (_, i) => html`<span class="dot ${i === this._page ? "dot--active" : ""}"></span>`,
        )}
      </div>
    `;
  }
}

if (!customElements.get("pq-list-carousel")) {
  customElements.define("pq-list-carousel", PqListCarousel);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-list-carousel": PqListCarousel;
  }
}
