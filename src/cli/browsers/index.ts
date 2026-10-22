import { browserViews } from "../../browser/inspect/index.ts";
import type { BrowserView } from "../../browser/inspect/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const BROWSERS_USAGE = "Usage: log browsers [--json]   (every open browser: its step and page, the known page state it sits on, the call that resolves it, and what only matt can clear)";

export const BROWSERS_INPUT: CommandInput = {
  forms: [{ words: [], summary: "Where every open browser is, and what resolves its page", positionals: [], flags: [JSON_FLAG] }],
};

export function renderBrowsers(views: BrowserView[]): string {
  if (!views.length) return "No browser is open.";
  return views
    .map((v) =>
      [
        `${v.account}  step ${v.step}  ${v.url || "no url yet"}`,
        `  State      ${v.state ? `${v.state.id}: ${v.state.what}` : v.failed ? `its last step failed: ${v.failed.slice(0, 200)}` : "no known blocking state"}`,
        ...(v.next ? [`  Next       ${v.next.tool} ${JSON.stringify(v.next.input)}`] : []),
        ...(v.needsMatt ? [`  Needs matt ${v.needsMatt}`] : []),
      ].join("\n"),
    )
    .join("\n\n");
}

export const browsersDeps: { read: () => BrowserView[] } = { read: browserViews };

export const browsersCommand: Command = {
  usage: BROWSERS_USAGE,
  platform: "any",
  name: "browsers",
  effect: "read",
  input: BROWSERS_INPUT,
  summary: "Where every open browser is: its page, the known page state it sits on, the call that resolves it, and what only matt can clear (rules 54-55)",
  args: "[--json]",
  run(_context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(BROWSERS_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log browsers: ${parsed.error}\n${BROWSERS_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log browsers: unexpected argument "${parsed.positionals[0]}"\n${BROWSERS_USAGE}` };
    const views = browsersDeps.read();
    return { code: 0, stdout: parsed.flags["json"] ? JSON.stringify({ browsers: views }, null, 2) : renderBrowsers(views) };
  },
};
