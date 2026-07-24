import { baseApi } from "@/shared/lib/baseApi";
import { PrizeCatalogList, type PrizeCatalogItem } from "../model";

export interface ListPrizesArgs {
  q?: string;
  category?: string;
}

/** Prize catalog data layer (read-only in Session 2; feeds the PrizePicker). */
export const catalogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listPrizes: build.query<PrizeCatalogItem[], ListPrizesArgs | void>({
      query: (args) => ({
        url: "/catalog/prizes",
        params: {
          ...(args?.q ? { q: args.q } : {}),
          ...(args?.category && args.category !== "all" ? { category: args.category } : {}),
        },
      }),
      transformResponse: (raw) => PrizeCatalogList.parse(raw),
      providesTags: ["Catalog"],
    }),
  }),
});

export const { useListPrizesQuery } = catalogApi;
