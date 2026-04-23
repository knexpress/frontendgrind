import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "../home/home.css";
import "./profile.css";

export function ProfilePage() {
  const auth = useAuth();
  const user = auth.user;
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ?? "");
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const avatarSrc = useMemo(() => user?.avatarUrl || "", [user?.avatarUrl]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setStatusText(null);
    try {
      await auth.updateUserProfile({
        fullName,
        mobileNumber,
        dateOfBirth,
      });
      setStatusText("Profile updated.");
    } catch (err) {
      setStatusText(err instanceof Error ? err.message : "Profile update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAvatarChange(file: File | null) {
    if (!file) return;
    setBusy(true);
    setStatusText(null);
    try {
      await auth.uploadUserAvatar(file);
      setStatusText("Profile picture updated.");
    } catch (err) {
      setStatusText(err instanceof Error ? err.message : "Avatar upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="site-page profile-page">
      <header className="home-nav">
        <Link to="/" className="home-nav__brand">
          GRIND
        </Link>
        <nav className="home-nav__links">
          <Link to="/chat" className="home-nav__cta home-nav__cta--ghost">
            Back to chat
          </Link>
        </nav>
      </header>
      <main className="profile-page__main">
        <h1 className="profile-page__title">Your profile</h1>
        <p className="profile-page__subtitle">
          Update your account details and profile picture used across GRIND.
        </p>

        <section className="profile-card">
          <div className="profile-card__avatar-row">
            <div className="profile-avatar">
              {avatarSrc ? <img src={avatarSrc} alt="Profile avatar" /> : <span>{(user?.fullName || "U").slice(0, 1)}</span>}
            </div>
            <label className="profile-avatar__upload">
              Upload profile picture
              <input
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <form className="profile-form" onSubmit={handleSaveProfile}>
            <label>
              Full name
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} />
            </label>

            <label>
              Email
              <input value={user?.email ?? ""} disabled />
            </label>

            <label>
              Mobile number
              <input
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+971 50 000 0000"
              />
            </label>

            <label>
              Date of birth
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </label>

            <button type="submit" disabled={busy || fullName.trim().length < 2}>
              {busy ? "Saving..." : "Save changes"}
            </button>
          </form>

          {statusText ? <p className="profile-card__status">{statusText}</p> : null}
        </section>
      </main>
    </div>
  );
}

