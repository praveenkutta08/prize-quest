import { baseApi } from "@/shared/lib/baseApi";
import {
  Property,
  TenantContext,
  type Module,
  type TenantBrand,
  type TenantTheme,
  type TenantVendor,
} from "@/shared/contracts";

/**
 * Settings data layer. Tenant mutations invalidate the shared **`Tenant`** tag —
 * the same tag the shell's boot loader / AppShell subscription reads — so any
 * Save re-drives the sidebar, brand lockup, theme, and PropertySwitcher with no
 * extra wiring. Property CRUD invalidates **both** `Property` and `Tenant`.
 */
export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateBrand: build.mutation<TenantContext, TenantBrand>({
      query: (brand) => ({ url: "/tenant/brand", method: "PUT", body: { brand } }),
      transformResponse: (raw) => TenantContext.parse(raw),
      invalidatesTags: ["Tenant"],
    }),

    updateTheme: build.mutation<TenantContext, TenantTheme>({
      query: (theme) => ({ url: "/tenant/theme", method: "PUT", body: { theme } }),
      transformResponse: (raw) => TenantContext.parse(raw),
      invalidatesTags: ["Tenant"],
    }),

    updateModules: build.mutation<TenantContext, Module[]>({
      query: (modules) => ({ url: "/tenant/modules", method: "PUT", body: { modules } }),
      transformResponse: (raw) => TenantContext.parse(raw),
      invalidatesTags: ["Tenant"],
    }),

    updateCompliance: build.mutation<
      TenantContext,
      { jurisdiction: string; jurisdictionLabel: string; budgetCapEnforced: boolean }
    >({
      query: (compliance) => ({
        url: "/tenant/compliance",
        method: "PUT",
        body: { compliance },
      }),
      transformResponse: (raw) => TenantContext.parse(raw),
      invalidatesTags: ["Tenant"],
    }),

    updateVendor: build.mutation<TenantContext, TenantVendor>({
      query: (vendor) => ({ url: "/tenant/vendor", method: "PUT", body: { vendor } }),
      transformResponse: (raw) => TenantContext.parse(raw),
      invalidatesTags: ["Tenant"],
    }),

    listProperties: build.query<Property[], void>({
      query: () => "/properties",
      transformResponse: (raw) => Property.array().parse(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: "Property" as const, id: p.id })),
              { type: "Property" as const, id: "LIST" },
            ]
          : [{ type: "Property" as const, id: "LIST" }],
    }),

    createProperty: build.mutation<Property, Omit<Property, "id">>({
      query: (property) => ({ url: "/properties", method: "POST", body: { property } }),
      transformResponse: (raw) => Property.parse(raw),
      invalidatesTags: [{ type: "Property", id: "LIST" }, "Tenant"],
    }),

    updateProperty: build.mutation<Property, Property>({
      query: (property) => ({
        url: `/properties/${property.id}`,
        method: "PUT",
        body: { property },
      }),
      transformResponse: (raw) => Property.parse(raw),
      invalidatesTags: (_r, _e, p) => [
        { type: "Property", id: p.id },
        { type: "Property", id: "LIST" },
        "Tenant",
      ],
    }),

    deleteProperty: build.mutation<{ id: string }, string>({
      query: (id) => ({ url: `/properties/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Property", id: "LIST" }, "Tenant"],
    }),
  }),
});

export const {
  useUpdateBrandMutation,
  useUpdateThemeMutation,
  useUpdateModulesMutation,
  useUpdateComplianceMutation,
  useUpdateVendorMutation,
  useListPropertiesQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} = settingsApi;
