import { apiJson } from "./http";

export type StrategyProfile = {
  ownerName: string;
  businessName: string;
  businessType: string;
  primaryOffer: string;
  marketLocation: string;
  operatingHours: string;
  targetCustomer: string;
  averagePricePoint: string;
  currentSituation: string;
  mainGoal: string;
  monthlyBudget: string;
  attemptedBefore: string;
  timeline: string;
  seasonalityNotes: string;
};

export type OnboardingPayload = {
  completed: boolean;
  profile: StrategyProfile | null;
};

export async function getOnboardingProfile(): Promise<OnboardingPayload> {
  return apiJson("/profile/onboarding", { method: "GET" });
}

export async function saveOnboardingProfile(profile: StrategyProfile): Promise<OnboardingPayload> {
  return apiJson("/profile/onboarding", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

