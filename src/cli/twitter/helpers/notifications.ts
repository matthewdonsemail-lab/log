import type { TwitterSessionAnswer } from "../../../twitter/account/session/index.ts";
import { NOTIFICATION_TYPES, countByKind, engagersOf, isNotificationType, notificationStorePath, postIdOf, queryNotifications, readNotificationStore } from "../../../twitter/notification/feed/index.ts";
import type { NotificationKind, NotificationStore, NotificationType, TwitterNotification } from "../../../twitter/notification/feed/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandInput } from "../../runner/types.ts";
import { governorLine, openTwitterAccount } from "./account.ts";

export const NOTIFICATIONS_USAGE = [
  "Usage: log twitter notifications --account <accountName> [--type likes|reposts|replies|quotes|follows|all] [--since <date>] [--post <id|url>] [--full] [--pages <n>] [--stored] [--limit <n>] [--json]",
  "Reads the account's X notifications on the direct-API engine through its one X session, the engine host (rule 105: no session of its own; no browser, no proxy, rule 80) and keeps them in ~/.logCli/twitter/<account>/notifications.json: one row per person per thing they did (like, repost, reply, quote, follow, mention), with which of the account's posts it was on and when. Sends nothing.",
  "Without --full it reads only what is new: the newest page, then older pages until it meets rows already kept (the first run reads up to 5 pages). --full then pages back through the history from where the last --full stopped, as far as X gives, at most --pages pages a run (default 25). The read is one engine call (rule 104: one call per account at a time); its pages are 40 notifications, 4 to 11 s apart, each through the account's governor; a 429 or a governor stop ends the read and keeps what came.",
  "--stored answers from what is kept, calling nothing. --type, --since, --post and --limit (default 50 shown, at most 5000) narrow what is shown; --json gives the rows, counts by kind and the people who engaged most.",
].join("\n");

export const NOTIFICATIONS_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Read who liked, reposted, replied to, quoted or followed an X account, new and back through its history, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The TWITTER socialAccount's accountName (its handle)" },
        { name: "type", kind: "string", description: "likes, reposts, replies, quotes, follows or all (default all)" },
        { name: "since", kind: "string", description: "Only notifications at or after this date (ISO, e.g. 2026-11-01)" },
        { name: "post", kind: "string", description: "Only notifications on this post (its id or x.com url)" },
        { name: "full", kind: "boolean", description: "Also page back through the history, from where the last --full stopped" },
        { name: "pages", kind: "string", description: "The most pages read this run (default 5 new, 25 with --full, at most 200)" },
        { name: "stored", kind: "boolean", description: "Answer from what is kept, without calling X" },
        { name: "limit", kind: "string", description: "How many rows to show (default 50, at most 5000)" },
        JSON_FLAG,
      ],
    },
  ],
};

const KIND_ORDER: readonly NotificationKind[] = ["like", "repost", "reply", "quote", "follow", "mention", "other"];

const flat = (text: string | null | undefined, max: number) => {
  const one = (text ?? "").replace(/\s+/g, " ").trim();
  return one.length > max ? `${one.slice(0, max - 1)}…` : one;
};

const when = (at: string | null) => (at ? at.replace("T", " ").slice(0, 16) : "unknown time");

function line(row: TwitterNotification): string {
  const who = `@${row.handle ?? row.userId}${row.followsYou ? " (follows you)" : ""}`;
  const on = row.postId ? ` on ${row.postText ? `"${flat(row.postText, 60)}" ` : ""}${row.postUrl ?? row.postId}` : "";
  const said = row.text ? `\n     "${flat(row.text, 140)}"${row.tweetUrl ? ` ${row.tweetUrl}` : ""}` : row.kind === "other" && row.message ? `\n     ${flat(row.message, 140)}` : "";
  return `  ${when(row.at)} · ${row.kind} · ${who}${on}${said}`;
}

const countsLine = (counts: Partial<Record<NotificationKind, number>>) => KIND_ORDER.filter((k) => counts[k]).map((k) => `${counts[k]} ${k}`).join(", ") || "none";

function syncLine(answer: TwitterSessionAnswer): string {
  const s = answer.notificationSync;
  if (!s) return "";
  const end = s.historyDone ? ", the whole history X gives is kept" : s.stoppedBy === "pageCap" ? ", more history left (run --full again)" : "";
  return `${s.pages} page${s.pages === 1 ? "" : "s"} read (${s.mode}), ${s.newRows} new, ${s.total} kept${end}`;
}

export const notificationsCommand: Command = {
  usage: NOTIFICATIONS_USAGE,
  platform: "twitter",
  name: "notifications",
  effect: "read",
  input: NOTIFICATIONS_INPUT,
  summary: "Read who liked, reposted, replied to, quoted or followed an X account, new and historical, kept locally, sending nothing",
  args: "--account <a> [--type <t>] [--since <date>] [--post <id|url>] [--full] [--pages <n>] [--stored] [--limit <n>] [--json]",
  async run(context, argv) {
    const label = "twitter notifications";
    const parsed = parseArgs(argv, parserSpecOf(NOTIFICATIONS_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log ${label}: ${parsed.error}\n${NOTIFICATIONS_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log ${label}: --account is needed\n${NOTIFICATIONS_USAGE}` };
    const typeRaw = parsed.flags["type"];
    const type: NotificationType = typeof typeRaw === "string" ? (typeRaw as NotificationType) : "all";
    if (!isNotificationType(type)) return refuse(label, "notificationQueryInvalid", `--type ${String(typeRaw)}`);
    const since = parsed.flags["since"];
    if (since !== undefined && (typeof since !== "string" || Number.isNaN(Date.parse(since)))) return refuse(label, "notificationQueryInvalid", `--since ${String(since)}`);
    const postRaw = parsed.flags["post"];
    const postId = typeof postRaw === "string" ? postIdOf(postRaw) : null;
    if (postRaw !== undefined && !postId) return refuse(label, "notificationQueryInvalid", `--post ${String(postRaw)}`);
    const pagesRaw = parsed.flags["pages"];
    const pages = pagesRaw === undefined ? undefined : Number(pagesRaw);
    if (pages !== undefined && (!Number.isInteger(pages) || pages < 1 || pages > 200)) return refuse(label, "notificationQueryInvalid", `--pages ${String(pagesRaw)}`);
    const limitRaw = parsed.flags["limit"];
    const limit = limitRaw === undefined ? 50 : Number(limitRaw);
    if (!Number.isInteger(limit) || limit < 1 || limit > 5000) return refuse(label, "limitInvalid", "--limit is a whole number from 1 to 5000");
    const full = parsed.flags["full"] === true;
    try {
      const opened = await openTwitterAccount(context, label, ref);
      if (!opened.ok) return opened.result;
      const account = opened.account.accountName;
      let answer: TwitterSessionAnswer = { ok: true };
      let governor: string | null = null;
      let path = notificationStorePath(account);
      if (parsed.flags["stored"] !== true) {
        context.err(`${account}: notifications read${full ? " (and back through the history)" : " (what is new)"} on the direct-API engine, X called directly`);
        const run = await opened.engine({ action: "notifications", screenName: account, ...(full ? { full: true } : {}), ...(pages ? { pages } : {}) });
        answer = run.answer;
        governor = governorLine(run);
        if (answer.storePath) path = answer.storePath;
      }
      const store: NotificationStore | null = readNotificationStore(path);
      const query = { kinds: NOTIFICATION_TYPES[type], ...(typeof since === "string" ? { since } : {}), ...(postId ? { postId } : {}) };
      const matched = queryNotifications(store, query);
      const shown = matched.slice(0, limit);
      const counts = countByKind(matched);
      const code = answer.ok ? 0 : 1;
      const kept = { storePath: path, syncedAt: store?.syncedAt ?? null, historyDone: store?.historyDone ?? false, total: store ? Object.keys(store.rows).length : 0 };
      if (parsed.flags["json"]) {
        const { governor: g, ...rest } = answer;
        return { code, stdout: JSON.stringify({ engine: "directApi", library: "twikit", account, ...rest, ...(g ? { governor: g } : {}), kept, type, matched: matched.length, counts, engagers: engagersOf(matched).slice(0, 50), rows: shown }, null, 2) };
      }
      const head = answer.ok
        ? `log twitter notifications: @${account}${parsed.flags["stored"] === true ? ", from what is kept (nothing called)" : `, ${syncLine(answer)}`}`
        : `log twitter notifications: @${account}: ${answer.code}${answer.loginState ? ` (${answer.loginState})` : ""}: ${answer.detail ?? ""}`;
      const body = [
        head,
        `  ${matched.length} ${type === "all" ? "notifications" : type}${since ? ` since ${since}` : ""}${postId ? ` on post ${postId}` : ""}: ${countsLine(counts)}${kept.syncedAt ? ` (kept up to ${when(kept.syncedAt)} UTC)` : ""}`,
        ...shown.map(line),
        ...(matched.length > shown.length ? [`  … ${matched.length - shown.length} more (--limit, or --json)`] : []),
        ...(governor ? [governor] : []),
      ];
      return { code, stdout: body.join("\n") };
    } catch (error) {
      return refuseError(label, error);
    }
  },
};
