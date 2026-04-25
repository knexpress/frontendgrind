import { FormEvent, useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RouteGuards";
import { useAuth } from "@/context/AuthContext";
import { ApiError, authApi } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, accessToken, updateUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName ?? "");
    setMobileNumber(user.mobileNumber ?? "");
    setDateOfBirth(user.dateOfBirth ?? "");
  }, [user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!accessToken) return;
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await authApi.updateProfile(accessToken, {
        fullName,
        mobileNumber,
        dateOfBirth,
      });
      updateUser(res.user);
      setSuccess("Profile updated.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (file: File | null) => {
    if (!file || !accessToken) return;
    setError("");
    setSuccess("");
    setUploading(true);
    try {
      const res = await authApi.uploadAvatar(accessToken, file);
      updateUser(res.user);
      setSuccess("Avatar updated.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Unable to upload avatar.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <RequireAuth>
      <main className="min-h-screen bg-hero px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl bg-glass p-8 shadow-elegant">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <Link to="/chat" className="text-sm text-primary hover:underline">
              Back to chat
            </Link>
          </div>

          <div className="mb-5 flex items-center gap-4">
            <img
              src={
                user?.avatarUrl ||
                "https://dummyimage.com/80x80/1f2937/e5e7eb.png&text=GR"
              }
              alt="Avatar"
              className="h-20 w-20 rounded-full border border-border object-cover"
            />
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">
                Upload avatar
              </span>
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) =>
                  void handleAvatarChange(e.target.files?.[0] ?? null)
                }
              />
            </label>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Full name" value={fullName} onChange={setFullName} />
            <Field
              label="Mobile number"
              value={mobileNumber}
              onChange={setMobileNumber}
            />
            <Field
              label="Date of birth"
              value={dateOfBirth}
              onChange={setDateOfBirth}
            />

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? (
              <p className="text-sm text-green-600 dark:text-green-400">
                {success}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
          </form>
        </div>
      </main>
    </RequireAuth>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm">{label}</span>
      <input
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-ring/50 focus:ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
