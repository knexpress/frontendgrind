import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import "../home/home.css";
import "./site-pages.css";

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
};

const INITIAL_FORM: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  subject: "",
  message: "",
};

function SitePageLayout(props: { title: string; subtitle: string; children: React.ReactNode }) {
  const { title, subtitle, children } = props;
  return (
    <div className="site-page">
      <header className="home-nav">
        <Link to="/" className="home-nav__brand">
          GRIND
        </Link>
        <nav className="home-nav__links">
          <a href="/#about" className="home-nav__link">
            About
          </a>
          <a href="/#use" className="home-nav__link">
            How to use
          </a>
          <Link to="/chat" className="home-nav__cta home-nav__cta--ghost">
            Open chat
          </Link>
        </nav>
      </header>
      <main className="site-page__main">
        <p className="site-page__eyebrow">Essentials</p>
        <h1 className="site-page__title">{title}</h1>
        <p className="site-page__subtitle">{subtitle}</p>
        <section className="site-page__card">{children}</section>
        <nav className="home-footer__links home-footer__links--dock" aria-label="Essentials quick links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-and-conditions">Terms & Conditions</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </main>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <SitePageLayout
      title="Privacy Policy"
      subtitle="How GRIND collects, uses, and protects your information."
    >
      <h2>Information we collect</h2>
      <p>
        We collect account details (such as name and email), onboarding profile data, and conversation
        content you submit while using GRIND.
      </p>

      <h2>How we use your data</h2>
      <p>
        Your data is used to provide product features, personalize strategy recommendations, maintain
        account security, and improve answer quality.
      </p>

      <h2>Data sharing</h2>
      <p>
        We do not sell your personal information. We may share data with service providers that help run
        the platform (hosting, analytics, and AI infrastructure) under appropriate safeguards.
      </p>

      <h2>Data retention and control</h2>
      <p>
        We retain data only as needed for product and legal purposes. You may request account or data
        deletion by contacting us through the contact page.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy requests, use <Link to="/contact">Contact</Link> and mention your account email.
      </p>
    </SitePageLayout>
  );
}

export function TermsPage() {
  return (
    <SitePageLayout
      title="Terms and Conditions"
      subtitle="Rules and responsibilities for using GRIND."
    >
      <h2>Use of service</h2>
      <p>
        GRIND provides marketing guidance for business planning support. You are responsible for business
        decisions and outcomes from applying any recommendation.
      </p>

      <h2>Accounts and security</h2>
      <p>
        You must provide accurate information and keep your login credentials secure. You are responsible
        for activity under your account.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You agree not to misuse the platform, attempt unauthorized access, or upload harmful or unlawful
        content.
      </p>

      <h2>Intellectual property</h2>
      <p>
        GRIND branding, interface, and software are protected assets. You keep ownership of content you
        submit.
      </p>

      <h2>Changes and termination</h2>
      <p>
        We may update these terms periodically. Continued use after updates means you accept the revised
        terms.
      </p>
    </SitePageLayout>
  );
}

export function ContactPage() {
  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
      form.phone.trim().length >= 7 &&
      form.message.trim().length >= 10
    );
  }, [form]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(false);
    setSubmitError(null);
    if (!canSubmit) {
      setSubmitError("Please complete required fields correctly.");
      return;
    }
    setSubmitted(true);
    setForm(INITIAL_FORM);
  }

  return (
    <SitePageLayout
      title="Contact GRIND"
      subtitle="Send us your details and we will get back to you as soon as possible."
    >
      <form className="site-contact-form" onSubmit={onSubmit}>
        <div className="site-contact-form__grid">
          <label>
            Full name *
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ali Abdullah"
              required
            />
          </label>
          <label>
            Email *
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="you@company.com"
              required
            />
          </label>
          <label>
            Phone number *
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+971 50 000 0000"
              required
            />
          </label>
          <label>
            Company / Business name
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
              placeholder="KN Express"
            />
          </label>
          <label className="site-contact-form__wide">
            Subject
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder="Support request"
            />
          </label>
          <label className="site-contact-form__wide">
            Message *
            <textarea
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Tell us how we can help."
              rows={5}
              required
            />
          </label>
        </div>

        <button type="submit" className="site-contact-form__submit" disabled={!canSubmit}>
          Submit
        </button>

        {submitError ? <p className="site-contact-form__feedback error">{submitError}</p> : null}
        {submitted ? (
          <p className="site-contact-form__feedback success">
            Thank you. We received your message and will contact you shortly.
          </p>
        ) : null}
      </form>
    </SitePageLayout>
  );
}
