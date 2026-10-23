import { createHash } from "node:crypto";
import type { BrowserCapture, CapturedScript } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function scriptText(content: Record<string, unknown>): string | null {
  const text = content.text;
  if (typeof text !== "string" || text.length === 0) return null;
  if (String(content.encoding ?? "").toLowerCase() === "base64") {
    try {
      return Buffer.from(text, "base64").toString("utf8");
    } catch {
      return null;
    }
  }
  return text;
}

function isScript(url: string, mime: string): boolean {
  const type = mime.toLowerCase();
  if (type.includes("javascript") || type.includes("ecmascript")) return true;
  try {
    return new URL(url).pathname.endsWith(".js");
  } catch {
    return url.split("?")[0].endsWith(".js");
  }
}

export function exportScripts(value: unknown): BrowserCapture {
  const scripts: CapturedScript[] = [];
  if (!isRecord(value) || !isRecord(value.log) || !Array.isArray(value.log.entries)) {
    return { har: isRecord(value) ? value : { log: { entries: [] } }, entries: 0, scripts };
  }
  const entries = value.log.entries as unknown[];
  for (const entry of entries) {
    if (!isRecord(entry)) continue;
    const request = isRecord(entry.request) ? entry.request : {};
    const response = isRecord(entry.response) ? entry.response : {};
    const content = isRecord(response.content) ? response.content : null;
    if (!content) continue;
    const url = typeof request.url === "string" ? request.url : "";
    const text = scriptText(content);
    if (text && isScript(url, String(content.mimeType ?? ""))) {
      const file = `script${scripts.length}.js`;
      scripts.push({ file, url, sha256: createHash("sha256").update(text).digest("hex"), text });
    }
  }
  return { har: value, entries: entries.length, scripts };
}

export function manifestFor(scripts: CapturedScript[]): { scripts: Array<Omit<CapturedScript, "text">> } {
  return { scripts: scripts.map(({ file, url, sha256 }) => ({ file, url, sha256 })) };
}
