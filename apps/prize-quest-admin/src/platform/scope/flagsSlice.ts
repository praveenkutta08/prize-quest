import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Module, ModuleKey } from "@/shared/contracts";

type ModuleFlags = Partial<Record<ModuleKey, boolean>>;

interface FlagsState {
  modules: ModuleFlags;
}

const initialState: FlagsState = {
  modules: {},
};

const flagsSlice = createSlice({
  name: "flags",
  initialState,
  reducers: {
    setModules(state, action: PayloadAction<Module[]>) {
      state.modules = action.payload.reduce<ModuleFlags>((acc, m) => {
        acc[m.key] = m.enabled;
        return acc;
      }, {});
    },
  },
});

export const { setModules } = flagsSlice.actions;
export const flagsReducer = flagsSlice.reducer;
