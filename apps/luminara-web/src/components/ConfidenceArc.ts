import { LitElement, css, html, svg, type TemplateResult } from "lit";

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 251.327

/**
 * `<lum-confidence-arc>` — 96px confidence ring (§6.9). Amber-soft → amber gradient
 * stroke over a mist track. `value` is 0–100; the numeric label keeps confidence
 * color-independent (§8). Lives in its own shadow root, so the gradient id never
 * collides across instances.
 */
export class ConfidenceArc extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      line-height: 0;
    }
    svg {
      display: block;
    }
    text {
      font-family: var(--font-display);
    }
  `;

  static override properties = {
    value: { type: Number },
  };

  declare value: number;

  constructor() {
    super();
    this.value = 0;
  }

  override render(): TemplateResult {
    const v = Math.max(0, Math.min(100, this.value));
    const offset = CIRCUMFERENCE * (1 - v / 100);
    return html`
      <svg
        viewBox="0 0 96 96"
        width="96"
        height="96"
        role="progressbar"
        aria-valuenow=${v}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Confidence ${v}%"
      >
        <defs>
          <linearGradient id="confGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--amber-soft)" />
            <stop offset="100%" stop-color="var(--amber)" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r="40" fill="none" stroke="var(--mist)" stroke-width="4" />
        ${svg`<circle
          cx="48"
          cy="48"
          r="40"
          fill="none"
          stroke="url(#confGrad)"
          stroke-width="4"
          stroke-linecap="round"
          stroke-dasharray=${CIRCUMFERENCE}
          stroke-dashoffset=${offset}
          transform="rotate(-90 48 48)"
        />`}
        <text x="48" y="54" text-anchor="middle" font-size="22" fill="var(--cream)">
          ${v}%
        </text>
      </svg>
    `;
  }
}

if (!customElements.get("lum-confidence-arc")) {
  customElements.define("lum-confidence-arc", ConfidenceArc);
}

declare global {
  interface HTMLElementTagNameMap {
    "lum-confidence-arc": ConfidenceArc;
  }
}
