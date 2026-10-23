#!/usr/bin/env bun
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
