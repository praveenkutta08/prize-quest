import { z } from "zod";
import { baseApi } from "@/shared/lib/baseApi";

/**
 * A players-local read of active campaigns for the "Add to campaign" picker.
 * FSD forbids importing `features/promotions`, so this hits the existing
 * `/api/campaigns` mock directly and projects just `{ id, name }` — no shape
 * dependency on the promotions slice.
 */
const CampaignOption = z.object({ id: z.string(), name: z.string() });
export type CampaignOption = z.infer<typeof CampaignOption>;

const CampaignsRaw = z.object({
  rows: z.array(z.object({ id: z.string(), name: z.string(), status: z.string() })),
});

export const campaignPickerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listActiveCampaignOptions: build.query<CampaignOption[], string>({
      query: () => ({ url: "/campaigns", params: { status: "active" } }),
      transformResponse: (raw) =>
        CampaignsRaw.parse(raw).rows.map((c) => ({ id: c.id, name: c.name })),
      providesTags: [{ type: "Campaign", id: "LIST" }],
    }),
  }),
});

export const { useListActiveCampaignOptionsQuery } = campaignPickerApi;
