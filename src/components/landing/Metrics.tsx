import { Reveal, StaggerGroup, StaggerItem } from "./Reveal";

const stats = [
  { v: "+184%", l: "Average ROAS improvement" },
  { v: "12 hrs", l: "Weekly decision time saved" },
  { v: "98.2%", l: "Recommendation confidence" },
  { v: "$48M", l: "Media budget guided" },
];

export function Metrics() {
  return (
    <section id="metrics" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Performance snapshot
            </p>
            <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
              Outcomes that{" "}
              <span className="text-gold-gradient">
                build quarter over quarter.
              </span>
            </h2>
          </div>
        </Reveal>

        <StaggerGroup className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-px rounded-3xl bg-border overflow-hidden bg-glass">
          {stats.map((s) => (
            <StaggerItem key={s.l} className="bg-card">
              <div className="px-6 py-12 text-center">
                <p className="text-4xl md:text-5xl font-semibold text-gold-gradient tracking-tight">
                  {s.v}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{s.l}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
