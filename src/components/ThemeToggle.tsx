import { useTheme } from "../theme/ThemeContext";
import { useLocation } from "react-router-dom";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const { pathname } = useLocation();
  if (pathname === "/auth/login") return null;
  const inChat = pathname.startsWith("/chat");
  const baseClass = inChat ? "theme-toggle theme-toggle--chat" : "theme-toggle";

  return (
    <button
      type="button"
      className={`${baseClass} ${isLight ? "is-light" : "is-dark"}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      title={`Switch to ${isLight ? "dark" : "light"} mode`}
    >
      <span className="theme-toggle__icon-wrap" aria-hidden="true">
        <svg className="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" focusable="false">
          <circle cx="12" cy="12" r="4.1" />
          <line x1="12" y1="1.6" x2="12" y2="4.1" />
          <line x1="12" y1="19.9" x2="12" y2="22.4" />
          <line x1="1.6" y1="12" x2="4.1" y2="12" />
          <line x1="19.9" y1="12" x2="22.4" y2="12" />
          <line x1="4.6" y1="4.6" x2="6.4" y2="6.4" />
          <line x1="17.6" y1="17.6" x2="19.4" y2="19.4" />
          <line x1="17.6" y1="6.4" x2="19.4" y2="4.6" />
          <line x1="4.6" y1="19.4" x2="6.4" y2="17.6" />
        </svg>
        <svg className="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" focusable="false">
          <path d="M20.5 14.1a8.4 8.4 0 1 1-10.6-10.6 7.4 7.4 0 1 0 10.6 10.6Z" />
        </svg>
      </span>
      <span className="theme-toggle__label">{isLight ? "Light" : "Dark"}</span>
    </button>
  );
}
