import { type ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage, RequireAuth } from "@/platform/auth";
import { AppShell, NotFound } from "@/platform/ui";

/**
 * Lazily resolve a named page export from a feature barrel into a React Router
 * `lazy` route. Each feature barrel becomes its own build chunk, so a surface's
 * code (its pages + RTK Query endpoints + Zod model) only downloads when the
 * operator first navigates to it. `lazy` awaits the import before swapping, so
 * the previous screen stays mounted during the (local, sub-frame) fetch — no
 * spinner flash. Nothing eager depends on a feature's endpoints (the sidebar
 * badges read the shared endpoints at the platform level), so deferring
 * endpoint injection to first-navigation is safe.
 */
function page(load: () => Promise<Record<string, unknown>>, name: string) {
  return { lazy: async () => ({ Component: (await load())[name] as ComponentType }) };
}

// Grouped so the whole feature (pages + api + model) lands in one chunk.
const rewards = () => import("@/features/rewards");
const players = () => import("@/features/players");
const promotions = () => import("@/features/promotions");
const rules = () => import("@/features/rules");
const settings = () => import("@/features/settings");
const users = () => import("@/features/users");
const fulfillment = () => import("@/features/fulfillment");
const audit = () => import("@/features/audit");
const notifications = () => import("@/features/notifications");
const reports = () => import("@/features/reports");
const triggers = () => import("@/features/triggers");
const dashboard = () => import("@/features/dashboard");

/**
 * Routes. Public: /login and /design-system. Everything else renders inside
 * <AppShell/> behind <RequireAuth/>. Feature pages are code-split (see `page`);
 * only the auth boundary + shell load in the initial bundle.
 */
export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/design-system",
    lazy: async () => ({ Component: (await import("@/platform/theme")).DesignSystemPage }),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", ...page(dashboard, "DashboardPage") },
          { path: "/promotions", ...page(promotions, "PromotionsListPage") },
          { path: "/promotions/new", ...page(promotions, "PromotionFormPage") },
          { path: "/promotions/:id", ...page(promotions, "PromotionDetailPage") },
          { path: "/promotions/:id/edit", ...page(promotions, "PromotionFormPage") },
          { path: "/rules", ...page(rules, "RulesListPage") },
          { path: "/rules/new", ...page(rules, "RuleFormPage") },
          { path: "/rules/logs", ...page(rules, "ExecutionLogsPage") },
          { path: "/rules/:id/edit", ...page(rules, "RuleFormPage") },
          { path: "/rewards", ...page(rewards, "RewardsListPage") },
          { path: "/rewards/new", ...page(rewards, "RewardFormPage") },
          { path: "/rewards/:id", ...page(rewards, "RewardDetailPage") },
          { path: "/rewards/:id/edit", ...page(rewards, "RewardFormPage") },
          { path: "/players", ...page(players, "PlayersListPage") },
          { path: "/players/segments", ...page(players, "SegmentsPage") },
          { path: "/players/:id", ...page(players, "PlayerProfilePage") },
          { path: "/settings", element: <Navigate to="/settings/general" replace /> },
          { path: "/settings/:panel", ...page(settings, "SettingsLayout") },
          { path: "/users", ...page(users, "UsersListPage") },
          { path: "/users/roles", ...page(users, "RolesMatrixPage") },
          { path: "/fulfillment", ...page(fulfillment, "FulfillmentQueuePage") },
          { path: "/audit", ...page(audit, "AuditLogsPage") },
          { path: "/notifications/templates/new", ...page(notifications, "TemplateFormPage") },
          { path: "/notifications/templates/:id/edit", ...page(notifications, "TemplateFormPage") },
          {
            path: "/reports",
            lazy: async () => ({ Component: (await reports()).ReportsLayout }),
            children: [
              { index: true, ...page(reports, "OverviewPage") },
              { path: "campaigns", ...page(reports, "CampaignsReportPage") },
              { path: "players", ...page(reports, "PlayersReportPage") },
              { path: "rewards", ...page(reports, "RewardsReportPage") },
            ],
          },
          { path: "/triggers", ...page(triggers, "TriggersListPage") },
          { path: "/triggers/new", ...page(triggers, "TriggerFormPage") },
          { path: "/triggers/:id", ...page(triggers, "TriggerDetailPage") },
          { path: "/triggers/:id/edit", ...page(triggers, "TriggerFormPage") },
          {
            path: "/notifications",
            lazy: async () => ({ Component: (await notifications()).NotificationsLayout }),
            children: [
              { index: true, ...page(notifications, "CenterPage") },
              { path: "templates", ...page(notifications, "TemplatesPage") },
              { path: "deliveries", ...page(notifications, "DeliveryLogPage") },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
