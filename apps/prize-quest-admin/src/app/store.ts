import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "@/shared/lib/baseApi";
import { authReducer } from "@/platform/auth/authSlice";
import { scopeReducer } from "@/platform/scope/scopeSlice";
import { tenantReducer } from "@/platform/scope/tenantSlice";
import { flagsReducer } from "@/platform/scope/flagsSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    scope: scopeReducer,
    tenant: tenantReducer,
    flags: flagsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

// Enables refetchOnFocus / refetchOnReconnect behaviours for RTK Query.
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
