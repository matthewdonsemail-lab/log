import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildClientMap, capturesRoot } from "../../rea/facebookClient/index.ts";
import { captureFromHar, defaultReaRunner, settleRunCapture } from "../../rea/capture/index.ts";
import { buildPlatformClientMap } from "../../rea/platformClient/index.ts";
import { PLATFORM_SITES, PLATFORMS } from "../runner/helpers/platforms.ts";
import type { ReaRunner } from "../../rea/capture/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput, CommandResult } from "../runner/types.ts";

export const CAPTURE_USAGE = [
  "Usage: log capture har <path> [--out <dir>] [--noRea] [--json]",
  "       log capture settle <runCaptureDir>  (what each run starts in the background: rea reads its capture, split per step)",
  "       log capture docs [--noRea]  (every run's requests → docs/platforms/<platform>/, one doc per request, rea reading each one's slice: by the platform's modules where it has a module map, otherwise by the call sites its bundles hold for each request)",
  "The HAR is the one Playwright writes from the account browser that ran, on any platform and any browser driver. It is copied raw, and rea reads it. No browser opens.",
].join("\n");

const NO_REA = { name: "noRea", kind: "boolean", description: "Skip the rea reading" } as const;

export const CAPTURE_INPUT: CommandInput = {
  forms: [
    {
      words: ["har"],
      effect: "write",
      summary: "Copy a run's raw HAR and read it and its scripts with offline rea; no browser opens",
      positionals: [{ name: "har", kind: "string", required: true, description: "The HAR a run wrote, to copy raw and read" }],
      flags: [
        { name: "out", kind: "string", description: "Where the read HAR goes (default beside the HAR)" },
        NO_REA,
        JSON_FLAG,
      ],
    },
    {
      words: ["settle"],
      effect: "write",
      summary: "Settle a run's capture: rea reads it, split per step (what each run starts in the background)",
      positionals: [{ name: "captureDir", kind: "string", required: true, description: "A run's capture folder" }],
      flags: [],
    },
    {
      words: ["docs"],
      effect: "write",
      summary: "Every platform's client docs from its runs: one doc per request in docs/platforms/<platform>/, rea reading its code",
      positionals: [],
      flags: [NO_REA],
    },
  ],
};

export const platformClientDocs = (platform: string): string => fileURLToPath(new URL(`../../../docs/platforms/${platform}`, import.meta.url));

export async function runCapture(argv: string[], runner?: ReaRunner, log: (line: string) => void = () => {}): Promise<CommandResult> {
  const parsed = parseArgs(argv, parserSpecOf(CAPTURE_INPUT));
  if (!parsed.ok) return refuseInput("capture", parsed.error, CAPTURE_USAGE);
  const [form, target] = parsed.positionals;
  const reaRunner = parsed.flags.noRea ? null : (runner ?? defaultReaRunner);
  if (form === "docs") {
    const root = capturesRoot();
    const notes: string[] = [];
    for (const platform of PLATFORMS.filter((p) => PLATFORM_SITES[p].browser)) {
      if (platform === "facebook") {
        notes.push(await buildClientMap({ capturesRoot: root, outDir: join(root, "rea", "facebookClient"), docsDir: platformClientDocs(platform), runner: reaRunner, log }));
        continue;
      }
      log(`${platform}: its runs' calls, their code in its bundles, rea reading each`);
      notes.push(await buildPlatformClientMap({ platform, capturesRoot: root, outDir: join(root, "rea", `${platform}Client`), docsDir: platformClientDocs(platform), runner: reaRunner, log }));
    }
    return { code: 0, stdout: notes.join("\n") };
  }
  if (form === "settle" && typeof target === "string") {
    const dir = resolve(target);
    const note = await settleRunCapture(dir, runner);
    writeFileSync(join(dir, "settle.json"), `${JSON.stringify({ at: new Date().toISOString(), note }, null, 2)}\n`);
    return { code: 0, stdout: note ?? "nothing to read" };
  }
  if (form !== "har" || typeof target !== "string") return { code: 1, error: "inputInvalid", stderr: `log capture: name what to capture: har, settle or docs\n${CAPTURE_USAGE}` };
  const harPath = resolve(target);
  const outDir = typeof parsed.flags.out === "string" ? resolve(parsed.flags.out) : join(harPath, "..", "firefox");
  try {
    const note = await captureFromHar(harPath, outDir, parsed.flags.noRea ? null : runner);
    if (parsed.flags.json) return { code: 0, stdout: JSON.stringify({ har: harPath, outDir, note }) };
    return { code: 0, stdout: `${note}\n${outDir}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { code: 1, stderr: `log capture: ${message}\n${CAPTURE_USAGE}` };
  }
}

export const captureCommand: Command = {
  usage: CAPTURE_USAGE,
  platform: "any",
  name: "capture",
  longRunning: true,
  effect: "write",
  input: CAPTURE_INPUT,
  summary: "Read a run's raw HAR and scripts with offline rea (any platform or browser driver), settle a run's capture, or build every platform's client docs. No browser.",
  args: "har <path> [--out <dir>] [--noRea] [--json] | settle <dir> | docs [--noRea]",
  run(context, argv) {
    return runCapture(argv, undefined, context.err);
  },
};
