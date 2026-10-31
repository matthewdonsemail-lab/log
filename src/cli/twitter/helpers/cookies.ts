import { cancel, intro, isCancel, outro, password } from "@clack/prompts";
import { toFacebookAccount } from "../../../marketplace/socialAccount/index.ts";
import type { SocialAccountRow } from "../../../marketplace/socialAccount/index.ts";
import { twitterStateRoot, writeLocalSession } from "../../../directApi/engine/index.ts";
import { findTwitterAccount } from "../../../twitter/account/session/index.ts";
import type { TwitterAccount } from "../../../twitter/account/session/index.ts";
import { COPY_STYLES, copyStyleOf, DEFAULT_COPY_STYLE } from "../../../twitter/copy/style/index.ts";
import { TwentyError } from "../../../twenty/graphql/index.ts";
import { shouldPrompt } from "../../launch/helpers/index.ts";
import type { LaunchTTY } from "../../launch/helpers/index.ts";
import { parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandInput } from "../../runner/types.ts";

export const COOKIES_USAGE = [
  "Usage: log twitter cookies save --account <handle> [--style <copyStyle>] [--name <label>]",
  "Saves an X account's session to Twenty from a masked Clack prompt: its auth_token, ct0 and twid cookies (twid carries the account's id), copied from a browser signed in to x.com, never passed as flags or printed. They are checked first: the direct-API engine (no browser, no proxy, rule 80) pings X with them, and only cookies X accepts for that same handle are saved. A handle Twenty doesn't have yet gets a new TWITTER socialAccounts row (rule 13); one it has gets its cookies replaced. --style sets the account's copyStyle, the writing style every send and queue check holds its copy to (empty: house). The account's governor starts under ~/.logCli/twitter/<handle>.",
].join("\n");

interface CookiePrompts {
  intro(title: string): void;
  outro(message?: string): void;
  cancel(message?: string): void;
  password(option: Parameters<typeof password>[0]): Promise<unknown>;
}

export const cookiesDeps: { prompts: CookiePrompts; tty: () => LaunchTTY } = {
  prompts: { intro, outro, cancel, password: password as CookiePrompts["password"] },
  tty: () => ({ stdinTTY: process.stdin?.isTTY, stdoutTTY: process.stdout?.isTTY }),
};

export const COOKIES_INPUT: CommandInput = {
  forms: [
    {
      words: ["save"],
      summary: "Save an X account's auth_token, ct0 and twid to Twenty from a masked prompt, checked against X first",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The account's X handle, saved as its accountName" },
        { name: "style", kind: "string", description: `The account's copy style (${Object.keys(COPY_STYLES).join(", ")}; empty: ${DEFAULT_COPY_STYLE})` },
        { name: "name", kind: "string", description: "The row's name in Twenty for a new account (default: the handle)" },
      ],
    },
  ],
};

export function isCookieValue(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9%_-]{20,}$/.test(value.trim());
}

async function existing(context: Parameters<Command["run"]>[0], handle: string): Promise<TwitterAccount | null> {
  try {
    return await findTwitterAccount(context.twenty, handle);
  } catch (error) {
    if (error instanceof TwentyError && error.code === "accountNotFound" && !/ are called /.test(error.message)) return null;
    throw error;
  }
}

export const cookiesCommand: Command = {
  usage: COOKIES_USAGE,
  platform: "twitter",
  name: "cookies",
  effect: "write",
  summary: "Add or refresh an X account in Twenty: its session cookies from a masked prompt, checked against X, and its copy style",
  input: COOKIES_INPUT,
  args: "save --account <handle> [--style <s>] [--name <label>]",
  async run(context, argv) {
    if (argv[0] !== "save") return { code: 1, stderr: `log twitter cookies: save is the only subcommand\n${COOKIES_USAGE}` };
    const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...COOKIES_INPUT.forms[0], words: [] }] }));
    if (!parsed.ok) return { code: 1, stderr: `log twitter cookies: ${parsed.error}\n${COOKIES_USAGE}` };
    const raw = parsed.flags["account"];
    const handle = typeof raw === "string" ? raw.trim().replace(/^@/, "") : "";
    if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) return { code: 1, stderr: `log twitter cookies save: --account must be an X handle (letters, digits, _)\n${COOKIES_USAGE}` };
    const style = typeof parsed.flags["style"] === "string" ? (parsed.flags["style"] as string).trim() : undefined;
    if (style && !copyStyleOf(style)) return refuse("twitter cookies save", "copyStyleUnknown", `${style} (known: ${Object.keys(COPY_STYLES).join(", ")})`);
    if (!context.directTwitter) return { code: 1, stderr: "log twitter cookies save: the direct-API engine isn't wired in this context" };
    if (!shouldPrompt(false, cookiesDeps.tty())) {
      return { code: 1, stderr: "log twitter cookies save: the cookies are typed in a Clack prompt, so it needs an interactive terminal: run it there (they are never passed as flags)" };
    }
    try {
      const found = await existing(context, handle);
      const prompts = cookiesDeps.prompts;
      prompts.intro(`log twitter cookies save — @${handle}${found ? " (already in Twenty: its cookies are replaced)" : " (new in Twenty)"}`);
      const ask = async (message: string) => {
        const value = await prompts.password({ message, mask: "•", validate: (v) => (isCookieValue(v) ? undefined : "paste the cookie's value only") });
        return isCancel(value) || !isCookieValue(value) ? null : value.trim();
      };
      const authToken = await ask("auth_token (x.com cookie)");
      const ct0 = authToken ? await ask("ct0 (x.com cookie)") : null;
      const twid = ct0 ? await ask("twid (x.com cookie, u%3D followed by the account id)") : null;
      if (!authToken || !ct0 || !twid) {
        prompts.cancel("Nothing saved.");
        return { code: 1, stderr: "log twitter cookies save: cancelled, nothing saved" };
      }
      const cookies = { auth_token: authToken, ct0, twid };
      const probe = toFacebookAccount({ id: found?.id ?? "new", accountName: handle, name: handle, platform: "TWITTER", cookies } as SocialAccountRow);
      context.err(`@${handle}: checking the cookies with X on the direct-API engine before saving`);
      const run = context.directTwitter(probe, { action: "ping" });
      if (!run.answer.ok || run.answer.loginState !== "loggedIn") {
        prompts.cancel("X didn't accept those cookies. Nothing saved.");
        return refuse("twitter cookies save", "twitterCookiesRefused", `${run.answer.code ?? "notLoggedIn"}${run.answer.loginState ? ` (${run.answer.loginState})` : ""}`);
      }
      const signedInAs = run.answer.screenName ?? "";
      if (signedInAs.toLowerCase() !== handle.toLowerCase()) {
        prompts.cancel(`Those cookies are signed in as @${signedInAs || "?"}. Nothing saved.`);
        return refuse("twitter cookies save", "twitterCookiesWrongAccount", `signed in as @${signedInAs || "?"}, not @${handle}`);
      }
      const now = context.now?.() ?? new Date();
      const saved = { ...cookies, ...(run.refreshed ?? {}) };
      const fields = { cookies: saved, sessionState: "loggedIn", sessionCheckedAt: now.toISOString(), ...(style ? { copyStyle: style } : {}) };
      const label = typeof parsed.flags["name"] === "string" && (parsed.flags["name"] as string).trim() ? (parsed.flags["name"] as string).trim() : handle;
      if (found) await context.twenty.update("socialAccounts", found.id, fields as never);
      else await context.twenty.create("socialAccounts", { name: label, accountName: handle, platform: "TWITTER", ...fields } as never);
      writeLocalSession(handle, "loggedIn", now, twitterStateRoot());
      const styleName = style || found?.copyStyle || DEFAULT_COPY_STYLE;
      prompts.outro(`Saved to Twenty. @${handle} is loggedIn (${run.answer.userId}), copy style ${styleName}.`);
      return { code: 0, stdout: `log twitter cookies save: @${handle} ${found ? "updated" : "added"} in Twenty as a TWITTER socialAccount, loggedIn as @${signedInAs} (${run.answer.userId}), cookies <set>, copy style ${styleName}.` };
    } catch (error) {
      return refuseError("twitter cookies save", error);
    }
  },
};
