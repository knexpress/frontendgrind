import { Reveal, StaggerGroup, StaggerItem } from "./Reveal";
import { Star } from "lucide-react";

const items = [
  {
    quote:
      "GRIND gives our growth team strategic direction we can act on immediately. We cut decision cycles from weekly to daily.",
    author: "Sasha Mendel",
    role: "VP Growth, Northwave",
  },
  {
    quote:
      "This is the first AI advisor that feels commercially grounded. Recommendations are clear, prioritized, and execution-ready.",
    author: "Daniel Okafor",
    role: "CMO, Lumen",
  },
  {
    quote:
      "In one quarter, GRIND helped us improve ROAS by 2.3x while keeping budget decisions aligned across the team.",
    author: "Mira Chen",
    role: "Head of Performance, Vertex",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Team feedback
            </p>
            <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
              Trusted by{" "}
              <span className="text-gold-gradient">performance leaders</span>.
            </h2>
          </div>
        </Reveal>

        <StaggerGroup className="mt-20 grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <StaggerItem key={t.author}>
              <figure className="group h-full rounded-3xl bg-glass p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-glow-soft">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <blockquote className="mt-5 text-sm leading-relaxed text-foreground/90">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 border-t border-border pt-4">
                  <p className="text-sm font-medium">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
