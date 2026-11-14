import { JSON_FLAG, parseArgs, parserSpecOf, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";
import { FACEBOOK_ACTIVITIES, WARMUP_PLATFORMS } from "../../facebook/warmup/activities/index.ts";
import { PLATFORM_USAGE, runPlatformActivity, runStages, STAGES_USAGE } from "./helpers/index.ts";

export const WARMUP_USAGE = [PLATFORM_USAGE.replace(/^ {7}/, "Usage: "), STAGES_USAGE].join("\n");

const RANGE = { kind: "string", pattern: "^\\d+(-\\d+)?$", takes: "a number or a range, 8-20" } as const;
const CHANCE = (what: string) => ({ kind: "number", min: 0, max: 1, description: `The chance per reel of ${what}, 0 to 1` }) as const;

export const WARMUP_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "The warm-up, by platform and activity: an activity's plan, a recorded or drawn run in the account's browser, the persona, or the stages and their log",
      positionals: [
        { name: "platform", kind: "enum", required: true, values: WARMUP_PLATFORMS, description: "The platform warmed up" },
        { name: "activity", kind: "enum", required: true, values: [...Object.keys(FACEBOOK_ACTIVITIES), "persona", "stages"], description: "The activity, the account's persona, or the stages" },
        { name: "step", kind: "enum", values: ["plan", "record", "run", "log"], description: "plan, record (the default) or run; the stages also take log" },
      ],
      flags: [
        { name: "account", kind: "string", description: "The account warmed up (needed to record or run, and for persona)" },
        { name: "live", kind: "boolean", live: true, description: "Clicks on the platform, only when the owner asked (rule 8)" },
        { name: "likes", kind: "boolean", live: true, description: "The warm-up's likes, only when the owner asked (rule 8)" },
        { name: "bypass", kind: "boolean", bypass: true, description: "Outside the account's waking hours, only when the owner asked (rule 86)" },
        { name: "now", kind: "boolean", description: "Skip the 10-minute launch gap only (rule 35)" },
        { name: "persona", kind: "boolean", description: "Run the persona's own session (reel and feed)" },
        { name: "newPersona", kind: "boolean", description: "Draw the account a new persona" },
        { name: "seed", kind: "integer", description: "The seed a drawn session or persona is drawn from" },
        { name: "reels", ...RANGE, description: "How many reels, a number or a range (1 to 60)" },
        { name: "watch", ...RANGE, description: "Seconds watched per reel, a number or a range (1 to 300)" },
        { name: "skip", ...CHANCE("skipping after a glance") },
        { name: "comments", ...CHANCE("opening its comments") },
        { name: "profile", ...CHANCE("opening its author's profile") },
        { name: "posts", ...RANGE, description: "How many feed posts, a number or a range" },
        { name: "trafficMb", kind: "integer", min: 1, description: "The most proxy traffic the session may use, in MB" },
        { name: "only", kind: "list", description: "Only these stage activities, e.g. feedBrowse,marketplaceBrowse" },
        { name: "gapSeconds", kind: "number", min: 0, max: 36_000, description: "Seconds between stage activities (default 10)" },
        { name: "lines", kind: "integer", min: 1, description: "How many stage log lines (default 40)" },
        { name: "follow", kind: "boolean", description: "Keep printing the stage log as lines come" },
        { name: "seconds", kind: "number", min: 1, description: "How long to follow the stage log, in seconds" },
        JSON_FLAG,
      ],
    },
  ],
};

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
  longRunning: true,
  effect: "browser",
  input: WARMUP_INPUT,
  summary: "The warm-up, by platform and activity: `log <platform> warmup reel|feed|stages` (the account's browser primed with the activity, each step checked, the outline written)",
  args: "<platform> <activity> [plan|record|run|log|persona] [--account <a>] [--live] [--likes] [--bypass]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(WARMUP_INPUT));
    if (!parsed.ok) return refuseInput("facebook warmup", parsed.error, WARMUP_USAGE);
    const [platform, activity, sub] = parsed.positionals;
    if (platform && MOVED[platform]) return { code: 1, stderr: `log facebook warmup ${platform}: the warm-up is by platform, then activity (rule 60). It is now: ${MOVED[platform]}\n${WARMUP_USAGE}` };
    if (!(WARMUP_PLATFORMS as readonly string[]).includes(platform ?? "")) return { code: 1, error: "inputInvalid", stderr: `log facebook warmup: pick a platform (${WARMUP_PLATFORMS.join(", ")})\n${WARMUP_USAGE}` };
    if (platform === "facebook" && activity === "stages") return runStages(context, sub, parsed.flags);
    return runPlatformActivity(context, parsed.positionals, parsed.flags);
  },
};
