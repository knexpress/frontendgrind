import { FormEvent, useEffect, useMemo, useState } from "react";
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

type StepConfig = {
  title: string;
  description: string;
  field: keyof OnboardingProfile;
  multiline?: boolean;
  placeholder?: string;
};

const steps: StepConfig[] = [
  {
    title: "What should we call you?",
    description: "Your name helps personalize your strategy plan.",
    field: "ownerName",
    placeholder: "e.g. Ali Abdullah",
  },
  {
    title: "What type of business do you run?",
    description: "Include industry and sub-category.",
    field: "businessType",
    placeholder: "e.g. Fashion retail - modest wear",
  },
  {
    title: "Where are you located?",
    description:
      "Country, city, district, and location type (street, mall, market, online-only, home-based).",
    field: "marketLocation",
    multiline: true,
    placeholder: "e.g. UAE, Dubai, Al Quoz, online-only",
  },
  {
    title: "How long have you been operating?",
    description: "Share how old the business is.",
    field: "operatingDuration",
    placeholder: "e.g. 1 year 6 months",
  },
  {
    title: "How many staff do you have, including yourself?",
    description: "A rough number is enough.",
    field: "staffCount",
    placeholder: "e.g. 4",
  },
  {
    title: "What is your current average monthly revenue?",
    description: "Approximate amount is fine.",
    field: "monthlyRevenue",
    placeholder: "e.g. 18,000 AED",
  },
  {
    title: "What is your available monthly marketing budget?",
    description: "Can be zero.",
    field: "monthlyBudget",
    placeholder: "e.g. 2,500 AED",
  },
  {
    title: "How much do you want to increase revenue, and by when?",
    description: "Add your growth target and deadline.",
    field: "revenueGoal",
    placeholder: "e.g. Increase by 40%",
  },
  {
    title: "What marketing have you tried before?",
    description: "Tell us what worked and what did not.",
    field: "marketingHistory",
    multiline: true,
    placeholder:
      "e.g. Instagram ads worked, influencer deals were expensive and low ROI",
  },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const { accessToken, onboardingCompleted, setOnboardingCompleted } =
    useAuth();
  const [form, setForm] = useState<OnboardingProfile>(defaultForm);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const progressLabel = useMemo(
    () => `${stepIndex + 1} / ${steps.length}`,
    [stepIndex],
  );

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

  const canMoveNext = () => {
    if (currentStep.field === "revenueGoal") {
      return form.revenueGoal.trim().length > 0 && form.goalDeadline.trim().length > 0;
    }
    return form[currentStep.field].trim().length > 0;
  };

  const handleNext = () => {
    if (!canMoveNext()) {
      setError("Please fill this answer before continuing.");
      return;
    }
    setError("");
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setError("");
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!accessToken) return;
    if (!canMoveNext()) {
      setError("Please complete this answer before finishing.");
      return;
    }

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
        <div className="mx-auto max-w-2xl rounded-2xl bg-glass p-8 shadow-elegant">
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
            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Step {progressLabel}</span>
                <span>{Math.round(((stepIndex + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>

              <div className="rounded-xl border border-border bg-background/70 p-5">
                <h2 className="text-lg font-semibold">{currentStep.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentStep.description}
                </p>

                {currentStep.field === "revenueGoal" ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Target increase"
                      value={form.revenueGoal}
                      onChange={(v) => updateField("revenueGoal", v)}
                      placeholder={currentStep.placeholder}
                    />
                    <Field
                      label="Target deadline"
                      value={form.goalDeadline}
                      onChange={(v) => updateField("goalDeadline", v)}
                      placeholder="e.g. within 6 months"
                    />
                  </div>
                ) : (
                  <Field
                    label="Your answer"
                    value={form[currentStep.field]}
                    onChange={(v) => updateField(currentStep.field, v)}
                    multiline={currentStep.multiline}
                    placeholder={currentStep.placeholder}
                  />
                )}
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={stepIndex === 0 || submitting}
                  className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium disabled:opacity-50"
                >
                  Back
                </button>
                {isLastStep ? (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {submitting ? "Saving..." : "Finish onboarding"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    Next
                  </button>
                )}
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
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="mt-4 block">
      <span className="mb-1 block text-sm">{label}</span>
      {multiline ? (
        <textarea
          className="h-28 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-ring/50 focus:ring"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
        />
      ) : (
        <input
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-ring/50 focus:ring"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
        />
      )}
    </label>
  );
}
