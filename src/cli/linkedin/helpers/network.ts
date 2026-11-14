import { recordLinkedinSession } from "../../../linkedin/account/session/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError, refuseInput } from "../../runner/helpers/index.ts";
import type { Command, CommandInput } from "../../runner/types.ts";
import { publicIdOf } from "./cookies.ts";
import { ACCOUNT_FLAG, APPROVED_BY_FLAG, failed, liveFlag, openAccount, text } from "./share.ts";
import { actOnEngine } from "../../../platformKit/action/index.ts";

export const LINKEDIN_CONNECT_GAP_MINUTES = 15;
export const LINKEDIN_CONNECTS_PER_DAY = 5;

export type SuggestedPerson = { name: string; publicId: string; profileUrl: string; memberId: string; origin: string };

export function profileOf(ref: string): string {
  if (!ref.trim()) return "";
  const id = publicIdOf(ref).toLowerCase();
  return id.length >= 3 && id.length <= 100 && !/[\s/?#]/.test(id) ? id : "";
}

function peopleOf(answer: Record<string, unknown>): SuggestedPerson[] {
  return Array.isArray(answer["people"]) ? (answer["people"] as SuggestedPerson[]) : [];
}

export function peopleLines(people: SuggestedPerson[]): string {
  return people.map((p) => `  ${p.name} (${p.publicId})`).join("\n");
}

export const LINKEDIN_SUGGESTIONS_USAGE = [
  "Usage: log linkedin suggestions --account <accountName> [--json]",
  "Lists the people LinkedIn suggests on the account's My Network page, on the direct-API engine (no browser): the feed, then My Network the way the browser opens it (the MyNetwork navigation, then its own mojoTabsBadge, addaMarkNotificationsSeen and addaClearUnseenInvitationsMutation), recorded from a real visit. Each suggestion's public id is what log linkedin connect --profile takes.",
  "Reads only: nothing is sent to anyone. Opening My Network marks its notifications seen, as the browser does.",
].join("\n");

const LINKEDIN_SUGGESTIONS_INPUT: CommandInput = {
  forms: [{ words: [], summary: "List the people LinkedIn suggests on the account's My Network page", positionals: [], flags: [ACCOUNT_FLAG, JSON_FLAG] }],
};

export const linkedinSuggestionsCommand: Command = {
  usage: LINKEDIN_SUGGESTIONS_USAGE,
  platform: "linkedin",
  name: "suggestions",
  effect: "read",
  input: LINKEDIN_SUGGESTIONS_INPUT,
  summary: "List the people LinkedIn suggests on the account's My Network page, on the direct-API engine",
  args: "--account <a> [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(LINKEDIN_SUGGESTIONS_INPUT));
    if (!parsed.ok) return refuseInput("linkedin suggestions", `${parsed.error}`, LINKEDIN_SUGGESTIONS_USAGE);
    if (parsed.positionals.length) return refuseInput("linkedin suggestions", `takes no words, only flags`, LINKEDIN_SUGGESTIONS_USAGE);
    const ref = text(parsed.flags, "account");
    if (!ref) return refuseInput("linkedin suggestions", `--account is needed`, LINKEDIN_SUGGESTIONS_USAGE);
    try {
      const opened = await openAccount(context, "suggestions", ref);
      if (!opened.ok) return opened.result;
      const account = opened.account;
      context.err(`${account.accountName}: reading My Network's suggestions on the direct-API engine (reads only)`);
      const run = context.directLinkedin!(account, { action: "suggestions" });
      for (const line of await recordLinkedinSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      if (!run.answer.ok) return failed("suggestions", run);
      const people = peopleOf(run.answer);
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ platform: "linkedin", account: account.accountName, people }, null, 2) };
      return { code: 0, stdout: `log linkedin suggestions: LinkedIn suggests ${people.length} people to ${account.accountName}:\n${peopleLines(people)}` };
    } catch (error) {
      return refuseError("linkedin suggestions", error);
    }
  },
};

export const LINKEDIN_CONNECT_USAGE = [
  "Usage: log linkedin connect --account <accountName> --profile <publicId|profile url> [--approvedBy <who>] [--live] [--json]",
  "Sends one connection invitation, without a note, to a person LinkedIn suggests on the account's My Network page, on the direct-API engine (no browser): My Network is opened as log linkedin suggestions opens it, and the invitation is the request that person's own Connect button carries (addaAddConnection), sent as the browser sent it. Someone not among the suggestions is refused (profileNotSuggested), since a profile page's Connect hasn't been recorded yet.",
  `A dry run unless --live, which needs --approvedBy (rule 8); the dry run only says whether the person is suggested. One invitation a run, at least ${LINKEDIN_CONNECT_GAP_MINUTES} minutes apart and at most ${LINKEDIN_CONNECTS_PER_DAY} in 24 hours (connectTooSoon, connectDailyCap): in a recorded session LinkedIn refused every connect sent within seconds of another, then ended the session (rule 94). LinkedIn's answer decides: the invitation is sent only when it sets it to Pending; its "invitation not sent" stops the run with nothing retried. The governor counts it as a write, 10 a day (rule 102).`,
].join("\n");

const LINKEDIN_CONNECT_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Send one connection invitation to someone LinkedIn suggests; a dry run unless --live",
      positionals: [],
      flags: [
        ACCOUNT_FLAG,
        { name: "profile", kind: "string", required: true, description: "The person's public id (after linkedin.com/in/) or profile URL, from log linkedin suggestions" },
        APPROVED_BY_FLAG,
        liveFlag("Send the invitation"),
        JSON_FLAG,
      ],
    },
  ],
};

export const linkedinConnectCommand: Command = {
  usage: LINKEDIN_CONNECT_USAGE,
  platform: "linkedin",
  name: "connect",
  effect: "write",
  input: LINKEDIN_CONNECT_INPUT,
  summary: "Send one connection invitation to someone LinkedIn suggests, on the direct-API engine; a dry run unless --live",
  args: "--account <a> --profile <publicId|url> [--approvedBy <who>] [--live] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(LINKEDIN_CONNECT_INPUT));
    if (!parsed.ok) return refuseInput("linkedin connect", `${parsed.error}`, LINKEDIN_CONNECT_USAGE);
    if (parsed.positionals.length) return refuseInput("linkedin connect", `takes no words, only flags`, LINKEDIN_CONNECT_USAGE);
    const ref = text(parsed.flags, "account");
    const profile = profileOf(text(parsed.flags, "profile"));
    if (!ref || !profile) return refuseInput("linkedin connect", `--account and --profile (a public id or profile URL) are needed`, LINKEDIN_CONNECT_USAGE);
    const live = parsed.flags["live"] === true;
    const approvedBy = text(parsed.flags, "approvedBy");
    if (live && !approvedBy) return refuse("linkedin connect", "notApproved", "--live needs --approvedBy <who> (rule 8)");
    const json = Boolean(parsed.flags["json"]);
    try {
      const opened = await openAccount(context, "connect", ref);
      if (!opened.ok) return opened.result;
      const account = opened.account;
      if (!live) {
        context.err(`${account.accountName}: checking ${profile} is among My Network's suggestions (reads only, nothing sent)`);
        const preview = context.directLinkedin!(account, { action: "suggestions" });
        if (!preview.answer.ok) return failed("connect", preview);
        const person = peopleOf(preview.answer).find((p) => p.publicId === profile);
        if (!person) return refuse("linkedin connect", "profileNotSuggested", `${profile} isn't among the people LinkedIn suggests to ${account.accountName} right now:\n${peopleLines(peopleOf(preview.answer).slice(0, 10))}`);
        if (json) return { code: 0, stdout: JSON.stringify({ platform: "linkedin", account: account.accountName, dryRun: true, person }, null, 2) };
        return { code: 0, stdout: `log linkedin connect: dry run: ${account.accountName} would invite ${person.name} (${person.publicId}), suggested by LinkedIn. Nothing was sent. --live --approvedBy <who> does it (rule 8).` };
      }
      const pace = context.directLinkedin!(account, { action: "connectPace" });
      if (!pace.answer.ok) return failed("connect", pace);
      context.err(`${account.accountName}: invite ${profile}, approved by ${approvedBy}, on the direct-API engine`);
      const run = await actOnEngine(() => context.directLinkedin!(account, { action: "connect", live: true, approvedBy, profile }));
      for (const line of await recordLinkedinSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      if (!run.answer.ok) return failed("connect", run);
      const person = (run.answer["connected"] ?? {}) as Partial<SuggestedPerson>;
      if (json) return { code: 0, stdout: JSON.stringify({ platform: "linkedin", account: account.accountName, approvedBy, ...run.answer }, null, 2) };
      return { code: 0, stdout: `log linkedin connect: ${account.accountName} invited ${person.name ?? profile} (${person.publicId ?? profile}); LinkedIn set the invitation to Pending. Approved by ${approvedBy}.` };
    } catch (error) {
      return refuseError("linkedin connect", error);
    }
  },
};
