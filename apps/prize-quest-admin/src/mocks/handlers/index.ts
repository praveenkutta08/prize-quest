import { authHandlers } from "./auth";
import { tenantHandlers } from "./tenant";
import { dashboardHandlers } from "./dashboard";
import { promotionHandlers } from "./promotions";

export const handlers = [
  ...authHandlers,
  ...tenantHandlers,
  ...dashboardHandlers,
  ...promotionHandlers,
];
