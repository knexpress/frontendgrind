import { Reveal, StaggerGroup, StaggerItem } from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Connect performance signals",
    desc: "Bring your paid, owned, and analytics channels into one strategic view.",
  },
  {
    n: "02",
    title: "Build your strategic baseline",
    desc: "GRIND maps your goals, constraints, and current performance to set the right priorities.",
  },
  {
    n: "03",
    title: "Decide through advisor chat",
    desc: "Ask targeted questions and receive clear recommendations with practical next steps.",
  },
  {
    n: "04",
    title: "Execute and compound gains",
    desc: "Repeat the loop weekly to improve efficiency, consistency, and growth velocity.",
  },
];

export function Process() {
  return (
    <section id="process" className="relative py-32">
      <div className="absolute inset-0 bg-hero opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              How it works
            </p>
            <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
              From strategy intake to{" "}
              <span className="text-gold-gradient">execution clarity</span> in
              four steps.
            </h2>
          </div>
        </Reveal>

        <StaggerGroup className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <StaggerItem key={s.n}>
              <div className="group relative h-full rounded-3xl bg-glass p-7 transition-all duration-500 hover:-translate-y-2">
                <span className="text-sm font-mono text-primary">{s.n}</span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
