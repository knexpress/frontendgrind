import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";

const links = [
  { label: "Capabilities", href: "#features" },
  { label: "Workflow", href: "#process" },
  { label: "Outcomes", href: "#metrics" },
  { label: "Questions", href: "#faq" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 30));

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-6"
      }`}
    >
      <div
        className={`mx-auto max-w-6xl px-4 transition-all duration-500 ${
          scrolled ? "" : ""
        }`}
      >
        <nav
          className={`flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500 ${
            scrolled ? "bg-glass shadow-elegant" : "bg-transparent"
          }`}
        >
          <a href="#top" className="flex items-center gap-2 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient shadow-glow-soft">
              <Sparkles
                className="h-4 w-4 text-primary-foreground"
                strokeWidth={2.5}
              />
            </div>
            <span className="text-base font-semibold tracking-tight">
              GRIND
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <span className="hidden text-xs text-muted-foreground md:inline">
                  {user?.fullName}
                </span>
                <Link
                  to="/chat"
                  className="group relative inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-300 hover:shadow-glow hover:scale-[1.03]"
                >
                  Open Advisor
                </Link>
                <button
                  className="rounded-full bg-glass px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={async () => {
                    await logout();
                    await navigate({ to: "/" });
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/chat"
                  className="rounded-full bg-glass px-4 py-2 text-sm font-medium text-foreground transition-all duration-300 hover:bg-white/[0.06]"
                >
                  Chat now
                </Link>
                <Link
                  to="/login"
                  className="group relative inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-300 hover:shadow-glow hover:scale-[1.03]"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
