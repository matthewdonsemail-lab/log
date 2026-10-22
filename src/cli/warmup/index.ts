import { parseArgs } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";
import { WARMUP_PLATFORMS } from "../../facebook/warmup/activities/index.ts";
import { PLATFORM_USAGE, runPlatformActivity, runStages, STAGES_USAGE } from "./helpers/index.ts";

export const WARMUP_USAGE = [PLATFORM_USAGE.replace(/^ {7}/, "Usage: "), STAGES_USAGE].join("\n");

const MOVED: Record<string, string> = {
  plan: "log facebook warmup stages plan",
  record: "log facebook warmup stages record",
  run: "log facebook warmup stages run (or log facebook warmup reel|feed run)",
  feed: "log facebook warmup stages log (the stage log; the home feed activity is log facebook warmup feed)",
};

export const warmupCommand: Command = {
  usage: WARMUP_USAGE,
  platform: "byArgument",
  name: "warmup",
  summary: "The warm-up, by platform and activity: `log facebook warmup reel|feed|stages` (the account's browser primed with the activity, each step checked, the outline written; rules 49, 60)",
  args: "<platform> <activity> [plan|record|run|log|persona] [--account <a>] [--live] [--likes] [--bypass]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["likes", "bypass", "now", "follow", "json", "live", "persona", "newPersona"], valued: ["account", "only", "gapMinutes", "lines", "seconds", "reels", "watch", "skip", "comments", "profile", "seed", "trafficMb", "posts"] });
    if (!parsed.ok) return { code: 1, stderr: `log facebook warmup: ${parsed.error}\n${WARMUP_USAGE}` };
    const [platform, activity, sub] = parsed.positionals;
    if (platform && MOVED[platform]) return { code: 1, stderr: `log facebook warmup ${platform}: the warm-up is by platform, then activity (rule 60). It is now: ${MOVED[platform]}\n${WARMUP_USAGE}` };
    if (!(WARMUP_PLATFORMS as readonly string[]).includes(platform ?? "")) return { code: 1, stderr: `log facebook warmup: pick a platform (${WARMUP_PLATFORMS.join(", ")})\n${WARMUP_USAGE}` };
    if (platform === "facebook" && activity === "stages") return runStages(context, sub, parsed.flags);
    return runPlatformActivity(context, parsed.positionals, parsed.flags);
  },
};
