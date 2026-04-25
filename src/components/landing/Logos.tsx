import { Reveal } from "./Reveal";

const brands = ["NORTHWAVE", "LUMEN", "AXIOM", "VERTEX", "OBSIDIAN", "HELIX"];

export function Logos() {
  return (
    <section className="relative border-y border-border bg-background/60 py-14">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Trusted by category-defining brands
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-8 gap-y-6 items-center">
            {brands.map((b) => (
              <span
                key={b}
                className="text-center text-sm font-medium tracking-[0.25em] text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                {b}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
