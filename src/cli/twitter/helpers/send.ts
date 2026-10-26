import { planSend } from "../../../twitter/post/send/index.ts";
import type { SendAction } from "../../../twitter/post/send/index.ts";
import type { TwitterSessionAnswer } from "../../../twitter/account/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandInput, FlagSpec } from "../../runner/types.ts";
import { governorLine, openTwitterAccount } from "./account.ts";

const ACCOUNT: FlagSpec = { name: "account", kind: "string", required: true, description: "The TWITTER socialAccount's accountName (its handle) that sends it" };
const TWEET: FlagSpec = { name: "tweet", kind: "string", required: true, description: "The post's url (https://x.com/<handle>/status/<id>), from treg research" };
const USER_ID: FlagSpec = { name: "userId", kind: "string", required: true, description: "The recipient's numeric X user id, from treg research" };
const TEXT: FlagSpec = { name: "text", kind: "string", required: true, description: "The approved copy, in house style (lowercase, no commas, full stops or dashes; urls exempt)" };
const APPROVED_BY: FlagSpec = { name: "approvedBy", kind: "string", description: "Who approved it: needed with --live (rule 8)" };
const SKIP_STYLE: FlagSpec = { name: "skipStyleCheck", kind: "boolean", description: "Skip the house style check, only when matt asked" };
export const FORCE: FlagSpec = { name: "force", kind: "boolean", description: "Go past the account's governor (its pause, hourly, daily and write caps) for this call, only when matt asked (rule 86)" };
const LIVE: FlagSpec = { name: "live", kind: "boolean", live: true, description: "Send it on X, only when matt asked (rule 8); without it a dry run checks it and contacts nothing" };

interface SendShape {
  action: SendAction;
  verb: string;
  target: "tweet" | "userId";
  text: boolean;
  summary: string;
  says: string;
}

const SHAPES: Record<SendAction, SendShape> = {
  reply: { action: "reply", verb: "reply to", target: "tweet", text: true, summary: "Reply to one post on X with approved copy, on the direct-API engine; a dry run unless --live", says: "X's create answer decides: a tweet id is sent, an empty result is a drop (nothing posted, usually the author's reply limits)" },
  quote: { action: "quote", verb: "quote", target: "tweet", text: true, summary: "Quote one post on X with approved copy, on the direct-API engine; a dry run unless --live", says: "X's create answer decides: a tweet id is sent, an empty result is a drop" },
  like: { action: "like", verb: "like", target: "tweet", text: false, summary: "Like one post on X, on the direct-API engine; a dry run unless --live", says: "X's favorite answer decides: Done (or already liked, code 139) is sent" },
  dm: { action: "dm", verb: "dm", target: "userId", text: true, summary: "Send one approved direct message on X, on the direct-API engine; a dry run unless --live", says: "X's answer decides: a conversation id is sent, none is a drop" },
};

function usageOf(shape: SendShape): string {
  const target = shape.target === "tweet" ? "--tweet <postUrl>" : "--userId <id>";
  const text = shape.text ? ' --text "<copy>"' : "";
  const skip = shape.text ? " [--skipStyleCheck]" : "";
  return [
    `Usage: log twitter ${shape.action} --account <accountName> ${target}${text} [--approvedBy <who>]${skip} [--force] [--live] [--json]`,
    `${shape.summary.replace(", on the direct-API engine; a dry run unless --live", "")}, on the direct-API engine (twikit, no browser, no proxy: X accounts call X directly, rule 80).`,
    `Without --live it is a dry run: the target${shape.text ? ", the text and its house style" : ""} are checked and X is not contacted. --live sends it, only when matt asked, and needs --approvedBy (rule 8). The session is checked first, and the account's governor counts it as a write (40 a day). --force goes past the governor's pause and caps for this one call, only when matt asked (rule 86): X still answers, and its answer still decides.`,
    `${shape.says}. Every answer is one event: sent, dropped, throttled, dailyLimit (344), gone (385/433), automated (226), duplicate (187), sessionDead (401), restricted. The session state and X's refreshed cookies go back to Twenty.`,
  ].join("\n");
}

function inputOf(shape: SendShape): CommandInput {
  const flags: FlagSpec[] = [ACCOUNT, shape.target === "tweet" ? TWEET : USER_ID, ...(shape.text ? [TEXT, SKIP_STYLE] : []), APPROVED_BY, FORCE, LIVE, JSON_FLAG];
  return { forms: [{ words: [], effect: "write", summary: shape.summary, positionals: [], flags }] };
}

export function renderSent(label: string, account: string, answer: TwitterSessionAnswer): string {
  if (answer.ok && answer.event === "sent") {
    if (answer.liked) return `log ${label}: ${account} liked ${answer.tweetId}${answer.already ? " (it was already liked)" : ""}.`;
    if (answer.conversationId) return `log ${label}: ${account} sent the dm (conversation ${answer.conversationId}).`;
    return `log ${label}: ${account} posted https://x.com/${account}/status/${answer.tweetId}.${answer.forcedPast ? ` Forced past the governor: ${answer.forcedPast}.` : ""}`;
  }
  const reset = answer.rateLimitReset ? `, X's limit resets at ${new Date(answer.rateLimitReset * 1000).toISOString()}` : "";
  return `log ${label}: ${account}: ${answer.event ?? answer.code}${answer.code && answer.event ? ` (${answer.code})` : ""}: ${answer.detail ?? ""}${reset}`;
}

function sendCommand(shape: SendShape): Command {
  const usage = usageOf(shape);
  const input = inputOf(shape);
  const label = `twitter ${shape.action}`;
  return {
    usage,
    platform: "twitter",
    name: shape.action,
    effect: "write",
    input,
    summary: shape.summary,
    args: `--account <a> ${shape.target === "tweet" ? "--tweet <url>" : "--userId <id>"}${shape.text ? ' --text "<copy>"' : ""} [--approvedBy <who>] [--force] [--live] [--json]`,
    async run(context, argv) {
      const parsed = parseArgs(argv, parserSpecOf(input));
      if (!parsed.ok) return { code: 1, stderr: `log ${label}: ${parsed.error}\n${usage}` };
      if (parsed.positionals.length) return { code: 1, stderr: `log ${label}: takes no words, only flags\n${usage}` };
      const ref = parsed.flags["account"];
      if (typeof ref !== "string") return { code: 1, stderr: `log ${label}: --account is needed\n${usage}` };
      const str = (name: string) => (typeof parsed.flags[name] === "string" ? (parsed.flags[name] as string) : undefined);
      const live = parsed.flags["live"] === true;
      const plan = planSend({ action: shape.action, tweetUrl: str("tweet"), userId: str("userId"), text: str("text"), approvedBy: str("approvedBy"), skipStyleCheck: parsed.flags["skipStyleCheck"] === true, live });
      if (!plan.ok) return refuse(label, plan.problem.code, plan.problem.detail);
      try {
        const opened = await openTwitterAccount(context, label, ref);
        if (!opened.ok) return opened.result;
        const { account, engine } = opened;
        if (!live) {
          const dry = { engine: "directApi", library: "twikit", account: account.accountName, ok: true, dryRun: true, action: shape.action, target: plan.target, text: plan.spec.text ?? null, style: shape.text ? (parsed.flags["skipStyleCheck"] ? "skipped" : "pass") : null, approvedBy: plan.spec.approvedBy ?? null };
          if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify(dry, null, 2) };
          return { code: 0, stdout: `log ${label}: dry run: ${account.accountName} would ${shape.verb} ${plan.target}${plan.spec.text ? ` with "${plan.spec.text}"` : ""}. Checked; X was not contacted. --live --approvedBy <who> sends it (rule 8).` };
        }
        context.err(`${account.accountName}: ${shape.action} ${plan.target} on the direct-API engine (twikit), X called directly, approved by ${plan.spec.approvedBy}`);
        const run = await engine(parsed.flags["force"] === true ? { ...plan.spec, force: true } : plan.spec);
        const code = run.answer.ok && run.answer.event === "sent" ? 0 : 1;
        if (parsed.flags["json"]) return { code, stdout: JSON.stringify({ engine: "directApi", library: "twikit", account: account.accountName, action: shape.action, target: plan.target, approvedBy: plan.spec.approvedBy, ...run.answer }, null, 2) };
        const governor = governorLine(run);
        return { code, stdout: [renderSent(label, account.accountName, run.answer), ...(governor ? [governor] : [])].join("\n") };
      } catch (error) {
        return refuseError(label, error);
      }
    },
  };
}

export const replyCommand = sendCommand(SHAPES.reply);
export const quoteCommand = sendCommand(SHAPES.quote);
export const likeCommand = sendCommand(SHAPES.like);
export const dmCommand = sendCommand(SHAPES.dm);
