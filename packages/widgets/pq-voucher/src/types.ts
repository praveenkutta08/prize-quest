/** Actions emitted by `pq-voucher-action`. `done` → hub, `orders` → order history. */
export type VoucherAction = "wallet" | "email" | "done" | "orders";

export interface VoucherActionDetail {
  action: VoucherAction;
}
