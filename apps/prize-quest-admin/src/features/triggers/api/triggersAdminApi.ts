import { baseApi } from "@/shared/lib/baseApi";
import {
  BoundRuleList,
  TriggerDefinition,
  TriggerListResponse,
  type BoundRule,
  type TriggerStatus,
} from "../model";

export interface ListTriggerDefsArgs {
  propertyId: string;
  category?: string;
  status?: string;
  q?: string;
  page?: number;
}

/** The catalog tags any trigger mutation must bust so the Rules EventSelector refreshes. */
const CATALOG_TAGS = [
  { type: "Trigger" as const, id: "LIST" },
  { type: "Trigger" as const, id: "CATALOG" },
];

/**
 * Triggers admin data layer. Mutations invalidate both the trigger list AND the
 * shared `Trigger`/`CATALOG` tag the Session 3 `listTriggers` (EventSelector feed)
 * reads — so a new / renamed / activated trigger appears in the Rules event
 * picker immediately. One store, no fork.
 */
export const triggersAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listTriggerDefs: build.query<TriggerListResponse, ListTriggerDefsArgs>({
      query: ({ category, status, q, page }) => ({
        url: "/triggers-admin",
        params: {
          ...(category && category !== "all" ? { category } : {}),
          ...(status && status !== "all" ? { status } : {}),
          ...(q ? { q } : {}),
          ...(page ? { page } : {}),
        },
      }),
      transformResponse: (raw) => TriggerListResponse.parse(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.rows.map((t) => ({ type: "Trigger" as const, id: t.id })),
              { type: "Trigger" as const, id: "LIST" },
            ]
          : [{ type: "Trigger" as const, id: "LIST" }],
    }),

    getTriggerDef: build.query<TriggerDefinition, string>({
      query: (id) => `/triggers-admin/${id}`,
      transformResponse: (raw) => TriggerDefinition.parse(raw),
      providesTags: (_r, _e, id) => [{ type: "Trigger", id }],
    }),

    getTriggerRules: build.query<BoundRule[], string>({
      query: (id) => `/triggers-admin/${id}/rules`,
      transformResponse: (raw) => BoundRuleList.parse(raw),
      providesTags: (_r, _e, id) => [{ type: "Trigger", id: `rules-${id}` }],
    }),

    createTrigger: build.mutation<TriggerDefinition, Partial<TriggerDefinition>>({
      query: (body) => ({ url: "/triggers-admin", method: "POST", body }),
      transformResponse: (raw) => TriggerDefinition.parse(raw),
      invalidatesTags: CATALOG_TAGS,
    }),

    updateTrigger: build.mutation<
      TriggerDefinition,
      { id: string; body: Partial<TriggerDefinition> }
    >({
      query: ({ id, body }) => ({ url: `/triggers-admin/${id}`, method: "PUT", body }),
      transformResponse: (raw) => TriggerDefinition.parse(raw),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Trigger", id }, ...CATALOG_TAGS],
    }),

    setTriggerStatus: build.mutation<TriggerDefinition, { id: string; status: TriggerStatus }>({
      query: ({ id, status }) => ({
        url: `/triggers-admin/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (raw) => TriggerDefinition.parse(raw),
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          triggersAdminApi.util.updateQueryData("getTriggerDef", id, (draft) => {
            draft.status = status;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: "Trigger", id }, ...CATALOG_TAGS],
    }),
  }),
});

export const {
  useListTriggerDefsQuery,
  useGetTriggerDefQuery,
  useGetTriggerRulesQuery,
  useCreateTriggerMutation,
  useUpdateTriggerMutation,
  useSetTriggerStatusMutation,
} = triggersAdminApi;
