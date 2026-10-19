#!/usr/bin/env bun
/**
 * log MCP server entrypoint (stdio). Every `log` command is a tool; the
 * wiring lives in `src/mcp/server`.
 */
import { resolve } from "node:path";
import { startLogMcpServer } from "../src/mcp/server/index.ts";

await startLogMcpServer(resolve(import.meta.dir, ".."));
