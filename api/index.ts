export const config = {
  runtime: "edge",
};

export default async function handler(request: Request): Promise<Response> {
  const serverModule = await import("../dist/server/server.js");
  const serverEntry = serverModule.default as { fetch?: (req: Request) => Promise<Response> };

  if (!serverEntry?.fetch) {
    return new Response("Server entry is unavailable.", { status: 500 });
  }

  return serverEntry.fetch(request);
}
