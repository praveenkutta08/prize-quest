import { LitElement, css, html, type TemplateResult } from "lit";
import { navigate } from "@pq/router";
import "../components/RecoHero";

interface Reco {
  eyebrow: string;
  heading: TemplateResult;
  body: string;
  confidence: number;
  sources: string[];
  cta: string;
  onCta: () => void;
}

/**
 * `<lum-home>` — the Luminara dashboard. Editorial greeting + three RecoHero cards.
 * Only the "casino" card routes anywhere (→ /promotions, the Prize Quest embed); the
 * others are no-ops for the MVP.
 */
export class Home extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    h1 {
      margin: 0 0 8px;
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(28px, 3.5vw, 40px);
      line-height: 1.05;
      letter-spacing: -0.035em;
      color: var(--cream);
      font-variation-settings: "opsz" 96;
    }
    .sub {
      margin: 0 0 40px;
      font: 400 18px/1.55 var(--font-body);
      color: var(--cream-dim);
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }
    @media (min-width: 768px) {
      .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (min-width: 1024px) {
      .grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
  `;

  get #recos(): Reco[] {
    return [
      {
        eyebrow: "Concierge",
        heading: html`Your suite is <em>ready</em>`,
        body: "Room 1402, west tower. Check-in opens at 4pm.",
        confidence: 92,
        sources: ["hotel-mcp", "player-mcp", "weather-mcp"],
        cta: "View suite",
        onCta: () => {},
      },
      {
        eyebrow: "Tonight",
        heading: html`Tonight at the <em>casino</em>`,
        body: "Three offers waiting. Two expire at midnight.",
        confidence: 84,
        sources: ["offers-mcp", "player-mcp"],
        cta: "See offers",
        onCta: () => navigate("/promotions"),
      },
      {
        eyebrow: "Saved",
        heading: html`Saved <em>for you</em>`,
        body: "The chef's tasting menu — booked at 8.",
        confidence: 76,
        sources: ["player-mcp"],
        cta: "View",
        onCta: () => {},
      },
    ];
  }

  override render(): TemplateResult {
    return html`
      <h1>Good evening, Marcus</h1>
      <p class="sub">Three things tonight.</p>
      <div class="grid">
        ${this.#recos.map(
          (r) => html`<lum-reco-hero
            eyebrow=${r.eyebrow}
            .heading=${r.heading}
            body=${r.body}
            .confidence=${r.confidence}
            .sources=${r.sources}
            cta=${r.cta}
            .onCta=${r.onCta}
          ></lum-reco-hero>`,
        )}
      </div>
    `;
  }
}

if (!customElements.get("lum-home")) {
  customElements.define("lum-home", Home);
}

declare global {
  interface HTMLElementTagNameMap {
    "lum-home": Home;
  }
}
