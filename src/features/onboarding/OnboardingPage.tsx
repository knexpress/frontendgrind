import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveOnboardingProfile, type StrategyProfile } from "../../api/profile";
import { ApiError } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import "./onboarding.css";

type StepDef = {
  key: keyof StrategyProfile;
  title: string;
  placeholder?: string;
  textarea?: boolean;
};

const STEPS: StepDef[] = [
  {
    key: "businessType",
    title: "What type of business do you run? (Industry and sub-category)",
    placeholder: "Example: Software agency - AI automation",
  },
  {
    key: "marketLocation",
    title:
      "Where are you located? (Country, city, district, and specific location type - street corner, mall, market, online-only, home-based)",
    placeholder: "Example: UAE, Dubai, Al Quoz, online-first",
  },
  { key: "operatingDuration", title: "How long have you been operating?", placeholder: "Example: 1 year 3 months" },
  { key: "staffCount", title: "How many staff do you have, including yourself?", placeholder: "Example: 4" },
  {
    key: "monthlyRevenue",
    title: "What is your current average monthly revenue? (Approximate is fine)",
    placeholder: "Example: AED 18,000",
  },
  {
    key: "revenueGoal",
    title: "How much do you want to increase it?",
    placeholder: "Example: +40% monthly revenue increase",
  },
  { key: "goalDeadline", title: "By when do you want to achieve this increase?", placeholder: "Example: Within 4 months" },
  {
    key: "monthlyBudget",
    title: "What is your available monthly marketing budget? (Can be zero)",
    placeholder: "Example: 0 or AED 2,500",
  },
  {
    key: "marketingHistory",
    title: "What marketing have you tried before? What worked? What did not?",
    placeholder: "Mention channels, campaigns, and outcomes.",
    textarea: true,
  },
];

const INITIAL: StrategyProfile = {
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

export function OnboardingPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [data, setData] = useState<StrategyProfile>({
    ...INITIAL,
    ownerName: auth.user?.fullName ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[index]!;
  const currentValue = data[step.key];
  const isLast = index === STEPS.length - 1;

  const progress = useMemo(() => Math.round(((index + 1) / STEPS.length) * 100), [index]);

  useEffect(() => {
    if (auth.onboardingCompleted) {
      navigate("/chat", { replace: true });
    }
  }, [auth.onboardingCompleted, navigate]);

  function updateValue(value: string) {
    setData((prev) => ({ ...prev, [step.key]: value }));
  }

  async function goNext() {
    if (!String(currentValue).trim()) return;
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const ownerName = auth.user?.fullName?.trim() || "Not provided";
      await saveOnboardingProfile({
        ownerName,
        businessType: String(data.businessType).trim(),
        marketLocation: String(data.marketLocation).trim(),
        operatingDuration: String(data.operatingDuration).trim(),
        staffCount: String(data.staffCount).trim(),
        monthlyRevenue: String(data.monthlyRevenue).trim(),
        revenueGoal: String(data.revenueGoal).trim(),
        goalDeadline: String(data.goalDeadline).trim(),
        monthlyBudget: String(data.monthlyBudget).trim(),
        marketingHistory: String(data.marketingHistory).trim(),
      });
      auth.markOnboardingCompleted();
      navigate("/chat", { replace: true });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save onboarding");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="onboarding-page">
      <section className="onboarding-card">
        <div className="onboarding-head">
          <p className="onboarding-eyebrow">Set up your strategy profile</p>
          <h1 className="onboarding-title">Question {index + 1} of {STEPS.length}</h1>
          <div className="onboarding-progress">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <h2 className="onboarding-question">{step.title}</h2>

        {step.textarea ? (
          <textarea
            className="onboarding-input onboarding-input--textarea"
            value={currentValue}
            placeholder={step.placeholder ?? ""}
            onChange={(e) => updateValue(e.target.value)}
            rows={4}
            disabled={saving}
          />
        ) : (
          <input
            className="onboarding-input"
            value={currentValue}
            placeholder={step.placeholder ?? ""}
            onChange={(e) => updateValue(e.target.value)}
            disabled={saving}
          />
        )}

        {error ? <p className="onboarding-error">{error}</p> : null}

        <div className="onboarding-actions">
          <button
            type="button"
            className="onboarding-btn onboarding-btn--ghost"
            disabled={index === 0 || saving}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            Back
          </button>
          <button
            type="button"
            className="onboarding-btn onboarding-btn--primary"
            disabled={!String(currentValue).trim() || saving}
            onClick={() => void goNext()}
          >
            {isLast ? (saving ? "Saving..." : "Finish and start chat") : "Next"}
          </button>
        </div>
      </section>
    </div>
  );
}

