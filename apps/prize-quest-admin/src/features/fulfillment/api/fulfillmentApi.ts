import { baseApi } from "@/shared/lib/baseApi";
import {
  BulkResult,
  FulfillmentListResponse,
  FulfillmentOrder,
  type BulkAction,
  type FulfillmentStatus,
} from "../model";

export interface ListOrdersArgs {
  propertyId: string;
  status?: string;
  method?: string;
  q?: string;
  page?: number;
}

/** Fulfillment data layer — property-scoped, optimistic status advance. */
export const fulfillmentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listOrders: build.query<FulfillmentListResponse, ListOrdersArgs>({
      query: ({ status, method, q, page }) => ({
        url: "/fulfillment",
        params: {
          ...(status && status !== "all" ? { status } : {}),
          ...(method && method !== "all" ? { method } : {}),
          ...(q ? { q } : {}),
          ...(page ? { page } : {}),
        },
      }),
      transformResponse: (raw) => FulfillmentListResponse.parse(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.rows.map((o) => ({ type: "Fulfillment" as const, id: o.id })),
              { type: "Fulfillment" as const, id: "LIST" },
            ]
          : [{ type: "Fulfillment" as const, id: "LIST" }],
    }),

    getOrder: build.query<FulfillmentOrder, string>({
      query: (id) => `/fulfillment/${id}`,
      transformResponse: (raw) => FulfillmentOrder.parse(raw),
      providesTags: (_r, _e, id) => [{ type: "Fulfillment", id }],
    }),

    advanceStatus: build.mutation<
      FulfillmentOrder,
      { id: string; status: FulfillmentStatus; trackingNumber?: string }
    >({
      query: ({ id, status, trackingNumber }) => ({
        url: `/fulfillment/${id}/status`,
        method: "PATCH",
        body: { status, trackingNumber },
      }),
      transformResponse: (raw) => FulfillmentOrder.parse(raw),
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          fulfillmentApi.util.updateQueryData("getOrder", id, (draft) => {
            draft.status = status;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Fulfillment", id },
        { type: "Fulfillment", id: "LIST" },
      ],
    }),

    bulkUpdate: build.mutation<BulkResult, { ids: string[]; action: BulkAction }>({
      query: (body) => ({ url: "/fulfillment/bulk", method: "POST", body }),
      transformResponse: (raw) => BulkResult.parse(raw),
      invalidatesTags: [{ type: "Fulfillment", id: "LIST" }],
    }),
  }),
});

export const {
  useListOrdersQuery,
  useGetOrderQuery,
  useAdvanceStatusMutation,
  useBulkUpdateMutation,
} = fulfillmentApi;
