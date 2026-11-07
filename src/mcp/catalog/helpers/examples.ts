import type { CatalogEntry, CatalogInput } from "../types.ts";

const BY_NAME: Readonly<Record<string, string>> = {
  account: "yourAccount",
  accounts: "yourAccount",
  handle: "someHandle",
  with: "someHandle",
  to: "someHandle",
  userId: "12345",
  user: "someHandle",
  text: "hello",
  query: "what to look for",
  group: "https://www.facebook.com/groups/123456789",
  listing: "listingId",
  campaign: "campaignId",
  id: "exampleId",
  name: "exampleName",
  file: "./example.json",
  path: "./example.json",
  url: "https://example.com",
  channel: "general",
  chat: "general",
  thread: "threadId",
  tweet: "https://x.com/someHandle/status/1",
  post: "https://x.com/someHandle/status/1",
  queue: "exampleQueue",
  approvedBy: "matt",
  by: "matt",
  platform: "twitter",
  key: "exampleKey",
  emoji: "👍",
  message: "messageId",
  workspace: "example",
  list: "exampleList",
  topic: "logMcpInstructions",
};

const PLACEHOLDER = /^<([^>]+)>$/;

export function exampleValue(input: CatalogInput): unknown {
  if (input.type === "boolean") return true;
  if (input.type === "integer") return 1;
  if (input.type === "enum") return input.values[0] ?? "value";
  if (input.type === "pairs") return { key: "value" };
  if (input.type === "list") return ["value"];
  if (input.values.length) return input.values[0];
  return BY_NAME[input.name] ?? `example${input.name[0].toUpperCase()}${input.name.slice(1)}`;
}

function sampleOf(word: string): string {
  const name = word.replace(/[^A-Za-z]/g, "");
  return BY_NAME[name] ?? (name ? `example${name[0].toUpperCase()}${name.slice(1)}` : "value");
}

export function exampleArgs(entry: CatalogEntry): string[] {
  const line = entry.usage[0] ?? "";
  const head = entry.command.platform === "byArgument" ? `log ${entry.command.name}` : `log ${entry.id.split(".").slice(0, entry.command.platform === "any" ? 1 : 2).join(" ")}`;
  const rest = line.startsWith(head) ? line.slice(head.length).trim() : "";
  const prefix = entry.command.platform === "byArgument" ? ["facebook"] : [];
  const words: string[] = [];
  for (const token of rest.split(/\s+/).filter(Boolean)) {
    if (token.startsWith("[") || token === "|" || token.includes("|")) break;
    const placeholder = PLACEHOLDER.exec(token);
    if (placeholder) words.push(sampleOf(placeholder[1]));
    else if (/^--[A-Za-z]+$/.test(token) || /^[a-z][A-Za-z]*$/.test(token)) words.push(token);
    else break;
  }
  if (entry.command.platform === "byArgument" && words[0] === "platform") words.shift();
  return [...prefix, ...words.filter((w) => w !== "--live" && w !== "--likes" && w !== "--bypass")];
}

export function exampleInputs(entry: CatalogEntry): Record<string, unknown> {
  if (!entry.form) return { args: exampleArgs(entry) };
  return Object.fromEntries(entry.inputs.filter((i) => i.required).map((i) => [i.name, exampleValue(i)]));
}

export function cliExample(entry: CatalogEntry, inputs: Record<string, unknown>): string {
  const words = entry.command.platform === "byArgument" ? ["log"] : ["log", ...entry.id.split(".")];
  if (!entry.form) {
    const args = (inputs.args as string[] | undefined) ?? [];
    return entry.command.platform === "byArgument" ? ["log", args[0] ?? "<platform>", entry.command.name, ...args.slice(1)].join(" ") : [...words, ...args].join(" ");
  }
  const quoted = (value: string) => (/[\s"']/.test(value) ? JSON.stringify(value) : value);
  const parts: string[] = [];
  for (const input of [...entry.inputs.filter((i) => i.positional), ...entry.inputs.filter((i) => !i.positional)]) {
    const value = inputs[input.name];
    if (value === undefined || value === false) continue;
    if (input.positional) parts.push(Array.isArray(value) ? value.map(String).map(quoted).join(" ") : quoted(String(value)));
    else if (value === true) parts.push(`--${input.name}`);
    else if (input.type === "pairs") for (const [k, v] of Object.entries(value as Record<string, string>)) parts.push(`--${input.name}`, quoted(`${k}=${v}`));
    else parts.push(`--${input.name}`, quoted(String(value)));
  }
  return [...words, ...parts].join(" ");
}
