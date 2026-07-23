import type { StatusTone } from "@/shared/ui";
import type { NotifChannel } from "../model";

export const CHANNEL_LABEL: Record<NotifChannel, string> = {
  email: "Email",
  sms: "SMS",
  push: "Push",
  "in-app": "In-app",
};

export function deliveryTone(status: "sent" | "scheduled" | "failed"): StatusTone {
  switch (status) {
    case "sent":
      return "active";
    case "scheduled":
      return "scheduled";
    case "failed":
      return "danger";
    default:
      return "draft";
  }
}
