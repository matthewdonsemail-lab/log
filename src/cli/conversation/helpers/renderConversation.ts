import type { Conversation, Message, RecordThreadResult, ScannedThread } from "../../../marketplace/conversation/index.ts";

const when = (iso: string | null) => (iso ? iso.replace("T", " ").slice(0, 16) : "-");

export function renderConversations(conversations: Conversation[]): string {
  if (!conversations.length) return "No Marketplace conversations in Twenty yet.";
  const lines = [`${conversations.length} conversation(s):`];
  for (const c of conversations) {
    const unread = c.unreadCount ? ` ${c.unreadCount} unread` : "";
    const listing = c.agencyListingId ? "" : " (listing not matched)";
    lines.push(`  ${c.id}  ${when(c.latestMessageAt)}  ${c.leadStatus ?? "new"}${unread}  ${c.buyerName ?? "?"} · ${c.listingTitle ?? "?"}${listing}`);
    if (c.latestPreview) lines.push(`      ${c.latestDirection === "outbound" ? "we: " : ""}${c.latestPreview}`);
  }
  return lines.join("\n");
}

export function renderConversation(c: Conversation, messages: Message[]): string {
  if (c.channel === "sms") return `${c.id} is one of blaster's SMS threads (${c.messageCount} message(s)); its history lives in blaster, not here.`;
  const lines = [
    `${c.buyerName ?? "?"} · ${c.listingTitle ?? "?"}`,
    `  lead: ${c.leadStatus ?? "new"}   messages: ${c.messageCount}   unread: ${c.unreadCount}   first replied: ${when(c.respondedAt)}`,
    `  account: ${c.socialAccountId ?? "-"}   listing: ${c.agencyListingId ?? "not matched (log facebook conversation link <id> --listing <agencyListingId>)"}`,
    `  Facebook thread: ${c.facebookThreadId ?? "-"}${c.facebookListingId ? `   item: ${c.facebookListingId}` : ""}`,
  ];
  if (c.buyerPhone || c.buyerEmail) lines.push(`  buyer gave: ${[c.buyerPhone, c.buyerEmail].filter(Boolean).join(", ")}`);
  for (const m of messages) {
    const who = m.direction === "outbound" ? `we${m.sentBy && m.sentBy !== "person" ? ` (${m.sentBy})` : ""}` : (m.senderName ?? "buyer");
    lines.push(`  ${when(m.sentAt ?? m.createdAt)}  ${m.direction === "inbound" && !m.isRead ? "* " : "  "}${who}: ${m.body}`);
  }
  return lines.join("\n");
}

export function renderRecorded(results: RecordThreadResult[]): string {
  return results
    .map((r) => {
      const c = r.conversation;
      const listing = r.listingMatchedBy === "none" ? "listing not matched" : `listing ${c.agencyListingId} (by ${r.listingMatchedBy})`;
      return `${r.created ? "new" : "kept"} ${c.id}: ${c.buyerName ?? "?"} · ${c.listingTitle ?? "?"}: ${r.added} message(s) added, ${r.skipped} already stored; ${listing}; lead ${c.leadStatus}`;
    })
    .join("\n");
}

export function parseThreads(raw: unknown): { ok: true; threads: ScannedThread[] } | { ok: false; error: string } {
  const list = Array.isArray(raw) ? raw : raw && typeof raw === "object" && Array.isArray((raw as { threads?: unknown }).threads) ? (raw as { threads: unknown[] }).threads : [raw];
  for (const [i, t] of list.entries()) {
    const thread = t as Partial<ScannedThread> | null;
    if (!thread || typeof thread.facebookThreadId !== "string" || !thread.facebookThreadId) return { ok: false, error: `thread ${i + 1} has no facebookThreadId` };
    if (!Array.isArray(thread.messages)) return { ok: false, error: `thread ${thread.facebookThreadId} has no messages list` };
    for (const m of thread.messages) {
      if (m?.direction !== "inbound" && m?.direction !== "outbound") return { ok: false, error: `thread ${thread.facebookThreadId}: a message's direction must be inbound or outbound` };
      if (typeof m.body !== "string") return { ok: false, error: `thread ${thread.facebookThreadId}: a message has no body` };
    }
  }
  return { ok: true, threads: list as ScannedThread[] };
}
