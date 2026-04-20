import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import { RequireOnboarding } from "./auth/RequireOnboarding";
import { AuthCallbackPage } from "./features/auth/AuthCallbackPage";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { HomePage } from "./features/home/HomePage";
import { ChatView } from "./features/chat/ChatView";
import { OnboardingPage } from "./features/onboarding/OnboardingPage";
import { ThemeToggle } from "./components/ThemeToggle";

export function App() {
  return (
    <>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <OnboardingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/chat"
          element={
            <RequireAuth>
              <RequireOnboarding>
                <ChatView />
              </RequireOnboarding>
            </RequireAuth>
          }
        />
      </Routes>
    </>
  );
}
