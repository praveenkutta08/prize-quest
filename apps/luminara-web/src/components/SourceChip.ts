import { LitElement, css, html, type TemplateResult } from "lit";

/**
 * `<lum-source-chip>` — MCP attribution chip (§6.2). JB Mono, uppercase, 0.2em
 * tracking, amber text, mist border, transparent bg, hover-tint. A Luminara brand
 * element only — never rendered on embedded Prize Quest content (§8 of the session
 * brief). `label` is the source name, e.g. "player-mcp".
 */
export class SourceChip extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }
    button {
      font: 400 11px/1 var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--amber);
      padding: 6px 10px;
      border: 1px solid var(--mist);
      border-radius: var(--r-sm);
      background: transparent;
      cursor: default;
      transition: background var(--dur-fast) var(--ease);
    }
    button:hover {
      background: var(--hover-tint);
    }
    button:focus-visible {
      box-shadow: var(--focus-ring);
      outline: none;
    }
  `;

  static override properties = {
    label: { type: String },
  };

  declare label: string;

  constructor() {
    super();
    this.label = "";
  }

  override render(): TemplateResult {
    return html`<button type="button" aria-label="Source: ${this.label}">
      <span>${this.label}</span>
    </button>`;
  }
}

if (!customElements.get("lum-source-chip")) {
  customElements.define("lum-source-chip", SourceChip);
}

declare global {
  interface HTMLElementTagNameMap {
    "lum-source-chip": SourceChip;
  }
}
