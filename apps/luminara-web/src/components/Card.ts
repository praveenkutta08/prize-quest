import { LitElement, css, html, type TemplateResult } from "lit";

/**
 * `<lum-card>` — the Luminara card primitive (§6.4): obsidian surface, mist hairline,
 * shadow-md, --r-lg radius, 24px padding. Set `interactive` for the hover lift +
 * focus ring (use on clickable tiles). Content goes in the default slot.
 */
export class Card extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    .card {
      padding: 24px;
      border-radius: var(--r-lg);
      background: var(--obsidian);
      border: 1px solid var(--mist);
      box-shadow: var(--shadow-md);
      transition: transform var(--dur-base) var(--ease),
        box-shadow var(--dur-base) var(--ease);
    }
    :host([interactive]) .card {
      cursor: pointer;
    }
    :host([interactive]) .card:hover {
      transform: translateY(-2px);
      box-shadow: var(--hover-lift);
    }
    :host([interactive]) .card:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring), var(--hover-lift);
    }
  `;

  static override properties = {
    interactive: { type: Boolean, reflect: true },
  };

  declare interactive: boolean;

  constructor() {
    super();
    this.interactive = false;
  }

  override render(): TemplateResult {
    return html`<div class="card" part="card"><slot></slot></div>`;
  }
}

if (!customElements.get("lum-card")) {
  customElements.define("lum-card", Card);
}

declare global {
  interface HTMLElementTagNameMap {
    "lum-card": Card;
  }
}
