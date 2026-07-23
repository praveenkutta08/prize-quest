import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building,
  FileBarChart,
  Gift,
  LayoutDashboard,
  Megaphone,
  PackageCheck,
  Radio,
  ScrollText,
  Settings,
  UserCog,
  Users,
  Zap,
} from "lucide-react";
import type { ModuleKey } from "@/shared/contracts";

export type NavStatus = "live" | "stub" | "v2";

export interface NavItem {
  key: ModuleKey;
  label: string;
  icon: LucideIcon;
  path?: string;
  status: NavStatus;
  badge?: number;
  children?: Array<{ label: string; path: string }>;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * Full sidebar information architecture. `status` reflects what's built this
 * track (live = usable now, stub = designed placeholder, v2 = future). The
 * tenant's `modules[]` flags gate visibility/enablement on top of this.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
        status: "live",
      },
      {
        key: "reports",
        label: "Reports",
        icon: FileBarChart,
        path: "/reports",
        status: "live",
        children: [
          { label: "Overview", path: "/reports" },
          { label: "Campaigns", path: "/reports/campaigns" },
          { label: "Players", path: "/reports/players" },
          { label: "Rewards", path: "/reports/rewards" },
        ],
      },
    ],
  },
  {
    label: "Engagement",
    items: [
      {
        key: "promotions",
        label: "Promotions",
        icon: Megaphone,
        path: "/promotions",
        status: "live",
      },
      {
        key: "rewards",
        label: "Rewards catalog",
        icon: Gift,
        path: "/rewards",
        status: "live",
      },
      {
        key: "players",
        label: "Players",
        icon: Users,
        path: "/players",
        status: "live",
        children: [
          { label: "All players", path: "/players" },
          { label: "Segments", path: "/players/segments" },
        ],
      },
    ],
  },
  {
    label: "Automation",
    items: [
      {
        key: "rules",
        label: "Rules Engine",
        icon: Zap,
        path: "/rules",
        status: "live",
        children: [
          { label: "All rules", path: "/rules" },
          { label: "Create rule", path: "/rules/new" },
          { label: "Execution logs", path: "/rules/logs" },
        ],
      },
      { key: "triggers", label: "Triggers", icon: Radio, path: "/triggers", status: "live" },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        key: "fulfillment",
        label: "Fulfillment",
        icon: PackageCheck,
        path: "/fulfillment",
        status: "live",
      },
      { key: "audit", label: "Audit logs", icon: ScrollText, path: "/audit", status: "live" },
      {
        key: "notifications",
        label: "Notifications",
        icon: Bell,
        path: "/notifications",
        status: "live",
        children: [
          { label: "Center", path: "/notifications" },
          { label: "Templates", path: "/notifications/templates" },
          { label: "Delivery log", path: "/notifications/deliveries" },
        ],
      },
    ],
  },
  {
    label: "Admin",
    items: [
      { key: "settings", label: "Settings", icon: Settings, path: "/settings", status: "live" },
      {
        key: "users",
        label: "Users & roles",
        icon: UserCog,
        path: "/users",
        status: "live",
        children: [
          { label: "Users", path: "/users" },
          { label: "Roles & permissions", path: "/users/roles" },
        ],
      },
    ],
  },
];

/** Command-palette navigation targets (live + stub destinations only). */
export const COMMAND_TARGETS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Promotions", path: "/promotions", icon: Megaphone },
  { label: "Rules Engine", path: "/rules", icon: Zap },
  { label: "Execution logs", path: "/rules/logs", icon: ScrollText },
  { label: "Rewards catalog", path: "/rewards", icon: Gift },
  { label: "New reward", path: "/rewards/new", icon: Gift },
  { label: "Players", path: "/players", icon: Users },
  { label: "Segments", path: "/players/segments", icon: Users },
  { label: "Settings", path: "/settings/general", icon: Settings },
  { label: "Theme & appearance", path: "/settings/theme", icon: Settings },
  { label: "Properties", path: "/settings/properties", icon: Building },
  { label: "Users & roles", path: "/users", icon: UserCog },
  { label: "Roles & permissions", path: "/users/roles", icon: UserCog },
  { label: "Fulfillment queue", path: "/fulfillment", icon: PackageCheck },
  { label: "Audit logs", path: "/audit", icon: ScrollText },
  { label: "Notifications center", path: "/notifications", icon: Bell },
  { label: "Notification templates", path: "/notifications/templates", icon: Bell },
  { label: "Delivery log", path: "/notifications/deliveries", icon: Bell },
  { label: "Reports", path: "/reports", icon: FileBarChart },
  { label: "Triggers", path: "/triggers", icon: Radio },
  { label: "New trigger", path: "/triggers/new", icon: Radio },
  { label: "Design system", path: "/design-system", icon: Building },
];
