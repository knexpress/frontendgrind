import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import "./AuthPage.css";

export function AuthCallbackPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function run() {
      const token = params.get("access_token");
      if (!token) {
        if (mounted) setError("Missing Google access token");
        return;
      }
      try {
        await auth.completeGoogleCallback(token);
        if (!mounted) return;
        navigate("/", { replace: true });
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof ApiError ? e.message : "Google sign-in failed");
      }
    }
    void run();
    return () => {
      mounted = false;
    };
  }, [auth, navigate, params]);

  return (
    <div className="auth-page">
      <section className="auth-card">
        <h1 className="auth-brand">GRIND</h1>
        <h2 className="auth-title">Completing sign-in...</h2>
        <p className="auth-sub">Please wait while we finish your Google login.</p>
        {error ? (
          <>
            <p className="auth-error">{error}</p>
            <p className="auth-foot">
              <a className="auth-link" href="/auth/login">
                Back to login
              </a>
            </p>
          </>
        ) : null}
      </section>
    </div>
  );
}

