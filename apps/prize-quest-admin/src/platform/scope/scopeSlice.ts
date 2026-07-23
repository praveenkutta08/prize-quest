import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** Sentinel for the cross-property roll-up. */
export const ALL_PROPERTIES = "all";

interface ScopeState {
  tenantId: string | null;
  /** `null` until a session resolves; "all" is the roll-up. */
  activePropertyId: string | null;
}

const initialState: ScopeState = {
  tenantId: null,
  activePropertyId: null,
};

const scopeSlice = createSlice({
  name: "scope",
  initialState,
  reducers: {
    setTenantId(state, action: PayloadAction<string>) {
      state.tenantId = action.payload;
    },
    setActiveProperty(state, action: PayloadAction<string>) {
      state.activePropertyId = action.payload;
    },
  },
});

export const { setTenantId, setActiveProperty } = scopeSlice.actions;
export const scopeReducer = scopeSlice.reducer;
