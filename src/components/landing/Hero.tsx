import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative min-h-screen overflow-hidden bg-hero pt-32 pb-20"
    >
      {/* Grid pattern */}
      <motion.div
        style={{ y: yBg }}
        className="absolute inset-0 grid-pattern opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />

      {/* Floating gold orbs */}
      <motion.div
        style={{ y: yBg }}
        className="absolute top-1/4 left-[10%] h-72 w-72 rounded-full bg-primary/15 blur-[100px] animate-float-slow"
        aria-hidden
      />
      <motion.div
        style={{ y: yBg }}
        className="absolute bottom-1/4 right-[10%] h-96 w-96 rounded-full bg-primary/10 blur-[120px] animate-float-medium"
        aria-hidden
      />
      <motion.div
        className="absolute top-[20%] right-[20%] h-3 w-3 rounded-full bg-primary shadow-glow animate-float-medium"
        aria-hidden
      />
      <motion.div
        className="absolute bottom-[30%] left-[15%] h-2 w-2 rounded-full bg-primary/70 shadow-glow-soft animate-float-slow"
        aria-hidden
      />

      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 mx-auto max-w-5xl px-6 text-center"
      >
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 text-5xl md:text-7xl lg:text-[5.5rem] font-semibold tracking-tight leading-[1.05]"
        >
          <span className="text-gold-gradient">
            The AI Marketing Advisor that guides every growth decision.
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-6 mx-auto max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed"
        >
          GRIND gives your team a senior marketing brain on demand: clear
          strategy, channel-level priorities, and execution-ready actions
          delivered through one AI chatbot.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/chat"
            className="group inline-flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-medium text-primary-foreground transition-all duration-300 hover:shadow-glow hover:scale-[1.04]"
          >
            Chat now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-full bg-glass px-7 py-3.5 text-sm font-medium text-foreground transition-all duration-300 hover:bg-white/[0.06] hover:scale-[1.02]"
          >
            Explore capabilities
          </a>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 mx-auto max-w-4xl"
        >
          <div className="relative rounded-3xl bg-glass p-2 shadow-elegant">
            <div
              className="absolute -inset-px rounded-3xl bg-gradient-to-b from-primary/30 to-transparent opacity-50 blur-sm"
              aria-hidden
            />
            <div className="relative rounded-[1.4rem] bg-card overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="ml-3 text-xs text-muted-foreground">
                  grind.ai / advisor
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-px bg-border">
                <div className="bg-card p-6">
                  <p className="text-xs text-muted-foreground">Active Plays</p>
                  <p className="mt-2 text-3xl font-semibold">24</p>
                  <p className="mt-1 text-xs text-primary">
                    +12% uplift this week
                  </p>
                </div>
                <div className="bg-card p-6">
                  <p className="text-xs text-muted-foreground">Blended ROAS</p>
                  <p className="mt-2 text-3xl font-semibold text-gold-gradient">
                    4.8x
                  </p>
                  <p className="mt-1 text-xs text-primary">
                    +0.7 month over month
                  </p>
                </div>
                <div className="bg-card p-6">
                  <p className="text-xs text-muted-foreground">
                    Advisor Actions
                  </p>
                  <p className="mt-2 text-3xl font-semibold">1,284</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    reviewed in 24h
                  </p>
                </div>
              </div>
              <div className="bg-card p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-gradient">
                    <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 rounded-2xl rounded-tl-sm bg-secondary p-4 text-sm text-foreground/90 leading-relaxed">
                    Strategic shift approved: move{" "}
                    <span className="text-primary font-medium">$2,400</span>{" "}
                    from low-intent Meta audiences into high-intent Google
                    Search clusters. Estimated ROAS impact:
                    <span className="text-primary font-medium"> +18%</span>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
