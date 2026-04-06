import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import { AuthCallbackPage } from "./features/auth/AuthCallbackPage";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { HomePage } from "./features/home/HomePage";
import { ChatView } from "./features/chat/ChatView";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/chat"
        element={
          <RequireAuth>
            <ChatView />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
