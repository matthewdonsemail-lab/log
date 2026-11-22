import { defaultDbPath, openDatabase } from "../../storage/schema/index.ts";
import { examplesOf, indexStreamOn, passLine, runIndexPass, trainFacts } from "../../indexPass/index.ts";
import type { PassStage } from "../../indexPass/index.ts";
import { JSON_FLAG, numberOf, parseArgs, parserSpecOf, refuseError, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const INDEX_USAGE = [
  "Usage: log index [--platform <p>] [--account <a>] [--since <t>] [--limit <n>] [--only <search|voice|facts>] [--json]",
  "One CPU pass per conversation: embed it for search, rebuild the owner's voice for that chat and person, then screen it for facts. The graph owner runs it by itself for every room kind and every signed-in account (LOG_INDEX_STREAM=off stops it); this clears a backlog by hand. `log relate owner status` shows its cost line.",
].join("\n");

export const INDEX_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "One CPU pass per conversation: embed, voice, facts",
      positionals: [],
      flags: [
        { name: "platform", kind: "string", description: "Only this platform" },
        { name: "account", kind: "string", description: "Only this account" },
        { name: "since", kind: "string", description: "Lines from this time on" },
        { name: "limit", kind: "integer", min: 1, max: 100000, description: "Conversations at most" },
        { name: "only", kind: "enum", values: ["search", "voice", "facts"], description: "Run one stage" },
        JSON_FLAG,
      ],
    },
  ],
};

export const FACTS_USAGE = [
  "Usage: log facts train [--epochs <n>] [--json]",
  "Fine-tunes the fact screen (GLiNER 2.5, CPU) on the corrections log kept: decider rejections, accepted facts and the owner's own. Holds a slice back, reports accuracy before and after, and writes a pinned revision under python/facts/revisions recorded in python/facts/revisions.json. Its own job, never inside the pass.",
].join("\n");

export const FACTS_INPUT: CommandInput = {
  forms: [
    {
      words: ["train"],
      effect: "write",
      summary: "Fine-tune the fact screen on its corrections, on CPU: accuracy before and after",
      positionals: [],
      flags: [{ name: "epochs", kind: "integer", min: 1, max: 20, description: "Passes over the corrections, default 3" }, JSON_FLAG],
    },
  ],
};

export const indexDeps = {
  open: () => openDatabase(defaultDbPath()),
};

export const indexCommand: Command = {
  usage: INDEX_USAGE,
  platform: "any",
  name: "index",
  effect: "write",
  input: INDEX_INPUT,
  summary: "One CPU pass per conversation: embed, voice, facts",
  terminalOnly: "runs the local CPU models over minutes of history and holds no chat context; the owner runs it in a terminal, and the graph owner's tick runs the same pass by itself",
  args: "[--platform <p>] [--account <a>] [--since <t>] [--limit <n>] [--only <s>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(INDEX_INPUT));
    if (!parsed.ok) return refuseInput("index", parsed.error, INDEX_USAGE);
    const json = parsed.flags["json"] === true;
    const only = typeof parsed.flags["only"] === "string" ? (parsed.flags["only"] as PassStage) : undefined;
    if (!indexStreamOn() && !only) context.err("index: LOG_INDEX_STREAM=off, so the pass does not run inside the owner; this manual run still does");
    const handle = indexDeps.open();
    try {
      const report = await runIndexPass(handle, {
        ...(typeof parsed.flags["platform"] === "string" ? { platform: parsed.flags["platform"] as string } : {}),
        ...(typeof parsed.flags["account"] === "string" ? { account: parsed.flags["account"] as string } : {}),
        ...(typeof parsed.flags["since"] === "string" ? { since: parsed.flags["since"] as string } : {}),
        ...(numberOf(parsed, "limit") ? { limit: numberOf(parsed, "limit")! } : {}),
        ...(only ? { only } : {}),
        log: (line) => context.err(line),
      });
      if (json) return { code: 0, stdout: JSON.stringify(report, null, 2) };
      return { code: 0, stdout: passLine(report) };
    } catch (error) {
      return refuseError("index", error);
    }
  },
};

export const factsCommand: Command = {
  usage: FACTS_USAGE,
  platform: "any",
  name: "facts",
  effect: "write",
  input: FACTS_INPUT,
  summary: "Train the fact screen on its corrections, on CPU, and see what it learned",
  terminalOnly: "fine-tunes a local model on CPU for minutes as its own job; the owner runs it in a terminal, never inside the pass",
  args: "train [--epochs <n>] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(FACTS_INPUT));
    if (!parsed.ok) return refuseInput("facts", parsed.error, FACTS_USAGE);
    const json = parsed.flags["json"] === true;
    const handle = indexDeps.open();
    try {
      const examples = examplesOf(handle, 5000);
      const trained = await trainFacts(examples, { ...(numberOf(parsed, "epochs") ? { epochs: numberOf(parsed, "epochs")! } : {}), log: (line) => context.err(line) });
      if ("problem" in trained) return refuseInput("facts train", trained.problem ?? "training did not finish", FACTS_USAGE);
      if (json) return { code: 0, stdout: JSON.stringify(trained, null, 2) };
      return {
        code: 0,
        stdout: [
          `log facts train: ${trained.revision} from ${trained.examples} correction(s), ${trained.heldOut} held out, ${trained.epochs} pass(es) on CPU in ${(trained.ms / 60000).toFixed(1)} min`,
          `  accuracy on the held-out slice: ${(trained.accuracyBefore * 100).toFixed(0)}% before, ${(trained.accuracyAfter * 100).toFixed(0)}% after`,
          `  written as a pinned revision ${trained.dir} (${(trained.bytes / 1024).toFixed(0)} kB) over ${trained.base}, recorded in python/facts/revisions.json; the screen uses it from the next start`,
        ].join("\n"),
      };
    } catch (error) {
      return refuseError("facts", error);
    }
  },
};
