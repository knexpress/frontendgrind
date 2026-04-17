import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveOnboardingProfile, type StrategyProfile } from "../../api/profile";
import { ApiError } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import "./onboarding.css";

type StepOption = {
  value: string;
  label: string;
};

type StepDef = {
  key: keyof StrategyProfile;
  title: string;
  placeholder?: string;
  textarea?: boolean;
  options?: StepOption[];
  allowCustom?: boolean;
};

const STEPS: StepDef[] = [
  { key: "businessName", title: "What is your business name?", placeholder: "Business name" },
  {
    key: "businessType",
    title: "What type of business do you run?",
    options: [
      { value: "Product-based", label: "Product-based" },
      { value: "Service-based", label: "Service-based" },
      { value: "Food and beverage", label: "Food and beverage" },
      { value: "Online/e-commerce", label: "Online/e-commerce" },
    ],
    allowCustom: true,
  },
  { key: "primaryOffer", title: "What do you mainly sell?", placeholder: "Main product or service" },
  { key: "marketLocation", title: "Where do you operate?", placeholder: "City/area and market context" },
  {
    key: "mainGoal",
    title: "What is your immediate goal?",
    options: [
      { value: "Grow sales", label: "Grow sales" },
      { value: "Get more leads", label: "Get more leads" },
      { value: "Improve retention", label: "Improve retention" },
      { value: "Launch something new", label: "Launch something new" },
    ],
    allowCustom: true,
  },
  {
    key: "monthlyBudget",
    title: "What is your monthly marketing budget?",
    options: [
      { value: "0 to 500", label: "0 to 500" },
      { value: "500 to 2,000", label: "500 to 2,000" },
      { value: "2,000 to 5,000", label: "2,000 to 5,000" },
      { value: "5,000+", label: "5,000+" },
    ],
    allowCustom: true,
  },
  {
    key: "targetCustomer",
    title: "Who is your main customer?",
    options: [
      { value: "Students", label: "Students" },
      { value: "Working professionals", label: "Working professionals" },
      { value: "Families", label: "Families" },
      { value: "Mixed audience", label: "Mixed audience" },
    ],
    allowCustom: true,
  },
  {
    key: "timeline",
    title: "By when do you want to see measurable results?",
    options: [
      { value: "30 days", label: "30 days" },
      { value: "60 to 90 days", label: "60 to 90 days" },
      { value: "3 to 6 months", label: "3 to 6 months" },
      { value: "Long-term", label: "Long-term" },
    ],
    allowCustom: true,
  },
  {
    key: "currentSituation",
    title: "Anything important GRIND should know before giving your first plan?",
    placeholder: "Share what is currently happening and any constraints you have.",
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
  const [choiceDraft, setChoiceDraft] = useState("");

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

  useEffect(() => {
    if (!step.options || !step.allowCustom) {
      setChoiceDraft("");
      return;
    }
    const selected = String(currentValue ?? "");
    const inOptions = step.options.some((opt) => opt.value === selected);
    setChoiceDraft(inOptions ? "" : selected);
  }, [step, currentValue]);

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
        businessName: String(data.businessName).trim(),
        businessType: String(data.businessType).trim(),
        primaryOffer: String(data.primaryOffer).trim(),
        marketLocation: String(data.marketLocation).trim(),
        operatingHours: "Not provided",
        targetCustomer: String(data.targetCustomer).trim(),
        averagePricePoint: "Not provided",
        currentSituation: String(data.currentSituation).trim(),
        mainGoal: String(data.mainGoal).trim(),
        monthlyBudget: String(data.monthlyBudget).trim(),
        attemptedBefore: "Not provided",
        timeline: String(data.timeline).trim(),
        seasonalityNotes: "Not provided",
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

        {step.options ? (
          <div className="onboarding-options">
            {step.options.map((opt) => {
              const selected = currentValue === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`onboarding-option${selected ? " onboarding-option--selected" : ""}`}
                  onClick={() => updateValue(opt.value)}
                  disabled={saving}
                >
                  {opt.label}
                </button>
              );
            })}
            {step.allowCustom && (
              <input
                className="onboarding-input"
                value={choiceDraft}
                placeholder="Or type a custom answer"
                onChange={(e) => {
                  const v = e.target.value;
                  setChoiceDraft(v);
                  updateValue(v);
                }}
                disabled={saving}
              />
            )}
          </div>
        ) : step.textarea ? (
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

