import { createHash } from "node:crypto";
import type { FirefoxCapture, FirefoxScript, FirefoxStripCounts } from "../types";

const SECRET_HEADERS = new Set(["cookie", "set-cookie", "authorization", "proxy-authorization"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function headerName(header: Record<string, unknown>): string {
  return String(header.name ?? "").toLowerCase();
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

/**
 * Copy a HAR from Playwright Firefox and take the secrets out.
 *
 * Cookies, cookie and authorization headers, and query values go. Response
 * and request bodies go too, after any JavaScript body has been copied onto
 * `scripts`. What remains is method, URL, status and type: enough for
 * `rea inspect-web-network-capture`, without a session cookie on disk.
 * Pure.
 */
export function stripHar(value: unknown): FirefoxCapture {
  const counts: FirefoxStripCounts = { cookies: 0, headers: 0, bodies: 0, queryValues: 0 };
  const scripts: FirefoxScript[] = [];
  if (!isRecord(value) || !isRecord(value.log) || !Array.isArray(value.log.entries)) {
    return { har: isRecord(value) ? structuredClone(value) : { log: { entries: [] } }, counts, scripts };
  }

  const har = structuredClone(value) as Record<string, unknown>;
  const log = har.log as Record<string, unknown>;
  const entries = log.entries as Record<string, unknown>[];

  for (const entry of entries) {
    const request = isRecord(entry.request) ? entry.request : {};
    const response = isRecord(entry.response) ? entry.response : {};
    for (const side of [request, response]) {
      if (Array.isArray(side.cookies) && side.cookies.length > 0) {
        counts.cookies += side.cookies.length;
        side.cookies = [];
      }
      if (Array.isArray(side.headers)) {
        const kept = [];
        for (const header of side.headers) {
          if (!isRecord(header)) continue;
          if (SECRET_HEADERS.has(headerName(header))) {
            counts.headers += 1;
            continue;
          }
          kept.push(header);
        }
        side.headers = kept;
      }
    }
    if (Array.isArray(request.queryString)) {
      for (const item of request.queryString) {
        if (isRecord(item) && typeof item.value === "string" && item.value.length > 0) {
          item.value = "";
          counts.queryValues += 1;
        }
      }
    }
    if (isRecord(request.postData)) {
      if ("text" in request.postData || "params" in request.postData) counts.bodies += 1;
      delete request.postData.text;
      delete request.postData.params;
    }
    const content = isRecord(response.content) ? response.content : null;
    const url = typeof request.url === "string" ? request.url : "";
    const mime = content ? String(content.mimeType ?? "") : "";
    if (content) {
      const text = scriptText(content);
      if (text && isScript(url, mime)) {
        const file = `script${scripts.length}.js`;
        scripts.push({ file, url, sha256: createHash("sha256").update(text).digest("hex"), text });
      }
      if ("text" in content || "encoding" in content) counts.bodies += 1;
      delete content.text;
      delete content.encoding;
    }
    entry.request = request;
    entry.response = response;
  }

  return { har, counts, scripts };
}

export function manifestFor(scripts: FirefoxScript[]): { scripts: Array<Omit<FirefoxScript, "text">> } {
  return { scripts: scripts.map(({ file, url, sha256 }) => ({ file, url, sha256 })) };
}
