import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { CursorGlow } from "@/components/landing/CursorGlow";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <CursorGlow />
      <Navbar />
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-36">
        <div className="rounded-3xl bg-glass p-8 shadow-elegant md:p-12">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Contact
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Reach the GRIND team for product support, partnerships, or enterprise
            inquiries.
          </p>

          <div className="mt-8 space-y-5 text-sm text-foreground/90">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </p>
              <a
                href="mailto:support@grind.ai"
                className="mt-1 inline-block font-medium text-primary hover:underline"
              >
                support@grind.ai
              </a>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Business
              </p>
              <a
                href="mailto:partnerships@grind.ai"
                className="mt-1 inline-block font-medium text-primary hover:underline"
              >
                partnerships@grind.ai
              </a>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Response Time
              </p>
              <p className="mt-1">
                Standard response within 24 business hours.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
