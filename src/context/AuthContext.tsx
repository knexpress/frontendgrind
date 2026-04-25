import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ApiError,
  authApi,
  type AuthPayload,
  type PublicUser,
} from "@/lib/api";

type AuthContextValue = {
  user: PublicUser | null;
  accessToken: string | null;
  onboardingCompleted: boolean;
  isReady: boolean;
  isAuthenticated: boolean;
  setSession: (session: {
    user: PublicUser;
    accessToken: string;
    onboardingCompleted: boolean;
  }) => void;
  updateUser: (user: PublicUser) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  login: (payload: { email: string; password: string }) => Promise<AuthPayload>;
  register: (payload: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<AuthPayload>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

const AUTH_TOKEN_KEY = "grind_access_token";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setOnboardingCompleted(false);
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {
      // ignore storage failures
    }
  }, []);

  const setSession = useCallback(
    (session: {
      user: PublicUser;
      accessToken: string;
      onboardingCompleted: boolean;
    }) => {
      setUser(session.user);
      setAccessToken(session.accessToken);
      setOnboardingCompleted(session.onboardingCompleted);
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, session.accessToken);
      } catch {
        // ignore storage failures
      }
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    try {
      const refreshed = await authApi.refresh();
      setSession(refreshed);
      return true;
    } catch {
      clearSession();
      return false;
    }
  }, [clearSession, setSession]);

  useEffect(() => {
    const bootstrap = async () => {
      let token: string | null = null;
      try {
        token = localStorage.getItem(AUTH_TOKEN_KEY);
      } catch {
        token = null;
      }

      if (!token) {
        const refreshed = await refreshSession();
        setIsReady(true);
        if (!refreshed) return;
        return;
      }

      try {
        const me = await authApi.me(token);
        setUser(me.user);
        setAccessToken(token);
        setOnboardingCompleted(me.onboardingCompleted);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await refreshSession();
        } else {
          clearSession();
        }
      } finally {
        setIsReady(true);
      }
    };

    void bootstrap();
  }, [clearSession, refreshSession]);

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const auth = await authApi.login(payload);
      setSession(auth);
      return auth;
    },
    [setSession],
  );

  const register = useCallback(
    async (payload: { fullName: string; email: string; password: string }) => {
      const auth = await authApi.register(payload);
      setSession(auth);
      return auth;
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      onboardingCompleted,
      isReady,
      isAuthenticated: Boolean(user && accessToken),
      setSession,
      updateUser: setUser,
      setOnboardingCompleted,
      login,
      register,
      logout,
      refreshSession,
    }),
    [
      user,
      accessToken,
      onboardingCompleted,
      isReady,
      setSession,
      login,
      register,
      logout,
      refreshSession,
    ],
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
