/**
 * `log firefoxCapture --har <path> [--out <dir>]` — the offline Firefox port.
 *
 * Reads a HAR that Playwright recorded from Camoufox (Firefox), copies it
 * unchanged (rule 19), writes its scripts beside it, and runs `rea` on the
 * files. No browser starts. `--noRea` stops after the files are written.
 */
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildClientMap, capturesRoot } from "../../rea/facebookClient/index.ts";
import { captureFromHar, defaultReaRunner, settleRunCapture } from "../../rea/firefox/index.ts";
import type { ReaRunner } from "../../rea/firefox/index.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import type { Command, CommandResult } from "../runner/types.ts";

export const FIREFOX_CAPTURE_USAGE = [
  "Usage: log firefoxCapture --har <path> [--out <dir>] [--noRea] [--json]",
  "       log firefoxCapture --settle <runCaptureDir>  (what each run starts in the background: rea reads its capture, split per step)",
  "       log firefoxCapture --docs [--noRea]  (every run's requests → docs/facebookClient/, one doc per request, rea reading each one's slice)",
  "The HAR is the one Playwright writes from Camoufox. It is copied raw, and rea reads it. No browser opens.",
].join("\n");

/** `docs/facebookClient` in this repo. */
export const FACEBOOK_CLIENT_DOCS = fileURLToPath(new URL("../../../docs/facebookClient", import.meta.url));

export async function runFirefoxCapture(argv: string[], runner?: ReaRunner, log: (line: string) => void = () => {}): Promise<CommandResult> {
  const parsed = parseArgs(argv, { boolean: ["json", "noRea", "docs"], valued: ["har", "out", "settle"] });
  if (!parsed.ok) return { code: 1, stderr: `log firefoxCapture: ${parsed.error}\n${FIREFOX_CAPTURE_USAGE}` };
  if (parsed.flags.docs) {
    const root = capturesRoot();
    const note = await buildClientMap({
      capturesRoot: root,
      outDir: join(root, "rea", "facebookClient"),
      docsDir: FACEBOOK_CLIENT_DOCS,
      runner: parsed.flags.noRea ? null : (runner ?? defaultReaRunner),
      log,
    });
    return { code: 0, stdout: note };
  }
  if (typeof parsed.flags.settle === "string") {
    const dir = resolve(parsed.flags.settle);
    const note = await settleRunCapture(dir, runner);
    writeFileSync(join(dir, "settle.json"), `${JSON.stringify({ at: new Date().toISOString(), note }, null, 2)}\n`);
    return { code: 0, stdout: note ?? "nothing to read" };
  }
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
  summary: "Read a raw Camoufox HAR and its scripts with offline rea. No browser.",
  args: "--har <path> [--out <dir>] [--noRea] [--json] | --settle <dir> | --docs [--noRea]",
  run(context, argv) {
    return runFirefoxCapture(argv, undefined, context.err);
  },
};
