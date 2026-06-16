// @pq/mock-data — fake, tenant-aware backend with realistic latency + error rate.
// Replace with a real API client in Phase 2 without changing widget code.
export * from "./types";
export { campaigns, tenantCampaignNames } from "./campaigns";
export { prizes } from "./prizes";
export { player } from "./player";
export { address, vouchers } from "./fulfillment";
export { orders, notifications, ordersForTenant } from "./activity";
export {
  patron,
  arcadePlayer,
  arcadeAddress,
  arcadePrizes,
  arcadeCampaigns,
  arcadeOrders,
  getClaimableCount,
  getOrderImageUrl,
  getOrderStats,
  getPatronShippingAddress,
  isArcadeTenant,
} from "./arcade";
export {
  getCampaigns,
  getCampaign,
  getPrizes,
  getAddress,
  getVoucher,
  getOrders,
  getNotifications,
  submitClaim,
} from "./api";
