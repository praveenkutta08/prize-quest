import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "@/platform/theme/tokens.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { Providers } from "@/app/providers";
import { store } from "@/app/store";
import { setTenantContext, setModules, setTenantId, tenantApi } from "@/platform/scope";
import { applyTenantTheme } from "@/platform/theme";

/** Resolve the tenant id from `?tenant=` or the VITE_TENANT env, else default. */
function resolveTenantId(): string {
  const fromQuery = new URLSearchParams(window.location.search).get("tenant");
  return fromQuery || import.meta.env.VITE_TENANT || "casino-royale";
}

async function startMockBackend() {
  if (import.meta.env.VITE_MOCK !== "1") return;
  const { worker } = await import("@/mocks/browser");
  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: false,
  });
}

/**
 * Boot sequence: start MSW → resolve the tenant context (brand + theme) →
 * apply the tenant's runtime theme → hydrate scope/flags → render. The theme is
 * applied before first paint so the client's brand is live from frame one.
 */
async function boot() {
  await startMockBackend();

  const tenantId = resolveTenantId();
  try {
    const result = await store
      .dispatch(tenantApi.endpoints.getTenantContext.initiate(tenantId))
      .unwrap();
    applyTenantTheme(result.theme);
    store.dispatch(setTenantContext(result));
    store.dispatch(setModules(result.modules));
    store.dispatch(setTenantId(result.tenant.id));
  } catch (err) {
    // Non-fatal: the base Nocturne theme still renders. Surface for debugging.
    console.error("[boot] tenant context failed to resolve", err);
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Providers>
        <App />
      </Providers>
    </StrictMode>,
  );
}

void boot();
