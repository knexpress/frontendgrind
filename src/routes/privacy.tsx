import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { CursorGlow } from "@/components/landing/CursorGlow";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <CursorGlow />
      <Navbar />
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-36">
        <div className="rounded-3xl bg-glass p-8 shadow-elegant md:p-12">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            GRIND is committed to protecting your information while delivering
            strategy guidance through our AI advisor.
          </p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
            <div>
              <h2 className="text-base font-semibold">Information We Collect</h2>
              <p className="mt-2">
                We collect account details, onboarding profile responses, and
                conversation activity to personalize recommendations and improve
                advisor output quality.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold">How We Use Data</h2>
              <p className="mt-2">
                Data is used to provide chat responses, improve reliability,
                maintain security, and support product analytics. We do not sell
                personal information.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold">Retention and Control</h2>
              <p className="mt-2">
                We retain information only as long as necessary for service and
                legal compliance. You can request profile updates or account
                deletion through support.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
