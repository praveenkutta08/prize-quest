import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { BootSplash } from "@/platform/ui/BootSplash";
import { setActiveProperty } from "@/platform/scope";
import { setSession } from "./authSlice";
import { useGetSessionQuery } from "./authApi";

/**
 * Route guard. If there's no session in the store, it resolves one via
 * `GET /api/auth/session` (RTK Query) exactly once; a 401 sends the operator to
 * /login, preserving the intended destination.
 */
export function RequireAuth() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const session = useAppSelector((s) => s.auth.session);
  const activePropertyId = useAppSelector((s) => s.scope.activePropertyId);

  const { data, isLoading, isError } = useGetSessionQuery(undefined, { skip: Boolean(session) });

  useEffect(() => {
    if (data && !session) {
      dispatch(setSession(data));
      // Resume path (page refresh): seed scope from the session's default property.
      if (!activePropertyId) dispatch(setActiveProperty(data.defaultPropertyId));
    }
  }, [data, session, activePropertyId, dispatch]);

  if (session) return <Outlet />;
  if (isLoading) return <BootSplash label="Resuming session…" />;
  if (data) return <Outlet />;
  if (isError) return <Navigate to="/login" replace state={{ from: location }} />;
  return <BootSplash label="Resuming session…" />;
}
