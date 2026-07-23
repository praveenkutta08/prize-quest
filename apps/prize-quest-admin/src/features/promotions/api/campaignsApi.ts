import { baseApi } from "@/shared/lib/baseApi";
import {
  CampaignDefinition,
  CampaignListResponse,
  PreviewReachResponse,
  type CampaignStatus,
  type PreviewReachRequest,
} from "../model";

export interface ListCampaignsArgs {
  /** In the RTK Query cache key so a property switch refetches (header scopes the data). */
  propertyId: string;
  status?: string;
  q?: string;
  sort?: string;
  page?: number;
}

/**
 * Promotions data layer, injected into the shared baseApi. Components read only
 * through these hooks — never the mock directly. Zod parses every response at
 * the boundary; `Campaign` tags wire list ⇄ detail ⇄ mutation invalidation.
 */
export const campaignsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listCampaigns: build.query<CampaignListResponse, ListCampaignsArgs>({
      query: ({ status, q, sort, page }) => ({
        url: "/campaigns",
        params: {
          ...(status && status !== "all" ? { status } : {}),
          ...(q ? { q } : {}),
          ...(sort ? { sort } : {}),
          ...(page ? { page } : {}),
        },
      }),
      transformResponse: (raw) => CampaignListResponse.parse(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.rows.map((c) => ({ type: "Campaign" as const, id: c.id })),
              { type: "Campaign" as const, id: "LIST" },
            ]
          : [{ type: "Campaign" as const, id: "LIST" }],
    }),

    getCampaign: build.query<CampaignDefinition, string>({
      query: (id) => `/campaigns/${id}`,
      transformResponse: (raw) => CampaignDefinition.parse(raw),
      providesTags: (_r, _e, id) => [{ type: "Campaign", id }],
    }),

    createCampaign: build.mutation<CampaignDefinition, Partial<CampaignDefinition>>({
      query: (body) => ({ url: "/campaigns", method: "POST", body }),
      transformResponse: (raw) => CampaignDefinition.parse(raw),
      invalidatesTags: [{ type: "Campaign", id: "LIST" }],
    }),

    updateCampaign: build.mutation<
      CampaignDefinition,
      { id: string; body: Partial<CampaignDefinition> }
    >({
      query: ({ id, body }) => ({ url: `/campaigns/${id}`, method: "PUT", body }),
      transformResponse: (raw) => CampaignDefinition.parse(raw),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Campaign", id },
        { type: "Campaign", id: "LIST" },
      ],
    }),

    setCampaignStatus: build.mutation<CampaignDefinition, { id: string; status: CampaignStatus }>({
      query: ({ id, status }) => ({
        url: `/campaigns/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (raw) => CampaignDefinition.parse(raw),
      // Optimistic: reflect the new status on the detail immediately; roll back on failure.
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          campaignsApi.util.updateQueryData("getCampaign", id, (draft) => {
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
        { type: "Campaign", id },
        { type: "Campaign", id: "LIST" },
      ],
    }),

    previewReach: build.mutation<PreviewReachResponse, PreviewReachRequest>({
      query: (body) => ({ url: "/campaigns/preview-reach", method: "POST", body }),
      transformResponse: (raw) => PreviewReachResponse.parse(raw),
    }),
  }),
});

export const {
  useListCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useSetCampaignStatusMutation,
  usePreviewReachMutation,
} = campaignsApi;
