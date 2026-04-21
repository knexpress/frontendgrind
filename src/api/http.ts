import { apiUrl } from "./config";

let accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;
const ACCESS_TOKEN_STORAGE_KEY = "grind_access_token";

export function setAccessToken(token: string | null) {
  accessToken = token;
  try {
    if (token) {
      window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage failures (private mode, blocked storage, etc.)
  }
}

export function getStoredAccessToken(): string | null {
  try {
    const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    return token && token.trim() ? token : null;
  } catch {
    return null;
  }
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function buildHeaders(init?: RequestInit): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
}

async function tryRefreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(apiUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        setAccessToken(null);
        return false;
      }

      const text = await res.text();
      if (!text) {
        setAccessToken(null);
        return false;
      }

      let data: unknown = undefined;
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        setAccessToken(null);
        return false;
      }

      if (
        !data ||
        typeof data !== "object" ||
        !("accessToken" in data) ||
        typeof (data as { accessToken?: unknown }).accessToken !== "string"
      ) {
        setAccessToken(null);
        return false;
      }

      setAccessToken((data as { accessToken: string }).accessToken);
      return true;
    } catch {
      setAccessToken(null);
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = normalizePath(path);
  const execute = () =>
    fetch(apiUrl(normalizedPath), {
      ...init,
      credentials: "include",
      headers: buildHeaders(init),
    });

  let res = await execute();

  const isAuthEndpoint = normalizedPath.startsWith("/auth/");
  if (res.status === 401 && !isAuthEndpoint) {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) {
      res = await execute();
    }
  }

  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg =
      data && typeof data === "object" && data !== null && "error" in data
        ? String((data as { error: unknown }).error)
        : res.statusText;
    throw new ApiError(msg || "Request failed", res.status, data);
  }

  return data as T;
}
