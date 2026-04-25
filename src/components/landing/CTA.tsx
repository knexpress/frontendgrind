import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "./Reveal";

export function CTA() {
  return (
    <section id="cta" className="relative py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-glass p-12 md:p-20 text-center shadow-elegant">
            {/* Glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/15 blur-[120px]"
              aria-hidden
            />
            <div
              className="absolute inset-0 grid-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
              aria-hidden
            />

            <div className="relative">
              <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
                Stop reacting to reports.
                <br />
                <span className="text-gold-gradient">
                  Start directing growth.
                </span>
              </h2>
              <p className="mt-6 mx-auto max-w-xl text-muted-foreground leading-relaxed">
                Put GRIND beside your team to prioritize channels, sharpen
                creative direction, and turn insight into action every day.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 rounded-full bg-gold-gradient px-8 py-4 text-sm font-medium text-primary-foreground transition-all duration-300 hover:shadow-glow hover:scale-[1.04] animate-pulse-glow"
                >
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/chat"
                  className="inline-flex items-center gap-2 rounded-full bg-glass px-8 py-4 text-sm font-medium text-foreground transition-all duration-300 hover:bg-white/[0.06]"
                >
                  Open advisor chat
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
