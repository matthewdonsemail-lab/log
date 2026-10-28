import { createDecisionsClient } from "../../../subq/decisions/index.ts";
import type { DecisionsClient } from "../../../subq/decisions/index.ts";
import { guidePath, readGuide, readVoice } from "../../../twitter/copy/voice/index.ts";
import type { VoiceReading } from "../../../twitter/copy/voice/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandInput } from "../../runner/types.ts";

export const VOICE_USAGE = [
  "Usage: log voice --to <handle> --text \"<draft>\" [--context \"<what they said>\"] [--json]",
  "Gates a draft before anything is sent as matt (his rule, 2026-10-27): SubQ reads it against matt's own writing guide (GUIDES/MATT_WRITING_STYLE.md, built from 256 of his tweets) and the dms he wrote himself, and answers whether it sounds like he typed it (voice, 0.8 to pass), whether it answers what they said (--context) or something specific about them, and whether it reads like a mate texting. A phrase matt never says (hit home, big swing, spot on, felt that…) fails it outright. Sends nothing.",
  "Exit 0 when it passes, 1 when it doesn't: rewrite and gate again.",
].join("\n");

export const VOICE_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Gate a draft against matt's own writing guide with SubQ before it is sent, sending nothing",
      positionals: [],
      flags: [
        { name: "to", kind: "string", required: true, description: "Who the draft is for (their handle)" },
        { name: "text", kind: "string", required: true, description: "The draft" },
        { name: "context", kind: "string", description: "What they said, that the draft answers" },
        JSON_FLAG,
      ],
    },
  ],
};

export const voiceDeps: { decisions: () => DecisionsClient } = { decisions: () => createDecisionsClient() };

export function renderVoice(reading: VoiceReading): string {
  const scores = `voice ${reading.voice.toFixed(2)} · answers them ${reading.inContext.toFixed(2)} · reads like a mate ${reading.friendLike.toFixed(2)}`;
  const never = reading.neverSays.length ? ` · matt never says: ${reading.neverSays.join(", ")}` : "";
  return `log voice: @${reading.to.replace(/^@/, "")} ${reading.pass ? "PASS" : "FAIL"}: ${scores}${never}${reading.pass ? "" : "\n  rewrite it in matt's words and gate it again"}`;
}

export const voiceCommand: Command = {
  usage: VOICE_USAGE,
  platform: "any",
  name: "voice",
  effect: "read",
  input: VOICE_INPUT,
  summary: "Gate a draft against matt's own writing guide with SubQ before anything is sent as him, sending nothing",
  args: "--to <handle> --text \"<draft>\" [--context \"<what they said>\"] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(VOICE_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log voice: ${parsed.error}\n${VOICE_USAGE}` };
    const to = parsed.flags["to"];
    const text = parsed.flags["text"];
    const said = parsed.flags["context"];
    if (typeof to !== "string" || !to.trim()) return refuse("voice", "targetMissing", "--to names who the draft is for");
    if (typeof text !== "string" || !text.trim()) return refuse("voice", "textMissing", "--text is the draft to gate");
    const guide = readGuide();
    if (!guide) return refuse("voice", "voiceGuideMissing", `matt's writing guide isn't at ${guidePath()}`);
    try {
      context.err(`voice: SubQ reading the draft for @${to.replace(/^@/, "")} against matt's writing guide`);
      const reading = await readVoice({ to, text, ...(typeof said === "string" && said.trim() ? { context: said } : {}) }, guide, voiceDeps.decisions());
      if (parsed.flags["json"]) return { code: reading.pass ? 0 : 1, stdout: JSON.stringify(reading, null, 2) };
      return { code: reading.pass ? 0 : 1, stdout: renderVoice(reading) };
    } catch (error) {
      return refuseError("voice", error);
    }
  },
};
