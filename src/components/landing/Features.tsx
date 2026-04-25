import {
  Brain,
  Target,
  LineChart,
  MessageSquare,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "./Reveal";

const features = [
  {
    icon: Brain,
    title: "Strategy Intelligence",
    desc: "Turn goals into a clear strategic roadmap with prioritized actions your team can execute this week.",
  },
  {
    icon: Target,
    title: "Audience Prioritization",
    desc: "Identify high-intent segments and messaging angles before budget is committed.",
  },
  {
    icon: LineChart,
    title: "Budget Allocation",
    desc: "Direct spend toward channels and campaigns with the strongest projected return.",
  },
  {
    icon: MessageSquare,
    title: "Advisor Chat Workflow",
    desc: "Ask one question and receive tactical guidance, rationale, and next actions in plain language.",
  },
  {
    icon: Zap,
    title: "Executive Clarity",
    desc: "Get concise, explainable recommendations your leadership team can align on quickly.",
  },
  {
    icon: ShieldCheck,
    title: "Operational Confidence",
    desc: "Stay in control with transparent recommendations and measurable decision outcomes.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Features
            </p>
            <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
              Built for teams that lead{" "}
              <span className="text-gold-gradient">
                performance with precision
              </span>
              .
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Six high-impact capabilities that turn fragmented marketing data
              into confident, revenue-focused decisions.
            </p>
          </div>
        </Reveal>

        <StaggerGroup className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <div className="group relative h-full rounded-3xl bg-glass p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-glow-soft">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-glass-gold">
                    <f.icon
                      className="h-5 w-5 text-primary"
                      strokeWidth={1.75}
                    />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
