import { baseApi } from "@/shared/lib/baseApi";
import {
  ActivityList,
  ClaimsSeries,
  KpiList,
  TopCampaignList,
  type ActivityItem,
  type ClaimsPoint,
  type Kpi,
  type TopCampaignRow,
} from "../model";

/**
 * Dashboard endpoints. The active `propertyId` is passed as the query arg so the
 * RTK Query cache key changes when the operator switches property — which makes
 * every tile re-fetch and visibly re-scope. The `X-Property-Id` header (set in
 * baseApi) is what the mock actually filters on; the param mirrors it.
 */
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getKpis: build.query<Kpi[], string>({
      query: (propertyId) => ({ url: "/dashboard/kpis", params: { property: propertyId } }),
      transformResponse: (raw) => KpiList.parse(raw),
      providesTags: ["Dashboard"],
    }),
    getClaimsSeries: build.query<ClaimsPoint[], string>({
      query: (propertyId) => ({
        url: "/dashboard/claims-series",
        params: { property: propertyId },
      }),
      transformResponse: (raw) => ClaimsSeries.parse(raw),
      providesTags: ["Dashboard"],
    }),
    getActivity: build.query<ActivityItem[], string>({
      query: (propertyId) => ({ url: "/dashboard/activity", params: { property: propertyId } }),
      transformResponse: (raw) => ActivityList.parse(raw),
      providesTags: ["Dashboard"],
    }),
    getTopCampaigns: build.query<TopCampaignRow[], string>({
      query: (propertyId) => ({
        url: "/dashboard/top-campaigns",
        params: { property: propertyId },
      }),
      transformResponse: (raw) => TopCampaignList.parse(raw),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetKpisQuery,
  useGetClaimsSeriesQuery,
  useGetActivityQuery,
  useGetTopCampaignsQuery,
} = dashboardApi;
