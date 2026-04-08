import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../../api/http";
import { useAuth } from "../../auth/AuthContext";
import "./AuthPage.css";

export function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await auth.register(fullName, email, password);
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <h1 className="auth-brand">GRIND</h1>
        <h2 className="auth-title">Create account</h2>
        <p className="auth-sub">Set up your workspace in under a minute.</p>
        {error ? <p className="auth-error">{error}</p> : null}
        <form className="auth-form" onSubmit={onSubmit}>
          <label className="auth-label">
            Full name
            <input
              className="auth-input"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
              autoComplete="name"
            />
          </label>
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
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="auth-divider">or</p>
        <button className="auth-google" type="button" disabled={loading} onClick={auth.startGoogleLogin}>
          Continue with Google
        </button>

        <p className="auth-foot">
          Already have an account?{" "}
          <Link className="auth-link" to="/auth/login">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
}

