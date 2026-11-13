import { findRedditAccount, recordRedditSession, redditGate } from "../../reddit/account/session/index.ts";
import type { PlatformAnswer } from "../../platformKit/session/index.ts";
import { JSON_FLAG, numberOf, parseArgs, parserSpecOf, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandInput, FlagSpec } from "../runner/types.ts";

export const REDDIT_SESSION_USAGE = [
  "Usage: log reddit session check --account <accountName> [--json]",
  "Checks that Reddit still accepts the account's saved session, on the direct-API engine (no browser). Sends nothing.",
  "Reddit's own answer decides. The result goes to socialAccounts.sessionState, and refreshed cookies are merged back into the row.",
].join("\n");

export const REDDIT_SESSION_INPUT: CommandInput = {
  forms: [
    {
      words: ["check"],
      summary: "Check that Reddit still accepts one account's saved session, sending nothing",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The REDDIT socialAccount's accountName (its handle)" },
        JSON_FLAG,
      ],
    },
  ],
};

function render(accountName: string, answer: PlatformAnswer): string {
  if (answer.ok) return `log reddit session check: ${accountName} is loggedIn${answer.screenName ? ` as ${answer.screenName}` : ""}, via the direct-API engine (no browser).`;
  return `log reddit session check: ${accountName}: ${answer.code}${answer.loginState ? ` (${answer.loginState})` : ""}: ${answer.detail ?? ""}`;
}

export const redditSessionCommand: Command = {
  usage: REDDIT_SESSION_USAGE,
  platform: "reddit",
  name: "session",
  effect: "read",
  input: REDDIT_SESSION_INPUT,
  summary: "Check that Reddit still accepts an account's saved session, on the direct-API engine, sending nothing; the answer goes to Twenty",
  args: "check --account <a> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(REDDIT_SESSION_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log reddit session: ${parsed.error}\n${REDDIT_SESSION_USAGE}` };
    if (parsed.positionals[0] !== "check" || parsed.positionals.length > 1) return { code: 1, stderr: `log reddit session: give check\n${REDDIT_SESSION_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log reddit session check: --account is needed\n${REDDIT_SESSION_USAGE}` };
    try {
      const account = await findRedditAccount(context.twenty, ref);
      const gate = redditGate(account);
      if (!gate.ok) return refuse("reddit session check", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directReddit) return { code: 1, stderr: "log reddit session check: the direct-API engine isn't wired in this context" };
      context.err(`${account.accountName}: session check on the direct-API engine`);
      const run = context.directReddit(account, { action: "ping" });
      for (const line of await recordRedditSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      const code = run.answer.ok ? 0 : 1;
      if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", platform: "reddit", account: account.accountName, ...run.answer }, null, 2) };
      return { code, stdout: render(account.accountName, run.answer) };
    } catch (error) {
      return refuseError("reddit session check", error);
    }
  },
};

export const REDDIT_READ_USAGE = [
  "Usage: log reddit read subreddits --account <accountName> --query <words> [--json]",
  "       log reddit read posts --account <accountName> --subreddit <name> [--days <n>] [--linksTo <host>] [--json]",
  "       log reddit read home --account <accountName> [--json]",
  "       log reddit read post --account <accountName> --url <permalink> [--limit <n>] [--json]",
  "Reads Reddit through the account's direct-API engine (no browser), paced as reads. Sends nothing.",
  "home is the account's home feed, one page. post is one post with its comments (--limit, default 50), each comment with the id log reddit reply takes to answer it.",
  "subreddits finds communities by words. posts reads a subreddit's newest posts back --days (default 7), each with every link in it;",
  "--linksTo keeps only the posts linking to that host (github.com) and ranks them by score, then comments. A 429 stops the read and keeps what was read (rule 94).",
].join("\n");

const REDDIT_ACCOUNT_FLAG: FlagSpec = { name: "account", kind: "string", required: true, description: "The REDDIT socialAccount's accountName (its handle)" };

export const REDDIT_READ_INPUT: CommandInput = {
  forms: [
    {
      words: ["subreddits"],
      summary: "Find subreddits by words, with their members and what each is about",
      positionals: [],
      flags: [
        REDDIT_ACCOUNT_FLAG,
        { name: "query", kind: "string", required: true, description: "The words to look a subreddit up by" },
        JSON_FLAG,
      ],
    },
    {
      words: ["posts"],
      summary: "A subreddit's newest posts back a number of days, each with its links, optionally only those linking to one host",
      positionals: [],
      flags: [
        REDDIT_ACCOUNT_FLAG,
        { name: "subreddit", kind: "string", required: true, description: "The subreddit, with or without r/" },
        { name: "days", kind: "number", max: 365, description: "How many days back, default 7, at most 365" },
        { name: "linksTo", kind: "string", description: "Keep only posts linking to this host (github.com), ranked by score then comments" },
        JSON_FLAG,
      ],
    },
    {
      words: ["home"],
      summary: "The account's home feed, one page, each post with its links",
      positionals: [],
      flags: [REDDIT_ACCOUNT_FLAG, JSON_FLAG],
    },
    {
      words: ["post"],
      summary: "One post with its comments, each comment with the id a reply takes",
      positionals: [],
      flags: [
        REDDIT_ACCOUNT_FLAG,
        { name: "url", kind: "string", required: true, description: "The post's link (its permalink)" },
        { name: "limit", kind: "integer", min: 1, max: 500, description: "How many comments, default 50, at most 500" },
        JSON_FLAG,
      ],
    },
  ],
};

export interface RedditPost {
  id: string;
  subreddit: string | null;
  title: string;
  author: string;
  created: number;
  score: number;
  comments: number;
  flair: string | null;
  permalink: string;
  url: string;
  text: string;
  links: string[];
}

export function linksToHost(links: string[], host: string): string[] {
  const want = host.toLowerCase().replace(/^www\./, "");
  return links.filter((link) => {
    try {
      const got = new URL(link).hostname.toLowerCase().replace(/^www\./, "");
      return got === want || got.endsWith(`.${want}`);
    } catch {
      return false;
    }
  });
}

export function rankLinking(posts: RedditPost[], host: string): Array<RedditPost & { matched: string[] }> {
  return posts
    .map((post) => ({ ...post, matched: linksToHost(post.links, host) }))
    .filter((post) => post.matched.length > 0)
    .sort((a, b) => b.score - a.score || b.comments - a.comments);
}

interface RedditThreadComment {
  id: string;
  author: string | null;
  created: number | null;
  depth: number | null;
  parentId: string | null;
  score: number | null;
  permalink: string;
  text: string;
}

function day(epoch: number): string {
  return new Date(epoch * 1000).toISOString().slice(0, 10);
}

type SubredditFound = { name: string; title: string; subscribers: number | null; about: string; url: string };

export const redditReadCommand: Command = {
  usage: REDDIT_READ_USAGE,
  platform: "reddit",
  name: "read",
  effect: "read",
  input: REDDIT_READ_INPUT,
  summary: "Find subreddits, and read a subreddit's newest posts with their links, through the account's direct-API engine",
  args: "subreddits --account <a> --query <words> | posts --account <a> --subreddit <name> [--days <n>] [--linksTo <host>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(REDDIT_READ_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log reddit read: ${parsed.error}\n${REDDIT_READ_USAGE}` };
    const form = parsed.positionals[0];
    if (!["subreddits", "posts", "home", "post"].includes(form ?? "") || parsed.positionals.length > 1) return { code: 1, stderr: `log reddit read: give subreddits, posts, home or post\n${REDDIT_READ_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log reddit read: --account is needed\n${REDDIT_READ_USAGE}` };
    const json = Boolean(parsed.flags["json"]);
    try {
      const account = await findRedditAccount(context.twenty, ref);
      const gate = redditGate(account);
      if (!gate.ok) return refuse("reddit read", gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
      if (!context.directReddit) return { code: 1, stderr: "log reddit read: the direct-API engine isn't wired in this context" };
      const now = context.now?.() ?? new Date();
      if (form === "subreddits") {
        const query = parsed.flags["query"];
        if (typeof query !== "string" || !query.trim()) return { code: 1, stderr: `log reddit read subreddits: --query is needed\n${REDDIT_READ_USAGE}` };
        context.err(`${account.accountName}: looking up subreddits for "${query}"`);
        const run = context.directReddit(account, { action: "subreddits", query });
        for (const line of await recordRedditSession(context.twenty, account, run, now)) context.err(line);
        const answer = run.answer as typeof run.answer & { subreddits?: SubredditFound[] };
        if (!answer.ok) return { code: 1, stderr: `log reddit read subreddits: ${answer.code}: ${answer.detail ?? ""}` };
        const found = answer.subreddits ?? [];
        if (json) return { code: 0, stdout: JSON.stringify({ platform: "reddit", account: account.accountName, query, subreddits: found }, null, 2) };
        return { code: 0, stdout: [`subreddits for "${query}": ${found.length}`, ...found.map((s) => `  r/${s.name}  ${s.subscribers ?? "?"} members  ${s.title ?? ""}${s.about ? `: ${s.about.slice(0, 140)}` : ""}`)].join("\n") };
      }
      if (form === "home") {
        context.err(`${account.accountName}: reading the home feed`);
        const run = context.directReddit(account, { action: "home" });
        for (const line of await recordRedditSession(context.twenty, account, run, now)) context.err(line);
        const answer = run.answer as typeof run.answer & { posts?: RedditPost[] };
        if (!answer.ok) return { code: 1, stderr: `log reddit read home: ${answer.code}: ${answer.detail ?? ""}` };
        const feed = answer.posts ?? [];
        if (json) return { code: 0, stdout: JSON.stringify({ platform: "reddit", account: account.accountName, posts: feed }, null, 2) };
        return { code: 0, stdout: [`home feed: ${feed.length} posts`, ...feed.map((p) => `  ${p.score} pts, ${p.comments} comments, r/${p.subreddit ?? "?"} u/${p.author ?? "?"}: ${p.title}\n    ${p.permalink}`)].join("\n") };
      }
      if (form === "post") {
        const url = parsed.flags["url"];
        if (typeof url !== "string" || !url.trim()) return { code: 1, stderr: `log reddit read post: --url is needed\n${REDDIT_READ_USAGE}` };
        const limit = numberOf(parsed, "limit") ?? 50;
        context.err(`${account.accountName}: reading ${url} and its comments`);
        const run = context.directReddit(account, { action: "post", url, limit });
        for (const line of await recordRedditSession(context.twenty, account, run, now)) context.err(line);
        const answer = run.answer as typeof run.answer & { post?: RedditPost; comments?: RedditThreadComment[] };
        if (!answer.ok || !answer.post) return { code: 1, stderr: `log reddit read post: ${answer.code}: ${answer.detail ?? ""}` };
        const comments = answer.comments ?? [];
        if (json) return { code: 0, stdout: JSON.stringify({ platform: "reddit", account: account.accountName, post: answer.post, comments }, null, 2) };
        const p = answer.post;
        return {
          code: 0,
          stdout: [
            `${p.score} pts, ${p.comments} comments, r/${p.subreddit ?? "?"} u/${p.author ?? "?"}: ${p.title}`,
            `  ${p.permalink}`,
            ...(p.text ? [`  ${p.text.slice(0, 600)}`] : []),
            ...p.links.map((link) => `  ${link}`),
            `comments (${comments.length}):`,
            ...comments.map((c) => `${"  ".repeat((c.depth ?? 0) + 1)}${c.id} u/${c.author ?? "?"} (${c.score ?? 0}): ${c.text.replace(/\s+/g, " ").slice(0, 300)}`),
          ].join("\n"),
        };
      }
      const subreddit = parsed.flags["subreddit"];
      if (typeof subreddit !== "string" || !subreddit.trim()) return { code: 1, stderr: `log reddit read posts: --subreddit is needed\n${REDDIT_READ_USAGE}` };
      const days = numberOf(parsed, "days") ?? 7;
      if (days <= 0) return { code: 1, stderr: "log reddit read posts: --days is a number of days, 1 to 365" };
      const linksTo = parsed.flags["linksTo"];
      const host = typeof linksTo === "string" && linksTo.trim() ? linksTo.trim() : undefined;
      context.err(`${account.accountName}: reading r/${subreddit}'s newest posts back ${days} days`);
      const run = context.directReddit(account, { action: "posts", subreddit, days });
      for (const line of await recordRedditSession(context.twenty, account, run, now)) context.err(line);
      const answer = run.answer as typeof run.answer & { posts?: RedditPost[]; pages?: number; complete?: boolean; stoppedBy?: { code: string; detail: string } };
      if (!answer.ok) return { code: 1, stderr: `log reddit read posts: ${answer.code}: ${answer.detail ?? ""}` };
      const all = answer.posts ?? [];
      const ranked = host ? rankLinking(all, host) : all;
      const stopped = answer.stoppedBy ? `stopped by ${answer.stoppedBy.code}: ${answer.stoppedBy.detail}; what was read is kept` : undefined;
      if (json) return { code: 0, stdout: JSON.stringify({ platform: "reddit", account: account.accountName, subreddit, days, linksTo: host ?? null, read: all.length, pages: answer.pages, complete: answer.complete, stopped: stopped ?? null, posts: ranked }, null, 2) };
      const head = `r/${subreddit}, last ${days} days: ${all.length} posts read in ${answer.pages} pages${host ? `, ${ranked.length} linking to ${host}` : ""}${answer.complete ? "" : " (not complete)"}`;
      const lines = ranked.map((post) => {
        const shown = "matched" in post ? (post as RedditPost & { matched: string[] }).matched : post.links;
        return [`  ${post.score} pts, ${post.comments} comments, ${day(post.created)}, u/${post.author}: ${post.title}`, `    ${post.permalink}`, ...shown.map((link) => `    ${link}`)].join("\n");
      });
      return { code: 0, stdout: [head, ...(stopped ? [stopped] : []), ...lines].join("\n") };
    } catch (error) {
      return refuseError("reddit read", error);
    }
  },
};

const APPROVED_BY_FLAG: FlagSpec = { name: "approvedBy", kind: "string", approval: true, description: "Who approved it: needed with --live (rule 8)" };

function liveFlag(what: string): FlagSpec {
  return { name: "live", kind: "boolean", live: true, description: `${what} on Reddit, only when the owner asked (rule 8); without it a dry run sends nothing` };
}

interface RedditWrite {
  name: "post" | "reply" | "vote";
  action: "create" | "reply" | "vote";
  usage: string;
  input: CommandInput;
  summary: string;
  args: string;
  spec: (flags: Record<string, unknown>) => { fields: Record<string, unknown> } | { error: string };
  plan: (fields: Record<string, unknown>) => string;
  done: (answer: Record<string, unknown>) => string;
}

function text(flags: Record<string, unknown>, name: string): string {
  const value = flags[name];
  return typeof value === "string" ? value.trim() : "";
}

function redditWriteCommand(write: RedditWrite): Command {
  return {
    usage: write.usage,
    platform: "reddit",
    name: write.name,
    effect: "write",
    input: write.input,
    summary: write.summary,
    args: write.args,
    async run(context, argv) {
      const parsed = parseArgs(argv, parserSpecOf(write.input));
      if (!parsed.ok) return { code: 1, stderr: `log reddit ${write.name}: ${parsed.error}\n${write.usage}` };
      if (parsed.positionals.length) return { code: 1, stderr: `log reddit ${write.name}: takes no words, only flags\n${write.usage}` };
      const ref = text(parsed.flags, "account");
      if (!ref) return { code: 1, stderr: `log reddit ${write.name}: --account is needed\n${write.usage}` };
      const built = write.spec(parsed.flags);
      if ("error" in built) return { code: 1, stderr: `log reddit ${write.name}: ${built.error}\n${write.usage}` };
      const live = parsed.flags["live"] === true;
      const approvedBy = text(parsed.flags, "approvedBy");
      if (live && !approvedBy) return refuse(`reddit ${write.name}`, "notApproved", "--live needs --approvedBy <who> (rule 8)");
      const json = Boolean(parsed.flags["json"]);
      try {
        const account = await findRedditAccount(context.twenty, ref);
        const gate = redditGate(account);
        if (!gate.ok) return refuse(`reddit ${write.name}`, gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail);
        const plan = write.plan(built.fields);
        if (!live) {
          if (json) return { code: 0, stdout: JSON.stringify({ platform: "reddit", account: account.accountName, dryRun: true, action: write.action, ...built.fields }, null, 2) };
          return { code: 0, stdout: `log reddit ${write.name}: dry run: ${account.accountName} would ${plan}. Nothing was sent. --live --approvedBy <who> does it (rule 8).` };
        }
        if (!context.directReddit) return { code: 1, stderr: `log reddit ${write.name}: the direct-API engine isn't wired in this context` };
        context.err(`${account.accountName}: ${plan}, approved by ${approvedBy}, on the direct-API engine`);
        const run = context.directReddit(account, { action: write.action, live: true, approvedBy, ...built.fields });
        for (const line of await recordRedditSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
        const answer = run.answer as typeof run.answer & Record<string, unknown>;
        if (!answer.ok) return { code: 1, stderr: `log reddit ${write.name}: ${answer.code}: ${answer.detail ?? ""}. Nothing is retried (rule 94).` };
        if (json) return { code: 0, stdout: JSON.stringify({ platform: "reddit", account: account.accountName, approvedBy, ...answer }, null, 2) };
        return { code: 0, stdout: `log reddit ${write.name}: ${account.accountName} ${write.done(answer)}, approved by ${approvedBy}.` };
      } catch (error) {
        return refuseError(`reddit ${write.name}`, error);
      }
    },
  };
}

export const REDDIT_POST_USAGE = [
  "Usage: log reddit post --account <accountName> --subreddit <name> --title <title> [--text <markdown>] [--flair <flair>] [--approvedBy <who>] [--live] [--json]",
  "Posts a text post to a subreddit through the account's direct-API engine (no browser). A dry run unless --live, which needs --approvedBy (rule 8).",
  "Reddit's composer asks for a reCAPTCHA Enterprise token, solved by 2Captcha (rule 10). The governor counts it as a write; Reddit's answer decides, and a refusal stops it with nothing retried (rule 94).",
].join("\n");

const REDDIT_POST_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Post a text post to a subreddit; a dry run unless --live",
      positionals: [],
      flags: [
        REDDIT_ACCOUNT_FLAG,
        { name: "subreddit", kind: "string", required: true, description: "The subreddit, with or without r/" },
        { name: "title", kind: "string", required: true, description: "The post's title" },
        { name: "text", kind: "string", description: "The post's body, in Reddit's Markdown" },
        { name: "flair", kind: "string", description: "A flair the subreddit offers, by its text or id" },
        APPROVED_BY_FLAG,
        liveFlag("Post it"),
        JSON_FLAG,
      ],
    },
  ],
};

export const redditPostCommand = redditWriteCommand({
  name: "post",
  action: "create",
  usage: REDDIT_POST_USAGE,
  input: REDDIT_POST_INPUT,
  summary: "Post a text post to a subreddit through the account's direct-API engine; a dry run unless --live",
  args: "--account <a> --subreddit <name> --title <title> [--text <markdown>] [--flair <flair>] [--approvedBy <who>] [--live] [--json]",
  spec: (flags) => {
    const subreddit = text(flags, "subreddit").replace(/^\/?r\//, "");
    const title = text(flags, "title");
    if (!subreddit || !title) return { error: "--subreddit and --title are needed" };
    return { fields: { subreddit, title, text: text(flags, "text"), flair: text(flags, "flair") } };
  },
  plan: (f) => `post "${f.title}" to r/${f.subreddit}${f.text ? ` (${String(f.text).length} characters of text)` : ""}${f.flair ? ` with the flair ${f.flair}` : ""}`,
  done: (a) => {
    const posted = a.posted as { permalink?: string; subreddit?: string } | undefined;
    return `posted to r/${posted?.subreddit ?? "?"}: ${posted?.permalink ?? "?"}`;
  },
});

export const REDDIT_REPLY_USAGE = [
  "Usage: log reddit reply --account <accountName> --url <post permalink> --text <text> [--comment <t1_id>] [--approvedBy <who>] [--live] [--json]",
  "Comments on a post, or replies to one of its comments (--comment, an id from log reddit read post), through the account's direct-API engine (no browser).",
  "A dry run unless --live, which needs --approvedBy (rule 8). Reddit asks for a reCAPTCHA Enterprise token, solved by 2Captcha (rule 10). A refusal stops it with nothing retried (rule 94).",
].join("\n");

const REDDIT_REPLY_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Comment on a post or reply to one of its comments; a dry run unless --live",
      positionals: [],
      flags: [
        REDDIT_ACCOUNT_FLAG,
        { name: "url", kind: "string", required: true, description: "The post's link (its permalink)" },
        { name: "text", kind: "string", required: true, description: "What to say" },
        { name: "comment", kind: "string", description: "A comment's id (t1_…) from log reddit read post, to reply to it instead of the post" },
        APPROVED_BY_FLAG,
        liveFlag("Comment"),
        JSON_FLAG,
      ],
    },
  ],
};

export const redditReplyCommand = redditWriteCommand({
  name: "reply",
  action: "reply",
  usage: REDDIT_REPLY_USAGE,
  input: REDDIT_REPLY_INPUT,
  summary: "Comment on a Reddit post or reply to one of its comments through the account's direct-API engine; a dry run unless --live",
  args: "--account <a> --url <permalink> --text <text> [--comment <t1_id>] [--approvedBy <who>] [--live] [--json]",
  spec: (flags) => {
    const url = text(flags, "url");
    const said = text(flags, "text");
    if (!url || !said) return { error: "--url and --text are needed" };
    const comment = text(flags, "comment");
    if (comment && !/^(t1_)?[a-z0-9]+$/i.test(comment)) return { error: "--comment is a comment's id (t1_…)" };
    return { fields: { url, text: said, commentId: comment } };
  },
  plan: (f) => `${f.commentId ? `reply to comment ${f.commentId} on` : "comment on"} ${f.url}: "${String(f.text).slice(0, 140)}"`,
  done: (a) => {
    const replied = a.replied as { permalink?: string } | undefined;
    return `replied to ${String(a.to ?? "?")}: ${replied?.permalink ?? "?"}`;
  },
});

export const REDDIT_VOTE_USAGE = [
  "Usage: log reddit vote --account <accountName> (--url <post permalink> | --target <t3_id|t1_id>) [--direction up|down|none] [--approvedBy <who>] [--live] [--json]",
  "Votes on a post or comment through the account's direct-API engine (no browser): up (the default), down, or none to take a vote back.",
  "A dry run unless --live, which needs --approvedBy (rule 8). The governor counts it as a write; a refusal stops it with nothing retried (rule 94).",
].join("\n");

const REDDIT_VOTE_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Vote on a post or comment; a dry run unless --live",
      positionals: [],
      flags: [
        REDDIT_ACCOUNT_FLAG,
        { name: "url", kind: "string", description: "The post's link (its permalink), to vote on the post" },
        { name: "target", kind: "string", pattern: "^[tT][13]_[a-zA-Z0-9]+$", takes: "a t3_ post or t1_ comment id", description: "A post (t3_…) or comment (t1_…) id, instead of --url" },
        { name: "direction", kind: "enum", values: ["up", "down", "none"], description: "up (the default), down, or none to take a vote back" },
        APPROVED_BY_FLAG,
        liveFlag("Vote"),
        JSON_FLAG,
      ],
      groups: [{ rule: "atLeastOne", names: ["url", "target"] }],
    },
  ],
};

export const redditVoteCommand = redditWriteCommand({
  name: "vote",
  action: "vote",
  usage: REDDIT_VOTE_USAGE,
  input: REDDIT_VOTE_INPUT,
  summary: "Vote on a Reddit post or comment through the account's direct-API engine; a dry run unless --live",
  args: "--account <a> (--url <permalink> | --target <t3_id|t1_id>) [--direction up|down|none] [--approvedBy <who>] [--live] [--json]",
  spec: (flags) => {
    const url = text(flags, "url");
    const target = text(flags, "target");
    if (!url && !target) return { error: "give --url or --target" };
    if (target && !/^t[13]_[a-z0-9]+$/i.test(target)) return { error: "--target is a t3_ post or t1_ comment id" };
    const direction = text(flags, "direction") || "up";
    return { fields: { url, target, direction } };
  },
  plan: (f) => (f.direction === "none" ? `take back its vote on ${f.target || f.url}` : `vote ${f.direction} on ${f.target || f.url}`),
  done: (a) => {
    const voted = a.voted as { target?: string; direction?: string } | undefined;
    return `voted ${voted?.direction ?? "?"} on ${voted?.target ?? "?"}`;
  },
});
