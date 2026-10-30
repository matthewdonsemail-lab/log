import { cancel, intro, isCancel, outro, password } from "@clack/prompts";
import { toFacebookAccount } from "../../../marketplace/socialAccount/index.ts";
import type { SocialAccountRow } from "../../../marketplace/socialAccount/index.ts";
import { findLinkedinAccount } from "../../../linkedin/account/session/index.ts";
import type { PlatformAccount } from "../../../platformKit/session/index.ts";
import { TwentyError } from "../../../twenty/graphql/index.ts";
import { shouldPrompt } from "../../launch/helpers/index.ts";
import type { LaunchTTY } from "../../launch/helpers/index.ts";
import { parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandInput } from "../../runner/types.ts";

export const LINKEDIN_COOKIES_USAGE = [
  "Usage: log linkedin cookies save --account <publicId> [--name <label>]",
  "Saves a LinkedIn account's session to Twenty from a masked Clack prompt: its li_at and JSESSIONID cookies, copied from a browser signed in to linkedin.com, never passed as flags or printed. --account is the profile's public id, the part after linkedin.com/in/.",
  "They are checked first: the direct-API engine (openLinkedinApi, no browser, no proxy) reads /voyager/api/me with them, and only cookies LinkedIn accepts for that same profile are saved. A profile Twenty doesn't have yet gets a new LINKEDIN socialAccounts row (rule 13); one it has gets its cookies replaced.",
].join("\n");

interface CookiePrompts {
  intro(title: string): void;
  outro(message?: string): void;
  cancel(message?: string): void;
  password(option: Parameters<typeof password>[0]): Promise<unknown>;
}

export const linkedinCookiesDeps: { prompts: CookiePrompts; tty: () => LaunchTTY } = {
  prompts: { intro, outro, cancel, password: password as CookiePrompts["password"] },
  tty: () => ({ stdinTTY: process.stdin?.isTTY, stdoutTTY: process.stdout?.isTTY }),
};

export const LINKEDIN_COOKIES_INPUT: CommandInput = {
  forms: [
    {
      words: ["save"],
      summary: "Save a LinkedIn account's li_at and JSESSIONID to Twenty from a masked prompt, checked against LinkedIn first",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The profile's public id (linkedin.com/in/<publicId>), saved as its accountName" },
        { name: "name", kind: "string", description: "The row's name in Twenty for a new account (default: the public id)" },
      ],
    },
  ],
};

export function isLiAt(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_\-]{40,}$/.test(value.trim());
}

export function isJsessionId(value: unknown): value is string {
  return typeof value === "string" && /^"?ajax:\d{10,}"?$/.test(value.trim());
}

export function publicIdOf(raw: string): string {
  const text = raw.trim().replace(/\/+$/, "");
  const fromUrl = /linkedin\.com\/in\/([^/?#]+)/i.exec(text)?.[1];
  return decodeURIComponent(fromUrl ?? text).replace(/^@/, "");
}

async function existing(context: Parameters<Command["run"]>[0], publicId: string): Promise<PlatformAccount | null> {
  try {
    return await findLinkedinAccount(context.twenty, publicId);
  } catch (error) {
    if (error instanceof TwentyError && error.code === "accountNotFound" && !/ are called /.test(error.message)) return null;
    throw error;
  }
}

export const linkedinCookiesCommand: Command = {
  usage: LINKEDIN_COOKIES_USAGE,
  platform: "linkedin",
  name: "cookies",
  effect: "write",
  summary: "Add or refresh a LinkedIn account in Twenty: its session cookies from a masked prompt, checked against LinkedIn",
  input: LINKEDIN_COOKIES_INPUT,
  args: "save --account <publicId> [--name <label>]",
  async run(context, argv) {
    if (argv[0] !== "save") return { code: 1, stderr: `log linkedin cookies: save is the only subcommand\n${LINKEDIN_COOKIES_USAGE}` };
    const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...LINKEDIN_COOKIES_INPUT.forms[0], words: [] }] }));
    if (!parsed.ok) return { code: 1, stderr: `log linkedin cookies: ${parsed.error}\n${LINKEDIN_COOKIES_USAGE}` };
    const raw = parsed.flags["account"];
    const publicId = typeof raw === "string" ? publicIdOf(raw) : "";
    if (!/^[A-Za-z0-9\-_%]{3,100}$/.test(publicId)) return { code: 1, stderr: `log linkedin cookies save: --account must be the profile's public id (linkedin.com/in/<publicId>)\n${LINKEDIN_COOKIES_USAGE}` };
    if (!context.directLinkedin) return { code: 1, stderr: "log linkedin cookies save: the direct-API engine isn't wired in this context" };
    if (!shouldPrompt(false, linkedinCookiesDeps.tty())) {
      return { code: 1, stderr: "log linkedin cookies save: the cookies are typed in a Clack prompt, so it needs an interactive terminal: run it there (they are never passed as flags)" };
    }
    try {
      const found = await existing(context, publicId);
      const prompts = linkedinCookiesDeps.prompts;
      prompts.intro(`log linkedin cookies save — ${publicId}${found ? " (already in Twenty: its cookies are replaced)" : " (new in Twenty)"}`);
      const ask = async (message: string, valid: (v: unknown) => boolean, hint: string) => {
        const value = await prompts.password({ message, mask: "•", validate: (v) => (valid(v) ? undefined : hint) });
        return isCancel(value) || !valid(value) ? null : (value as string).trim();
      };
      const liAt = await ask("li_at (linkedin.com cookie)", isLiAt, "paste the li_at cookie's value only");
      const jsessionId = liAt ? await ask("JSESSIONID (linkedin.com cookie, starts with ajax:)", isJsessionId, "paste the JSESSIONID value, ajax: and the digits") : null;
      if (!liAt || !jsessionId) {
        prompts.cancel("Nothing saved.");
        return { code: 1, stderr: "log linkedin cookies save: cancelled, nothing saved" };
      }
      const cookies = { li_at: liAt, JSESSIONID: jsessionId.startsWith('"') ? jsessionId : `"${jsessionId}"` };
      const probe = toFacebookAccount({ id: found?.id ?? "new", accountName: publicId, name: publicId, platform: "LINKEDIN", cookies } as SocialAccountRow);
      context.err(`${publicId}: checking the cookies with LinkedIn on the direct-API engine before saving`);
      const run = context.directLinkedin(probe, { action: "ping" });
      if (!run.answer.ok || run.answer.loginState !== "loggedIn") {
        prompts.cancel("LinkedIn didn't accept those cookies. Nothing saved.");
        return refuse("linkedin cookies save", "linkedinCookiesRefused", `${run.answer.code ?? "notLoggedIn"}${run.answer.loginState ? ` (${run.answer.loginState})` : ""}${run.answer.detail ? `: ${run.answer.detail}` : ""}`);
      }
      const signedInAs = String(run.answer.screenName ?? "");
      if (signedInAs.toLowerCase() !== publicId.toLowerCase()) {
        prompts.cancel(`Those cookies are signed in as ${signedInAs || "?"}. Nothing saved.`);
        return refuse("linkedin cookies save", "linkedinCookiesWrongAccount", `signed in as ${signedInAs || "?"}, not ${publicId}`);
      }
      const now = context.now?.() ?? new Date();
      const saved = { ...cookies, ...(run.refreshed ?? {}) };
      const fields = { cookies: saved, sessionState: "loggedIn", sessionCheckedAt: now.toISOString() };
      const label = typeof parsed.flags["name"] === "string" && (parsed.flags["name"] as string).trim() ? (parsed.flags["name"] as string).trim() : publicId;
      if (found) await context.twenty.update("socialAccounts", found.id, fields as never);
      else await context.twenty.create("socialAccounts", { name: label, accountName: publicId, platform: "LINKEDIN", ...fields } as never);
      prompts.outro(`Saved to Twenty. ${publicId} is loggedIn.`);
      return { code: 0, stdout: `log linkedin cookies save: ${publicId} ${found ? "updated" : "added"} in Twenty as a LINKEDIN socialAccount, loggedIn as ${signedInAs}${run.answer.userId ? ` (${run.answer.userId})` : ""}, cookies <set>.` };
    } catch (error) {
      return refuseError("linkedin cookies save", error);
    }
  },
};
