import { LitElement, css, html, type TemplateResult } from "lit";

/**
 * `<lum-primary-cta>` — the amber-gradient primary button (§6.3). Rebuilt in Luminara
 * tokens (no imported UI-kit button). Slot in the label; set `type` for form usage.
 * Forwards clicks naturally (the inner <button> bubbles a composed click).
 */
export class PrimaryCTA extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px 22px;
      min-height: 48px;
      border-radius: 14px;
      border: none;
      background: linear-gradient(180deg, var(--amber-soft), var(--amber));
      color: var(--on-accent);
      font: 500 15px/1.2 var(--font-body);
      letter-spacing: -0.01em;
      white-space: nowrap;
      cursor: pointer;
      box-shadow: 0 8px 20px -6px var(--glow-amber);
      transition: transform var(--dur-fast) var(--ease),
        box-shadow var(--dur-fast) var(--ease);
    }
    ::slotted(svg) {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
    }
    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 24px -6px var(--glow-amber);
    }
    button:active {
      transform: scale(0.98);
    }
    button:focus-visible {
      box-shadow: var(--focus-ring), 0 8px 20px -6px var(--glow-amber);
      outline: none;
    }
  `;

  static override properties = {
    type: { type: String },
  };

  declare type: "button" | "submit";

  constructor() {
    super();
    this.type = "button";
  }

  override render(): TemplateResult {
    return html`<button type=${this.type}><slot></slot></button>`;
  }
}

if (!customElements.get("lum-primary-cta")) {
  customElements.define("lum-primary-cta", PrimaryCTA);
}

declare global {
  interface HTMLElementTagNameMap {
    "lum-primary-cta": PrimaryCTA;
  }
}
