import { conversationsDbPath, loadConversations } from "../../search/conversations/index.ts";
import type { Conversation, ConversationMessage } from "../../search/conversations/index.ts";
import { useDatabase } from "../../storage/schema/index.ts";
import { isMirror, personKeyOf } from "../../twitter/dm/person/index.ts";
import { SendersNoDataError, SENDERS_ACTIVITY_DAYS, SENDERS_DEFAULT_LIMIT, SENDERS_MAX_LIMIT, SENDERS_PREVIEW_CHARS } from "./types.ts";
import type { Sender, SendersOptions, SendersReport } from "./types.ts";

const DAY_MS = 86_400_000;

export function sinceOf(value: string | null | undefined, now: Date = new Date()): string | null {
  const text = (value ?? "").trim();
  if (!text) return null;
  const relative = /^(\d{1,4})([dwh])$/.exec(text);
  if (relative) {
    const hours = Number(relative[1]) * (relative[2] === "w" ? 168 : relative[2] === "d" ? 24 : 1);
    return new Date(now.getTime() - hours * 3_600_000).toISOString();
  }
  const at = Date.parse(text);
  if (Number.isNaN(at)) throw new Error(`sinceInvalid: "${text}" is neither a date (2026-11-01) nor a span (7d, 4w, 12h)`);
  return new Date(at).toISOString();
}

const handleOf = (text: string): string => text.replace(/^@/, "");

function inbound(messages: readonly ConversationMessage[], since: string | null): ConversationMessage[] {
  const sorted = messages.filter((m) => !m.fromMe && m.at && (!since || m.at >= since)).sort((a, b) => (a.at ?? "").localeCompare(b.at ?? ""));
  const kept: ConversationMessage[] = [];
  for (const m of sorted) {
    const at = Date.parse(m.at ?? "");
    let mirrored = false;
    for (let i = kept.length - 1; i >= 0 && at - Date.parse(kept[i].at ?? "") <= 5_000; i--) {
      if (isMirror(kept[i], m)) {
        mirrored = true;
        break;
      }
    }
    if (!mirrored) kept.push(m);
  }
  return kept;
}

export function sendersOf(conversations: readonly Conversation[], options: SendersOptions = {}, names: ReadonlyMap<string, string> = new Map(), platform = "twitter"): SendersReport {
  const since = sinceOf(options.since, options.now);
  const account = options.account ? handleOf(options.account) : null;
  const limit = Math.min(Math.max(1, options.limit ?? SENDERS_DEFAULT_LIMIT), SENDERS_MAX_LIMIT);
  const oneToOne = conversations.filter((c) => c.platform === platform && c.with.length === 1 && (!account || c.account.toLowerCase() === account.toLowerCase()));
  const groups = new Map<string, { handle: string; account: string; messages: ConversationMessage[] }>();
  for (const c of oneToOne) {
    const key = `${c.account}\u0000${personKeyOf(c.conversationId)}`;
    const group = groups.get(key) ?? { handle: handleOf(c.with[0]), account: c.account, messages: [] };
    group.messages.push(...c.messages);
    groups.set(key, group);
  }
  const kept: { group: { handle: string; account: string }; messages: ConversationMessage[] }[] = [];
  const days = new Map<string, number>();
  for (const group of groups.values()) {
    const messages = inbound(group.messages, since);
    if (!messages.length) continue;
    for (const m of messages) days.set(m.at!.slice(0, 10), (days.get(m.at!.slice(0, 10)) ?? 0) + 1);
    kept.push({ group, messages });
  }
  const lastDay = [...days.keys()].sort().at(-1);
  const window = lastDay ? Array.from({ length: SENDERS_ACTIVITY_DAYS }, (_, i) => new Date(Date.parse(`${lastDay}T00:00:00Z`) - (SENDERS_ACTIVITY_DAYS - 1 - i) * DAY_MS).toISOString().slice(0, 10)) : [];
  const senders: Sender[] = kept.map(({ group, messages }) => {
    const perDay = new Map<string, number>();
    for (const m of messages) perDay.set(m.at!.slice(0, 10), (perDay.get(m.at!.slice(0, 10)) ?? 0) + 1);
    const last = [...messages].reverse().find((m) => m.text.trim() && !/^\(.*\)$/s.test(m.text.trim()));
    return {
      handle: group.handle,
      name: names.get(group.handle.toLowerCase()) || group.handle,
      account: group.account,
      count: messages.length,
      firstAt: messages[0].at,
      lastAt: messages.at(-1)!.at,
      activity: window.map((day) => perDay.get(day) ?? 0),
      lastMessage: last ? last.text.replace(/\s+/g, " ").trim().slice(0, SENDERS_PREVIEW_CHARS) : null,
    };
  });
  senders.sort((a, b) => b.count - a.count || (b.lastAt ?? "").localeCompare(a.lastAt ?? "") || a.handle.localeCompare(b.handle));
  return {
    source: "twitterDmsBySender",
    readFrom: "log.db",
    account,
    accounts: [...new Set(oneToOne.map((c) => c.account))].sort(),
    since,
    messages: senders.reduce((sum, s) => sum + s.count, 0),
    people: senders.length,
    senders: senders.slice(0, limit),
    byDay: fillDays(days, since),
  };
}

function fillDays(days: ReadonlyMap<string, number>, since: string | null): { day: string; count: number }[] {
  const keys = [...days.keys()].sort();
  if (!keys.length) return [];
  const start = Date.parse(`${since ? since.slice(0, 10) : keys[0]}T00:00:00Z`);
  const end = Date.parse(`${keys.at(-1)}T00:00:00Z`);
  if ((end - start) / DAY_MS > 366) return keys.map((day) => ({ day, count: days.get(day)! }));
  const out: { day: string; count: number }[] = [];
  for (let t = start; t <= end; t += DAY_MS) {
    const day = new Date(t).toISOString().slice(0, 10);
    out.push({ day, count: days.get(day) ?? 0 });
  }
  return out;
}

export function identityNames(platform: string, path: string = conversationsDbPath()): Map<string, string> {
  return useDatabase(path, (handle) => {
    const rows = handle.prepare("SELECT handle, displayName FROM identities WHERE platform = ? AND handle IS NOT NULL AND displayName IS NOT NULL AND displayName <> ''").all(platform) as { handle: string; displayName: string }[];
    return new Map(rows.map((r) => [handleOf(r.handle).toLowerCase(), r.displayName]));
  });
}

export function twitterNames(path: string = conversationsDbPath()): Map<string, string> {
  return identityNames("twitter", path);
}

export function readTwitterSenders(options: SendersOptions = {}, path: string = conversationsDbPath()): SendersReport {
  return sendersOf(loadConversations(path, { platform: "twitter" }), options, twitterNames(path));
}

export function readPlatformSenders(platform: string, options: SendersOptions = {}, path: string = conversationsDbPath()): SendersReport {
  const conversations = loadConversations(path, { platform });
  if (!conversations.length) throw new SendersNoDataError(platform);
  return { ...sendersOf(conversations, options, identityNames(platform, path), platform), source: "dmsBySender", platform };
}
