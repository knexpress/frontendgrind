import { FormEvent, useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { RequireGuest } from "@/components/auth/RouteGuards";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const apiBaseUrl = useMemo(
    () =>
      ((import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
        /\/$/,
        "",
      ) ?? "http://localhost:4000/api/v1"),
    [],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const auth = await login({ email, password });
      await navigate({
        to: auth.onboardingCompleted ? "/chat" : "/onboarding",
      });
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequireGuest>
      <main className="min-h-screen bg-hero px-4 py-16">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-glass p-8 shadow-elegant">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold">Welcome to GRIND</h1>
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-xs text-muted-foreground transition hover:bg-accent/40 hover:text-foreground"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Access your AI marketing advisor.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1 block text-sm">Email</span>
              <input
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-ring/50 focus:ring"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm">Password</span>
              <input
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-ring/50 focus:ring"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <button
              disabled={submitting}
              className="w-full rounded-xl bg-gold-gradient px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              type="submit"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <a
            href={`${apiBaseUrl}/auth/google`}
            className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/[0.03]"
          >
            Continue with Google
          </a>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-primary hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </main>
    </RequireGuest>
  );
}
