import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import "./AuthPage.css";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; width?: number; text?: string; shape?: string }
          ) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginVideoSrc = "/Teamwork and Leadership __ Motivational short Animation Video....mp4";
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;
    let disposed = false;

    const renderGoogleButton = () => {
      if (disposed || !googleButtonRef.current || !window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) {
            setError("Google authentication failed");
            return;
          }
          setLoading(true);
          setError(null);
          try {
            await auth.loginWithGoogleCredential(response.credential);
            navigate("/onboarding", { replace: true });
          } catch (err) {
            setError(err instanceof ApiError ? err.message : "Google login failed");
          } finally {
            setLoading(false);
          }
        },
      });

      googleButtonRef.current.innerHTML = "";
      const width = Math.max(240, Math.min(420, Math.floor(googleButtonRef.current.clientWidth || 420)));
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width,
        text: "continue_with",
        shape: "rectangular",
      });
      window.google.accounts.id.prompt();
      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return () => {
        disposed = true;
        window.google?.accounts?.id?.cancel();
      };
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    const script = existingScript ?? document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      renderGoogleButton();
    };

    if (!existingScript) {
      document.head.appendChild(script);
    } else if (window.google?.accounts?.id) {
      renderGoogleButton();
    }

    return () => {
      disposed = true;
      window.google?.accounts?.id?.cancel();
    };
  }, [auth, googleClientId, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await auth.login(email, password);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page auth-page--login">
      <div className="auth-layout">
        <section className="auth-card auth-card--login">
          <h1 className="auth-brand">GRIND</h1>
          <h2 className="auth-title auth-title--hero">Think fast, build faster</h2>
          <p className="auth-sub">Sign in to continue to your strategist workspace.</p>
          {error ? <p className="auth-error">{error}</p> : null}
          <form className="auth-form" onSubmit={onSubmit}>
            <label className="auth-label">
              Email
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <label className="auth-label">
              Password
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-divider">or</p>
          <div className="auth-google-wrap">
            <div ref={googleButtonRef} className="auth-google-gsi" />
            {!googleReady ? (
              <button className="auth-google" type="button" disabled={loading} onClick={auth.startGoogleLogin}>
                Continue with Google
              </button>
            ) : null}
          </div>

          <p className="auth-foot">
            No account yet?{" "}
            <Link className="auth-link" to="/auth/register">
              Create one
            </Link>
          </p>
        </section>

        <section className="auth-video-panel" aria-label="Login page preview video">
          <video className="auth-video" autoPlay muted loop playsInline preload="metadata">
            <source src={loginVideoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </section>
      </div>
    </div>
  );
}

