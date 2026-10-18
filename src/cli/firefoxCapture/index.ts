/**
 * `log firefoxCapture --har <path> [--out <dir>]` — the offline Firefox port.
 *
 * Reads a HAR that Playwright recorded from Camoufox (Firefox), strips
 * cookies and bodies, writes the scripts beside it, and runs `rea` on the
 * files. No browser starts. `--noRea` stops after the files are written.
 */
import { join, resolve } from "node:path";
import { captureFromHar } from "../../rea/firefox/index.ts";
import type { ReaRunner } from "../../rea/firefox/index.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import type { Command, CommandResult } from "../runner/types.ts";

export const FIREFOX_CAPTURE_USAGE = [
  "Usage: log firefoxCapture --har <path> [--out <dir>] [--noRea] [--json]",
  "The HAR is the one Playwright writes from Camoufox. rea reads the stripped copy. No browser opens.",
].join("\n");

export async function runFirefoxCapture(argv: string[], runner?: ReaRunner): Promise<CommandResult> {
  const parsed = parseArgs(argv, { boolean: ["json", "noRea"], valued: ["har", "out"] });
  if (!parsed.ok) return { code: 1, stderr: `log firefoxCapture: ${parsed.error}\n${FIREFOX_CAPTURE_USAGE}` };
  if (parsed.positionals.length > 0) return { code: 1, stderr: `log firefoxCapture: unexpected argument "${parsed.positionals[0]}"\n${FIREFOX_CAPTURE_USAGE}` };
  const har = parsed.flags.har;
  if (typeof har !== "string") return { code: 1, stderr: `log firefoxCapture: --har is required\n${FIREFOX_CAPTURE_USAGE}` };
  const harPath = resolve(har);
  const outDir = typeof parsed.flags.out === "string" ? resolve(parsed.flags.out) : join(harPath, "..", "firefox");
  try {
    const note = await captureFromHar(harPath, outDir, parsed.flags.noRea ? null : runner);
    if (parsed.flags.json) return { code: 0, stdout: JSON.stringify({ har: harPath, outDir, note }) };
    return { code: 0, stdout: `${note}\n${outDir}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { code: 1, stderr: `log firefoxCapture: ${message}\n${FIREFOX_CAPTURE_USAGE}` };
  }
}

export const firefoxCaptureCommand: Command = {
  name: "firefoxCapture",
  summary: "Strip a Camoufox HAR and read it with offline rea. No browser.",
  args: "--har <path> [--out <dir>] [--noRea] [--json]",
  run(_context, argv) {
    return runFirefoxCapture(argv);
  },
};
