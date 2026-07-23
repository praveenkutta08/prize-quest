import type {
  NotificationDelivery,
  NotificationTemplate,
  OperatorNotification,
} from "@/features/notifications/model";

/**
 * Notifications fixtures — ~10 templates, ~30 deliveries, ~10 operator
 * notifications (some unread). Deterministic. Tenant-level (no property scope).
 */

function daysAgoIso(days: number, hours = 0): string {
  const NOW = Date.UTC(2026, 6, 23, 12, 0, 0);
  return new Date(NOW - days * 86_400_000 - hours * 3_600_000).toISOString();
}

export const TEMPLATES: NotificationTemplate[] = [
  {
    id: "nt-welcome",
    name: "Welcome new member",
    channel: "email",
    subject: "Welcome to {{property.name}}!",
    body: "Hi {{player.name}}, welcome aboard. Your journey to great rewards starts now.",
    status: "active",
    updatedAt: daysAgoIso(4),
  },
  {
    id: "nt-reward-ready",
    name: "Reward ready for pickup",
    channel: "sms",
    body: "{{player.name}}, your {{reward.name}} is ready for pickup at {{property.name}}.",
    status: "active",
    updatedAt: daysAgoIso(2),
  },
  {
    id: "nt-tier-up",
    name: "Tier upgrade",
    channel: "push",
    body: "Congrats {{player.name}} — you've reached a new tier!",
    status: "active",
    updatedAt: daysAgoIso(6),
  },
  {
    id: "nt-offer",
    name: "Campaign offer",
    channel: "email",
    subject: "A special offer just for you",
    body: "{{player.name}}, don't miss {{campaign.name}} — earn toward {{reward.name}}.",
    status: "active",
    updatedAt: daysAgoIso(1),
  },
  {
    id: "nt-birthday",
    name: "Birthday bonus",
    channel: "email",
    subject: "Happy birthday, {{player.name}}!",
    body: "Enjoy a birthday bonus on us this week.",
    status: "active",
    updatedAt: daysAgoIso(9),
  },
  {
    id: "nt-winback",
    name: "Win-back nudge",
    channel: "email",
    subject: "We miss you",
    body: "{{player.name}}, come back for a welcome-back reward.",
    status: "draft",
    updatedAt: daysAgoIso(12),
  },
  {
    id: "nt-fulfil-shipped",
    name: "Reward shipped",
    channel: "in-app",
    body: "Your {{reward.name}} has shipped.",
    status: "active",
    updatedAt: daysAgoIso(3),
  },
  {
    id: "nt-points-expiry",
    name: "Points expiring",
    channel: "sms",
    body: "{{player.name}}, your {{points.balance}} points expire soon.",
    status: "draft",
    updatedAt: daysAgoIso(20),
  },
  {
    id: "nt-event-invite",
    name: "VIP event invite",
    channel: "email",
    subject: "You're invited",
    body: "{{player.name}}, join us for an exclusive VIP evening at {{property.name}}.",
    status: "active",
    updatedAt: daysAgoIso(7),
  },
  {
    id: "nt-survey",
    name: "Post-visit survey",
    channel: "push",
    body: "How was your visit, {{player.name}}? Tap to tell us.",
    status: "draft",
    updatedAt: daysAgoIso(15),
  },
];

const DELIVERY_STATUSES = ["sent", "sent", "sent", "scheduled", "failed"] as const;

export function buildDeliveries(): NotificationDelivery[] {
  return Array.from({ length: 30 }, (_, i) => {
    const tpl = TEMPLATES[i % TEMPLATES.length];
    const status = DELIVERY_STATUSES[i % DELIVERY_STATUSES.length];
    return {
      id: `nd-${String(i + 1).padStart(4, "0")}`,
      templateId: tpl.id,
      templateName: tpl.name,
      channel: tpl.channel,
      recipientCount: 120 + ((i * 337) % 8800),
      sentAt: daysAgoIso(i % 14, i % 24),
      status,
    };
  });
}

export const OPERATOR_NOTIFICATIONS: OperatorNotification[] = [
  {
    id: "on-1",
    type: "success",
    title: "Campaign activated",
    message: "Summer Bash 2026 is now live across LV.",
    time: daysAgoIso(0, 1),
    read: false,
  },
  {
    id: "on-2",
    type: "warning",
    title: "Low stock",
    message: "YETI Rambler 64oz is below its low-stock threshold.",
    time: daysAgoIso(0, 3),
    read: false,
  },
  {
    id: "on-3",
    type: "error",
    title: "Fulfillment failed",
    message: "Order fo-0010 failed — vendor rejected the request.",
    time: daysAgoIso(0, 5),
    read: false,
  },
  {
    id: "on-4",
    type: "info",
    title: "New user invited",
    message: "Priya Kapoor was invited as Operations.",
    time: daysAgoIso(1),
    read: false,
  },
  {
    id: "on-5",
    type: "success",
    title: "Catalog synced",
    message: "Added 2 · updated 3 · skipped 2.",
    time: daysAgoIso(1, 6),
    read: true,
  },
  {
    id: "on-6",
    type: "info",
    title: "Rule paused",
    message: "High Roller Weekly was paused by Maya Rodriguez.",
    time: daysAgoIso(2),
    read: true,
  },
  {
    id: "on-7",
    type: "warning",
    title: "Budget cap nearing",
    message: "March Madness has used 82% of its budget.",
    time: daysAgoIso(2, 4),
    read: true,
  },
  {
    id: "on-8",
    type: "success",
    title: "Reward shipped",
    message: "AirPods Pro shipped to Ava Reyes.",
    time: daysAgoIso(3),
    read: true,
  },
  {
    id: "on-9",
    type: "info",
    title: "Report ready",
    message: "Your monthly compliance report is ready to download.",
    time: daysAgoIso(4),
    read: true,
  },
  {
    id: "on-10",
    type: "error",
    title: "Sync error",
    message: "A vendor sync attempt returned a transient error.",
    time: daysAgoIso(5),
    read: true,
  },
];

export function seedTemplates(): NotificationTemplate[] {
  return TEMPLATES.map((t) => structuredClone(t));
}
export function seedDeliveries(): NotificationDelivery[] {
  return buildDeliveries();
}
export function seedOperatorNotifications(): OperatorNotification[] {
  return OPERATOR_NOTIFICATIONS.map((n) => structuredClone(n));
}
