import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildClientMap, capturesRoot } from "../../rea/facebookClient/index.ts";
import { captureFromHar, defaultReaRunner, settleRunCapture } from "../../rea/capture/index.ts";
import { buildPlatformClientMap } from "../../rea/platformClient/index.ts";
import { PLATFORM_SITES, PLATFORMS } from "../runner/helpers/platforms.ts";
import type { ReaRunner } from "../../rea/capture/index.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import type { Command, CommandResult } from "../runner/types.ts";

export const CAPTURE_USAGE = [
  "Usage: log facebook capture --har <path> [--out <dir>] [--noRea] [--json]",
  "       log facebook capture --settle <runCaptureDir>  (what each run starts in the background: rea reads its capture, split per step)",
  "       log facebook capture --docs [--noRea]  (every run's requests → docs/platforms/<platform>/, one doc per request, rea reading each one's slice: Facebook's by its modules, every other platform with a browser path by the call sites its bundles hold for each request)",
  "The HAR is the one Playwright writes from Camoufox. It is copied raw, and rea reads it. No browser opens.",
].join("\n");

export const FACEBOOK_CLIENT_DOCS = fileURLToPath(new URL("../../../docs/platforms/facebook", import.meta.url));

export const platformClientDocs = (platform: string): string => fileURLToPath(new URL(`../../../docs/platforms/${platform}`, import.meta.url));

export async function runCapture(argv: string[], runner?: ReaRunner, log: (line: string) => void = () => {}): Promise<CommandResult> {
  const parsed = parseArgs(argv, { boolean: ["json", "noRea", "docs"], valued: ["har", "out", "settle"] });
  if (!parsed.ok) return { code: 1, stderr: `log facebook capture: ${parsed.error}\n${CAPTURE_USAGE}` };
  if (parsed.flags.docs) {
    const root = capturesRoot();
    const note = await buildClientMap({
      capturesRoot: root,
      outDir: join(root, "rea", "facebookClient"),
      docsDir: FACEBOOK_CLIENT_DOCS,
      runner: parsed.flags.noRea ? null : (runner ?? defaultReaRunner),
      log,
    });
    const notes = [note];
    for (const platform of PLATFORMS.filter((p) => p !== "facebook" && PLATFORM_SITES[p].browser)) {
      log(`${platform}: its runs' calls, their code in its bundles, rea reading each`);
      notes.push(await buildPlatformClientMap({
        platform,
        capturesRoot: root,
        outDir: join(root, "rea", `${platform}Client`),
        docsDir: platformClientDocs(platform),
        runner: parsed.flags.noRea ? null : (runner ?? defaultReaRunner),
        log,
      }));
    }
    return { code: 0, stdout: notes.join("\n") };
  }
  if (typeof parsed.flags.settle === "string") {
    const dir = resolve(parsed.flags.settle);
    const note = await settleRunCapture(dir, runner);
    writeFileSync(join(dir, "settle.json"), `${JSON.stringify({ at: new Date().toISOString(), note }, null, 2)}\n`);
    return { code: 0, stdout: note ?? "nothing to read" };
  }
  if (parsed.positionals.length > 0) return { code: 1, stderr: `log facebook capture: unexpected argument "${parsed.positionals[0]}"\n${CAPTURE_USAGE}` };
  const har = parsed.flags.har;
  if (typeof har !== "string") return { code: 1, stderr: `log facebook capture: --har is required\n${CAPTURE_USAGE}` };
  const harPath = resolve(har);
  const outDir = typeof parsed.flags.out === "string" ? resolve(parsed.flags.out) : join(harPath, "..", "firefox");
  try {
    const note = await captureFromHar(harPath, outDir, parsed.flags.noRea ? null : runner);
    if (parsed.flags.json) return { code: 0, stdout: JSON.stringify({ har: harPath, outDir, note }) };
    return { code: 0, stdout: `${note}\n${outDir}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { code: 1, stderr: `log facebook capture: ${message}\n${CAPTURE_USAGE}` };
  }
}

export const captureCommand: Command = {
  usage: CAPTURE_USAGE,
  platform: "facebook",
  name: "capture",
  effect: "write",
  summary: "Read a run's raw HAR (any browser driver) and its scripts with offline rea; --docs builds every platform's client docs, rea reading each request's code. No browser.",
  args: "--har <path> [--out <dir>] [--noRea] [--json] | --settle <dir> | --docs [--noRea]",
  run(context, argv) {
    return runCapture(argv, undefined, context.err);
  },
};
