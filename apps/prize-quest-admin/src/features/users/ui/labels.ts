import type { StatusTone } from "@/shared/ui";
import type { Role, UserStatus } from "../model";

export const ROLE_LABEL: Record<Role, string> = {
  "marketing-manager": "Marketing Manager",
  approver: "Approver",
  operations: "Operations",
  auditor: "Auditor",
  admin: "Admin",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  "marketing-manager": "Builds campaigns and rules; can't activate.",
  approver: "Reviews and activates campaigns and rules.",
  operations: "Runs fulfillment, catalog sync, and player ops.",
  auditor: "Read-only plus compliance exports.",
  admin: "Full access, including users and settings.",
};

export const STATUS_LABEL: Record<UserStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
};

export function roleTone(role: Role): StatusTone {
  switch (role) {
    case "admin":
      return "event";
    case "approver":
      return "scheduled";
    case "operations":
      return "active";
    case "auditor":
      return "paused";
    default:
      return "draft";
  }
}

export function statusTone(status: UserStatus): StatusTone {
  switch (status) {
    case "active":
      return "active";
    case "pending":
      return "scheduled";
    case "inactive":
      return "ended";
    default:
      return "draft";
  }
}
