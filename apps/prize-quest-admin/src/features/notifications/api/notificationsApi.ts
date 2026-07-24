import { baseApi } from "@/shared/lib/baseApi";
import {
  DeliveryListResponse,
  NotificationList,
  NotificationTemplate,
  TemplateList,
  type OperatorNotification,
} from "../model";

export interface ListDeliveriesArgs {
  status?: string;
  channel?: string;
  q?: string;
  page?: number;
}

/** Notifications data layer — tenant-level. Templates CRUD + deliveries + bell feed. */
export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listTemplates: build.query<NotificationTemplate[], void>({
      query: () => "/notif/templates",
      transformResponse: (raw) => TemplateList.parse(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: "NotifTemplate" as const, id: t.id })),
              { type: "NotifTemplate" as const, id: "LIST" },
            ]
          : [{ type: "NotifTemplate" as const, id: "LIST" }],
    }),

    getTemplate: build.query<NotificationTemplate, string>({
      query: () => "/notif/templates",
      transformResponse: (raw, _meta, id) =>
        TemplateList.parse(raw).find((t) => t.id === id) ?? TemplateList.parse(raw)[0],
      providesTags: (_r, _e, id) => [{ type: "NotifTemplate", id }],
    }),

    createTemplate: build.mutation<NotificationTemplate, Partial<NotificationTemplate>>({
      query: (body) => ({ url: "/notif/templates", method: "POST", body }),
      transformResponse: (raw) => NotificationTemplate.parse(raw),
      invalidatesTags: [{ type: "NotifTemplate", id: "LIST" }],
    }),

    updateTemplate: build.mutation<
      NotificationTemplate,
      { id: string; body: Partial<NotificationTemplate> }
    >({
      query: ({ id, body }) => ({ url: `/notif/templates/${id}`, method: "PUT", body }),
      transformResponse: (raw) => NotificationTemplate.parse(raw),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "NotifTemplate", id },
        { type: "NotifTemplate", id: "LIST" },
      ],
    }),

    setTemplateStatus: build.mutation<
      NotificationTemplate,
      { id: string; status: "active" | "draft" }
    >({
      query: ({ id, status }) => ({
        url: `/notif/templates/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (raw) => NotificationTemplate.parse(raw),
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          notificationsApi.util.updateQueryData("listTemplates", undefined, (draft) => {
            const t = draft.find((x) => x.id === id);
            if (t) t.status = status;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: [{ type: "NotifTemplate", id: "LIST" }],
    }),

    listDeliveries: build.query<DeliveryListResponse, ListDeliveriesArgs>({
      query: ({ status, channel, q, page }) => ({
        url: "/notif/deliveries",
        params: {
          ...(status && status !== "all" ? { status } : {}),
          ...(channel && channel !== "all" ? { channel } : {}),
          ...(q ? { q } : {}),
          ...(page ? { page } : {}),
        },
      }),
      transformResponse: (raw) => DeliveryListResponse.parse(raw),
      providesTags: [{ type: "NotifDelivery", id: "LIST" }],
    }),

    listNotifications: build.query<OperatorNotification[], void>({
      query: () => "/notifications",
      transformResponse: (raw) => NotificationList.parse(raw),
      providesTags: ["Notification"],
    }),

    markRead: build.mutation<{ unread: number }, { ids?: string[]; all?: boolean }>({
      query: (body) => ({ url: "/notifications/read", method: "POST", body }),
      async onQueryStarted({ ids, all }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          notificationsApi.util.updateQueryData("listNotifications", undefined, (draft) => {
            for (const n of draft) {
              if (all || (ids && ids.includes(n.id))) n.read = true;
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useListTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useSetTemplateStatusMutation,
  useListDeliveriesQuery,
  useListNotificationsQuery,
  useMarkReadMutation,
} = notificationsApi;
