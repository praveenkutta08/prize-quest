import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Session } from "@/shared/contracts";

export type AuthStatus = "idle" | "authenticating" | "authenticated" | "unauthenticated";

interface AuthState {
  session: Session | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  session: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<Session>) {
      state.session = action.payload;
      state.status = "authenticated";
    },
    setAuthStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload;
    },
    clearSession(state) {
      state.session = null;
      state.status = "unauthenticated";
    },
  },
});

export const { setSession, setAuthStatus, clearSession } = authSlice.actions;
export const authReducer = authSlice.reducer;
