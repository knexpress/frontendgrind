import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Process } from "@/components/landing/Process";
import { Benefits } from "@/components/landing/Benefits";
import { Metrics } from "@/components/landing/Metrics";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { CursorGlow } from "@/components/landing/CursorGlow";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "GRIND - AI Marketing Advisor for Growth Teams" },
      {
        name: "description",
        content:
          "GRIND is the AI marketing advisor that helps growth teams make sharper strategy decisions and execute with confidence.",
      },
      {
        property: "og:title",
        content: "GRIND - AI Marketing Advisor for Growth Teams",
      },
      {
        property: "og:description",
        content:
          "Guide channel strategy, prioritize budget, and move from insight to action through one advisor chat experience.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function Index() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <CursorGlow />
      <Navbar />
      <Hero />
      <Features />
      <Process />
      <Benefits />
      <Metrics />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
