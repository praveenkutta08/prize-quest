// @pq/playground — dev harness entry.
//
// Two surfaces share one page:
//  - `/enter`  → a plain-DOM "vendor dashboard" landing (src/screens/enter.ts).
//  - everything else → the Prize Quest patron app: a single <pq-screen> that renders
//    the composition for the active channel × route, with state in @pq/store.
//
// This file is the glue: default-route logic, app/enter visibility, the in-app tenant
// + channel switchers, the exit affordance, and mapping widget events onto store
// actions + router navigation.
import { listTenantIds, setActiveTenant } from "@pq/tenants";
import { navigate, getCurrentRoute, onRouteChange } from "@pq/router";
import { detectChannel, type Channel } from "@pq/compositions";
import * as store from "@pq/store";
import {
  $session,
  $address,
  $selectedPrize,
  loadCampaigns,
  loadOrders,
  loadNotifications,
  loadAddress,
  selectCampaign,
  selectPrize,
  startClaim,
  submitPin,
  submitAddress,
  finalizeClaim,
  markAllNotificationsRead,
  markNotificationRead,
} from "@pq/store";
import { renderEnterScreen } from "./screens/enter";

// Register every widget so <pq-screen> can instantiate them by tag name.
import "@pq/pq-progress-bar";
import "@pq/pq-status-pill";
import "@pq/pq-campaign-card";
import "@pq/pq-campaign-list";
import "@pq/pq-promo-hero";
import "@pq/pq-prize-tile";
import "@pq/pq-campaign-detail";
import "@pq/pq-pin-pad";
import "@pq/pq-address-block";
import "@pq/pq-claim-confirm";
import "@pq/pq-claim-summary";
import "@pq/pq-success";
import "@pq/pq-voucher";
import "@pq/pq-order-history";
import "@pq/pq-notifications";
import "@pq/pq-tier-progress";
import "@pq/pq-trust-strip";
import "@pq/pq-offline-banner";
import "@pq/pq-screen";
import type { PqScreen } from "@pq/pq-screen";

const TENANT_LABELS: Record<string, string> = {
  "casino-royale-lv": "Casino Royale — Las Vegas (premium)",
  "demo-purple": "Neon Nights — Demo Purple (casino-loud)",
  luminara: "Luminara (premium)",
  "station-casinos": "Station Casinos (casino-loud)",
  "arcade-demo": "Arcade Rewards (arcade)",
};

const CHANNELS: Channel[] = [
  "mobile-web",
  "desktop-web",
  "kiosk-portrait",
  "kiosk-landscape",
  "egm-main",
  "ttd",
];

const tenantIds = listTenantIds();

const enterRoot = document.querySelector<HTMLElement>("#enter-root");
const appEl = document.querySelector<HTMLElement>("#app");
const tenantSelect = document.querySelector<HTMLSelectElement>("#tenant-switcher");
const channelSelect = document.querySelector<HTMLSelectElement>("#channel-switcher");
const screenEl = document.querySelector<PqScreen>("#screen");
const routeLog = document.querySelector<HTMLElement>("#route-log");
const exitBtn = document.querySelector<HTMLButtonElement>("#exit-btn");

// The most recent data load — re-run by the offline banner's Retry.
let lastLoad: () => void = () => {};

/** (Re)load all tenant-scoped data into the store. */
async function loadTenantData(tenantId: string): Promise<void> {
  lastLoad = () => void loadTenantData(tenantId);
  await Promise.all([loadCampaigns(tenantId), loadOrders(tenantId), loadNotifications(tenantId)]);
}

// --- In-app switchers -------------------------------------------------------
if (tenantSelect) {
  for (const id of tenantIds) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = TENANT_LABELS[id] ?? id;
    tenantSelect.append(option);
  }
  tenantSelect.addEventListener("change", () => {
    const tenantId = tenantSelect.value;
    void setActiveTenant(tenantId);
    const session = $session.get();
    if (session) $session.set({ ...session, tenantId });
    void loadTenantData(tenantId);
  });
}

if (channelSelect) {
  for (const channel of CHANNELS) {
    const option = document.createElement("option");
    option.value = channel;
    option.textContent = channel;
    channelSelect.append(option);
  }
  channelSelect.addEventListener("change", () => {
    const url = new URL(location.href);
    url.searchParams.set("channel", channelSelect.value);
    history.replaceState({}, "", url);
    screenEl?.reload();
  });
}

exitBtn?.addEventListener("click", () => {
  // Simulate closing Prize Quest and returning to the vendor dashboard.
  $session.set(null);
  navigate("/enter");
});

/** Preserve the active channel query param across route navigation. */
function withChannel(path: string): string {
  const channel = new URLSearchParams(location.search).get("channel");
  return channel ? `${path}?channel=${channel}` : path;
}

// --- Default route + app/enter visibility -----------------------------------
function applyRoute(): void {
  const { path } = getCurrentRoute();

  // No session → always land on the vendor dashboard.
  if (!$session.get() && path !== "/enter") {
    navigate("/enter");
    return;
  }

  if (path === "/enter") {
    appEl?.setAttribute("hidden", "");
    if (enterRoot) {
      enterRoot.hidden = false;
      renderEnterScreen(enterRoot);
    }
    return;
  }

  // In-app route: show the app shell, sync the chrome, lazy-load step data.
  if (enterRoot) enterRoot.hidden = true;
  appEl?.removeAttribute("hidden");
  const session = $session.get();
  if (tenantSelect && session) tenantSelect.value = session.tenantId;
  if (channelSelect) channelSelect.value = detectChannel();
  if (routeLog) routeLog.textContent = `Route: ${path}`;
  if (path === "/address") void loadAddress();
}

onRouteChange(applyRoute);

// --- Widget events → store actions + navigation -----------------------------
// Events are composed + bubbling, so they reach document regardless of surface.
const detailId = (e: Event) => (e as CustomEvent<{ id: string }>).detail.id;

document.addEventListener("pq-card-click", (e) => {
  const id = detailId(e);
  void selectCampaign(id);
  navigate(withChannel(`/campaign/${id}`));
});
document.addEventListener("pq-hero-cta", (e) => {
  const id = detailId(e);
  void selectCampaign(id);
  navigate(withChannel(`/campaign/${id}`));
});
document.addEventListener("pq-prize-select", (e) => selectPrize(detailId(e)));
document.addEventListener("pq-claim-start", () => {
  startClaim();
  navigate(withChannel("/confirm"));
});
document.addEventListener("pq-claim-confirm", () => navigate(withChannel("/pin")));
document.addEventListener("pq-pin-complete", (e) => {
  submitPin((e as CustomEvent<{ value: string }>).detail.value);
  navigate(withChannel("/address"));
});
document.addEventListener("pq-address-confirm", () => {
  const addr = $address.get();
  if (addr) submitAddress(addr);
  navigate(withChannel("/submit"));
});
document.addEventListener("pq-claim-submit", () => {
  const digital = $selectedPrize.get()?.prizeType === "digital";
  void finalizeClaim().then((claimId) => {
    if (!claimId) return;
    navigate(withChannel(`${digital ? "/voucher" : "/success"}/${claimId}`));
  });
});
document.addEventListener("pq-success-dismiss", () => navigate(withChannel("/")));
document.addEventListener("pq-success-cta", () => navigate(withChannel("/orders")));
document.addEventListener("pq-voucher-action", (e) => {
  if ((e as CustomEvent<{ action: string }>).detail.action === "done") navigate(withChannel("/"));
});
document.addEventListener("pq-order-click", (e) => navigate(withChannel(`/order/${detailId(e)}`)));
document.addEventListener("pq-notifications-read", () => markAllNotificationsRead());
document.addEventListener("pq-notification-action", (e) => markNotificationRead(detailId(e)));
document.addEventListener("pq-retry", () => lastLoad());

// --- First paint ------------------------------------------------------------
applyRoute();

// Expose the store for manual dev-console checks, e.g.
//   pqStore.$campaigns.set([])     → list re-renders to empty state
//   await pqStore.finalizeClaim()  → $claims grows by one
(window as Window & { pqStore?: typeof store }).pqStore = store;
