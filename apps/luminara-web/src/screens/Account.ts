import { LitElement, css, html, type TemplateResult } from "lit";
import { navigate } from "@pq/router";
import { $session } from "@pq/store";
import { pageStyles } from "./screen-common";
import { member, preferences } from "../mock/host-data";
import "../components/Card";
import "../components/Avatar";

/** `<lum-account>` — profile header + static preference rows (Theme stays Twilight). */
export class Account extends LitElement {
  static override styles = [
    pageStyles,
    css`
      .profile {
        display: flex;
        align-items: center;
        gap: 20px;
      }
      .profile .meta {
        min-width: 0;
      }
      .profile .name {
        margin: 0 0 4px;
        font-family: var(--font-display);
        font-weight: 500;
        font-size: 24px;
        letter-spacing: -0.025em;
        color: var(--cream);
      }
      .profile .sub {
        margin: 0;
        font: 400 14px/1.4 var(--font-body);
        color: var(--cream-dim);
      }
      .profile .badge {
        color: var(--amber);
      }
      .rows {
        margin-top: 4px;
      }
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 0;
        border-bottom: 1px solid var(--mist);
      }
      .row:last-child {
        border-bottom: none;
      }
      .row .key {
        font: 500 14px/1.2 var(--font-body);
        color: var(--cream-dim);
      }
      .row .value {
        font: 500 13px/1 var(--font-body);
        color: var(--cream);
      }
      .row .value.accent {
        font-family: var(--font-mono);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: var(--amber);
      }
      .signout {
        margin-top: 24px;
        border: 1px solid var(--mist);
        background: transparent;
        color: var(--cream-dim);
        border-radius: var(--r-sm);
        padding: 12px 18px;
        font: 500 14px/1 var(--font-body);
        cursor: pointer;
        transition: color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
      }
      .signout:hover {
        color: var(--rose);
        border-color: var(--rose);
      }
      .signout:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }
    `,
  ];

  #signOut(): void {
    $session.set(null);
    navigate("/signin");
  }

  override render(): TemplateResult {
    return html`
      <div class="page-head">
        <p class="eyebrow">You</p>
        <h1>Account</h1>
        <p class="lead">Your profile and preferences.</p>
      </div>

      <lum-card>
        <div class="profile">
          <lum-avatar monogram=${member.monogram} .size=${56}></lum-avatar>
          <div class="meta">
            <p class="name">${member.name}</p>
            <p class="sub">
              <span class="badge">${member.tier} member</span> · since ${member.memberSince} ·
              ${member.email}
            </p>
          </div>
        </div>
      </lum-card>

      <div class="section">
        <h2 class="section__title">Preferences</h2>
        <lum-card>
          <div class="rows">
            ${preferences.map(
              (p) => html`<div class="row">
                <span class="key">${p.key}</span>
                <span class="value ${p.accent ? "accent" : ""}">${p.value}</span>
              </div>`,
            )}
          </div>
          <button class="signout" type="button" @click=${() => this.#signOut()}>Sign out</button>
        </lum-card>
      </div>
    `;
  }
}

if (!customElements.get("lum-account")) {
  customElements.define("lum-account", Account);
}

declare global {
  interface HTMLElementTagNameMap {
    "lum-account": Account;
  }
}
