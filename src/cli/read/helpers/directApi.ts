import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FacebookAccount } from "../../../marketplace/socialAccount/index.ts";

interface Cookie { name: string; value: string; domain?: string; path?: string; expires?: number; httpOnly?: boolean }

export interface DirectPost { id: string | null; text: string; creation_time: number | null; author?: unknown }
export type DirectRead = { ok: true; rows: DirectPost[] } | { ok: false; detail: string };

function cookiesOf(account: FacebookAccount): Cookie[] {
  const raw = (account as unknown as { cookies: unknown }).cookies;
  if (Array.isArray(raw)) return raw as Cookie[];
  if (typeof raw === "string" && raw) {
    try {
      return JSON.parse(raw) as Cookie[];
    } catch {
      return [];
    }
  }
  return [];
}

export function accountHasSession(account: FacebookAccount): boolean {
  const names = new Set(cookiesOf(account).map((c) => c.name));
  return names.has("c_user") && names.has("xs");
}

function netscape(cookies: Cookie[]): string {
  const lines = ["# Netscape HTTP Cookie File"];
  for (const c of cookies) {
    const domain = c.domain?.startsWith(".") ? c.domain : `.${(c.domain || "facebook.com").replace(/^\./, "")}`;
    const expiry = c.expires && c.expires > 0 ? Math.floor(c.expires) : 9999999999;
    const row = `${domain}\tTRUE\t${c.path || "/"}\tTRUE\t${expiry}\t${c.name}\t${c.value}`;
    lines.push(c.httpOnly ? `#HttpOnly_${row}` : row);
  }
  return lines.join("\n") + "\n";
}

export function readGroupDirect(account: FacebookAccount, groupId: string): DirectRead {
  if (!account.proxy) return { ok: false, detail: "no proxy" };
  const dir = mkdtempSync(join(tmpdir(), "readDirect"));
  try {
    const jar = join(dir, "cookies.txt");
    writeFileSync(jar, netscape(cookiesOf(account)), { mode: 0o600 });
    const spec = join(dir, "spec.json");
    writeFileSync(spec, JSON.stringify({ surface: "groups", method: "feed_read", args: [groupId], cookiesPath: jar, proxy: account.proxy }), { mode: 0o600 });
    const engine = join(import.meta.dir, "..", "..", "..", "..", "python", "directApi", "engine.py");
    const run = spawnSync(process.env.LOG_PYTHON || "python", [engine, spec], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    const line = (run.stdout || "").trim().split("\n").filter(Boolean).pop() || "";
    let out: { ok?: boolean; rows?: DirectPost[]; detail?: string };
    try {
      out = JSON.parse(line) as typeof out;
    } catch {
      return { ok: false, detail: (run.stderr || "no output").slice(0, 200) };
    }
    return out.ok ? { ok: true, rows: out.rows ?? [] } : { ok: false, detail: out.detail ?? "direct read failed" };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function renderDirectRead(rows: DirectPost[]): string {
  const lines = [`log facebook read group: ${rows.length} post(s) via the direct-API engine (fbk groups.feed_read, no browser).`];
  for (const p of rows) {
    const when = p.creation_time ? new Date(p.creation_time * 1000).toISOString().slice(0, 16) : "?";
    lines.push(`  ${when} ${(p.text || "(no text)").replace(/\s+/g, " ").slice(0, 100)}`);
  }
  lines.push("  Twenty: lastReadAt updated; posts go to OpenMagpie, only matches reach Twenty (rule 65).");
  return lines.join("\n");
}
