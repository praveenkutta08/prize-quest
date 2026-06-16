// @pq/luminara-web — host entry.
//
// The Luminara web app embeds the Prize Quest patron module. This file does the
// registration plumbing: every Prize Quest widget is imported for its side effect so
// the embedded <pq-screen> can instantiate it by tag name, and <lum-layout> is
// registered to drive the host's own routes. All host state + routing lives in the
// components — main.ts just wires up the custom-element registry and the root shell.

// Prize Quest widgets the embed transitively renders (no bundling — workspace imports).
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

import { setActiveTenant } from "@pq/tenants";

// The host shell registers every lum-* component + screen transitively.
import "./components/Layout";

// Apply the Luminara theme by DEFAULT, before sign-in: this writes the Luminara
// --pq-* tokens + fonts onto :root so the embedded HTML5 (Prize Quest) content is
// brand-accurate from first paint. setActiveTenant also sets document.title to the
// tenant's productName ("Prize Quest"), so restore the host title afterwards.
void setActiveTenant("luminara")
  .then(() => {
    document.title = "Luminara";
  })
  .catch((error) => console.error("[luminara] default tenant activation failed", error));

// If the document somehow loads without <lum-layout> in the markup, mount it.
if (!document.querySelector("lum-layout")) {
  document.body.appendChild(document.createElement("lum-layout"));
}
