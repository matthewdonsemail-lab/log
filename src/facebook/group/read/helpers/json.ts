export type Json = Record<string, unknown>;
export const obj = (v: unknown): Json | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : null);
export const str = (v: unknown): string => (typeof v === "string" ? v : "");
export const at = (o: unknown, ...keys: (string | number)[]): unknown => keys.reduce<unknown>((v, k) => (Array.isArray(v) ? v[k as number] : obj(v)?.[k as string]), o);

export function chunksOf(text: string): Json[] {
  const body = text.startsWith("for (;;);") ? text.slice(9) : text;
  const chunks: Json[] = [];
  for (const line of body.split("\n")) {
    if (!line.trim()) continue;
    try {
      const chunk = obj(JSON.parse(line));
      if (chunk) chunks.push(chunk);
    } catch {
    }
  }
  return chunks;
}

export function embeddedResults(html: string): Json[] {
  const results: Json[] = [];
  const walk = (v: unknown): void => {
    if (!v || typeof v !== "object") return;
    const result = obj(at(v, "__bbox", "result"));
    if (result && obj(result.data)) results.push(result);
    for (const child of Object.values(v)) walk(child);
  };
  for (const [, block] of html.matchAll(/<script type="application\/json"[^>]*>(.*?)<\/script>/gs)) {
    try {
      walk(JSON.parse(block ?? ""));
    } catch {
    }
  }
  return results;
}

export function responsesOf(har: { log?: { entries?: unknown[] } }, names: readonly string[]): string[] {
  const out: string[] = [];
  for (const entry of har.log?.entries ?? []) {
    const form = obj(at(entry, "request", "postData"));
    const params = Array.isArray(form?.params) ? (form?.params as Json[]) : [];
    const name = params.find((p) => p.name === "fb_api_req_friendly_name")?.value ?? new URLSearchParams(str(form?.text)).get("fb_api_req_friendly_name");
    if (typeof name !== "string" || !names.includes(name)) continue;
    const text = str(at(entry, "response", "content", "text"));
    if (text) out.push(text);
  }
  return out;
}

export function documentsOf(har: { log?: { entries?: unknown[] } }): string[] {
  const out: string[] = [];
  for (const entry of har.log?.entries ?? []) {
    const mime = str(at(entry, "response", "content", "mimeType"));
    const text = str(at(entry, "response", "content", "text"));
    if (mime.includes("text/html") && text.includes("<script")) out.push(text);
  }
  return out;
}

export function groupIdFromPage(html: string): string | null {
  for (const result of embeddedResults(html)) {
    const group = obj(at(result, "data", "group"));
    const id = str(group?.id);
    if (group && "group_feed" in group && /^\d+$/.test(id)) return id;
  }
  return null;
}
