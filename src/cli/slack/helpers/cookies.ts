import { cancel, intro, isCancel, outro, password } from "@clack/prompts";
import { toFacebookAccount } from "../../../marketplace/socialAccount/index.ts";
import type { SocialAccountRow } from "../../../marketplace/socialAccount/index.ts";
import { findSlackAccount, SLACK_COOKIE_DOMAIN } from "../../../slack/account/session/index.ts";
import type { PlatformAccount } from "../../../platformKit/session/index.ts";
import { TwentyError, upsertLocalAccount } from "../../../twenty/graphql/index.ts";
import { shouldPrompt } from "../../launch/helpers/index.ts";
import type { LaunchTTY } from "../../launch/helpers/index.ts";
import { parseArgs, parserSpecOf, refuse, refuseError, refuseInput } from "../../runner/helpers/index.ts";
import type { Command, CommandInput } from "../../runner/types.ts";

export const SLACK_COOKIES_USAGE = [
  "Usage: log slack cookies save --account <accountName> [--name <label>] [--workspace <domain>]",
  "Saves a Slack account's session locally (~/.logCli/localAccounts.json, rule 97) from a masked Clack prompt: its d cookie (xoxd-…), copied from a browser signed in to app.slack.com, never passed as a flag or printed.",
  "It is checked first: the direct-API engine (vendor/gabrielSlack, no browser, no proxy) exchanges it with Slack for the workspaces it is signed in to, and only a cookie Slack accepts is saved. An account log doesn't have yet gets a new local SLACK row; one it has gets its d cookie replaced and keeps the rest.",
].join("\n");

interface CookiePrompts {
  intro(title: string): void;
  outro(message?: string): void;
  cancel(message?: string): void;
  password(option: Parameters<typeof password>[0]): Promise<unknown>;
}

export const slackCookiesDeps: { prompts: CookiePrompts; tty: () => LaunchTTY } = {
  prompts: { intro, outro, cancel, password: password as CookiePrompts["password"] },
  tty: () => ({ stdinTTY: process.stdin?.isTTY, stdoutTTY: process.stdout?.isTTY }),
};

export const SLACK_COOKIES_INPUT: CommandInput = {
  forms: [
    {
      words: ["save"],
      summary: "Save a Slack account's d cookie locally from a masked prompt, checked against Slack first",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The account's name in log, saved as its accountName" },
        { name: "name", kind: "string", description: "The row's label for a new account (default: the account name)" },
        { name: "workspace", kind: "string", description: "Also check the session inside this workspace (its domain, e.g. acme-team)" },
      ],
    },
  ],
};

export function isSlackD(value: unknown): value is string {
  return typeof value === "string" && /^xoxd-[A-Za-z0-9%_\-+/=.]{20,}$/.test(value.trim());
}

type BrowserCookie = { name: string; value: string; domain?: string; path?: string } & Record<string, unknown>;

export function withD(held: unknown, d: string): BrowserCookie[] | Record<string, string> {
  const cookie: BrowserCookie = { name: "d", value: d, domain: SLACK_COOKIE_DOMAIN, path: "/", httpOnly: true, secure: true, sameSite: "Lax" };
  if (Array.isArray(held)) return [...(held as BrowserCookie[]).filter((c) => c?.name !== "d"), cookie];
  if (held && typeof held === "object") return { ...(held as Record<string, string>), d };
  return [cookie];
}

async function existing(context: Parameters<Command["run"]>[0], name: string): Promise<PlatformAccount | null> {
  try {
    return await findSlackAccount(context.twenty, name);
  } catch (error) {
    if (error instanceof TwentyError && error.code === "accountNotFound" && !/ are called /.test(error.message)) return null;
    throw error;
  }
}

export const slackCookiesCommand: Command = {
  usage: SLACK_COOKIES_USAGE,
  platform: "slack",
  name: "cookies",
  effect: "write",
  summary: "Add or refresh a Slack account locally: its d cookie from a masked prompt, checked against Slack",
  input: SLACK_COOKIES_INPUT,
  args: "save --account <a> [--name <label>] [--workspace <domain>]",
  async run(context, argv) {
    if (argv[0] !== "save") return { code: 1, stderr: `log slack cookies: save is the only subcommand\n${SLACK_COOKIES_USAGE}` };
    const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...SLACK_COOKIES_INPUT.forms[0], words: [] }] }));
    if (!parsed.ok) return refuseInput("slack cookies", parsed.error, SLACK_COOKIES_USAGE);
    const accountName = String(parsed.flags["account"] ?? "").trim();
    if (!/^[A-Za-z0-9_.\-]{2,64}$/.test(accountName)) return { code: 1, error: "inputInvalid", stderr: `log slack cookies save: --account must be a name of letters, digits, _ . or -\n${SLACK_COOKIES_USAGE}` };
    const workspace = typeof parsed.flags["workspace"] === "string" ? parsed.flags["workspace"].trim() : "";
    if (!context.directSlack) return { code: 1, stderr: "log slack cookies save: the direct-API engine isn't wired in this context" };
    if (!context.cookiePrompts && !shouldPrompt(false, slackCookiesDeps.tty())) {
      return { code: 1, stderr: "log slack cookies save: the d cookie is typed in a Clack prompt, so it needs an interactive terminal: run it there (it is never passed as a flag)" };
    }
    try {
      const found = await existing(context, accountName);
      const prompts = context.cookiePrompts ?? slackCookiesDeps.prompts;
      prompts.intro(`log slack cookies save — ${accountName}${found ? " (already saved: its d cookie is replaced)" : " (new, saved locally)"}`);
      const value = await prompts.password({ message: "d (slack.com cookie, starts with xoxd-)", mask: "•", validate: (v) => (isSlackD(v) ? undefined : "paste the d cookie's value only, xoxd- and the rest") });
      if (isCancel(value) || !isSlackD(value)) {
        prompts.cancel("Nothing saved.");
        return { code: 1, stderr: "log slack cookies save: cancelled, nothing saved" };
      }
      const d = value.trim();
      const probe = toFacebookAccount({ id: found?.id ?? "new", accountName, name: accountName, platform: "SLACK", cookies: { d } } as unknown as SocialAccountRow);
      context.err(`${accountName}: checking the d cookie with Slack on the direct-API engine (vendor/gabrielSlack) before saving`);
      const run = context.directSlack(probe, { action: "ping", ...(workspace ? { workspace } : {}) });
      if (!run.answer.ok || run.answer.loginState !== "loggedIn") {
        prompts.cancel("Slack didn't accept that cookie. Nothing saved.");
        return refuse("slack cookies save", "slackCookiesRefused", `${run.answer.code ?? "notLoggedIn"}${run.answer.loginState ? ` (${run.answer.loginState})` : ""}${run.answer.detail ? `: ${run.answer.detail}` : ""}`);
      }
      const workspaces = ((run.answer.workspaces as { domain?: string; name?: string }[] | undefined) ?? []).map((w) => w.domain ?? w.name ?? "?");
      const now = context.now?.() ?? new Date();
      const fields = { sessionState: "loggedIn", sessionCheckedAt: now.toISOString() };
      const label = typeof parsed.flags["name"] === "string" && parsed.flags["name"].trim() ? parsed.flags["name"].trim() : accountName;
      if (found) {
        const row = await context.twenty.get("socialAccounts", found.id);
        const held = (row as unknown as { cookies?: unknown } | null)?.cookies;
        await context.twenty.update("socialAccounts", found.id, { cookies: withD(held, d), ...fields } as never);
      } else upsertLocalAccount({ accountName, name: label, platform: "SLACK", cookies: withD(null, d), ...fields });
      prompts.outro(`Saved locally. ${accountName} is loggedIn.`);
      return { code: 0, stdout: `log slack cookies save: ${accountName} ${found ? "updated" : "added"} as a local SLACK account, loggedIn${run.answer.screenName ? ` as ${run.answer.screenName}` : ""} in ${workspaces.length} workspace(s) (${workspaces.join(", ")}), d <set>.` };
    } catch (error) {
      return refuseError("slack cookies save", error);
    }
  },
};
