// /enter — a simulated "casino vendor dashboard" landing (Session 21, Option A).
//
// Not a Custom Element: a plain function that renders into a container with lit-html.
// It chooses the tenant / channel / tier, then "taps the loyalty card" to open Prize
// Quest — applying tokens + profile, seeding $session, loading data, and navigating to
// the home composition.
import { html, render } from "lit";
import { listTenantIds, setActiveTenant } from "@pq/tenants";
import { applyProfile, getProfileForChannel, type Channel } from "@pq/compositions";
import { navigate } from "@pq/router";
import { $session, loadCampaigns, loadOrders, loadNotifications } from "@pq/store";

const TENANT_LABELS: Record<string, string> = {
  "casino-royale-lv": "Casino Royale — Las Vegas",
  "demo-purple": "Neon Nights — Demo Purple",
  luminara: "Luminara",
  "station-casinos": "Station Casinos",
  "arcade-demo": "Arcade Rewards",
};
const ENTER_CHANNELS: Channel[] = ["mobile-web", "kiosk-landscape", "egm-main"];
const TIERS = ["Silver", "Gold", "Platinum", "Diamond"];

const val = (root: HTMLElement, id: string): string =>
  root.querySelector<HTMLSelectElement>(`#${id}`)?.value ?? "";

/** Render the landing into `container`. Idempotent — safe to call on every entry. */
export function renderEnterScreen(container: HTMLElement): void {
  const onTap = async (): Promise<void> => {
    const tenantId = val(container, "enter-tenant") || listTenantIds()[0];
    const channel = (val(container, "enter-channel") || "mobile-web") as Channel;
    const tier = val(container, "enter-tier") || "Gold";

    // Apply tokens up front (fast, local) — a bad tenant config must not block entry.
    try {
      await setActiveTenant(tenantId);
    } catch (error) {
      console.error(`[enter] failed to activate tenant "${tenantId}"`, error);
    }
    applyProfile(getProfileForChannel(channel));
    $session.set({ playerId: "demo", tenantId, tier, vendorToken: "mock" });

    // Transition immediately; widgets subscribe to the store and fill in as data
    // arrives. Always carry the channel in the URL so detectChannel() resolves the
    // chosen surface deterministically (rather than falling back to the viewport).
    navigate(`/?channel=${channel}`);
    void Promise.all([loadCampaigns(tenantId), loadOrders(tenantId), loadNotifications(tenantId)]);
  };

  render(template(onTap), container);
}

function template(onTap: () => void) {
  return html`
    <style>
      /* Scoped to :not([hidden]) so that setting the hidden attribute (when the
         app takes over) actually hides the landing — an unscoped display:grid
         here would override the UA [hidden] display:none rule. */
      #enter-root:not([hidden]) {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 40px 20px;
        background: radial-gradient(120% 120% at 50% 0%, #16263e 0%, #0a1422 60%, #060d18 100%);
        color: #e8eef6;
        font-family: "Inter", system-ui, sans-serif;
      }
      .vd {
        width: 100%;
        max-width: 420px;
        background: #0e1d31;
        border: 1px solid #213a5c;
        border-radius: 18px;
        padding: 32px 28px 28px;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
      }
      .vd__eyebrow {
        margin: 0 0 4px;
        font-family: "IBM Plex Mono", ui-monospace, monospace;
        font-size: 10px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: #7da2cf;
      }
      .vd__title {
        margin: 0 0 24px;
        font-size: 22px;
        font-weight: 600;
      }
      .vd__field {
        margin-bottom: 16px;
      }
      .vd__field label {
        display: block;
        margin-bottom: 6px;
        font-size: 11px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #9db4d1;
      }
      .vd__field select {
        width: 100%;
        appearance: none;
        background: #14283f;
        color: #e8eef6;
        border: 1px solid #2a4f7a;
        border-radius: 10px;
        padding: 12px 14px;
        font-size: 14px;
        cursor: pointer;
      }
      .vd__tap {
        margin-top: 12px;
        width: 100%;
        padding: 18px;
        border: none;
        border-radius: 12px;
        background: linear-gradient(180deg, #fcd34d, #f59e0b);
        color: #1a1206;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 0.01em;
        cursor: pointer;
        transition: transform 120ms ease;
      }
      .vd__tap:hover {
        transform: translateY(-1px);
      }
      .vd__hint {
        margin: 14px 0 0;
        text-align: center;
        font-size: 11px;
        color: #6f88a6;
      }
    </style>
    <div class="vd" role="form" aria-label="Vendor dashboard">
      <p class="vd__eyebrow">Casino vendor dashboard · simulation</p>
      <h1 class="vd__title">Open Prize Quest</h1>

      <div class="vd__field">
        <label for="enter-tenant">Property / tenant</label>
        <select id="enter-tenant">
          ${listTenantIds().map(
            (id) => html`<option value=${id}>${TENANT_LABELS[id] ?? id}</option>`,
          )}
        </select>
      </div>

      <div class="vd__field">
        <label for="enter-channel">Channel / surface</label>
        <select id="enter-channel">
          ${ENTER_CHANNELS.map((c) => html`<option value=${c}>${c}</option>`)}
        </select>
      </div>

      <div class="vd__field">
        <label for="enter-tier">Player tier</label>
        <select id="enter-tier">
          ${TIERS.map((t) => html`<option value=${t} ?selected=${t === "Gold"}>${t}</option>`)}
        </select>
      </div>

      <button class="vd__tap" @click=${onTap}>Tap your loyalty card</button>
      <p class="vd__hint">Simulates a guest tapping their card at this surface.</p>
    </div>
  `;
}
