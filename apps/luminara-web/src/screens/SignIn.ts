import { LitElement, css, html, svg, type TemplateResult } from "lit";
import { setActiveTenant } from "@pq/tenants";
import { navigate } from "@pq/router";
import { $session, loadCampaigns, loadOrders, loadNotifications } from "@pq/store";
import "../components/AuroraOrb";
import "../components/PrimaryCTA";

const TENANT_ID = "luminara";

const icon = (paths: TemplateResult): TemplateResult => svg`
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const eyeOpen = icon(svg`<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`);
const eyeOff = icon(svg`<path d="M3 3l18 18"/><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a18.4 18.4 0 0 1-3.2 4.1M6.6 6.6A18.5 18.5 0 0 0 2 12s3.5 7 10 7a10.8 10.8 0 0 0 4.2-.8"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>`);
const arrow = icon(svg`<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>`);
const googleMark = svg`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1S8.7 5.7 12 5.7c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.1 14.6 2.2 12 2.2 6.9 2.2 2.8 6.3 2.8 11.9S6.9 21.7 12 21.7c5.5 0 9.1-3.8 9.1-9.3 0-.6-.1-1.1-.2-1.6H12Z"/></svg>`;

type Tab = "email" | "account";

/**
 * `<lum-signin>` — full-page split sign-in. Left: the Luminara concierge brand stage
 * (radial glow, drifting orb, editorial headline, mock stat strip). Right: the form
 * with two login options — Email + password (eye toggle) and Account № + PIN — plus
 * "continue with" providers. Everything is decorative (no validation); any sign-in
 * affordance triggers the same mock entry.
 *
 * Continue activates the Luminara tenant (idempotent — the app already applied it at
 * boot), seeds a mock $session before any <pq-screen> mounts, warms the store, then
 * routes to /home. Prize Quest's "default to /enter if no session" never fires.
 */
export class SignIn extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    .split {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      min-height: 100vh;
    }

    /* ---------------- brand stage (left) ---------------- */
    .brand {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 48px;
      padding: 56px 56px 48px;
      background: radial-gradient(60% 55% at 14% 10%, rgba(91, 107, 184, 0.3), transparent 60%),
        radial-gradient(60% 60% at 92% 96%, rgba(228, 168, 83, 0.24), transparent 62%),
        linear-gradient(155deg, var(--midnight), var(--night));
      border-right: 1px solid var(--mist);
    }
    .brand__top {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .wordmark {
      font-family: var(--font-display);
      font-weight: 500;
      font-size: 20px;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: var(--cream);
    }
    .eyebrow {
      margin: 0;
      font: 400 11px/1.3 var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.28em;
      color: var(--amber);
    }
    .brand__mid h1 {
      margin: 0 0 16px;
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(40px, 4.4vw, 64px);
      line-height: 1.02;
      letter-spacing: -0.035em;
      color: var(--cream);
    }
    .brand__mid h1 em {
      font-style: italic;
      color: var(--amber-soft);
    }
    .brand__mid p {
      margin: 0;
      max-width: 30ch;
      font: 400 18px/1.55 var(--font-body);
      color: var(--cream-dim);
    }
    .stats {
      display: flex;
      gap: 48px;
      flex-wrap: wrap;
    }
    .stat .k {
      display: block;
      font: 400 10px/1.3 var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.22em;
      color: var(--cream-mute);
      margin-bottom: 6px;
    }
    .stat .v {
      font-family: var(--font-display);
      font-weight: 500;
      font-size: 28px;
      letter-spacing: -0.02em;
      color: var(--cream);
    }
    .stat .v small {
      font-size: 15px;
      color: var(--cream-dim);
    }

    /* ---------------- form (right) ---------------- */
    .form {
      display: grid;
      place-items: center;
      padding: 48px;
      background: var(--night);
    }
    .form__inner {
      width: 100%;
      max-width: 380px;
    }
    .form__eyebrow {
      margin: 0 0 10px;
      font: 400 11px/1.3 var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.24em;
      color: var(--amber);
    }
    .form__title {
      margin: 0 0 6px;
      font-family: var(--font-display);
      font-weight: 400;
      font-size: clamp(30px, 3.2vw, 40px);
      line-height: 1.05;
      letter-spacing: -0.03em;
      color: var(--cream);
    }
    .form__sub {
      margin: 0 0 28px;
      font: 400 15px/1.5 var(--font-body);
      color: var(--cream-dim);
    }

    .tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px;
      padding: 4px;
      margin-bottom: 24px;
      border: 1px solid var(--mist);
      border-radius: var(--r-md);
      background: var(--obsidian);
    }
    .tab {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px;
      border: 1px solid transparent;
      border-radius: var(--r-sm);
      background: transparent;
      color: var(--cream-dim);
      font: 500 14px/1 var(--font-body);
      cursor: pointer;
      transition: color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
    }
    .tab[aria-selected="true"] {
      color: var(--cream);
      background: var(--slate);
      border-color: rgba(228, 168, 83, 0.32);
    }
    .tab .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--amber);
      opacity: 0;
    }
    .tab[aria-selected="true"] .dot {
      opacity: 1;
    }
    .tab:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    .field {
      margin-bottom: 18px;
    }
    .field__label {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .field__label label {
      font: 500 11px/1.3 var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: var(--cream-dim);
    }
    .field__label .hint {
      font: 400 10px/1.3 var(--font-mono);
      letter-spacing: 0.12em;
      color: var(--cream-mute);
    }
    .control {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 14px;
      border-radius: var(--r-sm);
      border: 1px solid var(--mist);
      background: transparent;
      transition: border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
    }
    .control:focus-within {
      border-color: var(--amber);
      box-shadow: 0 0 0 3px var(--glow-amber);
    }
    .control svg {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
      color: var(--cream-mute);
    }
    .control input {
      flex: 1;
      min-width: 0;
      padding: 14px 0;
      border: none;
      background: transparent;
      color: var(--cream);
      font: 400 16px/1.4 var(--font-body);
    }
    .control input:focus {
      outline: none;
    }
    .control input::placeholder {
      color: var(--cream-mute);
    }
    .ghost-btn {
      border: none;
      background: transparent;
      padding: 4px;
      color: var(--cream-mute);
      cursor: pointer;
      display: grid;
      place-items: center;
    }
    .ghost-btn:hover {
      color: var(--cream);
    }
    .ghost-btn:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
      border-radius: var(--r-xs);
    }

    .pin {
      display: flex;
      gap: 10px;
      padding: 12px 14px;
      align-items: center;
    }
    .pin .lock {
      width: 18px;
      height: 18px;
      color: var(--cream-mute);
    }
    .pin .dots {
      display: flex;
      gap: 10px;
    }
    .pin .dots span {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 1px solid var(--mist);
    }
    .pin .dots span.on {
      background: var(--amber);
      border-color: var(--amber);
    }

    .row {
      display: flex;
      justify-content: flex-end;
      margin: -6px 0 22px;
    }
    .link {
      border: none;
      background: transparent;
      padding: 0;
      font: 500 13px/1.3 var(--font-body);
      color: var(--amber);
      cursor: pointer;
    }
    .link:hover {
      color: var(--amber-soft);
    }
    .link:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
      border-radius: var(--r-xs);
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 14px;
      margin: 26px 0 18px;
      font: 400 10px/1 var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.24em;
      color: var(--cream-mute);
    }
    .divider::before,
    .divider::after {
      content: "";
      flex: 1;
      height: 1px;
      background: var(--mist);
    }
    .providers {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .provider {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border: 1px solid var(--mist);
      border-radius: var(--r-sm);
      background: var(--obsidian);
      color: var(--cream);
      font: 500 13px/1 var(--font-body);
      cursor: pointer;
      transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
    }
    .provider:hover {
      background: var(--slate);
      border-color: var(--cream-mute);
    }
    .provider:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }
    .provider svg {
      width: 18px;
      height: 18px;
    }
    .terms {
      margin: 24px 0 0;
      font: 400 12px/1.5 var(--font-body);
      color: var(--cream-mute);
    }
    .terms a {
      color: var(--cream-dim);
    }

    @media (max-width: 900px) {
      .split {
        grid-template-columns: 1fr;
      }
      .brand {
        display: none;
      }
      .form {
        background: radial-gradient(70% 50% at 50% 0%, rgba(228, 168, 83, 0.14), transparent 60%),
          linear-gradient(160deg, var(--midnight), var(--night));
        padding: 40px 24px;
        align-items: start;
      }
    }
  `;

  static override properties = {
    _tab: { state: true },
    _showPw: { state: true },
  };

  declare _tab: Tab;
  declare _showPw: boolean;

  constructor() {
    super();
    this._tab = "email";
    this._showPw = false;
  }

  async #continue(e?: Event): Promise<void> {
    e?.preventDefault();
    // Idempotent — the app applied this at boot, but a deep-link straight to /signin
    // (or a tenant change) still needs it.
    try {
      await setActiveTenant(TENANT_ID);
      document.title = "Luminara";
    } catch (error) {
      console.error(`[luminara] failed to activate tenant "${TENANT_ID}"`, error);
    }
    $session.set({ playerId: "demo", tenantId: TENANT_ID, tier: "Gold", vendorToken: "mock" });
    navigate("/home");
    void Promise.all([
      loadCampaigns(TENANT_ID),
      loadOrders(TENANT_ID),
      loadNotifications(TENANT_ID),
    ]);
  }

  #onKey(e: KeyboardEvent): void {
    if (e.key === "Enter") void this.#continue(e);
  }

  #renderEmailTab(): TemplateResult {
    return html`
      <div class="field">
        <div class="field__label"><label for="email">Email address</label></div>
        <div class="control">
          ${icon(svg`<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>`)}
          <input
            id="email"
            type="email"
            value="marcus.chen@mail.com"
            autocomplete="email"
            @keydown=${(e: KeyboardEvent) => this.#onKey(e)}
          />
        </div>
      </div>
      <div class="field">
        <div class="field__label">
          <label for="pw">Password</label>
          <span class="hint">10 · characters</span>
        </div>
        <div class="control">
          ${icon(svg`<rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>`)}
          <input
            id="pw"
            type=${this._showPw ? "text" : "password"}
            value="concierge1"
            autocomplete="current-password"
            @keydown=${(e: KeyboardEvent) => this.#onKey(e)}
          />
          <button
            class="ghost-btn"
            type="button"
            aria-label=${this._showPw ? "Hide password" : "Show password"}
            @click=${() => (this._showPw = !this._showPw)}
          >
            ${this._showPw ? eyeOff : eyeOpen}
          </button>
        </div>
      </div>
      <div class="row"><button class="link" type="button">Forgot password?</button></div>
    `;
  }

  #renderAccountTab(): TemplateResult {
    return html`
      <div class="field">
        <div class="field__label">
          <label for="acct">Account number</label>
          <span class="hint">10 digits</span>
        </div>
        <div class="control">
          ${icon(svg`<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>`)}
          <input
            id="acct"
            type="text"
            inputmode="numeric"
            value="8842 1903 71"
            @keydown=${(e: KeyboardEvent) => this.#onKey(e)}
          />
        </div>
      </div>
      <div class="field">
        <div class="field__label">
          <label>PIN</label>
          <span class="hint">6 digits</span>
        </div>
        <div class="control pin">
          ${icon(svg`<rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>`)}
          <div class="dots" role="img" aria-label="PIN, 4 of 6 entered">
            ${[0, 1, 2, 3, 4, 5].map((i) => html`<span class=${i < 4 ? "on" : ""}></span>`)}
          </div>
        </div>
      </div>
      <div class="row"><button class="link" type="button">Forgot PIN?</button></div>
    `;
  }

  override render(): TemplateResult {
    return html`
      <div class="split">
        <aside class="brand">
          <div class="brand__top">
            <lum-aurora-orb .size=${40}></lum-aurora-orb>
            <span class="wordmark">Luminara</span>
            <p class="eyebrow">· Your concierge ·</p>
          </div>

          <div class="brand__mid">
            <h1>Good evening.<br />Your suite <em>awaits</em>.</h1>
            <p>Sign in to pick up where you left off — offers, rewards, and tonight's plans.</p>
          </div>

          <div class="stats">
            <div class="stat">
              <span class="k">Tonight</span>
              <span class="v">3 <small>offers</small></span>
            </div>
            <div class="stat">
              <span class="k">Your tier</span>
              <span class="v">Gold</span>
            </div>
            <div class="stat">
              <span class="k">Member since</span>
              <span class="v">2021</span>
            </div>
          </div>
        </aside>

        <main class="form">
          <div class="form__inner">
            <p class="form__eyebrow">Sign in</p>
            <h2 class="form__title">Welcome <em style="font-style:italic;color:var(--amber-soft)">back</em></h2>
            <p class="form__sub">
              ${this._tab === "email"
                ? "Sign in to continue where you left off."
                : "Your player account & PIN works too."}
            </p>

            <div class="tabs" role="tablist" aria-label="Sign-in method">
              <button
                class="tab"
                role="tab"
                aria-selected=${this._tab === "email"}
                @click=${() => (this._tab = "email")}
              >
                <span class="dot"></span>Email
              </button>
              <button
                class="tab"
                role="tab"
                aria-selected=${this._tab === "account"}
                @click=${() => (this._tab = "account")}
              >
                <span class="dot"></span>Account №
              </button>
            </div>

            ${this._tab === "email" ? this.#renderEmailTab() : this.#renderAccountTab()}

            <lum-primary-cta @click=${(e: Event) => void this.#continue(e)}>
              Sign in ${arrow}
            </lum-primary-cta>

            <div class="divider">or continue with</div>
            <div class="providers">
              <button class="provider" type="button" @click=${(e: Event) => void this.#continue(e)}>
                ${googleMark} Google
              </button>
            </div>

            <p class="terms">
              By signing in, you agree to the <a href="#" @click=${(e: Event) => e.preventDefault()}>member terms</a>
              and <a href="#" @click=${(e: Event) => e.preventDefault()}>privacy notice</a>.
            </p>
          </div>
        </main>
      </div>
    `;
  }
}

if (!customElements.get("lum-signin")) {
  customElements.define("lum-signin", SignIn);
}

declare global {
  interface HTMLElementTagNameMap {
    "lum-signin": SignIn;
  }
}
