import { existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, relative, resolve as resolvePath } from "node:path";
import { findLinkedinAccount, linkedinGate, recordLinkedinSession } from "../../../linkedin/account/session/index.ts";
import { watermarkReadingOf } from "../../../twitter/copy/watermark/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput, CommandResult, FlagSpec } from "../../runner/types.ts";
import type { PlatformAccount, PlatformEngineRun } from "../../../platformKit/session/index.ts";

export const LINKEDIN_TEXT_MAX = 3000;
export const LINKEDIN_IMAGE_MAX_BYTES = 20 * 1024 * 1024;
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];

export const ACCOUNT_FLAG: FlagSpec = { name: "account", kind: "string", required: true, description: "The LINKEDIN socialAccount's accountName (its handle)" };
export const APPROVED_BY_FLAG: FlagSpec = { name: "approvedBy", kind: "string", description: "Who approved it: needed with --live (rule 8)" };

export function liveFlag(what: string): FlagSpec {
  return { name: "live", kind: "boolean", live: true, description: `${what} on LinkedIn, only when matt asked (rule 8); without it a dry run sends nothing` };
}

export function text(flags: Record<string, unknown>, name: string): string {
  const value = flags[name];
  return typeof value === "string" ? value.trim() : "";
}

export function imageRoots(env: Record<string, string | undefined> = process.env): string[] {
  return [resolvePath(env.LOG_OUTBOX || join(homedir(), ".buzz", "OUTBOX")), resolvePath(join(homedir(), ".logCli"))];
}

export function imageOf(flag: string, roots = imageRoots()): { ok: true; path: string | null } | { ok: false; refused: string } {
  if (!flag) return { ok: true, path: null };
  const path = resolvePath(flag);
  const inside = roots.some((root) => { const rel = relative(root, path); return !!rel && !rel.startsWith("..") && !isAbsolute(rel); });
  if (!inside) return { ok: false, refused: `${path} isn't under OUTBOX or ~/.logCli, so it isn't posted` };
  if (!existsSync(path) || !statSync(path).isFile()) return { ok: false, refused: `${path} isn't a file` };
  if (!IMAGE_EXTENSIONS.some((ext) => path.toLowerCase().endsWith(ext))) return { ok: false, refused: `${path} isn't a JPEG, PNG or GIF` };
  if (statSync(path).size > LINKEDIN_IMAGE_MAX_BYTES) return { ok: false, refused: `${path} is over 20 MB` };
  return { ok: true, path };
}

export async function openAccount(context: CommandContext, name: string, ref: string): Promise<{ ok: true; account: PlatformAccount } | { ok: false; result: CommandResult }> {
  const account = await findLinkedinAccount(context.twenty, ref);
  const gate = linkedinGate(account);
  if (!gate.ok) return { ok: false, result: refuse(`linkedin ${name}`, gate.code === "accountDeactivated" ? "accountNotUsable" : gate.code, gate.detail) };
  if (!context.directLinkedin) return { ok: false, result: { code: 1, stderr: `log linkedin ${name}: the direct-API engine isn't wired in this context` } };
  return { ok: true, account };
}

export function failed(name: string, run: PlatformEngineRun): { code: number; stderr: string } {
  const calls = Array.isArray(run.answer["calls"]) ? (run.answer["calls"] as { call: string; httpStatus: number }[]).map((c) => `${c.call} ${c.httpStatus}`).join(", ") : "";
  return { code: 1, stderr: `log linkedin ${name}: ${run.answer.code}: ${run.answer.detail ?? ""}${calls ? ` (calls: ${calls})` : ""}. Nothing is retried (rule 94).` };
}

type Mention = { query: string; name: string; entityID: string };

export function hasMentions(raw: string): boolean {
  return raw.includes("@[");
}

function mentionsOf(answer: Record<string, unknown>): Mention[] {
  return Array.isArray(answer["mentions"]) ? (answer["mentions"] as Mention[]) : [];
}

function mentionLines(mentions: Mention[]): string {
  return mentions.map((m) => `\n  @[${m.query}] mentions ${m.name} (${m.entityID})`).join("");
}

export const LINKEDIN_POST_USAGE = [
  'Usage: log linkedin post --account <accountName> --text "<post>" [--image <path>] [--approvedBy <who>] [--live] [--json]',
  "Posts to the account's LinkedIn feed (anyone can see and comment), with one image if --image, on the direct-API engine (no browser), replaying the calls LinkedIn's own composer makes (ShareCompose, DispatchPostCreateWithDetour, the image upload, CreatePost), recorded from a real post.",
  "@[Name] in the text mentions a person or page: LinkedIn's own mention search must give exactly one match with that name, and @[Name|entityID] picks one of several. The dry run looks them up (reads only) and shows each pick. After the post, the composer's own follow-up calls go out as the browser sends them (FetchSharingAfterPostNBA, addUpdateToFeedListRequest, restoreTagPills, collaboratorResetOnDiscardAction, TrackShareboxInteraction), and the calls are paced like a person typing. The app version comes from LinkedIn's own x-li-application-version answer header; without one nothing is sent (appVersionUnknown).",
  "A dry run unless --live, which needs --approvedBy (rule 8). The image must be under OUTBOX or ~/.logCli, a JPEG, PNG or GIF of at most 20 MB. The copy is read for what AI chat interfaces leave in text first (rule 111). LinkedIn's answer decides: the new post's activityId is the post, and anything else stops the run with nothing retried (rule 94). The governor counts it as a write, 10 a day (rule 102).",
].join("\n");

const LINKEDIN_POST_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Post to the account's LinkedIn feed, with an optional image; a dry run unless --live",
      positionals: [],
      flags: [
        ACCOUNT_FLAG,
        { name: "text", kind: "string", required: true, description: "The post's text, at most 3000 characters" },
        { name: "image", kind: "string", description: "One image to post with it, under OUTBOX or ~/.logCli" },
        APPROVED_BY_FLAG,
        liveFlag("Post it"),
        JSON_FLAG,
      ],
    },
  ],
};

export const linkedinPostCommand: Command = {
  usage: LINKEDIN_POST_USAGE,
  platform: "linkedin",
  name: "post",
  effect: "write",
  input: LINKEDIN_POST_INPUT,
  summary: "Post to the account's LinkedIn feed, with an optional image, on the direct-API engine; a dry run unless --live",
  args: '--account <a> --text "<post>" [--image <path>] [--approvedBy <who>] [--live] [--json]',
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(LINKEDIN_POST_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log linkedin post: ${parsed.error}\n${LINKEDIN_POST_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log linkedin post: takes no words, only flags\n${LINKEDIN_POST_USAGE}` };
    const ref = text(parsed.flags, "account");
    const raw = typeof parsed.flags["text"] === "string" ? (parsed.flags["text"] as string) : "";
    if (!ref || !raw.trim()) return { code: 1, stderr: `log linkedin post: --account and --text are needed\n${LINKEDIN_POST_USAGE}` };
    if (raw.length > LINKEDIN_TEXT_MAX) return { code: 1, stderr: `log linkedin post: LinkedIn posts hold at most ${LINKEDIN_TEXT_MAX} characters, this one has ${raw.length}` };
    const image = imageOf(text(parsed.flags, "image"));
    if (!image.ok) return refuse("linkedin post", "fileRefused", image.refused);
    const watermark = watermarkReadingOf(raw);
    if (watermark.level === "artifacts") return refuse("linkedin post", "aiArtifacts", `the copy carries what AI chat interfaces leave in text: ${watermark.findings.filter((f) => f.deterministic).map((f) => `${f.label} ×${f.count}`).join(", ")}`);
    const live = parsed.flags["live"] === true;
    const approvedBy = text(parsed.flags, "approvedBy");
    if (live && !approvedBy) return refuse("linkedin post", "notApproved", "--live needs --approvedBy <who> (rule 8)");
    const json = Boolean(parsed.flags["json"]);
    const planOf = (body: string) => `post ${body.length} characters${image.path ? ` with the image ${image.path}` : ""}`;
    const plan = planOf(raw);
    try {
      const opened = await openAccount(context, "post", ref);
      if (!opened.ok) return opened.result;
      const account = opened.account;
      if (!live) {
        let shown = raw;
        let mentions: Mention[] = [];
        if (hasMentions(raw)) {
          context.err(`${account.accountName}: looking up the post's mentions with LinkedIn's own mention search (reads only, nothing posted)`);
          const preview = context.directLinkedin!(account, { action: "mentions", text: raw });
          if (!preview.answer.ok) return failed("post", preview);
          shown = String(preview.answer["text"] ?? raw);
          mentions = mentionsOf(preview.answer);
        }
        if (json) return { code: 0, stdout: JSON.stringify({ platform: "linkedin", account: account.accountName, dryRun: true, text: shown, mentions, image: image.path }, null, 2) };
        return { code: 0, stdout: `log linkedin post: dry run: ${account.accountName} would ${planOf(shown)}:\n${shown}${mentionLines(mentions)}\nNothing was posted. --live --approvedBy <who> does it (rule 8).` };
      }
      context.err(`${account.accountName}: ${plan}, approved by ${approvedBy}, on the direct-API engine`);
      const run = context.directLinkedin!(account, { action: "post", live: true, approvedBy, text: raw, ...(image.path ? { image: image.path } : {}) });
      for (const line of await recordLinkedinSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      if (!run.answer.ok) return failed("post", run);
      if (json) return { code: 0, stdout: JSON.stringify({ platform: "linkedin", account: account.accountName, approvedBy, ...run.answer }, null, 2) };
      const stopped = run.answer["followUpStopped"] as { call: string; code: string } | undefined;
      const after = stopped ? `\nThe post is live, but LinkedIn refused the composer's follow-up ${stopped.call} (${stopped.code}): the rest were skipped and nothing is retried (rule 94).` : "";
      return { code: 0, stdout: `log linkedin post: ${account.accountName} posted, activity ${String(run.answer["activityId"])}: ${String(run.answer["url"])}, approved by ${approvedBy}.${mentionLines(mentionsOf(run.answer))}${after}` };
    } catch (error) {
      return refuseError("linkedin post", error);
    }
  },
};

export const LINKEDIN_DELETE_USAGE = [
  "Usage: log linkedin delete --account <accountName> --activity <activityId|post url> [--approvedBy <who>] [--live] [--json]",
  "Deletes one of the account's own LinkedIn posts by its activity id (what log linkedin post printed, or the urn:li:activity in its URL), on the direct-API engine (no browser), replaying LinkedIn's own deletePost call.",
  "A dry run unless --live, which needs --approvedBy (rule 8). LinkedIn's answer decides; a refusal stops it with nothing retried (rule 94). The governor counts it as a write.",
].join("\n");

const LINKEDIN_DELETE_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Delete one of the account's own LinkedIn posts; a dry run unless --live",
      positionals: [],
      flags: [
        ACCOUNT_FLAG,
        { name: "activity", kind: "string", required: true, description: "The post's activity id, or its URL" },
        APPROVED_BY_FLAG,
        liveFlag("Delete it"),
        JSON_FLAG,
      ],
    },
  ],
};

export function activityOf(ref: string): string | null {
  const found = ref.match(/activity[:-](\d{10,25})/) ?? ref.match(/^(\d{10,25})$/);
  return found ? found[1] : null;
}

export const linkedinDeleteCommand: Command = {
  usage: LINKEDIN_DELETE_USAGE,
  platform: "linkedin",
  name: "delete",
  effect: "write",
  input: LINKEDIN_DELETE_INPUT,
  summary: "Delete one of the account's own LinkedIn posts on the direct-API engine; a dry run unless --live",
  args: "--account <a> --activity <id|url> [--approvedBy <who>] [--live] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(LINKEDIN_DELETE_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log linkedin delete: ${parsed.error}\n${LINKEDIN_DELETE_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log linkedin delete: takes no words, only flags\n${LINKEDIN_DELETE_USAGE}` };
    const ref = text(parsed.flags, "account");
    const activity = activityOf(text(parsed.flags, "activity"));
    if (!ref) return { code: 1, stderr: `log linkedin delete: --account is needed\n${LINKEDIN_DELETE_USAGE}` };
    if (!activity) return { code: 1, stderr: `log linkedin delete: --activity must be a LinkedIn activity id or a post URL holding one\n${LINKEDIN_DELETE_USAGE}` };
    const live = parsed.flags["live"] === true;
    const approvedBy = text(parsed.flags, "approvedBy");
    if (live && !approvedBy) return refuse("linkedin delete", "notApproved", "--live needs --approvedBy <who> (rule 8)");
    const json = Boolean(parsed.flags["json"]);
    try {
      const opened = await openAccount(context, "delete", ref);
      if (!opened.ok) return opened.result;
      const account = opened.account;
      if (!live) {
        if (json) return { code: 0, stdout: JSON.stringify({ platform: "linkedin", account: account.accountName, dryRun: true, activityId: activity }, null, 2) };
        return { code: 0, stdout: `log linkedin delete: dry run: ${account.accountName} would delete activity ${activity}. Nothing was sent. --live --approvedBy <who> does it (rule 8).` };
      }
      context.err(`${account.accountName}: delete activity ${activity}, approved by ${approvedBy}, on the direct-API engine`);
      const run = context.directLinkedin!(account, { action: "deletePost", live: true, approvedBy, activityId: activity });
      for (const line of await recordLinkedinSession(context.twenty, account, run, context.now?.() ?? new Date())) context.err(line);
      if (!run.answer.ok) return failed("delete", run);
      if (json) return { code: 0, stdout: JSON.stringify({ platform: "linkedin", account: account.accountName, approvedBy, ...run.answer }, null, 2) };
      return { code: 0, stdout: `log linkedin delete: ${account.accountName} deleted activity ${activity}, approved by ${approvedBy}.` };
    } catch (error) {
      return refuseError("linkedin delete", error);
    }
  },
};
