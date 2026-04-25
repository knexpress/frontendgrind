import { Check } from "lucide-react";
import { Reveal } from "./Reveal";

const points = [
  "Unify strategy, execution guidance, and optimization in one advisor",
  "Reduce decision latency with concise, context-aware recommendations",
  "Prioritize budget where growth impact is highest",
  "Detect performance risk early and adjust faster",
  "Standardize marketing decisions across your team",
  "Keep human approval in every critical growth move",
];

export function Benefits() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Why GRIND
            </p>
            <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
              Strategic intelligence,
              <br />
              <span className="text-gold-gradient">
                without operational drag.
              </span>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-lg">
              GRIND is built for teams that need faster, better marketing
              decisions without adding process overhead or tool sprawl.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-3xl bg-glass p-8 shadow-elegant">
              <ul className="space-y-4">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-glass-gold">
                      <Check
                        className="h-3.5 w-3.5 text-primary"
                        strokeWidth={2.5}
                      />
                    </span>
                    <span className="text-sm text-foreground/90 leading-relaxed">
                      {p}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
