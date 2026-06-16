// @pq/kiosk-arcade — Kiosk Arcade demo entry.
//
// Boots the arcade-mode Prize Quest experience inside a scaled kiosk device frame.
// Flow: /attract (tap card) → /hub (account menu) → /campaigns (Prize Quest) and the
// full claim flow. The 'arcade-demo' tenant (mode: arcade) is set on boot; the channel
// is pinned to 'kiosk-landscape' (→ expanded profile) by the dev chrome.
//
// #kiosk-screen is the mount point: host chrome (<kiosk-attract>/<kiosk-hub>) for the
// attract/hub routes, <pq-screen> (the server-driven flow) for the rest, or a
// Session-27 placeholder for form factors without compositions yet (iVIEW).
import "./styles.css";

import { setActiveTenant } from "@pq/tenants";
import { navigate, onRouteChange, getCurrentRoute, matchPattern } from "@pq/router";
import * as store from "@pq/store";
import {
  $selectedPrize,
  $activeCampaign,
  $player,
  $address,
  $shippingAddress,
  loadCampaigns,
  loadOrders,
  selectCampaign,
  selectPrize,
  startClaim,
  submitPin,
  setShippingAddress,
  resetShippingAddress,
  finalizeClaim,
} from "@pq/store";
import { arcadePlayer, arcadeAddress, getPatronShippingAddress } from "@pq/mock-data";
import type { AddressData } from "@pq/contracts";

// Host-app chrome (NOT @pq widgets) — the attract + hub screens.
import "./components/kiosk-attract";
import "./components/kiosk-hub";
import { wireDevChrome, type DeviceChange } from "./dev-chrome";
import { wireInactivityTimeout } from "./idle";

// Register every widget the kiosk-landscape compositions instantiate + pq-screen.
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
import "@pq/pq-tier-progress";
import "@pq/pq-screen-header";
import "@pq/pq-flow-loading";
import "@pq/pq-screen";

// Selectable arcade tenants (dev-chrome dropdown + ?tenant= deep links). All are
// arcade mode — operator-flavored re-skins of arcade-demo (Session 34). arcade-demo
// stays the default; the *-style demos are generic, private-sales only.
const TENANT_OPTIONS = [
  "arcade-demo",
  "resort-style",
  "velvet-style",
  "aria-style",
  "emerald-style",
] as const;
const TENANT_KEY = "pq.kiosk.tenant";

/** Resolve the boot tenant: ?tenant= deep link → (dev) localStorage → arcade-demo. */
function getInitialTenant(): string {
  const fromParam = new URLSearchParams(location.search).get("tenant");
  if (fromParam && (TENANT_OPTIONS as readonly string[]).includes(fromParam)) return fromParam;
  try {
    const stored = localStorage.getItem(TENANT_KEY);
    if (stored && (TENANT_OPTIONS as readonly string[]).includes(stored)) return stored;
  } catch {
    /* private browsing — ignore */
  }
  return "resort-style";
}

const TENANT_ID = getInitialTenant();
const IDLE_MS = 60_000;
const EGM_IDLE_MS = 30_000;

const screenMount = document.getElementById("kiosk-screen");
let currentChannel = "kiosk-landscape";

/** Preserve the pinned channel across navigations. */
function withChannel(path: string): string {
  const channel = new URLSearchParams(location.search).get("channel") ?? "kiosk-landscape";
  return `${path}?channel=${channel}`;
}

function nav(path: string): void {
  navigate(withChannel(path));
}

/** Mount the right thing for a route: host chrome or the flow renderer. */
function mountForRoute(path: string): void {
  if (!screenMount) return;
  if (path === "/" || path === "/attract") {
    screenMount.replaceChildren(document.createElement("kiosk-attract"));
    return;
  }
  if (path === "/hub") {
    screenMount.replaceChildren(document.createElement("kiosk-hub"));
    return;
  }
  const pq = document.createElement("pq-screen");
  pq.setAttribute("route", path);
  screenMount.replaceChildren(pq);
}

// --- Boot ------------------------------------------------------------------
async function boot(): Promise<void> {
  // Activate arcade tokens (data-pq-mode=arcade), Manrope fonts, categoryMap.
  await setActiveTenant(TENANT_ID);
  // Seed the store: arcade patron (header chrome), campaigns, orders, address.
  $player.set(arcadePlayer);
  $address.set(arcadeAddress);
  void loadCampaigns(TENANT_ID);
  void loadOrders(TENANT_ID);

  wireDevChrome();
  wireTenantSwitch();
  // EGM deployments time out faster (30s) than kiosks/iVIEW (60s).
  wireInactivityTimeout(() => (currentChannel === "egm" ? EGM_IDLE_MS : IDLE_MS));

  // On a device switch the channel changes — re-mount the current screen for EVERY
  // route, host chrome (attract/hub) included, so kiosk-attract / kiosk-hub re-render
  // at the new form factor (they were previously skipped). Form-factor sizing keys off
  // <html data-formfactor> (set by dev-chrome before this fires), so the fresh mount
  // picks up the iVIEW :host-context([data-formfactor^="iview"]) rules. (Orientation/
  // scale-only changes don't change the channel, so they don't trigger a re-mount.)
  window.addEventListener("pq-device-change", (e) => {
    const { channel } = (e as CustomEvent<DeviceChange>).detail;
    const changed = channel !== currentChannel;
    currentChannel = channel;
    if (changed) mountForRoute(getCurrentRoute().path);
  });

  onRouteChange((route) => mountForRoute(route.path));
  bindFlow();

  nav("/attract"); // boot to the attract screen
}

// --- Dev-chrome tenant switcher (Session 34) -------------------------------
// Reloads with ?tenant= so the new palette/fonts apply from a clean boot (kiosk
// has no live hot-swap path; reload is simplest and avoids stale inline tokens).
// Dev-only: hidden + skipped in production builds, but ?tenant= deep links still
// resolve via getInitialTenant() for private sales demos.
function wireTenantSwitch(): void {
  if (import.meta.env.VITE_PROD_BUILD) return;
  const select = document.getElementById("tenant-switch") as HTMLSelectElement | null;
  if (!select) return;
  select.value = TENANT_ID;
  select.addEventListener("change", () => {
    const id = select.value;
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

// --- Widget events → store actions + navigation ----------------------------
function bindFlow(): void {
  const detailId = (e: Event): string => (e as CustomEvent<{ id: string }>).detail.id;

  // On the compact iVIEW channels, a ready ("eligible") campaign jumps straight to the
  // reward picker (skip the interstitial detail/CTA screen). The expanded kiosk/EGM grid
  // keeps its inline-detail flow, so it always opens the campaign detail.
  const openCampaign = (id: string): void => {
    void selectCampaign(id);
    const compact = currentChannel === "iview-3" || currentChannel === "iview-4";
    const eligible = store.$campaigns.get()?.find((c) => c.id === id)?.status === "eligible";
    nav(compact && eligible ? `/campaign/${id}/rewards` : `/campaign/${id}`);
  };
  document.addEventListener("pq-card-click", (e) => openCampaign(detailId(e)));
  document.addEventListener("pq-hero-cta", (e) => openCampaign(detailId(e)));

  // iVIEW (compact) eligible detail → open the dedicated reward-selection screen.
  document.addEventListener("pq-view-rewards", (e) => {
    const id = (e as CustomEvent<{ campaignId: string }>).detail.campaignId;
    nav(`/campaign/${id}/rewards`);
  });

  // Expanded detail has no separate claim button — selecting a reward IS the claim
  // start. (Compact/standard emit pq-claim-start instead; both are handled.)
  document.addEventListener("pq-prize-select", (e) => {
    selectPrize(detailId(e));
    const path = getCurrentRoute().path;
    if (matchPattern("/campaign/:id", path) && $activeCampaign.get()?.status === "eligible") {
      startClaim();
      resetShippingAddress();
      nav("/confirm");
    }
  });
  document.addEventListener("pq-claim-start", () => {
    startClaim();
    // Fresh claim → drop any address entered on a previous claim (re-prefill from CMS).
    resetShippingAddress();
    nav("/confirm");
  });

  document.addEventListener("pq-claim-confirm", () => nav("/pin"));

  document.addEventListener("pq-pin-complete", (e) => {
    submitPin((e as CustomEvent<{ value: string }>).detail.value);
    // Two-phase loader (Validating PIN → Retrieving Address). pq-flow-loading self-advances
    // and emits `pq-flow-loading-done`; we then show the editable address form.
    nav("/loading");
  });

  // Loader done → seed the form from the patron's CMS address (once), show Screen 07.
  document.addEventListener("pq-flow-loading-done", () => {
    if (getCurrentRoute().path !== "/loading") return;
    if (!$shippingAddress.get()) setShippingAddress(getPatronShippingAddress());
    nav("/address");
  });

  // Editable address form OK → persist entered address, advance to final confirm + T&C.
  document.addEventListener("pq-address-submit", (e) => {
    setShippingAddress((e as CustomEvent<AddressData>).detail);
    nav("/submit");
  });

  document.addEventListener("pq-claim-submit", () => {
    const digital = $selectedPrize.get()?.prizeType === "digital";
    void finalizeClaim().then((claimId) => {
      if (!claimId) return;
      resetShippingAddress();
      nav(`${digital ? "/voucher" : "/success"}/${claimId}`);
    });
  });

  // After a claim, return to the hub or jump to order history.
  document.addEventListener("pq-success-dismiss", () => nav("/hub"));
  document.addEventListener("pq-success-cta", () => nav("/orders"));
  document.addEventListener("pq-voucher-action", (e) => {
    const action = (e as CustomEvent<{ action: string }>).detail.action;
    if (action === "done") nav("/hub");
    else if (action === "orders") nav("/orders");
  });

  // Back: campaign list, order history + post-claim screens return to the hub
  // (their "Back to hub" affordance now lives in the body widget, not the header);
  // mid-flow steps back.
  document.addEventListener("pq-back", () => {
    const path = getCurrentRoute().path;
    if (
      path === "/campaigns" ||
      path === "/orders" ||
      path.startsWith("/success") ||
      path.startsWith("/voucher")
    ) {
      nav("/hub");
    } else {
      history.back();
    }
  });
}

void boot();

// Dev-console handle.
(window as Window & { pqStore?: typeof store }).pqStore = store;
