// @pq/ttd-synkros — TTD / iVIEW / Device Manager demo entry.
//
// Boots the Tier Rewards Promotions experience inside a fixed device frame.
// Flow: /attract (insert card) → /hub (3-tile menu) → / (campaign list) and the full
// claim flow. The 'tier-rewards' tenant (mode: arcade) is the default, and the channel
// is pinned by the form-factor switcher — 'ttd' (compact) for the Konami/stretched TTD
// panels, 'iview-4' for the DEVICE MANAGER main-screen surfaces (1920×1080 / 1024×768).
//
// DEVICE MANAGER form factors are EGM main screens. An EGM cannot split its display,
// so we do not: the game is a Picture-in-Picture video layer the cabinet's mixer scales
// and positions, and <dm-stage> owns a full-screen content layer with a HOLE where the
// game sits. Regions (rail / top band / bottom band) are derived from the game rect —
// see ./dm/stage.ts. Screens mount into those regions by slot.
//
// #screen is a mount point: host chrome (<ttd-attract>/<ttd-hub>, or <dm-stage>) for
// host routes, or <pq-screen> (the server-driven Prize Quest flow) for everything else
// — in DM mode the pq-screen is slotted into the stage's content rail.
import "./styles.css";

import { setActiveTenant, getActiveTenant } from "@pq/tenants";
import { navigate, onRouteChange, getCurrentRoute } from "@pq/router";
import * as store from "@pq/store";
import { arcadePlayer, arcadeAddress, getPatronShippingAddress } from "@pq/mock-data";

// Host-app chrome (NOT @pq widgets) — the attract + hub screens.
import "./components/ttd-attract";
import "./components/ttd-hub";
// Device Manager host chrome — Picture-in-Picture stage + the screens it hosts.
import "./components/dm-stage";
import "./components/dm-attract";
import "./components/dm-hub";
import "./components/dm-rewards-hub";
import "./components/dm-promo-list";
import "./components/dm-prize-list";
import "./components/dm-flow-panel";
import "./components/dm-order-list";
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

// Production default: a fresh deploy with no override loads Tier Rewards (black +
// gold + chrome). Every other tenant — including the retired casino-loud one, which no
// longer appears in the dev-chrome switcher — is opt-in via ?tenant=, the vendor global,
// or (for the ones still listed) the tenant dropdown.
const DEFAULT_TENANT = "tier-rewards";

/**
 * VENDOR CHROME — fixed across every tenant.
 *
 * The attract screen and the hub belong to the CASINO: they carry the operator's name
 * and their own programme name. The Tier Rewards widget starts at the hub's hero tile,
 * and from that tap onward every screen is ours — so the product name and logo below
 * are constants, not tenant config. They are published on `<html data-pq-product-*>`
 * (the same contract as data-pq-mode) so chrome widgets can read them without importing
 * anything app- or tenant-specific.
 */
const PRODUCT = {
  name: "Tier Rewards Promotions",
  logo: "/logos/tier-rewards.png",
  alt: "Tier Rewards",
} as const;

function publishProductIdentity(): void {
  const root = document.documentElement;
  root.dataset.pqProductName = PRODUCT.name;
  root.dataset.pqProductLogo = PRODUCT.logo;
  root.dataset.pqProductAlt = PRODUCT.alt;
}
const TENANT_KEY = "pq.ttd.tenant";
const IS_PROD = import.meta.env.VITE_PROD_BUILD === "true";
const IDLE_MS = 60000;

/** Resolve the boot tenant: URL/vendor override → (dev) localStorage → default. */
function resolveTenant(): string {
  const urlTenant = new URLSearchParams(location.search).get("tenant");
  if (urlTenant) return urlTenant;
  if (IS_PROD) {
    return (
      (window as Window & { __SYNKROS_TENANT__?: string }).__SYNKROS_TENANT__ ?? DEFAULT_TENANT
    );
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

/** Device Manager mode is active when the form factor set [data-dm-ff] on <html>. */
function isDeviceManager(): boolean {
  return Boolean(document.documentElement.dataset.dmFf);
}

/**
 * Stage mode per route — three postures, matching what the patron is doing.
 *
 *   BAND     idling or just carded in. The game is untouched at full size and we are
 *            a service strip beneath it.
 *   FRAME    browsing (Tier Rewards landing, promotions, prize selection). These are
 *            DM-native screens that lay themselves out for the rail, so the game keeps
 *            its full reference rect beside them.
 *   TAKEOVER the embedded flow (confirm → PIN → address → claim). Those screens are
 *            drawn by the landscape iview-4 compositions and cannot lay out in a narrow
 *            rail, so the game steps back to a window and they get the room. Nobody is
 *            watching the reels while entering a PIN.
 */
const DM_PRIZE_ROUTE = /^\/campaign\/[^/]+\/rewards$/;

function dmStageMode(path: string): "band" | "frame" | "takeover" {
  if (path === "/attract" || path === "/hub") return "band";
  // ONE GEOMETRY for the whole service window. Browsing promotions, picking a prize and
  // claiming it are one continuous journey; the game must not change size underneath the
  // patron halfway through it. An earlier version dropped the claim into a takeover on
  // the 1024 cabinet — the game lost a third of its width and the content column gained
  // half of its own, mid-flow, which read as two different applications.
  return "frame";
}

/** Swap the stage's child screen, leaving the stage (and the game layer) untouched. */
function setStageScreen(stage: Element, tag: string, slot: string): void {
  const current = stage.firstElementChild;
  if (current && current.tagName.toLowerCase() === tag) return;
  const el = document.createElement(tag);
  el.setAttribute("slot", slot);
  stage.replaceChildren(el);
}

/**
 * DM mounting — one persistent <dm-stage> for the whole session so the game layer
 * never unmounts between screens; only its slotted child changes.
 */
function mountForDmRoute(path: string): void {
  if (!screenMount) return;
  screenMount.classList.add("host");

  let stage = screenMount.querySelector("dm-stage");
  if (!stage) {
    stage = document.createElement("dm-stage");
    stage.setAttribute("data-ff", document.documentElement.dataset.dmFf ?? "1920x1080");
    // The stage's own close affordance returns the patron to their game.
    stage.addEventListener("dm-stage-close", () => navigate(withChannel("/hub")));
    screenMount.replaceChildren(stage);
  }
  const dm = stage as HTMLElement & { mode: string; identity: boolean };
  dm.mode = dmStageMode(path);
  // Identity lives in the top band on every screen inside the service window; the
  // band strips (attract/hub) carry their own. Anything that is not a strip gets it —
  // whether a given rect solves to frame or takeover is geometry, and the identity
  // should not blink out just because the game moved a few pixels.
  dm.identity = dmStageMode(path) !== "band";

  if (path === "/attract") return setStageScreen(stage, "dm-attract", "bottom");
  if (path === "/hub") return setStageScreen(stage, "dm-hub", "bottom");
  if (path === "/rewards") return setStageScreen(stage, "dm-rewards-hub", "rail");
  if (path === "/promotions") return setStageScreen(stage, "dm-promo-list", "rail");
  // Prize selection is DM-native too — pq-reward-select is built for a landscape panel
  // and its art well starves the body column in a rail.
  if (DM_PRIZE_ROUTE.test(path)) return setStageScreen(stage, "dm-prize-list", "rail");
  // Order history is DM-native for the same reason prize selection is: the shared
  // widget's card is "118px art well + 1fr", which starves the text column to ~89px in
  // this rail and clamps the prize name to initials.
  if (path === "/orders") return setStageScreen(stage, "dm-order-list", "rail");

  // Flow routes (confirm → PIN → address → review → success, plus order history) run
  // the SAME widgets and the SAME compositions as TTD/iVIEW — not a word of the flow
  // is re-authored here. What changes is the container: <dm-flow-panel> frames them in
  // the vitrine chrome, caps the reading width, and carries the step rail, so a 270px
  // block of content stops looking marooned in a 768px rail. pq-screen is created once
  // inside the panel and self-routes from there.
  let panel = stage.querySelector("dm-flow-panel") as (HTMLElement & { route: string }) | null;
  if (!panel) {
    panel = document.createElement("dm-flow-panel") as HTMLElement & { route: string };
    panel.setAttribute("slot", "rail");
    const pq = document.createElement("pq-screen");
    pq.setAttribute("route", path);
    panel.appendChild(pq);
    stage.replaceChildren(panel);
  }
  // The panel needs the route for the step rail; pq-screen self-routes independently.
  panel.route = path;
}

/**
 * Mount the right thing for a route: host chrome (attract/hub) edge-to-edge, or the
 * <pq-screen> flow renderer (which self-routes via its own router subscription).
 * Device Manager form factors route through the dm-* shells instead.
 */
function mountForRoute(path: string): void {
  if (!screenMount) return;
  if (isDeviceManager()) {
    mountForDmRoute(path);
    return;
  }
  if (path === "/attract") {
    screenMount.classList.add("host");
    screenMount.replaceChildren(document.createElement("ttd-attract"));
  } else if (path === "/hub") {
    screenMount.classList.add("host");
    screenMount.replaceChildren(document.createElement("ttd-hub"));
  } else if (path === "/rewards" || path === "/promotions") {
    // DM-only routes reached without DM chrome (deep link on a TTD panel) — treat as
    // the campaign list.
    navigate(withChannel("/"));
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
  // Before the tenant resolves — chrome widgets read these on first render.
  publishProductIdentity();
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
// The form factor selects both the frame size and the COMPOSITION CHANNEL. Both panels
// in the fleet are TTD-class — the Konami SYNKROS at 480×234 and the L&W iView at
// 640×240 — so both run the dense `ttd` screens; the iView is simply 160px wider. The
// map is kept (rather than hardcoding "ttd") because a future panel may warrant its own
// channel, and switching channel is the one case that needs a reload: compositions and
// the density profile resolve once, at mount.
const FF_CHANNEL: Record<string, string> = {
  "480x234": "ttd",
  "640x240": "ttd",
  // Device Manager (EGM main screen) — the embedded flow renders inside the 40%
  // service window, so it runs the roomier iview-4 compositions. A dedicated
  // `device-manager` channel in @pq/compositions can replace this later.
  "1920x1080": "iview-4",
  "1024x768": "iview-4",
};
/** Form factors that mount the Device Manager host chrome (dm-* shells). */
const DM_FF = new Set(["1920x1080", "1024x768"]);
const FF_DEFAULT = "480x234";

/** Read the persisted form factor (dev chrome only; harmless in private browsing). */
function storedFormFactor(): string | null {
  try {
    return localStorage.getItem("pq.ttd.ff");
  } catch {
    return null;
  }
}

/**
 * Scale the cabinet to the viewport. The TTD frames always fit; the Device Manager
 * frames (1920×1080 / 1024×768 + cabinet padding) usually don't, so the cabinet is
 * scaled down with the negative-margin trick to keep the stage centered without
 * changing its layout size. Demo chrome only — a real DM runs full screen.
 */
function fitStage(): void {
  const cabinet = document.querySelector<HTMLElement>(".cabinet");
  if (!cabinet) return;
  const styles = getComputedStyle(document.documentElement);
  const w = parseFloat(styles.getPropertyValue("--ttd-screen-w")) || 480;
  const h = parseFloat(styles.getPropertyValue("--ttd-screen-h")) || 234;
  const pad = parseFloat(styles.getPropertyValue("--ttd-cabinet-pad")) || 30;
  const cabW = w + pad * 2;
  const cabH = h + pad * 2;
  // 49px ff-bar + the stage's own 56/24px padding.
  const availW = window.innerWidth - 48;
  const availH = window.innerHeight - 49 - 112;
  const scale = Math.min(availW / cabW, availH / cabH, 1);
  if (scale < 1) {
    cabinet.style.transform = `scale(${scale})`;
    cabinet.style.margin = `${(cabH * scale - cabH) / 2}px ${(cabW * scale - cabW) / 2}px`;
  } else {
    cabinet.style.transform = "";
    cabinet.style.margin = "";
  }
}

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
    // DM host chrome + the head bootstrap key off [data-dm-ff].
    if (DM_FF.has(value)) {
      document.documentElement.dataset.dmFf = value;
    } else {
      delete document.documentElement.dataset.dmFf;
    }
    fitStage();
    // Persist so demo viewers don't have to re-pick on reload.
    try {
      localStorage.setItem("pq.ttd.ff", value);
    } catch {
      /* private browsing — ignore */
    }
  }

  // Reconcile the stored choice against the channel actually pinned in the URL — an
  // explicit ?channel= (sales deep link) wins over whatever was last picked here.
  const urlChannel = new URLSearchParams(location.search).get("channel");
  let active = storedFormFactor() ?? FF_DEFAULT;
  if (urlChannel && FF_CHANNEL[active] !== urlChannel) {
    const match = Object.keys(FF_CHANNEL).find((ff) => FF_CHANNEL[ff] === urlChannel);
    active = match ?? FF_DEFAULT;
  }
  select.value = active;
  applyFormFactor(active);
  window.addEventListener("resize", fitStage);

  select.addEventListener("change", (e) => {
    const value = (e.target as HTMLSelectElement).value;
    applyFormFactor(value);
    const next = FF_CHANNEL[value] ?? "ttd";
    const current = new URLSearchParams(location.search).get("channel") ?? "ttd";
    // Same-channel change (Konami ↔ stretched TTD) is a live resize — no reload needed.
    if (next === current) return;
    const url = new URL(location.href);
    url.searchParams.set("channel", next);
    location.assign(url.href);
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

  // EVERY campaign opens the reward picker — eligible ones to collect, locked ones as
  // a preview (the picker disables Collect when the campaign isn't eligible). The
  // interstitial detail screen is no longer routed to from the list.
  const openCampaign = (id: string): void => {
    void selectCampaign(id);
    navigate(withChannel(`/campaign/${id}/rewards`));
  };
  document.addEventListener("pq-card-click", (e) => openCampaign(detailId(e)));
  // Trailing "Order History" card in the campaign carousel (pq-campaign-list) — the
  // widget stays routing-free and just announces intent.
  document.addEventListener("pq-view-orders", () => navigate(withChannel("/orders")));
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
  // Loader finished both phases → seed the shipping address from the patron's CMS record
  // (once) and show the read-only address-verified screen (Screen 07).
  document.addEventListener("pq-flow-loading-done", () => {
    if (getCurrentRoute().path !== "/loading") return;
    if (!$shippingAddress.get()) setShippingAddress(getPatronShippingAddress());
    navigate(withChannel("/address"));
  });
  // The address is no longer editable on the TTD — the composition renders the read-only
  // <pq-address-block> (allowEdit: false), which fires `pq-address-confirm`. The address
  // shown is the one already seeded from CMS above, so there is nothing to persist here.
  document.addEventListener("pq-address-confirm", () => {
    if (!$shippingAddress.get()) setShippingAddress(getPatronShippingAddress());
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
  // return to the hub (dashboard); mid-flow screens step back through history. In DM
  // mode the campaign list backs out to the service-window hub (/rewards) instead —
  // /hub there means "close the window and return to the game".
  document.addEventListener("pq-back", () => {
    const path = getCurrentRoute().path;
    if (isDeviceManager() && DM_PRIZE_ROUTE.test(path)) {
      navigate(withChannel("/promotions"));
    } else if (isDeviceManager() && (path === "/" || path === "/promotions")) {
      // Inside the service window, Back steps up to the Tier Rewards landing — /hub
      // there means "close the window and return to the game".
      navigate(withChannel(path === "/promotions" ? "/rewards" : "/promotions"));
    } else if (path === "/" || path.startsWith("/success") || path.startsWith("/voucher")) {
      navigate(withChannel("/hub"));
    } else {
      history.back();
    }
  });
}

void boot();

// Dev-console handle.
(window as Window & { pqStore?: typeof store }).pqStore = store;
