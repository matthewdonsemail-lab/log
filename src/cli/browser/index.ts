import { viewerState } from "../../browser/viewer/index.ts";
import type { ViewerStream, ViewerView } from "../../browser/viewer/index.ts";
import { readLocalAccounts } from "../../twenty/graphql/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import { PLATFORM_LABELS, platformOfAccount } from "../runner/helpers/platforms.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const BROWSER_USAGE = [
  "Usage: log browser view --account <accountName> [--json]   (the account's live browser: whether it needs a person to sign in, the page state and its revision; when log runs on the person's own machine the sign-in is in the browser window there, and from a remote runtime an MCP Apps host shows it inline through browserView)",
  "Where the runtime is comes from LOG_BROWSER_VIEW_LOCATION (local or remote), which the stdio MCP, the HTTP MCP and the hosted bridge each set for their own process.",
].join("\n");

export const BROWSER_INPUT: CommandInput = {
  forms: [
    {
      words: ["view"],
      effect: "read",
      summary: "The account's live browser: whether it needs a person to sign in, and where they do it",
      positionals: [],
      flags: [{ name: "account", kind: "string", description: "The account whose browser to show", required: true }, JSON_FLAG],
    },
  ],
};

export const BROWSER_VIEW_LOCATIONS = ["local", "remote"] as const;
export type BrowserViewLocation = (typeof BROWSER_VIEW_LOCATIONS)[number];

export function browserViewLocation(env: Record<string, string | undefined> = process.env): BrowserViewLocation {
  return env.LOG_BROWSER_VIEW_LOCATION === "remote" ? "remote" : "local";
}

export function platformNameOf(account: string): string {
  try {
    const row = readLocalAccounts().find((item) => String(item.accountName ?? "") === account);
    return row ? PLATFORM_LABELS[platformOfAccount({ platform: typeof row.platform === "string" ? row.platform : null })] : "account";
  } catch {
    return "account";
  }
}

const REMOTE: Record<ViewerView["phase"], string> = {
  browserMissing: "No browser is open for this account. Open one with inspectStart (log inspect start --account <name> --detach), then call browserView again.",
  viewerUnavailable: "The account's browser is open but its viewer could not be reached, so it cannot be shown. Nothing was sent to the page.",
  signInRequired: "The page asks for sign-in. The person signs in inside the browser view; their clicks and keys go to the page only while it still asks for sign-in, each one a recorded step. Wait for them, then call browserView again before carrying on.",
  needsAttention: "The page needs a person and is a stop (rule 94): input is off. Tell the person what the page shows; do not continue this account until they clear it.",
  busy: "The browser is running a step. Call browserView again in a moment.",
  ready: "The page does not ask for sign-in. Nothing is needed from the person; carry on.",
};

function localText(view: ViewerView, platform: string): string {
  if (view.phase === "signInRequired") return `The ${platform} sign-in is open in the browser window on this machine. Finish there, then continue: call browserView again to check before carrying on.`;
  if (view.phase === "needsAttention") return `The ${platform} page in the browser window on this machine needs a person and is a stop (rule 94). Tell the person what it shows; do not continue this account until they clear it there.`;
  return REMOTE[view.phase];
}

export function browserViewText(view: ViewerView, location: BrowserViewLocation = browserViewLocation(), platform = platformNameOf(view.account)): string {
  const head = `${view.account}: ${view.phase}${view.pageState ? ` (page state ${view.pageState})` : ""}${view.address ? ` on ${view.address}` : ""}`;
  if (location === "local") return [head, localText(view, platform)].join("\n");
  return [head, REMOTE[view.phase], ...(view.needsHuman ? ["Without an inline view (a host without MCP Apps), the person opens it in an MCP Apps host (Claude, ChatGPT, Cursor), or runs log console --web on the runtime's machine and uses the account's live browser button on Connections."] : [])].join("\n");
}

export type BrowserViewJson = Omit<ViewerView, "stream"> & { location: BrowserViewLocation; streamKind: "voxl" | "frames" | "none"; stream: ViewerStream | null };

export function browserViewJson(view: ViewerView, location: BrowserViewLocation = browserViewLocation()): BrowserViewJson {
  const { stream, ...rest } = view;
  if (location === "local") return { ...rest, location, streamKind: "none", stream: null };
  return { ...rest, location, streamKind: stream ? "voxl" : "frames", stream };
}

export const browserDeps: { state: (account: string) => Promise<ViewerView> } = { state: viewerState };

export const browserCommand: Command = {
  usage: BROWSER_USAGE,
  platform: "any",
  name: "browser",
  effect: "read",
  input: BROWSER_INPUT,
  summary: "One account's live browser: whether it needs a person to sign in, in the window on this machine or inline from a remote runtime",
  args: "view --account <accountName> [--json]",
  async run(_context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(BROWSER_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log browser: ${parsed.error}\n${BROWSER_USAGE}` };
    if (parsed.positionals[0] !== "view" || parsed.positionals.length > 1) return { code: 1, stderr: `log browser: say view\n${BROWSER_USAGE}` };
    const account = parsed.flags["account"];
    if (typeof account !== "string" || !account) return { code: 1, stderr: `log browser view: --account is required\n${BROWSER_USAGE}` };
    const view = await browserDeps.state(account);
    return { code: 0, stdout: parsed.flags["json"] ? JSON.stringify(browserViewJson(view), null, 2) : browserViewText(view) };
  },
};
