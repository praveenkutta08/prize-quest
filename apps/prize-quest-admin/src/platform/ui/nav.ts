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
      { key: "reports", label: "Reports", icon: FileBarChart, status: "v2" },
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
        status: "stub",
        badge: 7,
      },
      { key: "rewards", label: "Rewards catalog", icon: Gift, status: "v2" },
      { key: "players", label: "Players", icon: Users, status: "v2" },
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
        status: "stub",
        children: [
          { label: "All rules", path: "/rules" },
          { label: "Create rule", path: "/rules/new" },
          { label: "Execution logs", path: "/rules/logs" },
        ],
      },
      { key: "triggers", label: "Triggers", icon: Radio, status: "v2" },
    ],
  },
  {
    label: "Operations",
    items: [
      { key: "fulfillment", label: "Fulfillment", icon: PackageCheck, status: "v2" },
      { key: "audit", label: "Audit logs", icon: ScrollText, status: "v2" },
      { key: "notifications", label: "Notifications", icon: Bell, status: "v2" },
    ],
  },
  {
    label: "Admin",
    items: [
      { key: "settings", label: "Settings", icon: Settings, status: "v2" },
      { key: "users", label: "Users & roles", icon: UserCog, status: "v2" },
    ],
  },
];

/** Command-palette navigation targets (live + stub destinations only). */
export const COMMAND_TARGETS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Promotions", path: "/promotions", icon: Megaphone },
  { label: "Rules Engine", path: "/rules", icon: Zap },
  { label: "Execution logs", path: "/rules/logs", icon: ScrollText },
  { label: "Design system", path: "/design-system", icon: Building },
];
