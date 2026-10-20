#!/usr/bin/env bun
/**
 * log MCP server entrypoint. Every `log` command is a tool; the wiring lives
 * in `src/mcp/server`.
 *
 *   bun bin/logMcp.ts                                   stdio (a local client starts it)
 *   bun bin/logMcp.ts --http [--host <h>] [--port <p>]  Streamable HTTP at http://<h>:<p>/mcp, for a
 *       client on another machine over the private network (docs/deployment.md). Default
 *       127.0.0.1:7337; any other host needs LOG_MCP_TOKEN (sent as a bearer token).
 */
import { resolve } from "node:path";
import { startLogMcpHttp, startLogMcpServer } from "../src/mcp/server/index.ts";

const argv = process.argv.slice(2);
const flag = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};
const root = resolve(import.meta.dir, "..");
if (argv.includes("--http")) await startLogMcpHttp(root, { host: flag("host"), port: flag("port") ? Number(flag("port")) : undefined });
else await startLogMcpServer(root);
