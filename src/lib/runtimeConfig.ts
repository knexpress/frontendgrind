const normalize = (value: string) => value.replace(/\/$/, "");

export function getApiBaseUrl() {
  const fromUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const fromBase = import.meta.env.VITE_API_BASE as string | undefined;
  const configured = fromUrl ?? fromBase;

  if (configured && configured.trim().length > 0) {
    return normalize(configured.trim());
  }

  // In production we should never fall back to localhost.
  return import.meta.env.DEV ? "http://localhost:4000/api/v1" : "/api/v1";
}
