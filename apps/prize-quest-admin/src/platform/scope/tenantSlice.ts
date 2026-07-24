import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TenantContext } from "@/shared/contracts";

interface TenantState {
  context: TenantContext | null;
}

const initialState: TenantState = {
  context: null,
};

const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    setTenantContext(state, action: PayloadAction<TenantContext>) {
      state.context = action.payload;
    },
  },
});

export const { setTenantContext } = tenantSlice.actions;
export const tenantReducer = tenantSlice.reducer;
