import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setModules, setTenantContext, useGetTenantContextQuery } from "@/platform/scope";
import { applyTenantTheme } from "@/platform/theme";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "./CommandPalette";

/** Authenticated console frame: sidebar + topbar + routed content. */
export function AppShell() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const dispatch = useAppDispatch();
  const tenantId = useAppSelector((s) => s.scope.tenantId) ?? undefined;

  // Keep a live subscription to the tenant context so a Settings save (which
  // invalidates the `Tenant` tag) refetches and re-drives the shell: the theme
  // re-tints, the sidebar re-gates modules, and the PropertySwitcher re-lists.
  const { data: tenantContext } = useGetTenantContextQuery(tenantId, { skip: !tenantId });
  useEffect(() => {
    if (!tenantContext) return;
    applyTenantTheme(tenantContext.theme);
    dispatch(setTenantContext(tenantContext));
    dispatch(setModules(tenantContext.modules));
  }, [tenantContext, dispatch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenCommand={() => setCmdOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto min-h-full w-full max-w-[1600px] animate-fade-in px-6 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}
