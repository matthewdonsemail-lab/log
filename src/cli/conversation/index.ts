/**
 * `log facebook conversations` — the buyers' Marketplace conversations in Twenty (rule 34).
 * `log facebook conversation show|read|lead|link|record` — one conversation: its
 * messages, mark it read, set its lead status, tie it to a listing, or store
 * a scanned thread. Twenty only: nothing here opens a browser or writes to
 * Facebook (rule 8).
 */
import { readFileSync } from "node:fs";
import {
  getConversation,
  LEAD_STATUSES,
  linkListing,
  listConversations,
  markRead,
  messagesOf,
  recordThread,
  setLeadStatus,
} from "../../marketplace/conversation/index.ts";
import type { LeadStatus } from "../../marketplace/conversation/index.ts";
import { getListing } from "../../marketplace/agencyListing/index.ts";
import { findAccount, fromTwentyEnum } from "../../marketplace/socialAccount/index.ts";
import { parseArgs, refuseError } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";
import { parseThreads, renderConversation, renderConversations, renderRecorded } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const CONVERSATIONS_USAGE = "Usage: log facebook conversations [--account <name>] [--listing <agencyListingId>] [--json]";
export const CONVERSATION_USAGE = [
  "Usage: log facebook conversation show <id> [--json]",
  "       log facebook conversation read <id>",
  `       log facebook conversation lead <id> <${LEAD_STATUSES.map((s) => s.toUpperCase()).join("|")}>`,
  "       log facebook conversation link <id> --listing <agencyListingId>",
  "       log facebook conversation record --account <name> --file <threads.json>",
].join("\n");

export const conversationsCommand: Command = {
  usage: CONVERSATIONS_USAGE,
  platform: "facebook",
  name: "conversations",
  summary: "List buyers' Marketplace conversations in Twenty, newest first, by account or listing",
  args: "[--account <name>] [--listing <id>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["account", "listing"] });
    if (!parsed.ok) return { code: 1, stderr: `log facebook conversations: ${parsed.error}\n${CONVERSATIONS_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log facebook conversations: unexpected argument "${parsed.positionals[0]}"\n${CONVERSATIONS_USAGE}` };
    try {
      const account = typeof parsed.flags["account"] === "string" ? await findAccount(context.twenty, parsed.flags["account"]) : null;
      const listing = typeof parsed.flags["listing"] === "string" ? parsed.flags["listing"] : undefined;
      const conversations = await listConversations(context.twenty, { socialAccountId: account?.id, agencyListingId: listing });
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ conversations }, null, 2) };
      return { code: 0, stdout: renderConversations(conversations) };
    } catch (error) {
      return refuseError("conversations", error);
    }
  },
};

export const conversationCommand: Command = {
  usage: CONVERSATION_USAGE,
  platform: "facebook",
  name: "conversation",
  summary: "One conversation: show its messages, mark read, set its lead status, link its listing, or store a scanned thread",
  args: "<show|read|lead|link|record> [id] [STATUS] [--listing <id>] [--account <name> --file <json>]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["listing", "account", "file"] });
    if (!parsed.ok) return { code: 1, stderr: `log facebook conversation: ${parsed.error}\n${CONVERSATION_USAGE}` };
    const [action, id, value] = parsed.positionals;
    try {
      if (action === "record") {
        const accountRef = parsed.flags["account"];
        const file = parsed.flags["file"];
        if (typeof accountRef !== "string" || typeof file !== "string") return { code: 1, stderr: `log facebook conversation record: give --account and --file\n${CONVERSATION_USAGE}` };
        let raw: unknown;
        try {
          raw = JSON.parse(readFileSync(file, "utf8"));
        } catch (error) {
          return { code: 1, stderr: `log facebook conversation record: can't read ${file}: ${error instanceof Error ? error.message : String(error)}` };
        }
        const threads = parseThreads(raw);
        if (!threads.ok) return { code: 1, stderr: `log facebook conversation record: ${threads.error}` };
        const account = await findAccount(context.twenty, accountRef);
        const results = [];
        for (const [i, thread] of threads.threads.entries()) {
          context.err(`conversation ${i + 1}/${threads.threads.length}: thread ${thread.facebookThreadId}`);
          results.push(await recordThread(context.twenty, account.id, thread));
        }
        return { code: 0, stdout: parsed.flags["json"] ? JSON.stringify({ results }, null, 2) : renderRecorded(results) };
      }
      if (!id || !["show", "read", "lead", "link"].includes(action ?? "")) return { code: 1, stderr: `log facebook conversation: pick show, read, lead, link or record\n${CONVERSATION_USAGE}` };
      const conversation = await getConversation(context.twenty, id);
      if (!conversation) return { code: 1, stderr: `log facebook conversation: no conversation ${id} (log facebook conversations lists them)` };
      if (action === "show") {
        const messages = await messagesOf(context.twenty, id);
        if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ conversation, messages }, null, 2) };
        return { code: 0, stdout: renderConversation(conversation, messages) };
      }
      if (action === "read") {
        const count = await markRead(context.twenty, id);
        return { code: 0, stdout: `Marked ${count} message(s) read.` };
      }
      if (action === "lead") {
        const status = value ? fromTwentyEnum(value) : "";
        if (!(LEAD_STATUSES as readonly string[]).includes(status)) return { code: 1, stderr: `log facebook conversation lead: give a status\n${CONVERSATION_USAGE}` };
        const saved = await setLeadStatus(context.twenty, id, status as LeadStatus);
        return { code: 0, stdout: `Lead is now ${saved.leadStatus}.` };
      }
      const listingId = parsed.flags["listing"];
      if (typeof listingId !== "string") return { code: 1, stderr: `log facebook conversation link: give --listing <agencyListingId>\n${CONVERSATION_USAGE}` };
      const listing = await getListing(context.twenty, listingId);
      if (!listing) return { code: 1, stderr: `log facebook conversation link: no agencyListing ${listingId}` };
      if (conversation.socialAccountId && listing.socialAccountId && listing.socialAccountId !== conversation.socialAccountId) {
        return { code: 1, stderr: `log facebook conversation link: listing ${listingId} is on another account than this conversation` };
      }
      await linkListing(context.twenty, id, listingId);
      return { code: 0, stdout: `Linked to listing ${listingId} (${listing.title}).` };
    } catch (error) {
      return refuseError("conversation", error);
    }
  },
};
