import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { parseEnvFile, userEnvPath } from "../../config/userEnv/index.ts";
import { CREDENTIAL_PROVIDERS, credentialFields, DEFAULT_ADSPOWER_HOST } from "./types.ts";
import type { CredentialProvider, CredentialSaveResult } from "./types.ts";

type Env = Record<string, string | undefined>;

export function isCredentialProvider(value: unknown): value is CredentialProvider {
  return typeof value === "string" && (CREDENTIAL_PROVIDERS as readonly string[]).includes(value);
}

export function savedCredential(name: string, env: Env = process.env): string | null {
  if (!env.LOG_USER_ENV && (env !== process.env || process.env.NODE_ENV === "test")) return null;
  const path = userEnvPath(env);
  if (!existsSync(path)) return null;
  return parseEnvFile(readFileSync(path, "utf8"))[name]?.trim() || null;
}

export function adsPowerHomesValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed.toLowerCase() === "all") return "all";
  const homes = [...new Set(trimmed.split(",").map((home) => home.trim().toUpperCase()).filter(Boolean))].join(",");
  if (!/^[A-Z]{2}(,[A-Z]{2})*$/.test(homes)) throw new Error("credentialInputInvalid");
  return homes;
}

export function adsPowerHostValue(value: string): string {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("credentialInputInvalid");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error("credentialInputInvalid");
  return url.origin;
}

function cleanValue(value: unknown): string {
  if (typeof value !== "string") throw new Error("credentialInputInvalid");
  const trimmed = value.trim();
  if (trimmed.length > 8192 || /[\r\n\0"']/.test(trimmed)) throw new Error("credentialInputInvalid");
  return trimmed;
}

export function validateCredentialInput(provider: unknown, values: unknown): { provider: CredentialProvider; values: Record<string, string> } {
  if (!isCredentialProvider(provider) || !values || typeof values !== "object" || Array.isArray(values)) throw new Error("credentialInputInvalid");
  const fields = credentialFields[provider];
  const input = values as Record<string, unknown>;
  if (Object.keys(input).some((name) => !fields.some((field) => field.id === name))) throw new Error("credentialInputInvalid");
  const cleaned: Record<string, string> = {};
  for (const field of fields) {
    const value = input[field.id] === undefined ? "" : cleanValue(input[field.id]);
    if (!value) {
      if (field.required !== false) throw new Error("credentialInputInvalid");
      continue;
    }
    cleaned[field.id] = field.id === "LOG_ADSPOWER_HOMES" ? adsPowerHomesValue(value) : field.id === "ADSPOWER_HOST" ? adsPowerHostValue(value) : value;
  }
  return { provider, values: cleaned };
}

export function saveProviderCredentials(provider: CredentialProvider, values: Record<string, string>, env: Env = process.env): CredentialSaveResult {
  const fields = credentialFields[provider];
  const entries = Object.entries(values);
  if (!entries.length || entries.some(([name, value]) => !fields.some((field) => field.id === name) || cleanValue(value) !== value || !value)) throw new Error("credentialInputInvalid");
  const path = userEnvPath(env);
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const previous = parseEnvFile(existing);
  const changed = entries.filter(([name, value]) => previous[name] !== value);
  if (!changed.length) return { saved: true, changed: false };
  const update = new Map(changed);
  const lines = existing.split(/\r?\n/).filter((line) => {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line);
    return !match || !update.has(match[1]);
  });
  while (lines.at(-1) === "") lines.pop();
  for (const [name, value] of update) lines.push(`${name}="${value}"`);
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const pending = `${path}.${process.pid}.pending`;
  writeFileSync(pending, `${lines.join("\n")}\n`, { mode: 0o600 });
  chmodSync(pending, 0o600);
  renameSync(pending, path);
  const verified = parseEnvFile(readFileSync(path, "utf8"));
  for (const [name, value] of update) {
    if (verified[name] !== value) throw new Error("credentialSaveUnconfirmed");
    env[name] = value;
  }
  return { saved: true, changed: true };
}

export function readPublicCredentials(provider: unknown, lookup: (name: string) => string | null): Record<string, string> {
  if (!isCredentialProvider(provider)) throw new Error("credentialInputInvalid");
  const values: Record<string, string> = {};
  for (const field of credentialFields[provider]) if (!field.secret) values[field.id] = lookup(field.id) ?? "";
  if (provider === "adsPower") {
    values.ADSPOWER_HOST ||= DEFAULT_ADSPOWER_HOST;
    values.LOG_ADSPOWER_HOMES ||= "all";
  }
  return values;
}
