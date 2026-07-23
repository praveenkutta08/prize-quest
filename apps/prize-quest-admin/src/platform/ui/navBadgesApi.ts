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
    getRulesBadge: build.query<{ activeRules: number }, string>({
      query: () => ({ url: "/rules", params: { page: 0 } }),
      transformResponse: (raw: { counts?: { active?: number } }) => ({
        activeRules: raw?.counts?.active ?? 0,
      }),
      providesTags: [{ type: "Rule", id: "LIST" }],
    }),
    getRewardsBadge: build.query<{ lowStock: number }, string>({
      query: () => ({ url: "/rewards", params: { page: 0 } }),
      transformResponse: (raw: { stats?: { lowStock?: number } }) => ({
        lowStock: raw?.stats?.lowStock ?? 0,
      }),
      providesTags: [{ type: "Reward", id: "LIST" }],
    }),
    getPlayersBadge: build.query<{ totalPlayers: number }, string>({
      query: () => ({ url: "/players", params: { page: 0 } }),
      transformResponse: (raw: { counts?: { all?: number } }) => ({
        totalPlayers: raw?.counts?.all ?? 0,
      }),
      providesTags: [{ type: "Player", id: "LIST" }],
    }),
    getUsersBadge: build.query<{ pending: number }, string>({
      query: () => ({ url: "/users", params: { page: 0 } }),
      transformResponse: (raw: { counts?: { pending?: number } }) => ({
        pending: raw?.counts?.pending ?? 0,
      }),
      providesTags: [{ type: "User", id: "LIST" }],
    }),
    getFulfillmentBadge: build.query<{ pending: number }, string>({
      query: () => ({ url: "/fulfillment", params: { page: 0 } }),
      transformResponse: (raw: { counts?: { pending?: number } }) => ({
        pending: raw?.counts?.pending ?? 0,
      }),
      providesTags: [{ type: "Fulfillment", id: "LIST" }],
    }),
    getNotifBadge: build.query<{ unread: number }, void>({
      query: () => "/notifications",
      transformResponse: (raw: Array<{ read: boolean }>) => ({
        unread: Array.isArray(raw) ? raw.filter((n) => !n.read).length : 0,
      }),
      providesTags: ["Notification"],
    }),
    getTriggersBadge: build.query<{ active: number }, string>({
      query: () => ({ url: "/triggers-admin", params: { page: 0 } }),
      transformResponse: (raw: { counts?: { active?: number } }) => ({
        active: raw?.counts?.active ?? 0,
      }),
      providesTags: [{ type: "Trigger", id: "LIST" }],
    }),
  }),
});

export const {
  useGetNavBadgesQuery,
  useGetRulesBadgeQuery,
  useGetRewardsBadgeQuery,
  useGetPlayersBadgeQuery,
  useGetUsersBadgeQuery,
  useGetFulfillmentBadgeQuery,
  useGetNotifBadgeQuery,
  useGetTriggersBadgeQuery,
} = navBadgesApi;
