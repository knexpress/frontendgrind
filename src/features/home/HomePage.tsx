import { Link } from "react-router-dom";
import "./home.css";

export function HomePage() {
  return (
    <div className="home">
      <div className="home__bg" aria-hidden="true" />

      <header className="home-nav">
        <Link to="/" className="home-nav__brand">
          GRIND
        </Link>
        <nav className="home-nav__links">
          <a href="#about" className="home-nav__link">
            About
          </a>
          <a href="#use" className="home-nav__link">
            How to use
          </a>
          <Link to="/chat" className="home-nav__cta home-nav__cta--ghost">
            Open chat
          </Link>
        </nav>
      </header>

      <main>
        <section className="home-hero">
          <p className="home-hero__eyebrow home-animate" style={{ animationDelay: "0.05s" }}>
            Marketing intelligence for real businesses
          </p>
          <h1 className="home-hero__title home-animate" style={{ animationDelay: "0.12s" }}>
            The strategist
            <span className="home-hero__title-accent"> your SME never had</span>
          </h1>
          <p className="home-hero__lead home-animate" style={{ animationDelay: "0.2s" }}>
            GRIND is not a content generator. It is a grounded marketing strategist that learns your
            business, challenges unrealistic goals, and gives specific actions you can run on your
            budget, including zero spend.
          </p>
          <div className="home-hero__actions home-animate" style={{ animationDelay: "0.28s" }}>
            <Link to="/chat" className="home-btn home-btn--primary">
              Start with GRIND
            </Link>
            <a href="#about" className="home-btn home-btn--secondary">
              Learn more
            </a>
          </div>
          <ul className="home-hero__stats home-animate" style={{ animationDelay: "0.36s" }}>
            <li>
              <span className="home-hero__stat-value">Street-smart</span>
              <span className="home-hero__stat-label">Physical and digital context</span>
            </li>
            <li>
              <span className="home-hero__stat-value">Honest</span>
              <span className="home-hero__stat-label">Reality checks before plans</span>
            </li>
            <li>
              <span className="home-hero__stat-value">Executable</span>
              <span className="home-hero__stat-label">Week by week actions</span>
            </li>
          </ul>
        </section>

        <section id="about" className="home-section">
          <h2 className="home-section__title home-reveal">What GRIND does</h2>
          <p className="home-section__intro home-reveal">
            Built for owners who cannot hire a consultant but need the same quality of thinking:
            industry-aware questions, local channel sense, and plans that respect time and money.
          </p>

          <div className="home-bento">
            <article className="home-card home-card--wide home-reveal">
              <h3 className="home-card__title">Deep intake, not a form</h3>
              <p className="home-card__text">
                GRIND asks how your business actually works: location, foot traffic, what you tried,
                budget, and goals. Advice only starts once the picture is real enough to be useful.
              </p>
            </article>
            <article className="home-card home-reveal">
              <h3 className="home-card__title">Strategy first</h3>
              <p className="home-card__text">
                Channels, pricing psychology, referrals, timelines, and budgets are connected into
                one plan, not random tips.
              </p>
            </article>
            <article className="home-card home-reveal">
              <h3 className="home-card__title">Proof-minded</h3>
              <p className="home-card__text">
                Recommendations are framed around what tends to work for businesses like yours. GRIND
                does not fake case studies or numbers.
              </p>
            </article>
            <article className="home-card home-reveal">
              <h3 className="home-card__title">Plain language</h3>
              <p className="home-card__text">
                Clear sentences, no corporate filler. You get direct answers and next steps you can
                act on this week.
              </p>
            </article>
          </div>
        </section>

        <section className="home-section home-section--tight">
          <h2 className="home-section__title home-reveal">Who it is for</h2>
          <p className="home-section__intro home-reveal">
            Shops, clinics, trades, logistics, food, retail, services, and online sellers anywhere in
            the world. If you run an SME and want growth without marketing theory homework, GRIND is
            for you.
          </p>
        </section>

        <section id="use" className="home-section">
          <h2 className="home-section__title home-reveal">How to use GRIND efficiently</h2>
          <ol className="home-steps">
            <li className="home-step home-reveal">
              <span className="home-step__num">1</span>
              <div>
                <h3 className="home-step__title">Create your account and complete onboarding</h3>
                <p className="home-step__text">
                  Sign in, then answer the guided onboarding cards. GRIND saves your business profile,
                  goals, constraints, and context so strategy starts from your real situation.
                </p>
              </div>
            </li>
            <li className="home-step home-reveal">
              <span className="home-step__num">2</span>
              <div>
                <h3 className="home-step__title">Start a chat thread for one objective</h3>
                <p className="home-step__text">
                  Open chat and focus each thread on one target outcome such as more leads, better
                  conversion, higher repeat orders, or expansion in a specific area.
                </p>
              </div>
            </li>
            <li className="home-step home-reveal">
              <span className="home-step__num">3</span>
              <div>
                <h3 className="home-step__title">Answer GRIND’s diagnostic follow-up questions</h3>
                <p className="home-step__text">
                  GRIND asks sharp clarifying questions before giving tactics. This replaces generic
                  marketing advice with strategy that fits your market, pricing, customer type, and timing.
                </p>
              </div>
            </li>
            <li className="home-step home-reveal">
              <span className="home-step__num">4</span>
              <div>
                <h3 className="home-step__title">Execute, track results, and continue in threads</h3>
                <p className="home-step__text">
                  Run one action block, return with outcomes, and refine. Keep old threads for history,
                  and start a new thread when your goal changes or a new campaign starts.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section className="home-cta-band home-reveal">
          <div className="home-cta-band__inner">
            <h2 className="home-cta-band__title">Ready for a plan that fits your business?</h2>
            <p className="home-cta-band__text">
              Open the chat and start with your business type, location, and goal. GRIND takes it from
              there.
            </p>
            <Link to="/chat" className="home-btn home-btn--primary home-btn--large">
              Open GRIND chat
            </Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <span className="home-footer__brand">GRIND</span>
        <span className="home-footer__meta">Marketing strategist for SMEs</span>
      </footer>
    </div>
  );
}
