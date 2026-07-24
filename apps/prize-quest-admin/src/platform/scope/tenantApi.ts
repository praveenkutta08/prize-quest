import { baseApi } from "@/shared/lib/baseApi";
import { TenantContext } from "@/shared/contracts";

/** Tenant context endpoint. Validates the payload against the Zod schema. */
export const tenantApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTenantContext: build.query<TenantContext, string | void>({
      query: (tenantId) => ({
        url: "/tenant/context",
        params: tenantId ? { tenant: tenantId } : undefined,
      }),
      transformResponse: (raw) => TenantContext.parse(raw),
      providesTags: ["Tenant"],
    }),
  }),
});

export const { useGetTenantContextQuery } = tenantApi;
