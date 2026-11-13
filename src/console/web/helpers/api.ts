import { loadConsoleAiClients } from "../../aiClients/index.ts";
import { loadConsoleConnections } from "../../connections/index.ts";
import { EVENT_STATUSES, loadConsoleEvents, MAX_PAGE_SIZE } from "../../events/index.ts";
import type { EventStatus } from "../../events/index.ts";
import { CONSOLE_SCREENS } from "../../screens/index.ts";
import type { ConsoleDomain } from "../../screens/index.ts";
import { loadConsoleSettings } from "../../settings/index.ts";
import { loadConsoleStart } from "../../start/index.ts";
import { loadConsoleUsage, usageDaysOf } from "../../usage/index.ts";
import { consoleErrorCode, CONSOLE_ERROR_STATUS, CONSOLE_MUTATIONS, runConsoleOperation } from "../../operations/index.ts";
import type { ConsoleOperationDeps } from "../../operations/index.ts";

export class ConsoleInputError extends Error {}

function statusOf(value: string | null): EventStatus | undefined {
  if (value === null || value === "" || value === "all") return undefined;
  if (!(EVENT_STATUSES as readonly string[]).includes(value)) throw new ConsoleInputError("consoleEventStatusInvalid");
  return value as EventStatus;
}

export const CONSOLE_API: Readonly<Record<ConsoleDomain, (query: URLSearchParams, port: number) => unknown>> = {
  start: () => loadConsoleStart(),
  connections: (query) => loadConsoleConnections({ platform: query.get("platform") ?? undefined }),
  usage: (query) => {
    const days = usageDaysOf(query.get("days") ?? "7");
    if (!days) throw new ConsoleInputError("usageRangeInvalid");
    return loadConsoleUsage(days);
  },
  events: (query) => loadConsoleEvents({ kind: query.get("kind") ?? undefined, status: statusOf(query.get("status")), page: Number(query.get("page") ?? 0) || 0, pageSize: Number(query.get("pageSize") ?? MAX_PAGE_SIZE) || MAX_PAGE_SIZE }),
  aiClients: (query) => loadConsoleAiClients({ client: query.get("client") ?? undefined }),
  settings: (_query, port) => loadConsoleSettings(port),
};

export function consoleDomainOfPath(pathname: string): ConsoleDomain | null {
  return CONSOLE_SCREENS.find((screen) => screen.api === pathname)?.domain ?? null;
}

const HEADERS = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export interface ConsoleMutationRequest {
  header: (name: string) => string | null;
  json: () => Promise<unknown>;
}

export const MAX_MUTATION_BYTES = 65536;

export async function consoleMutationAnswer(pathname: string, method: string, request: ConsoleMutationRequest, deps: ConsoleOperationDeps = {}): Promise<Response> {
  const operation = CONSOLE_MUTATIONS[pathname];
  if (method !== "POST" || request.header("x-log-console") !== "1" || !request.header("content-type")?.startsWith("application/json")) return Response.json({ error: "consoleMethodNotAllowed" }, { status: 405, headers: { ...HEADERS, Allow: "POST" } });
  if (Number(request.header("content-length") ?? 0) > MAX_MUTATION_BYTES) return Response.json({ error: "consoleInputInvalid" }, { status: 400, headers: HEADERS });
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("consoleInputInvalid");
    return Response.json(await runConsoleOperation(operation, body as Record<string, unknown>, deps), { headers: HEADERS });
  } catch (error) {
    const code = consoleErrorCode(error);
    return Response.json({ error: code }, { status: CONSOLE_ERROR_STATUS[code] ?? 503, headers: HEADERS });
  }
}

export function consoleApiAnswer(url: URL, method: string, port: number): Response | null {
  if (url.pathname === "/api/console/mode") return Response.json({ mode: "local", team: null, billing: null }, { headers: HEADERS });
  if (url.pathname.startsWith("/api/v1/")) return Response.json({ code: "unauthenticated", safeMessage: "local: no team or billing" }, { status: 401, headers: HEADERS });
  if (!url.pathname.startsWith("/api/")) return null;
  if (CONSOLE_MUTATIONS[url.pathname]) return Response.json({ error: "consoleMethodNotAllowed" }, { status: 405, headers: { ...HEADERS, Allow: "POST" } });
  const domain = consoleDomainOfPath(url.pathname);
  if (!domain) return Response.json({ error: "consoleNotFound" }, { status: 404, headers: HEADERS });
  if (method !== "GET") return Response.json({ error: "consoleMethodNotAllowed" }, { status: 405, headers: { ...HEADERS, Allow: "GET" } });
  try {
    return Response.json(CONSOLE_API[domain](url.searchParams, port), { headers: HEADERS });
  } catch (error) {
    if (error instanceof ConsoleInputError || (error instanceof Error && /Invalid$/.test(error.message))) return Response.json({ error: error.message }, { status: 400, headers: HEADERS });
    return Response.json({ error: "consoleWorkspaceUnavailable" }, { status: 503, headers: HEADERS });
  }
}
