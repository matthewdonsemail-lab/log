/** Reading Facebook's JSON as the HAR recorded it: its streamed answers and the page's own script blocks. Pure. */

export type Json = Record<string, unknown>;
export const obj = (v: unknown): Json | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : null);
export const str = (v: unknown): string => (typeof v === "string" ? v : "");
export const at = (o: unknown, ...keys: (string | number)[]): unknown => keys.reduce<unknown>((v, k) => (Array.isArray(v) ? v[k as number] : obj(v)?.[k as string]), o);

/** A streamed answer's chunks, one JSON object a line, after Facebook's `for (;;);` guard. A line cut short is skipped. */
export function chunksOf(text: string): Json[] {
  const body = text.startsWith("for (;;);") ? text.slice(9) : text;
  const chunks: Json[] = [];
  for (const line of body.split("\n")) {
    if (!line.trim()) continue;
    try {
      const chunk = obj(JSON.parse(line));
      if (chunk) chunks.push(chunk);
    } catch {
      // A line cut short: the rest of the response still counts.
    }
  }
  return chunks;
}

/** Every `__bbox.result` in a page's JSON script blocks (the answers Facebook embeds in the HTML), in page order. */
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
      // A block that isn't JSON: the rest of the page still counts.
    }
  }
  return results;
}

/** The answers to the named queries in a recorded step's HAR (by `fb_api_req_friendly_name`), in the order they came. */
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

/** The HTML pages a recorded step loaded (its documents), in the order they came. A goto's own page is among them. */
export function documentsOf(har: { log?: { entries?: unknown[] } }): string[] {
  const out: string[] = [];
  for (const entry of har.log?.entries ?? []) {
    const mime = str(at(entry, "response", "content", "mimeType"));
    const text = str(at(entry, "response", "content", "text"));
    if (mime.includes("text/html") && text.includes("<script")) out.push(text);
  }
  return out;
}

/** The group's numeric id from its page's own feed (`data.group.id` beside `group_feed`), for a group given by its name. Pure. */
export function groupIdFromPage(html: string): string | null {
  for (const result of embeddedResults(html)) {
    const group = obj(at(result, "data", "group"));
    const id = str(group?.id);
    if (group && "group_feed" in group && /^\d+$/.test(id)) return id;
  }
  return null;
}
