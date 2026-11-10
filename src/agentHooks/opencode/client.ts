import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { HarnessInstall, MergeResult } from "./types.ts";

export const SERVER = "log";

export const DEFAULT_SCHEMA = "https://opencode.ai/config.json";

export const PACKAGE_ROOT = join(import.meta.dir, "..", "..", "..");

export function opencodeConfigDir(): string {
  return process.env.LOG_OPENCODE_DIR || join(homedir(), ".config", "opencode");
}

export function logMcpCommand(root: string = PACKAGE_ROOT): string[] {
  return ["bun", "--cwd", root, "bin", "logMcp.ts"];
}

export function stripJsonc(text: string): string {
  let out = "";
  let inString = false;
  let inLine = false;
  let inBlock = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (inLine) {
      if (char === "\n") {
        inLine = false;
        out += char;
      }
      continue;
    }
    if (inBlock) {
      if (char === "*" && next === "/") {
        inBlock = false;
        i++;
      }
      continue;
    }
    if (inString) {
      out += char;
      if (char === "\\") {
        out += next ?? "";
        i++;
      } else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      out += char;
      continue;
    }
    if (char === "/" && next === "/") {
      inLine = true;
      i++;
      continue;
    }
    if (char === "/" && next === "*") {
      inBlock = true;
      i++;
      continue;
    }
    out += char;
  }
  return out.replace(/,(\s*[}\]])/g, "$1");
}

export function mergeConfig(text: string, command: string[]): MergeResult {
  const parsed = text.trim() ? (JSON.parse(stripJsonc(text)) as Record<string, unknown>) : {};
  const mcp = (parsed.mcp ?? {}) as Record<string, unknown>;
  const servers: Record<string, unknown> = { ...((mcp.servers ?? {}) as Record<string, unknown>) };
  let changed = false;
  for (const [name, value] of Object.entries(mcp)) {
    if (name === "servers" || name === "timeout") continue;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const server = { ...(value as Record<string, unknown>) };
      if (server.enabled === false) server.disabled = true;
      if ("enabled" in server) delete server.enabled;
      servers[name] = server;
      changed = true;
    }
  }
  const wanted = { type: "local", command, codemode: false };
  const same = JSON.stringify(servers[SERVER]) === JSON.stringify(wanted);
  servers[SERVER] = wanted;
  const nextMcp: Record<string, unknown> = { ...mcp, servers };
  for (const name of Object.keys(mcp)) if (name !== "servers" && name !== "timeout") delete nextMcp[name];
  const out: Record<string, unknown> = {};
  out.$schema = typeof parsed.$schema === "string" ? parsed.$schema : DEFAULT_SCHEMA;
  for (const [key, value] of Object.entries(parsed)) if (key !== "$schema") out[key] = value;
  out.mcp = nextMcp;
  return { text: `${JSON.stringify(out, null, 2)}\n`, changed: changed || !same };
}

export function configPathIn(dir: string): string {
  for (const name of ["opencode.jsonc", "opencode.json"]) {
    const path = join(dir, name);
    if (existsSync(path)) return path;
  }
  return join(dir, "opencode.jsonc");
}

export function copyPlugin(from: string, to: string): string[] {
  const copied: string[] = [];
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const source = join(from, entry.name);
    const target = join(to, entry.name);
    if (entry.isDirectory()) {
      copied.push(...copyPlugin(source, target));
      continue;
    }
    if (!statSync(source).isFile()) continue;
    copyFileSync(source, target);
    copied.push(target);
  }
  return copied;
}

export function installOpenCode(dir: string = opencodeConfigDir(), root: string = PACKAGE_ROOT): HarnessInstall {
  mkdirSync(dir, { recursive: true });
  const configPath = configPathIn(dir);
  const existed = existsSync(configPath);
  const before = existed ? readFileSync(configPath, "utf8") : "";
  const merged = mergeConfig(before, logMcpCommand(root));
  if (merged.changed || !existed) writeFileSync(configPath, merged.text);
  const from = join(root, ".opencode", "plugins", "logHooks");
  const pluginDir = join(dir, "plugins", "logHooks");
  const pluginFiles = existsSync(from) ? copyPlugin(from, pluginDir) : [];
  return { configPath, changed: merged.changed || !existed, pluginDir, pluginFiles };
}
