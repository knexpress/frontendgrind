import { apiJson, setAccessToken } from "./http";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  provider: "local" | "google";
  avatarUrl: string;
};

type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

function applyToken(accessToken: string) {
  setAccessToken(accessToken);
}

export async function register(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  const data = await apiJson<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  applyToken(data.accessToken);
  return data.user;
}

export async function login(input: { email: string; password: string }): Promise<AuthUser> {
  const data = await apiJson<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  applyToken(data.accessToken);
  return data.user;
}

export async function refreshSession(): Promise<AuthUser> {
  const data = await apiJson<AuthResponse>("/auth/refresh", { method: "POST" });
  applyToken(data.accessToken);
  return data.user;
}

export async function logout(): Promise<void> {
  await apiJson<unknown>("/auth/logout", { method: "POST" });
  setAccessToken(null);
}

export function loginWithGoogle(baseApi: string) {
  window.location.href = `${baseApi.replace(/\/$/, "")}/auth/google`;
}

export function completeGoogleLogin(accessToken: string) {
  setAccessToken(accessToken);
}

