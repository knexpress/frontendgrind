import { FormEvent, useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ApiError } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/runtimeConfig";
import { useAuth } from "@/context/AuthContext";
import { RequireGuest } from "@/components/auth/RouteGuards";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const auth = await register({ fullName, email, password });
      await navigate({
        to: auth.onboardingCompleted ? "/chat" : "/onboarding",
      });
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequireGuest>
      <main className="min-h-screen bg-hero px-4 py-16">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-glass p-8 shadow-elegant">
          <h1 className="text-2xl font-semibold">Create your GRIND account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start building your strategy in minutes.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1 block text-sm">Full name</span>
              <input
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-ring/50 focus:ring"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </label>
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
                minLength={8}
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
              {submitting ? "Creating account..." : "Create account"}
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
          <p className="mt-5 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </RequireGuest>
  );
}
