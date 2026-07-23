import { createBrowserRouter, Navigate } from "react-router-dom";
import { ScrollText, Zap } from "lucide-react";
import { LoginPage, RequireAuth } from "@/platform/auth";
import { AppShell, NotFound, PlaceholderPage } from "@/platform/ui";
import { DesignSystemPage } from "@/platform/theme";
import { DashboardPage } from "@/features/dashboard";
import { PromotionsListPage, PromotionDetailPage, PromotionFormPage } from "@/features/promotions";

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
          { path: "/promotions", element: <PromotionsListPage /> },
          { path: "/promotions/new", element: <PromotionFormPage /> },
          { path: "/promotions/:id", element: <PromotionDetailPage /> },
          { path: "/promotions/:id/edit", element: <PromotionFormPage /> },
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
