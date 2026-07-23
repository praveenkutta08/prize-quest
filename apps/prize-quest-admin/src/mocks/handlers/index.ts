import { authHandlers } from "./auth";
import { tenantHandlers } from "./tenant";
import { dashboardHandlers } from "./dashboard";

export const handlers = [...authHandlers, ...tenantHandlers, ...dashboardHandlers];
