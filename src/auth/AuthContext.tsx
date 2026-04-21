import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  completeGoogleLogin,
  fetchMe,
  login,
  loginWithGoogleCredential,
  loginWithGoogle,
  logout,
  refreshSession,
  register,
  type AuthUser,
} from "../api/auth";
import { apiUrl } from "../api/config";
import { getStoredAccessToken, setAccessToken } from "../api/http";

type AuthStatus = "loading" | "authenticated" | "guest";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  onboardingCompleted: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  startGoogleLogin: () => void;
  loginWithGoogleCredential: (credential: string) => Promise<void>;
  completeGoogleCallback: (accessToken: string) => Promise<void>;
  markOnboardingCompleted: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function init() {
      const persistedToken = getStoredAccessToken();
      if (persistedToken) {
        setAccessToken(persistedToken);
      }
      try {
        const session = await refreshSession();
        if (!mounted) return;
        setUser(session.user);
        setOnboardingCompleted(session.onboardingCompleted);
        setStatus("authenticated");
      } catch {
        if (!mounted) return;
        if (persistedToken) {
          try {
            const session = await fetchMe();
            if (!mounted) return;
            setUser(session.user);
            setOnboardingCompleted(session.onboardingCompleted);
            setStatus("authenticated");
            return;
          } catch {
            // fallback to guest below
          }
        }
        setAccessToken(null);
        setUser(null);
        setOnboardingCompleted(false);
        setStatus("guest");
      }
    }
    void init();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      onboardingCompleted,
      async login(email: string, password: string) {
        const session = await login({ email, password });
        setUser(session.user);
        setOnboardingCompleted(session.onboardingCompleted);
        setStatus("authenticated");
      },
      async register(fullName: string, email: string, password: string) {
        const session = await register({ fullName, email, password });
        setUser(session.user);
        setOnboardingCompleted(session.onboardingCompleted);
        setStatus("authenticated");
      },
      async logout() {
        await logout();
        setUser(null);
        setOnboardingCompleted(false);
        setStatus("guest");
      },
      startGoogleLogin() {
        loginWithGoogle(apiUrl(""));
      },
      async loginWithGoogleCredential(credential: string) {
        const session = await loginWithGoogleCredential(credential);
        setUser(session.user);
        setOnboardingCompleted(session.onboardingCompleted);
        setStatus("authenticated");
      },
      async completeGoogleCallback(accessToken: string) {
        completeGoogleLogin(accessToken);
        const session = await refreshSession();
        setUser(session.user);
        setOnboardingCompleted(session.onboardingCompleted);
        setStatus("authenticated");
      },
      markOnboardingCompleted() {
        setOnboardingCompleted(true);
      },
    }),
    [onboardingCompleted, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}

