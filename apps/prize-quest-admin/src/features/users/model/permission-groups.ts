import type { PermissionGroup } from "./dto";

/**
 * The 13 permissions grouped into the matrix rows by domain. Covers every key in
 * the `Permission` enum (including `players.adjust`, added in Session 5); later
 * sessions' additive keys extend these groups so they appear as new matrix rows.
 */
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: "Campaigns",
    permissions: [
      { key: "campaign.view", label: "View campaigns" },
      { key: "campaign.create", label: "Create campaigns" },
      { key: "campaign.activate", label: "Activate / pause" },
    ],
  },
  {
    label: "Rules",
    permissions: [
      { key: "rule.view", label: "View rules" },
      { key: "rule.create", label: "Create rules" },
      { key: "rule.toggle", label: "Toggle rules" },
    ],
  },
  {
    label: "Logs",
    permissions: [
      { key: "logs.view", label: "View logs" },
      { key: "logs.export", label: "Export logs" },
    ],
  },
  {
    label: "Catalog",
    permissions: [{ key: "catalog.sync", label: "Sync catalog" }],
  },
  {
    label: "Players",
    permissions: [{ key: "players.adjust", label: "Adjust points" }],
  },
  {
    label: "Triggers",
    permissions: [{ key: "triggers.manage", label: "Manage triggers" }],
  },
  {
    label: "Fulfillment",
    permissions: [{ key: "fulfillment.manage", label: "Manage fulfillment" }],
  },
  {
    label: "Audit",
    permissions: [{ key: "audit.export", label: "Export audit" }],
  },
  {
    label: "Notifications",
    permissions: [{ key: "notifications.manage", label: "Manage notifications" }],
  },
  {
    label: "Users",
    permissions: [{ key: "users.manage", label: "Manage users" }],
  },
  {
    label: "Settings",
    permissions: [{ key: "settings.manage", label: "Manage settings" }],
  },
];
