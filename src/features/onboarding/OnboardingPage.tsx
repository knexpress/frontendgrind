import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveOnboardingProfile, type StrategyProfile } from "../../api/profile";
import { ApiError } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import "./onboarding.css";

type StepDef = {
  key: keyof StrategyProfile;
  title: string;
  placeholder: string;
  textarea?: boolean;
};

const STEPS: StepDef[] = [
  { key: "ownerName", title: "What is your name?", placeholder: "Your full name" },
  { key: "businessName", title: "What is your business name?", placeholder: "Business name" },
  {
    key: "businessType",
    title: "What type of business do you run?",
    placeholder: "Product-based, service-based, food and beverage, online/e-commerce, etc.",
  },
  { key: "primaryOffer", title: "What exactly do you sell?", placeholder: "Main product/service" },
  { key: "marketLocation", title: "Where do you operate?", placeholder: "City, area, and market context" },
  { key: "operatingHours", title: "What are your operating hours?", placeholder: "Days and time windows" },
  { key: "targetCustomer", title: "Who is your target customer?", placeholder: "Workers, students, families, etc." },
  { key: "averagePricePoint", title: "What is your average price point?", placeholder: "Average spend / price range" },
  {
    key: "currentSituation",
    title: "Current situation right now",
    placeholder: "What is currently happening in your business?",
    textarea: true,
  },
  { key: "mainGoal", title: "What is your main goal?", placeholder: "Grow sales, more leads, better retention, etc." },
  { key: "monthlyBudget", title: "What is your monthly marketing budget?", placeholder: "Even zero is okay" },
  {
    key: "attemptedBefore",
    title: "What have you already tried?",
    placeholder: "Ads, referrals, social posting, partnerships, etc.",
    textarea: true,
  },
  { key: "timeline", title: "By when do you want results?", placeholder: "30 days, 90 days, 6 months, etc." },
  {
    key: "seasonalityNotes",
    title: "Any seasonality or local event context?",
    placeholder: "Ramadan, school calendar, payday cycles, local events, etc.",
    textarea: true,
  },
];

const INITIAL: StrategyProfile = {
  ownerName: "",
  businessName: "",
  businessType: "",
  primaryOffer: "",
  marketLocation: "",
  operatingHours: "",
  targetCustomer: "",
  averagePricePoint: "",
  currentSituation: "",
  mainGoal: "",
  monthlyBudget: "",
  attemptedBefore: "",
  timeline: "",
  seasonalityNotes: "",
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
      await saveOnboardingProfile(data);
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
          <p className="onboarding-eyebrow">Setup your strategy profile</p>
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
            placeholder={step.placeholder}
            onChange={(e) => updateValue(e.target.value)}
            rows={4}
            disabled={saving}
          />
        ) : (
          <input
            className="onboarding-input"
            value={currentValue}
            placeholder={step.placeholder}
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

