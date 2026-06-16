import { LitElement, html, nothing, type TemplateResult } from "lit";
import { styles } from "./styles";
import type { PinLength } from "./types";

const deleteIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
  <path d="M21 4H8l-7 8 7 8h13a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" />
</svg>`;

/** Fisher–Yates shuffle (Math.random is fine in browser app code). */
function shuffleDigits(): string[] {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits;
}

/**
 * `<pq-pin-pad>` — numeric PIN entry, configurable length (4–6), optional shuffled
 * keypad (tenant `pinShuffle`). Emits `pq-pin-change` on every edit and
 * `pq-pin-complete` once `length` digits are entered. Set the `error` property to show
 * the error state (red cells + shake + message); it clears on the next keypress.
 */
export class PqPinPad extends LitElement {
  static override styles = styles;

  static override properties = {
    length: { type: Number },
    shuffle: { type: Boolean },
    error: { type: String },
    profile: { type: String, reflect: true },
    value: { state: true },
    _digits: { state: true },
  };

  declare length: PinLength;
  declare shuffle: boolean;
  declare error?: string;
  /** `compact` renders the 4-column keypad (Clr / ⌫, no Enter — auto-completes). */
  declare profile: "compact" | "standard" | "expanded";
  declare value: string;
  private declare _digits: string[];

  constructor() {
    super();
    this.length = 4;
    this.shuffle = false;
    this.profile = "standard";
    this.value = "";
    this._digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.shuffle) this._digits = shuffleDigits();
    window.addEventListener("keydown", this.handlePhysicalKey);
  }

  override disconnectedCallback(): void {
    window.removeEventListener("keydown", this.handlePhysicalKey);
    super.disconnectedCallback();
  }

  override render(): TemplateResult {
    const cells = Array.from({ length: this.length }, (_, i) => i < this.value.length);
    const showError = Boolean(this.error) && this.value.length === 0;
    if (this.profile === "expanded") return this.renderExpanded(cells, showError);
    if (this.profile === "compact") return this.renderCompact(cells, showError);
    return html`
      <div class="cells">
        ${cells.map((filled) => html`<div class="cell ${filled ? "cell--filled" : ""}"></div>`)}
      </div>
      <div class="keys">
        ${this._digits.slice(0, 9).map((d) => this.keyButton(d))}
        <button class="key key--util" @click=${this.clear}>Clear</button>
        ${this.keyButton(this._digits[9])}
        <button class="key key--util" aria-label="Delete" @click=${this.deleteLast}>${deleteIcon}</button>
      </div>
      ${showError ? html`<p class="msg">${this.error}</p>` : nothing}
    `;
  }

  /** 4-column compact keypad: 1-2-3-Clr / 4-5-6-⌫ / 7-8-9-0. No Enter key — entry
   *  auto-completes on the final digit (`press`), matching the Kiosk keypad. */
  private renderCompact(cells: boolean[], showError: boolean): TemplateResult {
    const d = this._digits;
    return html`
      <div class="cells">
        ${cells.map((filled) => html`<div class="cell ${filled ? "cell--filled" : ""}"></div>`)}
      </div>
      <div class="keys keys--compact">
        ${this.keyButton(d[0])}${this.keyButton(d[1])}${this.keyButton(d[2])}
        <button class="key key--util" @click=${this.clear}>Clr</button>
        ${this.keyButton(d[3])}${this.keyButton(d[4])}${this.keyButton(d[5])}
        <button class="key key--util" aria-label="Delete" @click=${this.deleteLast}>${deleteIcon}</button>
        ${this.keyButton(d[6])}${this.keyButton(d[7])}${this.keyButton(d[8])}${this.keyButton(d[9])}
      </div>
      ${showError ? html`<p class="msg">${this.error}</p>` : nothing}
    `;
  }

  /** Big kiosk keypad (ref `.arc-key`): scaled-up dots + 3-col grid, row 4 = Clear / 0 / Backspace. */
  private renderExpanded(cells: boolean[], showError: boolean): TemplateResult {
    const d = this._digits;
    return html`
      <div class="cells cells--expanded">
        ${cells.map((filled) => html`<div class="cell ${filled ? "cell--filled" : ""}"></div>`)}
      </div>
      <div class="keys keys--expanded">
        ${d.slice(0, 9).map((digit) => this.keyButton(digit))}
        <button class="key key--ghost" @click=${this.clear}>Clear</button>
        ${this.keyButton(d[9])}
        <button class="key key--ghost" aria-label="Delete" @click=${this.deleteLast}>${deleteIcon}</button>
      </div>
      ${showError ? html`<p class="msg">${this.error}</p>` : nothing}
    `;
  }

  private keyButton(digit: string): TemplateResult {
    return html`<button class="key" @click=${() => this.press(digit)}>${digit}</button>`;
  }

  private press(digit: string): void {
    if (this.value.length >= this.length) return;
    this.clearError();
    this.value = this.value + digit;
    this.emit("pq-pin-change");
    if (this.value.length === this.length) this.emit("pq-pin-complete");
  }

  private deleteLast(): void {
    if (this.value.length === 0) return;
    this.clearError();
    this.value = this.value.slice(0, -1);
    this.emit("pq-pin-change");
  }

  private clear(): void {
    if (this.value.length === 0) return;
    this.clearError();
    this.value = "";
    this.emit("pq-pin-change");
  }

  private clearError(): void {
    if (this.error) this.error = undefined;
  }

  private emit(type: "pq-pin-change" | "pq-pin-complete"): void {
    this.dispatchEvent(
      new CustomEvent(type, { detail: { value: this.value }, bubbles: true, composed: true }),
    );
  }

  private handlePhysicalKey = (event: KeyboardEvent): void => {
    if (/^[0-9]$/.test(event.key)) {
      this.press(event.key);
    } else if (event.key === "Backspace") {
      this.deleteLast();
    }
  };

  protected override updated(): void {
    const showError = Boolean(this.error) && this.value.length === 0;
    this.toggleAttribute("data-error", showError);
    this.setAttribute("role", "group");
    this.setAttribute("aria-label", `${this.length}-digit PIN entry`);
    if (showError) this.setAttribute("aria-invalid", "true");
    else this.removeAttribute("aria-invalid");
  }
}

if (!customElements.get("pq-pin-pad")) {
  customElements.define("pq-pin-pad", PqPinPad);
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-pin-pad": PqPinPad;
  }
}

export type { PinLength, PinDetail } from "./types";
