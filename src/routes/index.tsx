import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
  head: () => ({
    meta: [
      { title: "GRIND - AI Marketing Advisor for Growth Teams" },
      {
        name: "description",
        content:
          "GRIND is the AI marketing advisor that helps growth teams make sharper strategy decisions and execute with confidence.",
      },
      {
        property: "og:title",
        content: "GRIND - AI Marketing Advisor for Growth Teams",
      },
      {
        property: "og:description",
        content:
          "Guide channel strategy, prioritize budget, and move from insight to action through one advisor chat experience.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function IndexRedirect() {
  return <Navigate to="/home" />;
}
