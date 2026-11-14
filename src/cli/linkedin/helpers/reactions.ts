import { recordLinkedinSession } from "../../../linkedin/account/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError, refuseInput } from "../../runner/helpers/index.ts";
import type { Command, CommandInput } from "../../runner/types.ts";
import { ACCOUNT_FLAG, APPROVED_BY_FLAG, activityOf, failed, liveFlag, openAccount, text } from "./share.ts";
import { actOnEngine } from "../../../platformKit/action/index.ts";

export const LINKEDIN_LIKE_USAGE = [
  "Usage: log linkedin like --account <accountName> --post <activityId|post url> [--approvedBy <who>] [--live] [--json]",
  "Likes one LinkedIn post, on the direct-API engine (no browser): the feed, then reactions.create, the request the feed's Like button sends, recorded from a real visit. The post is its activity id or its URL (linkedin.com/feed/update/urn:li:activity:<id>).",
  "A dry run unless --live, which needs --approvedBy (rule 8); the dry run sends nothing. LinkedIn's answer decides: the like counts only when it commits the post's reaction state; otherwise likeUnconfirmed, and nothing is retried (rule 94). The governor counts it as a write, 10 a day (rule 102).",
].join("\n");

const LINKEDIN_LIKE_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Like one LinkedIn post; a dry run unless --live",
      positionals: [],
      flags: [
        ACCOUNT_FLAG,
        { name: "post", kind: "string", required: true, description: "The post's activity id, or its URL" },
        APPROVED_BY_FLAG,
        liveFlag("Like it"),
        JSON_FLAG,
      ],
    },
  ],
};

export const linkedinLikeCommand: Command = {
  usage: LINKEDIN_LIKE_USAGE,
  platform: "linkedin",
  name: "like",
  effect: "write",
  input: LINKEDIN_LIKE_INPUT,
  summary: "Like one LinkedIn post on the direct-API engine; a dry run unless --live",
  args: "--account <a> --post <id|url> [--approvedBy <who>] [--live] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(LINKEDIN_LIKE_INPUT));
    if (!parsed.ok) return refuseInput("linkedin like", `${parsed.error}`, LINKEDIN_LIKE_USAGE);
    if (parsed.positionals.length) return refuseInput("linkedin like", `takes no words, only flags`, LINKEDIN_LIKE_USAGE);
    const ref = text(parsed.flags, "account");
    const activity = activityOf(text(parsed.flags, "post"));
    if (!ref || !activity) return refuseInput("linkedin like", `--account and --post (an activity id or post URL) are needed`, LINKEDIN_LIKE_USAGE);
    const live = parsed.flags["live"] === true;
    const approvedBy = text(parsed.flags, "approvedBy");
    if (live && !approvedBy) return refuse("linkedin like", "notApproved", "--live needs --approvedBy <who> (rule 8)");
    const json = Boolean(parsed.flags["json"]);
    try {
      const opened = await openAccount(context, "like", ref);
      if (!opened.ok) return opened.result;
      const account = opened.account;
      if (!live) {
        if (json) return { code: 0, stdout: JSON.stringify({ platform: "linkedin", account: account.accountName, dryRun: true, activityId: activity }, null, 2) };
        return { code: 0, stdout: `log linkedin like: dry run: ${account.accountName} would like activity ${activity}. Nothing was sent. --live --approvedBy <who> does it (rule 8).` };
      }
      context.err(`${account.accountName}: like activity ${activity}, approved by ${approvedBy}, on the direct-API engine`);
      const run = await actOnEngine(() => context.directLinkedin!(account, { action: "like", live: true, approvedBy, post: activity }));
      for (const line of await recordLinkedinSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      if (!run.answer.ok) return failed("like", run);
      if (json) return { code: 0, stdout: JSON.stringify({ platform: "linkedin", account: account.accountName, approvedBy, ...run.answer }, null, 2) };
      return { code: 0, stdout: `log linkedin like: ${account.accountName} liked activity ${activity}; LinkedIn committed the reaction. Approved by ${approvedBy}.` };
    } catch (error) {
      return refuseError("linkedin like", error);
    }
  },
};

export const LINKEDIN_REPOST_USAGE = [
  "Usage: log linkedin repost --account <accountName> --post <activityId|post url> [--approvedBy <who>] [--live] [--json]",
  "Reposts one LinkedIn post as it is (an instant repost, no text of the account's own), on the direct-API engine (no browser): the feed, then createInstantRepost, the request the feed's Repost menu sends, recorded from a real visit. The post is its activity id or its URL (linkedin.com/feed/update/urn:li:activity:<id>).",
  "A dry run unless --live, which needs --approvedBy (rule 8); the dry run sends nothing. LinkedIn's answer decides: the repost counts only when it commits it with LinkedIn's success toast; otherwise repostUnconfirmed, and nothing is retried (rule 94). The governor counts it as a write.",
].join("\n");

const LINKEDIN_REPOST_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Repost one LinkedIn post as it is; a dry run unless --live",
      positionals: [],
      flags: [
        ACCOUNT_FLAG,
        { name: "post", kind: "string", required: true, description: "The post's activity id, or its URL" },
        APPROVED_BY_FLAG,
        liveFlag("Repost it"),
        JSON_FLAG,
      ],
    },
  ],
};

export const linkedinRepostCommand: Command = {
  usage: LINKEDIN_REPOST_USAGE,
  platform: "linkedin",
  name: "repost",
  effect: "write",
  input: LINKEDIN_REPOST_INPUT,
  summary: "Repost one LinkedIn post as it is, on the direct-API engine; a dry run unless --live",
  args: "--account <a> --post <id|url> [--approvedBy <who>] [--live] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(LINKEDIN_REPOST_INPUT));
    if (!parsed.ok) return refuseInput("linkedin repost", `${parsed.error}`, LINKEDIN_REPOST_USAGE);
    if (parsed.positionals.length) return refuseInput("linkedin repost", `takes no words, only flags`, LINKEDIN_REPOST_USAGE);
    const ref = text(parsed.flags, "account");
    const activity = activityOf(text(parsed.flags, "post"));
    if (!ref) return refuseInput("linkedin repost", `--account is needed`, LINKEDIN_REPOST_USAGE);
    if (!activity) return refuseInput("linkedin repost", `--post must be a LinkedIn activity id or a post URL holding one`, LINKEDIN_REPOST_USAGE);
    const live = parsed.flags["live"] === true;
    const approvedBy = text(parsed.flags, "approvedBy");
    if (live && !approvedBy) return refuse("linkedin repost", "notApproved", "--live needs --approvedBy <who> (rule 8)");
    const json = Boolean(parsed.flags["json"]);
    try {
      const opened = await openAccount(context, "repost", ref);
      if (!opened.ok) return opened.result;
      const account = opened.account;
      if (!live) {
        if (json) return { code: 0, stdout: JSON.stringify({ platform: "linkedin", account: account.accountName, dryRun: true, activityId: activity }, null, 2) };
        return { code: 0, stdout: `log linkedin repost: dry run: ${account.accountName} would repost activity ${activity} as it is. Nothing was sent. --live --approvedBy <who> does it (rule 8).` };
      }
      context.err(`${account.accountName}: repost activity ${activity}, approved by ${approvedBy}, on the direct-API engine`);
      const run = await actOnEngine(() => context.directLinkedin!(account, { action: "repost", live: true, approvedBy, post: activity }));
      for (const line of await recordLinkedinSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      if (!run.answer.ok) return failed("repost", run);
      if (json) return { code: 0, stdout: JSON.stringify({ platform: "linkedin", account: account.accountName, approvedBy, ...run.answer }, null, 2) };
      return { code: 0, stdout: `log linkedin repost: ${account.accountName} reposted activity ${activity}; LinkedIn committed it. Approved by ${approvedBy}.` };
    } catch (error) {
      return refuseError("linkedin repost", error);
    }
  },
};
