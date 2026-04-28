import { getApiBaseUrl } from "./runtimeConfig";

export type PublicUser = {
  id: string;
  fullName: string;
  email: string;
  provider: string;
  avatarUrl: string;
  mobileNumber: string;
  dateOfBirth: string;
};

export type AuthPayload = {
  user: PublicUser;
  accessToken: string;
  onboardingCompleted: boolean;
};

export type OnboardingProfile = {
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
  profile: OnboardingProfile | null;
};

export type ModelOption = {
  alias: string;
  description: string;
};

export type ConversationListItem = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessagePreview: string;
};

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; url: string; snippet?: string }>;
  createdAt?: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
};

export type AssistantReply = {
  role: "assistant";
  content: string;
  model?: string;
  sources?: Array<{ title: string; url: string; snippet?: string }>;
};

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = getApiBaseUrl();

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  accessToken?: string | null;
  body?: unknown;
  formData?: FormData;
};

async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers();

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const isFormData = Boolean(options.formData);
  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    credentials: "include",
    body:
      options.formData ??
      (options.body ? JSON.stringify(options.body) : undefined),
  });

  if (response.status === 204) {
    return null as T;
  }

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    details?: unknown;
  };

  if (!response.ok) {
    throw new ApiError(
      data.error ?? "Request failed",
      response.status,
      data.details,
    );
  }

  return data as T;
}

export const authApi = {
  register(payload: { fullName: string; email: string; password: string }) {
    return apiFetch<AuthPayload>("/auth/register", {
      method: "POST",
      body: payload,
    });
  },
  login(payload: { email: string; password: string }) {
    return apiFetch<AuthPayload>("/auth/login", {
      method: "POST",
      body: payload,
    });
  },
  refresh() {
    return apiFetch<AuthPayload>("/auth/refresh", { method: "POST" });
  },
  logout() {
    return apiFetch<void>("/auth/logout", { method: "POST" });
  },
  me(accessToken: string) {
    return apiFetch<{ user: PublicUser; onboardingCompleted: boolean }>(
      "/auth/me",
      { accessToken },
    );
  },
  updateProfile(
    accessToken: string,
    payload: { fullName: string; mobileNumber?: string; dateOfBirth?: string },
  ) {
    return apiFetch<{ user: PublicUser }>("/auth/profile", {
      method: "PATCH",
      accessToken,
      body: payload,
    });
  },
  uploadAvatar(accessToken: string, file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiFetch<{ user: PublicUser }>("/auth/profile/avatar", {
      method: "POST",
      accessToken,
      formData,
    });
  },
  googleToken(payload: { credential: string }) {
    return apiFetch<AuthPayload>("/auth/google/token", {
      method: "POST",
      body: payload,
    });
  },
};

export const profileApi = {
  getOnboarding(accessToken: string) {
    return apiFetch<OnboardingPayload>("/profile/onboarding", { accessToken });
  },
  putOnboarding(accessToken: string, payload: OnboardingProfile) {
    return apiFetch<OnboardingPayload>("/profile/onboarding", {
      method: "PUT",
      accessToken,
      body: payload,
    });
  },
};

export const chatApi = {
  getModels(accessToken: string) {
    return apiFetch<{ items: ModelOption[] }>("/ai/models", { accessToken });
  },
  listConversations(accessToken: string) {
    return apiFetch<{ items: ConversationListItem[] }>("/conversations", {
      accessToken,
    });
  },
  createConversation(accessToken: string) {
    return apiFetch<{ id: string; createdAt: string }>("/conversations", {
      method: "POST",
      accessToken,
    });
  },
  getConversation(accessToken: string, id: string) {
    return apiFetch<Conversation>(`/conversations/${id}`, { accessToken });
  },
  sendMessage(
    accessToken: string,
    id: string,
    payload: {
      content?: string;
      model?: string;
      responseStyle?: "auto" | "short" | "bullet" | "detailed";
    },
    image?: File | null,
  ) {
    if (image) {
      const formData = new FormData();
      formData.append("content", payload.content ?? "");
      if (payload.model) formData.append("model", payload.model);
      if (payload.responseStyle)
        formData.append("responseStyle", payload.responseStyle);
      formData.append("image", image);
      return apiFetch<AssistantReply>(`/conversations/${id}/messages`, {
        method: "POST",
        accessToken,
        formData,
      });
    }

    return apiFetch<AssistantReply>(`/conversations/${id}/messages`, {
      method: "POST",
      accessToken,
      body: payload,
    });
  },
  editMessage(
    accessToken: string,
    id: string,
    messageIndex: number,
    payload: {
      content?: string;
      model?: string;
      responseStyle?: "auto" | "short" | "bullet" | "detailed";
    },
  ) {
    return apiFetch<AssistantReply>(
      `/conversations/${id}/messages/${messageIndex}`,
      {
        method: "PATCH",
        accessToken,
        body: payload,
      },
    );
  },
};
