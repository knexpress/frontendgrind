import { apiJson } from "./http";

export type StrategyProfile = {
  ownerName: string;
  businessType: string;
  marketLocation: string;
  operatingDuration: string;
  staffCount: string;
  monthlyRevenue: string;
  revenueGoal: string;
  goalDeadline: string;
  monthlyBudget: string;
  marketingHistory: string;
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

