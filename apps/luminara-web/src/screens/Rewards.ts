import { LitElement, css, html, type TemplateResult } from "lit";
import { pageStyles } from "./screen-common";
import { member, rewards, tierBenefits } from "../mock/host-data";
import "../components/Card";

const fmt = (n: number): string => n.toLocaleString("en-US");

/** `<lum-rewards>` — points balance, tier progress, redeemable rewards, benefits. */
export class Rewards extends LitElement {
  static override styles = [
    pageStyles,
    css`
      .balance {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 28px;
        align-items: center;
      }
      .balance__points {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(40px, 6vw, 64px);
        line-height: 1;
        letter-spacing: -0.04em;
        color: var(--cream);
      }
      .balance__points small {
        display: block;
        margin-top: 6px;
        font: 400 11px/1 var(--font-mono);
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: var(--cream-mute);
      }
      .tier {
        min-width: 0;
      }
      .tier__row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .tier__row .now {
        font: 500 14px/1 var(--font-body);
        color: var(--amber);
      }
      .tier__row .next {
        font: 400 13px/1 var(--font-body);
        color: var(--cream-dim);
      }
      .bar {
        height: 8px;
        border-radius: 999px;
        background: var(--slate);
        overflow: hidden;
      }
      .bar__fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--amber-soft), var(--amber));
      }
      .tier__hint {
        margin: 10px 0 0;
        font: 400 13px/1.4 var(--font-body);
        color: var(--cream-dim);
      }
      .benefits {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 18px;
      }
      .chip {
        padding: 7px 12px;
        border: 1px solid var(--mist);
        border-radius: 999px;
        font: 500 12px/1 var(--font-body);
        color: var(--cream-dim);
        background: var(--obsidian);
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      @media (min-width: 700px) {
        .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (min-width: 1100px) {
        .grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      .reward {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .reward .name {
        margin: 4px 0 6px;
        font-family: var(--font-display);
        font-weight: 500;
        font-size: 18px;
        letter-spacing: -0.02em;
        color: var(--cream);
      }
      .reward .detail {
        margin: 0 0 18px;
        font: 400 14px/1.5 var(--font-body);
        color: var(--cream-dim);
      }
      .reward .foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
      }
      .reward .cost {
        font-family: var(--font-mono);
        font-size: 13px;
        letter-spacing: 0.04em;
        color: var(--amber);
      }
      .redeem {
        border: 1px solid rgba(228, 168, 83, 0.4);
        background: transparent;
        color: var(--amber);
        border-radius: var(--r-sm);
        padding: 8px 14px;
        font: 500 13px/1 var(--font-body);
        cursor: pointer;
        transition: background var(--dur-fast) var(--ease);
      }
      .redeem:hover {
        background: var(--hover-tint);
      }
      .redeem:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }
    `,
  ];

  override render(): TemplateResult {
    const pct = Math.min(100, Math.round((member.points / member.nextTierAt) * 100));
    const remaining = Math.max(0, member.nextTierAt - member.points);
    return html`
      <div class="page-head">
        <p class="eyebrow">Loyalty</p>
        <h1>Rewards</h1>
        <p class="lead">Your balance, your tier, and what it unlocks.</p>
      </div>

      <lum-card>
        <div class="balance">
          <div class="balance__points">
            ${fmt(member.points)}<small>Points</small>
          </div>
          <div class="tier">
            <div class="tier__row">
              <span class="now">${member.tier}</span>
              <span class="next">${member.nextTier}</span>
            </div>
            <div class="bar"><div class="bar__fill" style="width:${pct}%"></div></div>
            <p class="tier__hint">${fmt(remaining)} points to ${member.nextTier}.</p>
            <div class="benefits">
              ${tierBenefits.map((b) => html`<span class="chip">${b}</span>`)}
            </div>
          </div>
        </div>
      </lum-card>

      <div class="section">
        <h2 class="section__title">Redeem</h2>
        <div class="grid">
          ${rewards.map(
            (r) => html`<lum-card interactive>
              <div class="reward">
                <p class="eyebrow">${r.eyebrow}</p>
                <h3 class="name">${r.name}</h3>
                <p class="detail">${r.detail}</p>
                <div class="foot">
                  <span class="cost">${fmt(r.cost)} pts</span>
                  <button class="redeem" type="button">Redeem</button>
                </div>
              </div>
            </lum-card>`,
          )}
        </div>
      </div>
    `;
  }
}

if (!customElements.get("lum-rewards")) {
  customElements.define("lum-rewards", Rewards);
}

declare global {
  interface HTMLElementTagNameMap {
    "lum-rewards": Rewards;
  }
}
