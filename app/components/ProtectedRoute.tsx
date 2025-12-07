import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { isAuthenticated, getCurrentUser } from "~/lib/auth";
import type { UserType } from "~/lib/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: UserType[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedUserTypes,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check authentication
    if (!isAuthenticated()) {
      navigate(redirectTo, { replace: true });
      return;
    }

    // Check user type permissions
    if (allowedUserTypes && allowedUserTypes.length > 0) {
      const user = getCurrentUser();
      if (!user || !allowedUserTypes.includes(user.user_type)) {
        navigate("/unauthorized", { replace: true });
      }
    }
  }, [navigate, allowedUserTypes, redirectTo]);

  // Don't render until auth check is complete
  if (typeof window === 'undefined') {
    return null;
  }

  if (!isAuthenticated()) {
    return null;
  }

  if (allowedUserTypes && allowedUserTypes.length > 0) {
    const user = getCurrentUser();
    if (!user || !allowedUserTypes.includes(user.user_type)) {
      return null;
    }
  }

  return <>{children}</>;
}
