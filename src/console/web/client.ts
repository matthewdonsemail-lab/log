import { join } from "node:path";
import { PACKAGE_ROOT } from "../../agentHooks/opencode/index.ts";
import { DEFAULT_CONSOLE_PORT } from "../screens/index.ts";
import { consoleApiAnswer } from "./helpers/api.ts";
import { consoleBrowserAnswer } from "./helpers/browser.ts";
import { consoleApiAnswer, consoleMutationAnswer } from "./helpers/api.ts";
import { CONSOLE_MUTATIONS } from "../operations/index.ts";
import { consoleRequestAllowed } from "./helpers/guard.ts";
import { siteAnswer, siteBuilt } from "./helpers/site.ts";
import type { ConsoleWebOptions, ConsoleWebServer } from "./types.ts";

export const SITE_BUILD_COMMAND = "pnpm --dir site install && pnpm --dir site --filter web build";

const LOOPBACK_BIND = new Set(["127.0.0.1", "::1", "localhost"]);

export function consoleSiteDir(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_CONSOLE_SITE || join(PACKAGE_ROOT, "site", "apps", "web", "dist");
}

export function serveConsoleWeb(options: ConsoleWebOptions = {}): ConsoleWebServer {
  const host = options.host ?? "127.0.0.1";
  if (!LOOPBACK_BIND.has(host)) throw new Error(`log console --web serves on loopback only, not ${host}`);
  const siteDir = options.siteDir ?? consoleSiteDir();
  if (!siteBuilt(siteDir)) throw new Error(`the web console isn't built (no index.html in ${siteDir}): run ${SITE_BUILD_COMMAND}`);
  const server = Bun.serve({
    hostname: host,
    port: options.port ?? DEFAULT_CONSOLE_PORT,
    fetch(request, self) {
      const allowed = consoleRequestAllowed({
        host: request.headers.get("host"),
        remote: self.requestIP(request)?.address,
        origin: request.headers.get("origin"),
        fetchSite: request.headers.get("sec-fetch-site"),
      });
      if (!allowed) return Response.json({ error: "consoleWorkspaceAccessDenied" }, { status: 403, headers: { "Cache-Control": "no-store" } });
      const url = new URL(request.url);
      const browser = consoleBrowserAnswer(url, request);
      if (browser) return browser;
      if (CONSOLE_MUTATIONS[url.pathname]) return consoleMutationAnswer(url.pathname, request.method, { header: (name) => request.headers.get(name), json: () => request.json() });
      const api = consoleApiAnswer(url, request.method, self.port ?? DEFAULT_CONSOLE_PORT);
      if (api) return api;
      if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
      return siteAnswer(siteDir, url.pathname);
    },
  });
  const port = server.port ?? DEFAULT_CONSOLE_PORT;
  const shown = host === "::1" ? "[::1]" : host;
  return { url: `http://${shown}:${port}`, port, stop: () => server.stop(true) };
}
