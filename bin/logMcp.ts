#!/usr/bin/env bun
import "../src/config/userEnv/autoload.ts";
import { resolve } from "node:path";

const argv = process.argv.slice(2);
const flag = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};
const root = resolve(import.meta.dir, "..");
if (argv.includes("--http") || argv.includes("--child") || process.env.LOG_MCP_RELOAD === "off") {
  const { recordServerStart } = await import("../src/mcp/freshness/index.ts");
  const { startLogMcpHttp, startLogMcpServer } = await import("../src/mcp/server/index.ts");
  recordServerStart(root);
  if (argv.includes("--http")) await startLogMcpHttp(root, { host: flag("host"), port: flag("port") ? Number(flag("port")) : undefined });
  else await startLogMcpServer(root);
} else {
  const { runReloadProxy } = await import("../src/mcp/reload/index.ts");
  runReloadProxy(root);
}
