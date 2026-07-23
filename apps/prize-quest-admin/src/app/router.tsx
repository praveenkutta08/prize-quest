import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage, RequireAuth } from "@/platform/auth";
import { AppShell, NotFound } from "@/platform/ui";
import { DesignSystemPage } from "@/platform/theme";
import { DashboardPage } from "@/features/dashboard";
import { PromotionsListPage, PromotionDetailPage, PromotionFormPage } from "@/features/promotions";
import { RulesListPage, RuleFormPage, ExecutionLogsPage } from "@/features/rules";
import { RewardsListPage, RewardDetailPage, RewardFormPage } from "@/features/rewards";
import { PlayersListPage, PlayerProfilePage, SegmentsPage } from "@/features/players";
import { SettingsLayout } from "@/features/settings";
import { UsersListPage, RolesMatrixPage } from "@/features/users";
import { FulfillmentQueuePage } from "@/features/fulfillment";
import { AuditLogsPage } from "@/features/audit";
import {
  NotificationsLayout,
  CenterPage,
  TemplatesPage,
  TemplateFormPage,
  DeliveryLogPage,
} from "@/features/notifications";
import {
  ReportsLayout,
  OverviewPage,
  CampaignsReportPage,
  PlayersReportPage,
  RewardsReportPage,
} from "@/features/reports";
import { TriggersListPage, TriggerDetailPage, TriggerFormPage } from "@/features/triggers";

/**
 * Routes. Public: /login and /design-system. Everything else renders inside
 * <AppShell/> behind <RequireAuth/>. All v1 surfaces (dashboard, promotions,
 * rules, logs) are live as of Session 3.
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
          { path: "/rules", element: <RulesListPage /> },
          { path: "/rules/new", element: <RuleFormPage /> },
          { path: "/rules/logs", element: <ExecutionLogsPage /> },
          { path: "/rules/:id/edit", element: <RuleFormPage /> },
          { path: "/rewards", element: <RewardsListPage /> },
          { path: "/rewards/new", element: <RewardFormPage /> },
          { path: "/rewards/:id", element: <RewardDetailPage /> },
          { path: "/rewards/:id/edit", element: <RewardFormPage /> },
          { path: "/players", element: <PlayersListPage /> },
          { path: "/players/segments", element: <SegmentsPage /> },
          { path: "/players/:id", element: <PlayerProfilePage /> },
          { path: "/settings", element: <Navigate to="/settings/general" replace /> },
          { path: "/settings/:panel", element: <SettingsLayout /> },
          { path: "/users", element: <UsersListPage /> },
          { path: "/users/roles", element: <RolesMatrixPage /> },
          { path: "/fulfillment", element: <FulfillmentQueuePage /> },
          { path: "/audit", element: <AuditLogsPage /> },
          { path: "/notifications/templates/new", element: <TemplateFormPage /> },
          { path: "/notifications/templates/:id/edit", element: <TemplateFormPage /> },
          {
            path: "/reports",
            element: <ReportsLayout />,
            children: [
              { index: true, element: <OverviewPage /> },
              { path: "campaigns", element: <CampaignsReportPage /> },
              { path: "players", element: <PlayersReportPage /> },
              { path: "rewards", element: <RewardsReportPage /> },
            ],
          },
          { path: "/triggers", element: <TriggersListPage /> },
          { path: "/triggers/new", element: <TriggerFormPage /> },
          { path: "/triggers/:id", element: <TriggerDetailPage /> },
          { path: "/triggers/:id/edit", element: <TriggerFormPage /> },
          {
            path: "/notifications",
            element: <NotificationsLayout />,
            children: [
              { index: true, element: <CenterPage /> },
              { path: "templates", element: <TemplatesPage /> },
              { path: "deliveries", element: <DeliveryLogPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
