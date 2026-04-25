import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get("access_token");
      if (!accessToken) {
        setStatus("Missing access token. Redirecting to login...");
        await navigate({ to: "/login" });
        return;
      }

      try {
        const me = await authApi.me(accessToken);
        setSession({
          user: me.user,
          accessToken,
          onboardingCompleted: me.onboardingCompleted,
        });
        await navigate({
          to: me.onboardingCompleted ? "/chat" : "/onboarding",
        });
      } catch {
        setStatus("Authentication failed. Redirecting to login...");
        await navigate({ to: "/login" });
      }
    };

    void run();
  }, [navigate, setSession]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">{status}</p>
    </main>
  );
}
