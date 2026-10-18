/**
 * Reading and writing the per-account proxy files. The only I/O in
 * camofox/proxy. The Python never gets credentials on its command line: it is
 * handed this file's path and reads it itself (`python/proxyGate.py`).
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { validateProxy } from "./helpers/index.ts";
import type { ProxyConfig } from "./types.ts";

export function proxyPath(accountId: string, env: Record<string, string | undefined> = process.env): string {
  const dir = env.LOG_PROXY_DIR || join(homedir(), ".logCli", "proxies");
  return join(dir, `${accountId}.json`);
}

export type ReadProxyResult = { ok: true; proxy: ProxyConfig } | { ok: false; code: "noProxy" | "proxyMalformed"; detail: string };

export function readProxy(accountId: string, path = proxyPath(accountId)): ReadProxyResult {
  if (!existsSync(path)) {
    return { ok: false, code: "noProxy", detail: `no proxy for ${accountId} (${path}). Run: log proxy set --account ${accountId} --file <proxy.json>` };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    return { ok: false, code: "proxyMalformed", detail: `${path}: ${error instanceof Error ? error.message : String(error)}` };
  }
  const problems = validateProxy(parsed);
  if (problems.length) return { ok: false, code: "proxyMalformed", detail: `${path}: ${problems.join("; ")}` };
  return { ok: true, proxy: parsed as ProxyConfig };
}

export function writeProxy(accountId: string, proxy: ProxyConfig, path = proxyPath(accountId)): string {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(proxy, null, 2)}\n`);
  try {
    chmodSync(path, 0o600);
  } catch {
    // Windows: permissions come from the user profile folder.
  }
  return path;
}
