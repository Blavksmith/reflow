import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";

type AuthRedirectState = {
  authRequired: true;
  from: string;
};

export function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    const state: AuthRedirectState = { authRequired: true, from };
    return <Navigate to="/dashboard" replace state={state} />;
  }

  return <Outlet />;
}
