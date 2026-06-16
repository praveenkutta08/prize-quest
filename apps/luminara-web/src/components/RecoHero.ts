import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import "./ConfidenceArc";
import "./SourceChip";
import "./PrimaryCTA";

/**
 * `<lum-reco-hero>` — Luminara's signature recommendation card. Radial amber wash on
 * obsidian, thin amber border, JB Mono eyebrow, Bricolage heading (pass a
 * TemplateResult to emphasize a word with <em>), Jakarta body, a 96px confidence arc,
 * the MCP source-chip row (§6.2 — a brand element, never on embedded PQ content), and
 * a primary CTA at the bottom. Set `.onCta` for the CTA action.
 */
export class RecoHero extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    .hero {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 28px;
      border-radius: var(--r-xl);
      background: radial-gradient(130% 140% at 0% 0%, rgba(228, 168, 83, 0.16), transparent 55%),
        var(--obsidian);
      border: 1px solid rgba(228, 168, 83, 0.32);
      box-shadow: var(--shadow-md);
    }
    .top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }
    .copy {
      min-width: 0;
    }
    .eyebrow {
      margin: 0 0 12px;
      font: 400 11px/1.3 var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--amber);
    }
    .heading {
      margin: 0 0 10px;
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(22px, 2.2vw, 28px);
      line-height: 1.12;
      letter-spacing: -0.025em;
      color: var(--cream);
    }
    .heading em {
      font-style: italic;
      color: var(--amber-soft);
    }
    .body {
      margin: 0;
      font: 400 15px/1.55 var(--font-body);
      color: var(--cream-dim);
    }
    lum-confidence-arc {
      flex: 0 0 auto;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 20px 0 24px;
    }
    .cta {
      margin-top: auto;
    }
  `;

  static override properties = {
    eyebrow: { type: String },
    heading: { attribute: false },
    body: { type: String },
    confidence: { type: Number },
    sources: { attribute: false },
    cta: { type: String },
    onCta: { attribute: false },
  };

  declare eyebrow: string;
  declare heading: string | TemplateResult;
  declare body: string;
  declare confidence: number;
  declare sources: string[];
  declare cta: string;
  declare onCta?: () => void;

  constructor() {
    super();
    this.eyebrow = "";
    this.heading = "";
    this.body = "";
    this.confidence = 0;
    this.sources = [];
    this.cta = "";
  }

  override render(): TemplateResult {
    return html`
      <article class="hero">
        <div class="top">
          <div class="copy">
            ${this.eyebrow ? html`<p class="eyebrow">${this.eyebrow}</p>` : nothing}
            <h3 class="heading">${this.heading}</h3>
            ${this.body ? html`<p class="body">${this.body}</p>` : nothing}
          </div>
          <lum-confidence-arc .value=${this.confidence}></lum-confidence-arc>
        </div>

        <div class="chips" role="list" aria-label="Sources">
          ${this.sources.map((s) => html`<lum-source-chip label=${s}></lum-source-chip>`)}
        </div>

        <div class="cta">
          <lum-primary-cta @click=${() => this.onCta?.()}>${this.cta}</lum-primary-cta>
        </div>
      </article>
    `;
  }
}

if (!customElements.get("lum-reco-hero")) {
  customElements.define("lum-reco-hero", RecoHero);
}

declare global {
  interface HTMLElementTagNameMap {
    "lum-reco-hero": RecoHero;
  }
}
