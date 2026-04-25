import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/login")({
  component: AuthLoginAliasPage,
});

function AuthLoginAliasPage() {
  return <Navigate to="/login" />;
}
