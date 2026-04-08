import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequireOnboarding({ children }: { children: JSX.Element }) {
  const auth = useAuth();

  if (auth.status !== "authenticated") {
    return <Navigate to="/auth/login" replace />;
  }

  if (!auth.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

