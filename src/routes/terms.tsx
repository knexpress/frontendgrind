import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { CursorGlow } from "@/components/landing/CursorGlow";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <CursorGlow />
      <Navbar />
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-36">
        <div className="rounded-3xl bg-glass p-8 shadow-elegant md:p-12">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Terms and Conditions
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            These terms govern your use of GRIND and the strategy recommendations
            generated through the platform.
          </p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
            <div>
              <h2 className="text-base font-semibold">Service Scope</h2>
              <p className="mt-2">
                GRIND provides AI-generated guidance for marketing decision
                support. Final execution and business decisions remain your
                responsibility.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold">Acceptable Use</h2>
              <p className="mt-2">
                You agree not to misuse the service, attempt unauthorized access,
                or submit unlawful content through chat, onboarding, or profile
                forms.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold">Liability and Changes</h2>
              <p className="mt-2">
                GRIND may update features and terms as the product evolves.
                Continued use after updates means acceptance of the revised terms.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
