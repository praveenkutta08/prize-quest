import { baseApi } from "@/shared/lib/baseApi";
import {
  CampaignReportResponse,
  OverviewResponse,
  PlayerReportResponse,
  RewardReportResponse,
} from "../model";

export interface ReportArgs {
  range: string;
  property: string;
  segment?: string;
}

/** Reports data layer — query-only, property-scoped (X-Property-Id via header). */
export const reportsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOverview: build.query<OverviewResponse, ReportArgs>({
      query: ({ range, segment }) => ({
        url: "/reports/overview",
        params: { range, ...(segment ? { segment } : {}) },
      }),
      transformResponse: (raw) => OverviewResponse.parse(raw),
      providesTags: ["Report"],
    }),
    getCampaignReport: build.query<CampaignReportResponse, ReportArgs>({
      query: ({ range, segment }) => ({
        url: "/reports/campaigns",
        params: { range, ...(segment ? { segment } : {}) },
      }),
      transformResponse: (raw) => CampaignReportResponse.parse(raw),
      providesTags: ["Report"],
    }),
    getPlayerReport: build.query<PlayerReportResponse, ReportArgs>({
      query: ({ range, segment }) => ({
        url: "/reports/players",
        params: { range, ...(segment ? { segment } : {}) },
      }),
      transformResponse: (raw) => PlayerReportResponse.parse(raw),
      providesTags: ["Report"],
    }),
    getRewardReport: build.query<RewardReportResponse, ReportArgs>({
      query: ({ range, segment }) => ({
        url: "/reports/rewards",
        params: { range, ...(segment ? { segment } : {}) },
      }),
      transformResponse: (raw) => RewardReportResponse.parse(raw),
      providesTags: ["Report"],
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetCampaignReportQuery,
  useGetPlayerReportQuery,
  useGetRewardReportQuery,
} = reportsApi;
