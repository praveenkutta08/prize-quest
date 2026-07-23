import { baseApi } from "@/shared/lib/baseApi";
import {
  CatalogSyncResult,
  RewardCategoryList,
  RewardDetail,
  RewardItem,
  RewardListResponse,
  VendorList,
  type RewardCategoryInfo,
  type RewardStatus,
  type Vendor,
} from "../model";

export interface ListRewardsArgs {
  /** In the RTK Query cache key so a property switch refetches (header scopes the data). */
  propertyId: string;
  status?: string;
  category?: string;
  type?: string;
  q?: string;
  sort?: string;
  page?: number;
}

/**
 * Rewards Catalog data layer, injected into the shared baseApi. Components read
 * only through these hooks — never the mock directly. Zod parses every response
 * at the boundary; `Reward` tags wire list ⇄ detail ⇄ mutation invalidation.
 */
export const rewardsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listRewards: build.query<RewardListResponse, ListRewardsArgs>({
      query: ({ status, category, type, q, sort, page }) => ({
        url: "/rewards",
        params: {
          ...(status && status !== "all" ? { status } : {}),
          ...(category && category !== "all" ? { category } : {}),
          ...(type && type !== "all" ? { type } : {}),
          ...(q ? { q } : {}),
          ...(sort ? { sort } : {}),
          ...(page ? { page } : {}),
        },
      }),
      transformResponse: (raw) => RewardListResponse.parse(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.rows.map((r) => ({ type: "Reward" as const, id: r.id })),
              { type: "Reward" as const, id: "LIST" },
            ]
          : [{ type: "Reward" as const, id: "LIST" }],
    }),

    getReward: build.query<RewardDetail, string>({
      query: (id) => `/rewards/${id}`,
      transformResponse: (raw) => RewardDetail.parse(raw),
      providesTags: (_r, _e, id) => [{ type: "Reward", id }],
    }),

    createReward: build.mutation<RewardItem, Partial<RewardItem>>({
      query: (body) => ({ url: "/rewards", method: "POST", body }),
      transformResponse: (raw) => RewardItem.parse(raw),
      invalidatesTags: [{ type: "Reward", id: "LIST" }],
    }),

    updateReward: build.mutation<RewardItem, { id: string; body: Partial<RewardItem> }>({
      query: ({ id, body }) => ({ url: `/rewards/${id}`, method: "PUT", body }),
      transformResponse: (raw) => RewardItem.parse(raw),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Reward", id },
        { type: "Reward", id: "LIST" },
      ],
    }),

    setRewardStatus: build.mutation<RewardItem, { id: string; status: RewardStatus }>({
      query: ({ id, status }) => ({
        url: `/rewards/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (raw) => RewardItem.parse(raw),
      // Optimistic: reflect the new status on the detail immediately; roll back on failure.
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          rewardsApi.util.updateQueryData("getReward", id, (draft) => {
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
        { type: "Reward", id },
        { type: "Reward", id: "LIST" },
      ],
    }),

    syncCatalog: build.mutation<CatalogSyncResult, void>({
      query: () => ({ url: "/rewards/sync", method: "POST" }),
      transformResponse: (raw) => CatalogSyncResult.parse(raw),
      invalidatesTags: [{ type: "Reward", id: "LIST" }, "Category"],
    }),

    listVendors: build.query<Vendor[], void>({
      query: () => "/vendors",
      transformResponse: (raw) => VendorList.parse(raw),
      providesTags: ["Vendor"],
    }),

    listRewardCategories: build.query<RewardCategoryInfo[], string>({
      query: () => "/reward-categories",
      transformResponse: (raw) => RewardCategoryList.parse(raw),
      providesTags: ["Category"],
    }),
  }),
});

export const {
  useListRewardsQuery,
  useGetRewardQuery,
  useCreateRewardMutation,
  useUpdateRewardMutation,
  useSetRewardStatusMutation,
  useSyncCatalogMutation,
  useListVendorsQuery,
  useListRewardCategoriesQuery,
} = rewardsApi;
