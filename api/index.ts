import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { Readable } from "node:stream";
import { pathToFileURL } from "node:url";

function toWebRequest(req: IncomingMessage): Request {
  const protocol =
    (req.headers["x-forwarded-proto"] as string | undefined) ?? "https";
  const host = req.headers.host ?? "localhost";
  const url = `${protocol}://${host}${req.url ?? "/"}`;
  const method = req.method ?? "GET";

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
    } else if (typeof value === "string") {
      headers.set(key, value);
    }
  }

  const isBodyAllowed = method !== "GET" && method !== "HEAD";
  const body = isBodyAllowed ? (Readable.toWeb(req) as ReadableStream) : undefined;

  return new Request(url, {
    method,
    headers,
    body,
    // Required by undici for streamed request bodies in Node.
    duplex: "half",
  } as RequestInit);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const serverEntryPath = path.join(process.cwd(), "dist", "server", "server.js");
  const serverModule = await import(pathToFileURL(serverEntryPath).href);
  const serverEntry = serverModule.default as {
    fetch?: (request: Request) => Promise<Response>;
  };

  if (!serverEntry?.fetch) {
    res.statusCode = 500;
    res.end("Server entry is unavailable.");
    return;
  }

  const response = await serverEntry.fetch(toWebRequest(req));
  res.statusCode = response.status;

  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  res.end(buffer);
}
