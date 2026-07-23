import { baseApi } from "@/shared/lib/baseApi";
import {
  Player,
  PlayerActivityResponse,
  PlayerCampaignList,
  PlayerListResponse,
  PlayerRewardList,
  SegmentInfoList,
  type PlayerActivity,
  type PlayerCampaignRef,
  type PlayerRewardRef,
  type PointsAdjust,
  type SegmentInfo,
} from "../model";

export interface ListPlayersArgs {
  propertyId: string;
  segment?: string;
  tier?: string;
  status?: string;
  q?: string;
  sort?: string;
  page?: number;
}

interface ActivityArgs {
  id: string;
  cursor?: string;
}

/**
 * Players data layer, injected into baseApi. Read-mostly; the single mutation is
 * an optimistic points adjustment. Activity is cursor-paginated for the profile's
 * infinite-scroll feed. Components read only through these hooks.
 */
export const playersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listPlayers: build.query<PlayerListResponse, ListPlayersArgs>({
      query: ({ segment, tier, status, q, sort, page }) => ({
        url: "/players",
        params: {
          ...(segment && segment !== "all" ? { segment } : {}),
          ...(tier && tier !== "all" ? { tier } : {}),
          ...(status && status !== "all" ? { status } : {}),
          ...(q ? { q } : {}),
          ...(sort ? { sort } : {}),
          ...(page ? { page } : {}),
        },
      }),
      transformResponse: (raw) => PlayerListResponse.parse(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.rows.map((p) => ({ type: "Player" as const, id: p.id })),
              { type: "Player" as const, id: "LIST" },
            ]
          : [{ type: "Player" as const, id: "LIST" }],
    }),

    getPlayer: build.query<Player, string>({
      query: (id) => `/players/${id}`,
      transformResponse: (raw) => Player.parse(raw),
      providesTags: (_r, _e, id) => [{ type: "Player", id }],
    }),

    getPlayerActivity: build.query<PlayerActivityResponse, ActivityArgs>({
      query: ({ id, cursor }) => ({
        url: `/players/${id}/activity`,
        params: { ...(cursor ? { cursor } : {}) },
      }),
      transformResponse: (raw) => PlayerActivityResponse.parse(raw),
      // Infinite scroll: one cache entry per player, pages merged in order.
      serializeQueryArgs: ({ queryArgs }) => ({ id: queryArgs.id }),
      merge: (current, incoming) => {
        const seen = new Set(current.rows.map((r: PlayerActivity) => r.id));
        current.rows.push(...incoming.rows.filter((r) => !seen.has(r.id)));
        current.nextCursor = incoming.nextCursor;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      providesTags: (_r, _e, { id }) => [{ type: "Player", id: `activity-${id}` }],
    }),

    getPlayerRewards: build.query<PlayerRewardRef[], string>({
      query: (id) => `/players/${id}/rewards`,
      transformResponse: (raw) => PlayerRewardList.parse(raw),
      providesTags: (_r, _e, id) => [{ type: "Player", id: `rewards-${id}` }],
    }),

    getPlayerCampaigns: build.query<PlayerCampaignRef[], string>({
      query: (id) => `/players/${id}/campaigns`,
      transformResponse: (raw) => PlayerCampaignList.parse(raw),
      providesTags: (_r, _e, id) => [{ type: "Player", id: `campaigns-${id}` }],
    }),

    listSegments: build.query<SegmentInfo[], string>({
      query: () => "/segments",
      transformResponse: (raw) => SegmentInfoList.parse(raw),
      providesTags: ["Segment"],
    }),

    adjustPoints: build.mutation<Player, { id: string; body: PointsAdjust }>({
      query: ({ id, body }) => ({ url: `/players/${id}/points`, method: "POST", body }),
      transformResponse: (raw) => Player.parse(raw),
      // Optimistic balance bump on the detail; roll back on failure.
      async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          playersApi.util.updateQueryData("getPlayer", id, (draft) => {
            draft.pointsBalance = Math.max(0, draft.pointsBalance + body.delta);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: "Player", id }],
    }),
  }),
});

export const {
  useListPlayersQuery,
  useGetPlayerQuery,
  useGetPlayerActivityQuery,
  useGetPlayerRewardsQuery,
  useGetPlayerCampaignsQuery,
  useListSegmentsQuery,
  useAdjustPointsMutation,
} = playersApi;
