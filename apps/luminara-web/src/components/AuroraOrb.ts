import { LitElement, css, html, type TemplateResult } from "lit";

export type OrbSize = 24 | 32 | 40 | 64 | 96;

/**
 * `<lum-aurora-orb>` — the Luminara brand mark and only AI signifier (§6.1). A
 * conic-gradient disc with an inset highlight, drifting forever (8s linear). Never
 * replaced with a logotype. `size` is one of 24 | 32 | 40 | 64 | 96.
 */
export class AuroraOrb extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      line-height: 0;
    }
    .orb {
      width: var(--orb-size, 32px);
      height: var(--orb-size, 32px);
      border-radius: 50%;
      background: conic-gradient(
        from 220deg,
        var(--amber),
        var(--copper),
        var(--indigo),
        var(--amber)
      );
      box-shadow: 0 0 20px var(--glow-amber), inset 0 0 12px rgba(0, 0, 0, 0.3);
      animation: orb-drift var(--dur-loop, 8000ms) linear infinite;
      position: relative;
    }
    .orb::after {
      content: "";
      position: absolute;
      inset: 6px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, rgba(244, 239, 230, 0.7), transparent 60%);
    }
    @keyframes orb-drift {
      to {
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .orb {
        animation: none;
      }
    }
  `;

  static override properties = {
    size: { type: Number },
  };

  declare size: OrbSize;

  constructor() {
    super();
    this.size = 32;
  }

  override render(): TemplateResult {
    return html`<div
      class="orb"
      role="img"
      aria-label="Luminara assistant"
      style="--orb-size:${this.size}px"
    ></div>`;
  }
}

if (!customElements.get("lum-aurora-orb")) {
  customElements.define("lum-aurora-orb", AuroraOrb);
}

declare global {
  interface HTMLElementTagNameMap {
    "lum-aurora-orb": AuroraOrb;
  }
}
