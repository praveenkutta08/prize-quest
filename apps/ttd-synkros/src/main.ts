// @pq/ttd-synkros — SYNKROS TTD demo entry.
//
// Boots into the casino-loud Prize Quest experience inside a fixed device frame.
// Flow: /attract (insert card) → /hub (3-tile menu) → / (Prize Quest campaign list)
// and the full claim flow. The 'station-casinos' tenant (mode: casino-loud) is set on
// boot, and the channel is pinned to 'ttd' (→ compact profile) via the URL param.
//
// #screen is a mount point: host chrome (<ttd-attract>/<ttd-hub>) for the attract/hub
// routes, or <pq-screen> (the server-driven Prize Quest flow) for everything else.
import "./styles.css";

import { setActiveTenant, getActiveTenant } from "@pq/tenants";
import { navigate, onRouteChange, getCurrentRoute } from "@pq/router";
import * as store from "@pq/store";
import { arcadePlayer, arcadeAddress, getPatronShippingAddress } from "@pq/mock-data";
import type { AddressData } from "@pq/contracts";

// Host-app chrome (NOT @pq widgets) — the attract + hub screens.
import "./components/ttd-attract";
import "./components/ttd-hub";
import {
  $selectedPrize,
  $player,
  $address,
  $shippingAddress,
  loadCampaigns,
  loadOrders,
  loadPlayer,
  selectCampaign,
  selectPrize,
  startClaim,
  submitPin,
  setShippingAddress,
  resetShippingAddress,
  finalizeClaim,
} from "@pq/store";

// Register every widget the ttd compositions instantiate (by tag name) + pq-screen.
import "@pq/pq-progress-bar";
import "@pq/pq-status-pill";
import "@pq/pq-campaign-card";
import "@pq/pq-campaign-list";
import "@pq/pq-promo-hero";
import "@pq/pq-prize-tile";
import "@pq/pq-campaign-detail";
import "@pq/pq-pin-pad";
import "@pq/pq-address-block";
import "@pq/pq-address-form";
import "@pq/pq-claim-confirm";
import "@pq/pq-claim-summary";
import "@pq/pq-success";
import "@pq/pq-voucher";
import "@pq/pq-order-history";
import "@pq/pq-reward-select";
import "@pq/pq-trust-strip";
import "@pq/pq-screen-header";
import "@pq/pq-flow-loading";
import "@pq/pq-screen";

// Production default: a fresh deploy with no override loads the arcade theme.
// Casino-loud (station-casinos) is now opt-in via ?tenant=, vendor global, or the
// dev-chrome tenant switcher.
const DEFAULT_TENANT = "resort-style";
const TENANT_KEY = "pq.ttd.tenant";
const IS_PROD = import.meta.env.VITE_PROD_BUILD === "true";
const IDLE_MS = 60000;

/** Resolve the boot tenant: URL/vendor override → (dev) localStorage → default. */
function resolveTenant(): string {
  const urlTenant = new URLSearchParams(location.search).get("tenant");
  if (urlTenant) return urlTenant;
  if (IS_PROD) {
    return (window as Window & { __SYNKROS_TENANT__?: string }).__SYNKROS_TENANT__ ?? DEFAULT_TENANT;
  }
  try {
    return localStorage.getItem(TENANT_KEY) ?? DEFAULT_TENANT;
  } catch {
    return DEFAULT_TENANT;
  }
}

const screenMount = document.getElementById("screen");

/** The active tenant runs the arcade theme (vs casino-loud). Flow + seed data branch
 *  on this: arcade mirrors the kiosk (dedicated address screen, arcade patron/address);
 *  casino-loud keeps its Session-24c flow (loading → submit, default player). */
function isArcadeMode(): boolean {
  return getActiveTenant()?.theme.mode === "arcade";
}

/** Seed the store for the active tenant. Arcade seeds the patron (James Morrison,
 *  142,580 pts) + verified address so the flow header/address match the arcade hub +
 *  kiosk; casino-loud loads the default player. Orders load for both (was missing —
 *  without it the order-history screen only ever showed the just-claimed row). */
function seedTenant(tenant: string): void {
  if (isArcadeMode()) {
    $player.set(arcadePlayer);
    $address.set(arcadeAddress);
  } else {
    loadPlayer();
  }
  void loadCampaigns(tenant);
  void loadOrders(tenant);
}

/** Preserve the pinned ttd channel across every navigation. */
function withChannel(path: string): string {
  const channel = new URLSearchParams(location.search).get("channel") ?? "ttd";
  return `${path}?channel=${channel}`;
}

/**
 * Mount the right thing for a route: host chrome (attract/hub) edge-to-edge, or the
 * <pq-screen> flow renderer (which self-routes via its own router subscription).
 */
function mountForRoute(path: string): void {
  if (!screenMount) return;
  if (path === "/attract") {
    screenMount.classList.add("host");
    screenMount.replaceChildren(document.createElement("ttd-attract"));
  } else if (path === "/hub") {
    screenMount.classList.add("host");
    screenMount.replaceChildren(document.createElement("ttd-hub"));
  } else {
    screenMount.classList.remove("host");
    // Create pq-screen once; it then self-routes for every subsequent flow change.
    if (!screenMount.querySelector("pq-screen")) {
      const pq = document.createElement("pq-screen");
      pq.setAttribute("route", path);
      screenMount.replaceChildren(pq);
    }
  }
}

// --- Boot ------------------------------------------------------------------
async function boot(): Promise<void> {
  const tenant = resolveTenant();
  // Activates the tenant's mode tokens (arcade or casino-loud) + injects its fonts.
  await setActiveTenant(tenant);
  // Seed the store (player/address/campaigns/orders) for the active tenant.
  seedTenant(tenant);

  // Host routing: swap attract / hub / pq-screen as the route changes.
  onRouteChange((route) => mountForRoute(route.path));

  bindFormFactor();
  bindTenantSwitcher(tenant);
  bindReset();
  bindFlow();
  bindIdleTimeout();

  // Start on the attract screen (preserving the pinned ttd channel).
  navigate(withChannel("/attract"));
}

// --- Attract-on-idle — bounce to /attract after 60s of no input ------------
function bindIdleTimeout(): void {
  let idleTimer: number | null = null;
  const reset = (): void => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      if (getCurrentRoute().path !== "/attract") navigate(withChannel("/attract"));
    }, IDLE_MS);
  };
  (["pointerdown", "keydown", "touchstart"] as const).forEach((evt) =>
    window.addEventListener(evt, reset, { passive: true }),
  );
  reset();
}

// --- Task FF — form-factor switcher ----------------------------------------
function bindFormFactor(): void {
  const select = document.getElementById("ff-switch") as HTMLSelectElement | null;
  const dims = document.getElementById("ff-bar-dims");
  if (!select) return;

  function applyFormFactor(value: string): void {
    const [w, h] = value.split("x").map(Number);
    if (!w || !h) return;
    document.documentElement.style.setProperty("--ttd-screen-w", `${w}px`);
    document.documentElement.style.setProperty("--ttd-screen-h", `${h}px`);
    if (dims) dims.textContent = `${w} × ${h}`;
    // Persist so demo viewers don't have to re-pick on reload.
    try {
      localStorage.setItem("pq.ttd.ff", value);
    } catch {
      /* private browsing — ignore */
    }
  }

  // Restore last choice on boot (default to 480x234).
  const stored = (() => {
    try {
      return localStorage.getItem("pq.ttd.ff");
    } catch {
      return null;
    }
  })();
  if (stored) {
    select.value = stored;
    applyFormFactor(stored);
  }

  select.addEventListener("change", (e) => {
    applyFormFactor((e.target as HTMLSelectElement).value);
  });
}

// --- Dev-chrome tenant switcher --------------------------------------------
// Reloads with ?tenant= so the new tenant boots from a clean token state. A reload
// (vs. a live flip) is required now that the Session-34 *-style arcade tenants set the
// full --arc-* ramp as inline overrides: switching back to a tenant with no overrides
// (station-arcade) would otherwise inherit stale colors. ?tenant= is also shareable for
// sales deep links; resolveTenant() honors it (and localStorage) on boot.
function bindTenantSwitcher(current: string): void {
  const select = document.getElementById("tenant-switch") as HTMLSelectElement | null;
  if (!select) return;
  select.value = current;
  select.addEventListener("change", (e) => {
    const id = (e.target as HTMLSelectElement).value;
    try {
      localStorage.setItem(TENANT_KEY, id);
    } catch {
      /* private browsing — ignore */
    }
    const url = new URL(location.href);
    url.searchParams.set("tenant", id);
    location.assign(url.href);
  });
}

// --- Demo reset — return to the attract screen -----------------------------
function bindReset(): void {
  document.getElementById("ff-reset")?.addEventListener("click", () => {
    navigate(withChannel("/attract"));
  });
}

// --- Widget events → store actions + navigation ----------------------------
// Events bubble (composed) out of pq-screen to document. We swap routes via the
// router; pq-screen (route mode) reloads the composition for the new path.
function bindFlow(): void {
  const detailId = (e: Event) => (e as CustomEvent<{ id: string }>).detail.id;

  // Ready ("eligible") campaigns jump straight to the reward picker — the interstitial
  // detail screen (progress bar + "Pick your prize" CTA) is redundant once a campaign is
  // complete. Non-ready campaigns still open the detail (progress / locked prizes).
  const openCampaign = (id: string): void => {
    void selectCampaign(id);
    const eligible = store.$campaigns.get()?.find((c) => c.id === id)?.status === "eligible";
    navigate(withChannel(eligible ? `/campaign/${id}/rewards` : `/campaign/${id}`));
  };
  document.addEventListener("pq-card-click", (e) => openCampaign(detailId(e)));
  document.addEventListener("pq-hero-cta", (e) => openCampaign(detailId(e)));
  // Eligible compact detail → open the dedicated reward-selection screen.
  document.addEventListener("pq-view-rewards", (e) => {
    const id = (e as CustomEvent<{ campaignId: string }>).detail.campaignId;
    navigate(withChannel(`/campaign/${id}/rewards`));
  });
  document.addEventListener("pq-prize-select", (e) => selectPrize(detailId(e)));
  document.addEventListener("pq-claim-start", () => {
    startClaim();
    // Fresh claim → clear any address the patron entered on a previous claim, so the
    // form re-prefills from CMS (Session 30).
    resetShippingAddress();
    navigate(withChannel("/confirm"));
  });
  document.addEventListener("pq-claim-confirm", () => navigate(withChannel("/pin")));
  document.addEventListener("pq-pin-complete", (e) => {
    submitPin((e as CustomEvent<{ value: string }>).detail.value);
    // Two-phase loader (Validating PIN → Retrieving Address). The pq-flow-loading widget
    // self-advances on its phase durations and emits `pq-flow-loading-done`; we route to
    // the editable address form when it does (see below). Both modes use this flow now.
    navigate(withChannel("/loading"));
  });
  // Loader finished both phases → seed the form from the patron's CMS address (once) and
  // show the editable address form (Screen 07).
  document.addEventListener("pq-flow-loading-done", () => {
    if (getCurrentRoute().path !== "/loading") return;
    if (!$shippingAddress.get()) setShippingAddress(getPatronShippingAddress());
    navigate(withChannel("/address"));
  });
  // Editable address form OK → persist what the patron entered, advance to final confirm.
  document.addEventListener("pq-address-submit", (e) => {
    setShippingAddress((e as CustomEvent<AddressData>).detail);
    navigate(withChannel("/submit"));
  });
  document.addEventListener("pq-claim-submit", () => {
    const digital = $selectedPrize.get()?.prizeType === "digital";
    void finalizeClaim().then((claimId) => {
      if (!claimId) return;
      // Claim placed → clear the entered address so the next claim starts from CMS.
      resetShippingAddress();
      navigate(withChannel(`${digital ? "/voucher" : "/success"}/${claimId}`));
    });
  });
  // After a claim, dismiss the success/voucher screen back to the hub (dashboard).
  document.addEventListener("pq-success-dismiss", () => navigate(withChannel("/hub")));
  document.addEventListener("pq-success-cta", () => navigate(withChannel("/orders")));
  document.addEventListener("pq-voucher-action", (e) => {
    if ((e as CustomEvent<{ action: string }>).detail.action === "done") {
      navigate(withChannel("/hub"));
    }
  });

  // Header back button: the campaign list and the post-claim success/voucher screens
  // return to the hub (dashboard); mid-flow screens step back through history.
  document.addEventListener("pq-back", () => {
    const path = getCurrentRoute().path;
    if (path === "/" || path.startsWith("/success") || path.startsWith("/voucher")) {
      navigate(withChannel("/hub"));
    } else {
      history.back();
    }
  });
}

void boot();

// Dev-console handle.
(window as Window & { pqStore?: typeof store }).pqStore = store;
