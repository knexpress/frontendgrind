import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";

function FullPageState({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isReady, isAuthenticated } = useAuth();
  if (!isReady) return <FullPageState label="Loading session..." />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
}

export function RequireGuest({ children }: { children: ReactNode }) {
  const { isReady, isAuthenticated } = useAuth();
  if (!isReady) return <FullPageState label="Loading session..." />;
  if (isAuthenticated) return <Navigate to="/chat" />;
  return <>{children}</>;
}

export function RequireOnboardingComplete({
  children,
}: {
  children: ReactNode;
}) {
  const { isReady, isAuthenticated, onboardingCompleted } = useAuth();
  if (!isReady) return <FullPageState label="Loading session..." />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!onboardingCompleted) return <Navigate to="/onboarding" />;
  return <>{children}</>;
}
