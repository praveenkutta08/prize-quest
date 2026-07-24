import { baseApi } from "@/shared/lib/baseApi";
import {
  ManagedUser,
  RolePermissions,
  RolesResponse,
  UserListResponse,
  type Permission,
  type Role,
  type UserInvite,
  type UserStatus,
  type UserUpdate,
} from "../model";

export interface ListUsersArgs {
  role?: string;
  status?: string;
  q?: string;
  page?: number;
}

/**
 * Users & Roles data layer, injected into baseApi. Tenant-scoped — no
 * X-Property-Id dependence. Optimistic status/role toggles; the self-lockout
 * guard is enforced in MSW and mirrored in the UI.
 */
export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<UserListResponse, ListUsersArgs>({
      query: ({ role, status, q, page }) => ({
        url: "/users",
        params: {
          ...(role && role !== "all" ? { role } : {}),
          ...(status && status !== "all" ? { status } : {}),
          ...(q ? { q } : {}),
          ...(page ? { page } : {}),
        },
      }),
      transformResponse: (raw) => UserListResponse.parse(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.rows.map((u) => ({ type: "User" as const, id: u.id })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    inviteUser: build.mutation<ManagedUser, UserInvite>({
      query: (body) => ({ url: "/users/invite", method: "POST", body }),
      transformResponse: (raw) => ManagedUser.parse(raw),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    updateUser: build.mutation<ManagedUser, { id: string; body: UserUpdate }>({
      query: ({ id, body }) => ({ url: `/users/${id}`, method: "PUT", body }),
      transformResponse: (raw) => ManagedUser.parse(raw),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    setUserStatus: build.mutation<ManagedUser, { id: string; status: UserStatus }>({
      query: ({ id, status }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (raw) => ManagedUser.parse(raw),
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled, getState }) {
        // Optimistically patch every cached users list containing this row.
        const patches = usersApi.util.selectInvalidatedBy(getState(), [{ type: "User", id }]);
        const undos: Array<() => void> = [];
        for (const { originalArgs } of patches) {
          const undo = dispatch(
            usersApi.util.updateQueryData("listUsers", originalArgs, (draft) => {
              const row = draft.rows.find((u) => u.id === id);
              if (row) row.status = status;
            }),
          );
          undos.push(undo.undo);
        }
        try {
          await queryFulfilled;
        } catch {
          undos.forEach((u) => u());
        }
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    resendInvite: build.mutation<{ ok: boolean }, string>({
      query: (id) => ({ url: `/users/${id}/resend-invite`, method: "POST" }),
    }),

    getRoles: build.query<RolesResponse, void>({
      query: () => "/roles",
      transformResponse: (raw) => RolesResponse.parse(raw),
      providesTags: ["Role"],
    }),

    updateRolePermissions: build.mutation<
      RolePermissions,
      { role: Role; permissions: Permission[] }
    >({
      query: ({ role, permissions }) => ({
        url: `/roles/${role}/permissions`,
        method: "PUT",
        body: { permissions },
      }),
      transformResponse: (raw) => RolePermissions.parse(raw),
      async onQueryStarted({ role, permissions }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          usersApi.util.updateQueryData("getRoles", undefined, (draft) => {
            const row = draft.roles.find((r) => r.role === role);
            if (row) row.permissions = permissions;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ["Role"],
    }),
  }),
});

export const {
  useListUsersQuery,
  useInviteUserMutation,
  useUpdateUserMutation,
  useSetUserStatusMutation,
  useResendInviteMutation,
  useGetRolesQuery,
  useUpdateRolePermissionsMutation,
} = usersApi;
