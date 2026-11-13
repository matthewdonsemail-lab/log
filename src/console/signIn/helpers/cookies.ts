function pairsOfJson(value: unknown): [string, string][] {
  if (Array.isArray(value)) return value.flatMap((item) => (item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string" && typeof (item as { value?: unknown }).value === "string" ? [[(item as { name: string }).name, (item as { value: string }).value] as [string, string]] : []));
  if (value && typeof value === "object") {
    const nested = (value as { cookies?: unknown }).cookies;
    if (nested) return pairsOfJson(nested);
    return Object.entries(value as Record<string, unknown>).flatMap(([name, item]) => (typeof item === "string" ? [[name, item] as [string, string]] : []));
  }
  return [];
}

function pairsOfText(text: string): [string, string][] {
  const pairs: [string, string][] = [];
  for (const line of text.split(/\r?\n/)) {
    const columns = line.split("\t");
    if (columns.length >= 7 && !line.trimStart().startsWith("#")) {
      pairs.push([columns[5].trim(), columns[6].trim()]);
      continue;
    }
    for (const part of line.split(";")) {
      const match = /^\s*([A-Za-z0-9_\-.]+)\s*(?:=|:|\t)\s*(.*?)\s*$/.exec(part);
      if (match && match[2]) pairs.push([match[1], match[2].replace(/^"(.*)"$/, (_, inner: string) => (inner.startsWith("ajax:") ? `"${inner}"` : inner))]);
    }
  }
  return pairs;
}

export function parseCookies(text: unknown, names: readonly string[]): Record<string, string> {
  if (typeof text !== "string" || !text.trim() || text.length > 65536) throw new Error("cookiesIncomplete");
  let pairs: [string, string][];
  try {
    pairs = pairsOfJson(JSON.parse(text));
  } catch {
    pairs = pairsOfText(text);
  }
  const found: Record<string, string> = {};
  for (const name of names) {
    const hit = pairs.find(([key]) => key === name) ?? pairs.find(([key]) => key.toLowerCase() === name.toLowerCase());
    const value = hit?.[1]?.trim();
    if (!value || /[\r\n\0]/.test(value)) throw new Error("cookiesIncomplete");
    found[name] = value;
  }
  return found;
}
