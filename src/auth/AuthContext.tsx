import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { completeGoogleLogin, login, loginWithGoogle, logout, refreshSession, register, type AuthUser } from "../api/auth";
import { apiUrl } from "../api/config";
import { setAccessToken } from "../api/http";

type AuthStatus = "loading" | "authenticated" | "guest";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  startGoogleLogin: () => void;
  completeGoogleCallback: (accessToken: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const u = await refreshSession();
        if (!mounted) return;
        setUser(u);
        setStatus("authenticated");
      } catch {
        if (!mounted) return;
        setAccessToken(null);
        setUser(null);
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
      async login(email: string, password: string) {
        const u = await login({ email, password });
        setUser(u);
        setStatus("authenticated");
      },
      async register(fullName: string, email: string, password: string) {
        const u = await register({ fullName, email, password });
        setUser(u);
        setStatus("authenticated");
      },
      async logout() {
        await logout();
        setUser(null);
        setStatus("guest");
      },
      startGoogleLogin() {
        loginWithGoogle(apiUrl(""));
      },
      async completeGoogleCallback(accessToken: string) {
        completeGoogleLogin(accessToken);
        const u = await refreshSession();
        setUser(u);
        setStatus("authenticated");
      },
    }),
    [status, user]
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

