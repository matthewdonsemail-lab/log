import { readProxyState, serverStampFile } from "../../mcp/freshness/index.ts";
import { getState } from "../../storage/state/index.ts";
import { readConsoleAccounts } from "../connections/index.ts";
import { loadConsoleEvents } from "../events/index.ts";
import { consoleDbFound, consoleDbPath, processAlive } from "../store/index.ts";
import type { ConsoleStart } from "./types.ts";

type ServerStart = { pid?: number; startedAt?: string };

export function readMcpState(): ConsoleStart["mcp"] {
  if (!consoleDbFound()) return { running: false, pid: null, startedAt: null };
  const file = serverStampFile();
  const server = getState<ServerStart>("mcpServerStart", file, { legacyFile: file })?.body ?? null;
  if (server && processAlive(server.pid)) return { running: true, pid: server.pid ?? null, startedAt: server.startedAt ?? null };
  const proxy = readProxyState();
  if (proxy && processAlive(proxy.proxyPid)) return { running: true, pid: proxy.proxyPid, startedAt: null };
  return { running: false, pid: null, startedAt: null };
}

export function loadConsoleStart(): ConsoleStart {
  const found = consoleDbFound();
  const newest = found ? loadConsoleEvents({ pageSize: 1 }).events[0] : undefined;
  return {
    schemaVersion: 1,
    source: "local",
    generatedAt: new Date().toISOString(),
    database: { path: consoleDbPath(), found },
    mcp: readMcpState(),
    accounts: readConsoleAccounts().length,
    lastEventAt: newest ? new Date(newest.time).toISOString() : null,
  };
}
