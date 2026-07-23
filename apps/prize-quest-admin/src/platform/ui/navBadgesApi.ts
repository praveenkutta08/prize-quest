import { baseApi } from "@/shared/lib/baseApi";

/**
 * Live sidebar badge counts. A platform-level read against the shared campaigns
 * endpoint — it does NOT import the promotions feature (FSD: platform ⇏ feature),
 * it just reads the `counts` the list endpoint already returns. The propertyId
 * arg keys the cache so the badge re-scopes on a property switch, and reusing the
 * `Campaign`/`LIST` tag means create/pause/activate refresh it automatically.
 */
interface NavBadges {
  activeCampaigns: number;
}

const navBadgesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNavBadges: build.query<NavBadges, string>({
      query: () => ({ url: "/campaigns", params: { page: 0 } }),
      transformResponse: (raw: { counts?: { active?: number } }) => ({
        activeCampaigns: raw?.counts?.active ?? 0,
      }),
      providesTags: [{ type: "Campaign", id: "LIST" }],
    }),
  }),
});

export const { useGetNavBadgesQuery } = navBadgesApi;
