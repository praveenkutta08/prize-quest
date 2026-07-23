import { z } from "zod";

/** Notifications domain contracts (app-local, Zod-first). Tenant-level. */

export const NotifChannel = z.enum(["email", "sms", "push", "in-app"]);
export type NotifChannel = z.infer<typeof NotifChannel>;

export const NotificationTemplate = z.object({
  id: z.string(),
  name: z.string().min(1, "Name your template"),
  channel: NotifChannel,
  subject: z.string().optional(),
  body: z.string(),
  status: z.enum(["active", "draft"]),
  updatedAt: z.string(),
});
export type NotificationTemplate = z.infer<typeof NotificationTemplate>;

export const NotificationDelivery = z.object({
  id: z.string(),
  templateId: z.string(),
  templateName: z.string(),
  channel: NotifChannel,
  recipientCount: z.number().int(),
  sentAt: z.string(),
  status: z.enum(["sent", "scheduled", "failed"]),
});
export type NotificationDelivery = z.infer<typeof NotificationDelivery>;

export const OperatorNotification = z.object({
  id: z.string(),
  type: z.enum(["info", "success", "warning", "error"]),
  title: z.string(),
  message: z.string(),
  time: z.string(),
  read: z.boolean(),
});
export type OperatorNotification = z.infer<typeof OperatorNotification>;

export const TemplateList = z.array(NotificationTemplate);
export const NotificationList = z.array(OperatorNotification);

export const DeliveryCounts = z.object({
  all: z.number(),
  sent: z.number(),
  scheduled: z.number(),
  failed: z.number(),
});
export type DeliveryCounts = z.infer<typeof DeliveryCounts>;

export const DeliveryListResponse = z.object({
  rows: z.array(NotificationDelivery),
  total: z.number(),
  counts: DeliveryCounts,
});
export type DeliveryListResponse = z.infer<typeof DeliveryListResponse>;

// ── Template form ─────────────────────────────────────────────────────────────

export const TemplateForm = z.object({
  name: z.string().min(1, "Name your template"),
  channel: NotifChannel,
  subject: z.string().optional(),
  body: z.string().min(1, "Add a message body"),
  status: z.enum(["active", "draft"]),
});
export type TemplateForm = z.infer<typeof TemplateForm>;

export const TOKEN_CHIPS = [
  "{{player.name}}",
  "{{reward.name}}",
  "{{property.name}}",
  "{{campaign.name}}",
  "{{points.balance}}",
];
