import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { CursorGlow } from "@/components/landing/CursorGlow";

export const Route = createFileRoute("/security")({
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <CursorGlow />
      <Navbar />
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-36">
        <div className="rounded-3xl bg-glass p-8 shadow-elegant md:p-12">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Security
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            GRIND uses layered safeguards to protect account data, session tokens,
            and conversation history.
          </p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
            <div>
              <h2 className="text-base font-semibold">Authentication Controls</h2>
              <p className="mt-2">
                Access is protected through token-based authentication with secure
                refresh flows and route-level access guards across the app.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold">Transport and Storage</h2>
              <p className="mt-2">
                API traffic is expected over HTTPS in production, and sensitive
                operations are restricted to authenticated sessions.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold">Monitoring and Response</h2>
              <p className="mt-2">
                We monitor operational health, investigate suspicious behavior, and
                patch vulnerabilities as part of ongoing security maintenance.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
