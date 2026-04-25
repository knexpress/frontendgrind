import { FormEvent, useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RouteGuards";
import { useAuth } from "@/context/AuthContext";
import { ApiError, profileApi, type OnboardingProfile } from "@/lib/api";

const defaultForm: OnboardingProfile = {
  ownerName: "",
  businessType: "",
  marketLocation: "",
  operatingDuration: "",
  staffCount: "",
  monthlyRevenue: "",
  revenueGoal: "",
  goalDeadline: "",
  monthlyBudget: "",
  marketingHistory: "",
};

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const { accessToken, onboardingCompleted, setOnboardingCompleted } =
    useAuth();
  const [form, setForm] = useState<OnboardingProfile>(defaultForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (onboardingCompleted) {
      void navigate({ to: "/chat" });
      return;
    }

    const load = async () => {
      if (!accessToken) return;
      try {
        const data = await profileApi.getOnboarding(accessToken);
        if (data.profile) {
          setForm(data.profile);
        }
      } catch {
        // keep empty defaults if no profile
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [accessToken, onboardingCompleted, navigate]);

  const updateField = (key: keyof OnboardingProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!accessToken) return;

    setError("");
    setSubmitting(true);
    try {
      await profileApi.putOnboarding(accessToken, form);
      setOnboardingCompleted(true);
      await navigate({ to: "/chat" });
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError("Unable to save onboarding profile.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequireAuth>
      <main className="min-h-screen bg-hero px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl bg-glass p-8 shadow-elegant">
          <h1 className="text-2xl font-semibold">
            Tell GRIND about your business
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This helps GRIND give grounded recommendations, not generic advice.
          </p>
          {loading ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Loading onboarding profile...
            </p>
          ) : (
            <form
              className="mt-6 grid gap-4 md:grid-cols-2"
              onSubmit={handleSubmit}
            >
              <Field
                label="Owner name"
                value={form.ownerName}
                onChange={(v) => updateField("ownerName", v)}
              />
              <Field
                label="Business type"
                value={form.businessType}
                onChange={(v) => updateField("businessType", v)}
              />
              <Field
                label="Market location"
                value={form.marketLocation}
                onChange={(v) => updateField("marketLocation", v)}
              />
              <Field
                label="Operating duration"
                value={form.operatingDuration}
                onChange={(v) => updateField("operatingDuration", v)}
              />
              <Field
                label="Staff count"
                value={form.staffCount}
                onChange={(v) => updateField("staffCount", v)}
              />
              <Field
                label="Monthly revenue"
                value={form.monthlyRevenue}
                onChange={(v) => updateField("monthlyRevenue", v)}
              />
              <Field
                label="Revenue goal"
                value={form.revenueGoal}
                onChange={(v) => updateField("revenueGoal", v)}
              />
              <Field
                label="Goal deadline"
                value={form.goalDeadline}
                onChange={(v) => updateField("goalDeadline", v)}
              />
              <Field
                label="Monthly budget"
                value={form.monthlyBudget}
                onChange={(v) => updateField("monthlyBudget", v)}
              />

              <label className="md:col-span-2">
                <span className="mb-1 block text-sm">Marketing history</span>
                <textarea
                  className="h-28 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-ring/50 focus:ring"
                  value={form.marketingHistory}
                  onChange={(e) =>
                    updateField("marketingHistory", e.target.value)
                  }
                  required
                />
              </label>

              {error ? (
                <p className="md:col-span-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save and continue"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </RequireAuth>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label>
      <span className="mb-1 block text-sm">{label}</span>
      <input
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-ring/50 focus:ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </label>
  );
}
