const normalize = (value: string) => value.replace(/\/$/, "");

const isLocalhostUrl = (value: string) =>
  /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(value.trim());

export function getApiBaseUrl() {
  const fromUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const fromBase = import.meta.env.VITE_API_BASE as string | undefined;
  const configured = fromUrl ?? fromBase;

  if (configured && configured.trim().length > 0) {
    // Prevent broken production builds when env vars accidentally point to localhost.
    if (!import.meta.env.DEV && isLocalhostUrl(configured)) {
      return "/api/v1";
    }
    return normalize(configured.trim());
  }

  // In production we should never fall back to localhost.
  return import.meta.env.DEV ? "http://localhost:4000/api/v1" : "/api/v1";
}
