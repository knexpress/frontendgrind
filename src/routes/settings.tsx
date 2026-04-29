import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RequireOnboardingComplete } from "@/components/auth/RouteGuards";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

type SettingsTab =
  | "general"
  | "notifications"
  | "personalization"
  | "apps"
  | "data-controls"
  | "security"
  | "parental-controls"
  | "account";

function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  const menuItems = useMemo(
    () =>
      [
        { id: "general", label: "General" },
        { id: "notifications", label: "Notifications" },
        { id: "personalization", label: "Personalization" },
        { id: "apps", label: "Apps" },
        { id: "data-controls", label: "Data controls" },
        { id: "security", label: "Security" },
        { id: "parental-controls", label: "Parental controls" },
        { id: "account", label: "Account" },
      ] as Array<{ id: SettingsTab; label: string }>,
    [],
  );

  return (
    <RequireOnboardingComplete>
      <main className="min-h-screen bg-background px-3 py-5 text-foreground md:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 rounded-3xl border border-border bg-card/40 p-3 md:grid-cols-[240px_1fr] md:p-4">
          <aside className="rounded-2xl border border-border bg-background/80 p-3">
            <button
              className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              type="button"
              onClick={() => void navigate({ to: "/chat" })}
            >
              x
            </button>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${
                    activeTab === item.id
                      ? "bg-accent/60 text-foreground"
                      : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                  }`}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="rounded-2xl border border-border bg-background/80 p-5">
            <header className="border-b border-border pb-4">
              <h1 className="text-2xl font-semibold">Builder profile</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Personalize your builder profile to connect with users of your
                GRIND. These settings apply to publicly shared GRIND.
              </p>
            </header>

            <div className="my-5 rounded-2xl border border-border bg-card/60 p-4">
              <p className="text-sm">
                Complete verification to publish GRIND to everyone. Verify your
                identity by adding billing details or verifying ownership of a
                public domain name.
              </p>
            </div>

            <div className="space-y-6">
              {activeTab === "general" ? (
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold">General Settings</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-sm">Language</span>
                      <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option>English</option>
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm">Timezone</span>
                      <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option>UTC+4</option>
                      </select>
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-sm">Start page</span>
                      <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option>Chat</option>
                        <option>Home</option>
                      </select>
                    </label>
                  </div>
                </section>
              ) : null}

              {activeTab === "notifications" ? (
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold">Notification Settings</h2>
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" className="h-4 w-4 rounded border-border" />
                      Product updates
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" className="h-4 w-4 rounded border-border" />
                      Security alerts
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" className="h-4 w-4 rounded border-border" />
                      Weekly summary
                    </label>
                  </div>
                </section>
              ) : null}

              {activeTab === "personalization" ? (
                <section className="rounded-xl border border-border bg-card/40 p-4">
                  <h3 className="font-semibold">Personalization</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <input
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Base style and tone"
                    />
                    <input
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Characteristics (warm enthusiast, emoji lists)"
                    />
                    <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                      <option>Fast answers: balanced</option>
                      <option>Fast answers: prioritize speed</option>
                      <option>Fast answers: prioritize depth</option>
                    </select>
                    <input
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      placeholder="More about user"
                    />
                    <textarea
                      className="h-20 rounded-lg border border-border bg-background px-3 py-2 text-sm md:col-span-2"
                      placeholder="Custom instructions"
                    />
                    <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm md:col-span-2">
                      <option>Memory enabled</option>
                      <option>Memory limited</option>
                      <option>Memory off</option>
                    </select>
                  </div>
                </section>
              ) : null}

              {activeTab === "apps" ? (
                <section className="rounded-xl border border-border bg-card/40 p-6">
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </section>
              ) : null}

              {activeTab === "data-controls" ? (
                <section className="rounded-xl border border-border bg-card/40 p-4">
                  <h3 className="font-semibold">Data Controls</h3>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {[
                      "Location Services",
                      "Shared Links",
                      "Archived Chats",
                      "Archive all Chat",
                      "Delete Past Chats",
                      "Export your Data",
                      "Marketing Privacy",
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="rounded-lg border border-border bg-background px-3 py-2 text-left text-sm hover:bg-accent/40"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {activeTab === "security" ? (
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold">Security</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    <button className="rounded-lg border border-border bg-background px-3 py-2 text-left text-sm hover:bg-accent/40">
                      Change password
                    </button>
                    <button className="rounded-lg border border-border bg-background px-3 py-2 text-left text-sm hover:bg-accent/40">
                      Two-factor authentication
                    </button>
                  </div>
                </section>
              ) : null}

              {activeTab === "parental-controls" ? (
                <section className="rounded-xl border border-border bg-card/40 p-6" />
              ) : null}

              {activeTab === "account" ? (
                <>
                  <div className="border-b border-border pb-5">
                    <h2 className="text-xl font-semibold">Links</h2>
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-3 py-2">
                        <span className="text-sm text-muted-foreground">Domain</span>
                        <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                          <option>Select a domain</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-3 py-2">
                        <div className="inline-flex items-center gap-2 text-sm">
                          LinkedIn
                        </div>
                        <button
                          type="button"
                          className="rounded-full border border-border px-4 py-1 text-sm hover:bg-accent/40"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-3 py-2">
                        <div className="inline-flex items-center gap-2 text-sm">
                          GitHub
                        </div>
                        <button
                          type="button"
                          className="rounded-full border border-border px-4 py-1 text-sm hover:bg-accent/40"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-border pb-5">
                    <h2 className="text-xl font-semibold">Email</h2>
                    <p className="mt-3 text-sm">{user?.email ?? "Not available"}</p>
                    <label className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" className="h-4 w-4 rounded border-border" />
                      Receive feedback emails
                    </label>
                  </div>

                  <section className="rounded-xl border border-border bg-card/40 p-4">
                    <h3 className="font-semibold">Account</h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <input
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        defaultValue={user?.fullName ?? ""}
                        placeholder="Name"
                      />
                      <input
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        defaultValue={user?.email ?? ""}
                        placeholder="Email"
                      />
                      <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option>Subscription: Free</option>
                        <option>Subscription: Pro</option>
                      </select>
                      <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option>Payment: Card</option>
                        <option>Payment: Apple Pay</option>
                        <option>Payment: Google Pay</option>
                      </select>
                      <button
                        type="button"
                        className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/20 md:col-span-2"
                      >
                        Delete account
                      </button>
                    </div>
                  </section>
                </>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </RequireOnboardingComplete>
  );
}
