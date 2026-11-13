import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import { platformStateRoot } from "../../../directApi/engine/index.ts";
import { COPIED_REQUEST_PROBLEMS, copiedRequestProblem, parseCopiedRequest, requestFromHar, saveBrowser } from "../../../linkedin/account/browser/index.ts";
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
  "Usage: log linkedin cookies save --account <publicId> [--name <label>] [--har <file>]",
  "Saves a LinkedIn account's session to Twenty: every cookie and the browser's headers (user agent, client hints, x-li-track) from one www.linkedin.com request, never passed as flags or printed. The request is copied as cURL from Chrome's DevTools and read off the clipboard after a Clack prompt, or, with --har, taken from a recording of the account's own browser (a `log inspect` step's HAR, the account signed in there). --account is the profile's public id, the part after linkedin.com/in/.",
  "They are checked first: the direct-API engine (openLinkedinApi, no browser, no proxy) reads /voyager/api/me with them, and only cookies LinkedIn accepts for that same profile are saved. A profile Twenty doesn't have yet gets a new LINKEDIN socialAccounts row (rule 13); one it has gets its cookies replaced.",
].join("\n");

interface CookiePrompts {
  intro(title: string): void;
  outro(message?: string): void;
  cancel(message?: string): void;
  confirm(option: Parameters<typeof confirm>[0]): Promise<unknown>;
}

interface Clipboard {
  read(): string;
  clear(): void;
}

function clipboardCommand(): { read: [string, string[]]; clear: [string, string[]] } {
  if (process.platform === "win32") return { read: ["powershell", ["-NoProfile", "-Command", "Get-Clipboard -Raw"]], clear: ["powershell", ["-NoProfile", "-Command", "Set-Clipboard -Value ' '"]] };
  if (process.platform === "darwin") return { read: ["pbpaste", []], clear: ["sh", ["-c", "printf '' | pbcopy"]] };
  return { read: ["sh", ["-c", "wl-paste 2>/dev/null || xclip -o -selection clipboard"]], clear: ["sh", ["-c", "printf '' | wl-copy 2>/dev/null || printf '' | xclip -selection clipboard"]] };
}

export const systemClipboard: Clipboard = {
  read: () => {
    const [cmd, args] = clipboardCommand().read;
    const run = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 22, windowsHide: true });
    return run.status === 0 ? String(run.stdout ?? "") : "";
  },
  clear: () => {
    const [cmd, args] = clipboardCommand().clear;
    spawnSync(cmd, args, { encoding: "utf8", windowsHide: true });
  },
};

export const linkedinCookiesDeps: { prompts: CookiePrompts; tty: () => LaunchTTY; clipboard: Clipboard; stateRoot: () => string } = {
  prompts: { intro, outro, cancel, confirm: confirm as CookiePrompts["confirm"] },
  tty: () => ({ stdinTTY: process.stdin?.isTTY, stdoutTTY: process.stdout?.isTTY }),
  clipboard: systemClipboard,
  stateRoot: () => platformStateRoot("linkedin"),
};

export const LINKEDIN_COOKIES_INPUT: CommandInput = {
  forms: [
    {
      words: ["save"],
      summary: "Save a LinkedIn account's cookies and browser headers from a request copied as cURL, checked against LinkedIn first",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The profile's public id (linkedin.com/in/<publicId>), saved as its accountName" },
        { name: "name", kind: "string", description: "The row's name in Twenty for a new account (default: the public id)" },
        { name: "har", kind: "string", description: "A HAR recorded in the account's own browser signed in to linkedin.com (a log inspect step's), read instead of the clipboard" },
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
  summary: "Add or refresh a LinkedIn account in Twenty: every cookie and the browser's headers from a request copied as cURL, checked against LinkedIn",
  input: LINKEDIN_COOKIES_INPUT,
  args: "save --account <publicId> [--name <label>] [--har <file>]",
  async run(context, argv) {
    if (argv[0] !== "save") return { code: 1, stderr: `log linkedin cookies: save is the only subcommand\n${LINKEDIN_COOKIES_USAGE}` };
    const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...LINKEDIN_COOKIES_INPUT.forms[0], words: [] }] }));
    if (!parsed.ok) return { code: 1, stderr: `log linkedin cookies: ${parsed.error}\n${LINKEDIN_COOKIES_USAGE}` };
    const raw = parsed.flags["account"];
    const publicId = typeof raw === "string" ? publicIdOf(raw) : "";
    if (!/^[A-Za-z0-9\-_%]{3,100}$/.test(publicId)) return { code: 1, stderr: `log linkedin cookies save: --account must be the profile's public id (linkedin.com/in/<publicId>)\n${LINKEDIN_COOKIES_USAGE}` };
    if (!context.directLinkedin) return { code: 1, stderr: "log linkedin cookies save: the direct-API engine isn't wired in this context" };
    const harPath = typeof parsed.flags["har"] === "string" ? (parsed.flags["har"] as string) : null;
    if (!harPath && !shouldPrompt(false, linkedinCookiesDeps.tty())) {
      return { code: 1, stderr: "log linkedin cookies save: the copied request is read after a Clack prompt, so it needs an interactive terminal: run it there (cookies are never passed as flags)" };
    }
    try {
      const found = await existing(context, publicId);
      const quiet = { intro: () => {}, outro: () => {}, cancel: () => {}, confirm: async () => true };
      const prompts = harPath ? quiet : linkedinCookiesDeps.prompts;
      let request;
      if (harPath) {
        let har: string;
        try {
          har = readFileSync(harPath, "utf8");
        } catch {
          return refuse("linkedin cookies save", "linkedinRequestUnusable", `the HAR at ${harPath} can't be read`);
        }
        request = requestFromHar(har);
        if (!request) return refuse("linkedin cookies save", "linkedinRequestUnusable", "that file isn't a HAR");
        context.err(`${publicId}: the session and browser headers read from a www.linkedin.com request in the recording`);
      } else {
        prompts.intro(`log linkedin cookies save — ${publicId}${found ? " (already in Twenty: its cookies are replaced)" : " (new in Twenty)"}`);
        const ready = await prompts.confirm({ message: "In Chrome signed in to linkedin.com: DevTools, Network, right-click any www.linkedin.com request, Copy, Copy as cURL. Copied it?" });
        if (isCancel(ready) || ready !== true) {
          prompts.cancel("Nothing saved.");
          return { code: 1, stderr: "log linkedin cookies save: cancelled, nothing saved" };
        }
        request = parseCopiedRequest(linkedinCookiesDeps.clipboard.read());
        linkedinCookiesDeps.clipboard.clear();
      }
      const problem = copiedRequestProblem(request);
      if (problem || !request?.browser) {
        prompts.cancel(`${COPIED_REQUEST_PROBLEMS[problem ?? "noUserAgent"]}. Nothing saved.`);
        return refuse("linkedin cookies save", "linkedinRequestUnusable", COPIED_REQUEST_PROBLEMS[problem ?? "noUserAgent"]);
      }
      if (!isLiAt(request.cookies["li_at"]) || !isJsessionId(request.cookies["JSESSIONID"])) {
        prompts.cancel("The copied li_at or JSESSIONID doesn't look like LinkedIn's. Nothing saved.");
        return refuse("linkedin cookies save", "linkedinRequestUnusable", "li_at or JSESSIONID isn't in LinkedIn's shape");
      }
      const jsessionId = request.cookies["JSESSIONID"]!.trim();
      const cookies: Record<string, string> = { ...request.cookies, JSESSIONID: jsessionId.startsWith('"') ? jsessionId : `"${jsessionId}"` };
      saveBrowser(linkedinCookiesDeps.stateRoot(), publicId, request.browser);
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
      return { code: 0, stdout: `log linkedin cookies save: ${publicId} ${found ? "updated" : "added"} in Twenty as a LINKEDIN socialAccount, loggedIn as ${signedInAs}${run.answer.userId ? ` (${run.answer.userId})` : ""}, cookies <set> (${Object.keys(cookies).length} of them), browser ${request.browser.secChUaPlatform ?? "?"} saved.` };
    } catch (error) {
      return refuseError("linkedin cookies save", error);
    }
  },
};
