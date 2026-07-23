import { authHandlers } from "./auth";
import { tenantHandlers } from "./tenant";
import { dashboardHandlers } from "./dashboard";
import { promotionHandlers } from "./promotions";
import { ruleHandlers } from "./rules";
import { logHandlers } from "./logs";
import { rewardHandlers } from "./rewards";
import { playerHandlers } from "./players";
import { settingsHandlers } from "./settings";
import { userHandlers } from "./users";
import { fulfillmentHandlers } from "./fulfillment";
import { auditHandlers } from "./audit";
import { notificationHandlers } from "./notifications";
import { reportHandlers } from "./reports";
import { triggerAdminHandlers } from "./triggers";

export const handlers = [
  ...authHandlers,
  ...tenantHandlers,
  ...dashboardHandlers,
  ...promotionHandlers,
  ...ruleHandlers,
  ...logHandlers,
  ...rewardHandlers,
  ...playerHandlers,
  ...settingsHandlers,
  ...userHandlers,
  ...fulfillmentHandlers,
  ...auditHandlers,
  ...notificationHandlers,
  ...reportHandlers,
  ...triggerAdminHandlers,
];
