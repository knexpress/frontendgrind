import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal } from "./Reveal";

const faqs = [
  {
    q: "How is GRIND different from analytics dashboards like GA4?",
    a: "Dashboards report what happened. GRIND interprets performance, recommends what to do next, and helps your team act faster.",
  },
  {
    q: "Is GRIND built for marketing teams or founders?",
    a: "Both, but it is optimized for growth and performance teams who need strategic clarity, faster approvals, and measurable outcomes.",
  },
  {
    q: "Can GRIND support multiple channels and campaign types?",
    a: "Yes. GRIND is designed to guide paid, lifecycle, and content decisions with one consistent strategic layer.",
  },
  {
    q: "Will GRIND replace my current tools?",
    a: "No. GRIND acts as your advisor across existing tools, so your team can prioritize decisions without replacing the full stack.",
  },
  {
    q: "How quickly can a team start seeing value?",
    a: "Most teams can onboard quickly and start receiving practical recommendations within their first working session.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-32">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Common questions
            </p>
            <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
              Answers for{" "}
              <span className="text-gold-gradient">serious growth teams</span>.
            </h2>
          </div>
        </Reveal>

        <div className="mt-16 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 0.05}>
                <div className="rounded-2xl bg-glass overflow-hidden">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
                  >
                    <span className="text-sm md:text-base font-medium">
                      {f.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-glass-gold"
                    >
                      <Plus className="h-3.5 w-3.5 text-primary" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
