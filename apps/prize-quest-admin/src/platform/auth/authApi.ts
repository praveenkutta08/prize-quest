import { baseApi } from "@/shared/lib/baseApi";
import type { BrandStats, LoginRequest, Session } from "@/shared/contracts";

/**
 * Auth endpoints, injected into the shared baseApi. Components never read the
 * mock directly — always through these RTK Query hooks.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSession: build.query<Session, void>({
      query: () => "/auth/session",
      providesTags: ["Session"],
    }),
    login: build.mutation<Session, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["Session", "Dashboard"],
    }),
    getBrandStats: build.query<BrandStats, void>({
      query: () => "/auth/brand-stats",
    }),
  }),
});

export const { useGetSessionQuery, useLoginMutation, useGetBrandStatsQuery } = authApi;
