import { createBrowserRouter, Navigate } from "react-router-dom";
import { Megaphone, ScrollText, Zap } from "lucide-react";
import { LoginPage, RequireAuth } from "@/platform/auth";
import { AppShell, NotFound, PlaceholderPage } from "@/platform/ui";
import { DesignSystemPage } from "@/platform/theme";
import { DashboardPage } from "@/features/dashboard";

/**
 * Routes. Public: /login and /design-system. Everything else renders inside
 * <AppShell/> behind <RequireAuth/>. Promotions/Rules/Logs are designed
 * placeholders until Sessions 2–3.
 */
export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/design-system", element: <DesignSystemPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <DashboardPage /> },
          {
            path: "/promotions",
            element: (
              <PlaceholderPage
                crumbs={[{ label: "Operator" }, { label: "Promotions" }]}
                title="Promotions"
                subtitle="Manage and monitor Prize Quest campaigns across properties."
                icon={Megaphone}
                session="Session 2"
                description="The promotions list, detail, and the create/edit flow with the condition builder land in the next session — all on this design system."
              />
            ),
          },
          {
            path: "/promotions/new",
            element: (
              <PlaceholderPage
                crumbs={[
                  { label: "Operator" },
                  { label: "Promotions", href: "/promotions" },
                  { label: "New campaign" },
                ]}
                title="Create campaign"
                subtitle="Compose eligibility, earn rules, prizes, and compliance."
                icon={Megaphone}
                session="Session 2"
                description="The campaign builder with live rule pseudocode and reach preview is coming in the next session."
              />
            ),
          },
          {
            path: "/rules",
            element: (
              <PlaceholderPage
                crumbs={[{ label: "Operator" }, { label: "Automation" }, { label: "Rules Engine" }]}
                title="Rules Engine"
                subtitle="Create and manage automated rules for player engagement."
                icon={Zap}
                session="Session 3"
                description="The rules list and the trigger/condition/action builder with a live summary panel arrive in Session 3."
              />
            ),
          },
          {
            path: "/rules/new",
            element: (
              <PlaceholderPage
                crumbs={[
                  { label: "Operator" },
                  { label: "Rules Engine", href: "/rules" },
                  { label: "New rule" },
                ]}
                title="Create rule"
                subtitle="Trigger, conditions, actions, and a live summary."
                icon={Zap}
                session="Session 3"
                description="The rule builder is coming in Session 3, reusing the promotions condition builder."
              />
            ),
          },
          {
            path: "/rules/logs",
            element: (
              <PlaceholderPage
                crumbs={[
                  { label: "Operator" },
                  { label: "Rules Engine", href: "/rules" },
                  { label: "Execution logs" },
                ]}
                title="Execution logs"
                subtitle="Audit trail of every rule firing — for compliance and debugging."
                icon={ScrollText}
                session="Session 3"
                description="Filterable execution logs with CSV export and a live tail arrive in Session 3."
              />
            ),
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
