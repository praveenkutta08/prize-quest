import { LitElement, css, html, type TemplateResult } from "lit";
import { pageStyles } from "./screen-common";
import { activity } from "../mock/host-data";
import "../components/Card";

/** `<lum-activity>` — a recent-activity table (§6.6): JB Mono headers, mist rules, zebra. */
export class Activity extends LitElement {
  static override styles = [
    pageStyles,
    css`
      /* Pull the table flush to the card edges (counteracts lum-card's 24px padding). */
      .table-wrap {
        margin: -24px;
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font: 400 14px/1.5 var(--font-body);
      }
      thead th {
        font: 500 10px/1 var(--font-mono);
        text-transform: uppercase;
        letter-spacing: 0.22em;
        color: var(--cream-mute);
        text-align: left;
        padding: 16px 24px;
        border-bottom: 1px solid var(--mist);
        white-space: nowrap;
      }
      th.num,
      td.num {
        text-align: right;
      }
      tbody td {
        padding: 16px 24px;
        border-bottom: 1px solid var(--mist);
        color: var(--cream);
        vertical-align: top;
      }
      tbody tr:last-child td {
        border-bottom: none;
      }
      tbody tr:nth-child(even) {
        background: var(--row-zebra);
      }
      tbody tr:hover {
        background: var(--hover-tint);
      }
      .when {
        font-family: var(--font-mono);
        font-size: 12px;
        letter-spacing: 0.04em;
        color: var(--cream-dim);
        white-space: nowrap;
      }
      .when .t {
        color: var(--cream-mute);
      }
      .event {
        color: var(--cream);
      }
      .ctx {
        display: block;
        margin-top: 2px;
        font-size: 13px;
        color: var(--cream-mute);
      }
      .pts {
        font-family: var(--font-mono);
        font-size: 13px;
        letter-spacing: 0.04em;
        white-space: nowrap;
      }
      .pts.pos {
        color: var(--sage);
      }
      .pts.neg {
        color: var(--rose);
      }
      .pts.zero {
        color: var(--cream-mute);
      }
    `,
  ];

  override render(): TemplateResult {
    return html`
      <div class="page-head">
        <p class="eyebrow">History</p>
        <h1>Activity</h1>
        <p class="lead">Your recent visits, offers, and points.</p>
      </div>

      <lum-card>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Activity</th>
                <th class="num">Points</th>
              </tr>
            </thead>
            <tbody>
              ${activity.map(
                (a) => html`<tr>
                  <td class="when">${a.date} <span class="t">${a.time}</span></td>
                  <td>
                    <span class="event">${a.event}</span>
                    <span class="ctx">${a.context}</span>
                  </td>
                  <td class="num">
                    <span
                      class="pts ${a.points > 0 ? "pos" : a.points < 0 ? "neg" : "zero"}"
                    >
                      ${a.points > 0 ? "+" : ""}${a.points === 0 ? "—" : a.points.toLocaleString("en-US")}
                    </span>
                  </td>
                </tr>`,
              )}
            </tbody>
          </table>
        </div>
      </lum-card>
    `;
  }
}

if (!customElements.get("lum-activity")) {
  customElements.define("lum-activity", Activity);
}

declare global {
  interface HTMLElementTagNameMap {
    "lum-activity": Activity;
  }
}
