import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export interface PlayStep {
  n: string;
  step: string;
  tools: string[];
  done: string;
}

export interface ActivePlay {
  id: string;
  title: string;
  steps: PlayStep[];
  loadedAt: string;
}

export const PLAY_REQUIRED = new Set(["twitterDmLive", "twitterReplyLive", "twitterQuoteLive", "twitterQueueRunLive", "twitterVoiceLive", "discordSendLive", "slackSendLive", "instagramSendLive"]);

const STEP_TEXT_MAX = 160;

let active: ActivePlay | null = null;

const cellsOf = (line: string) => line.split("|").slice(1, -1).map((cell) => cell.trim());

export function stepsOf(page: string): PlayStep[] {
  return page
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => /^\|\s*\d+[a-z]?\s*\|/.test(line))
    .map(cellsOf)
    .filter((cells) => cells.length >= 4)
    .map(([n, step, tools, done]) => ({ n, step, tools: [...tools.matchAll(/`(\w+)/g)].map((m) => m[1]), done }));
}

export function setActivePlay(id: string, page: string, now: Date = new Date()): ActivePlay {
  active = { id, title: (/^# (.+)$/m.exec(page)?.[1] ?? id).trim(), steps: stepsOf(page), loadedAt: now.toISOString() };
  return active;
}

export function activePlay(): ActivePlay | null {
  return active;
}

export function clearActivePlay(): void {
  active = null;
}

const short = (text: string) => (text.length > STEP_TEXT_MAX ? `${text.slice(0, STEP_TEXT_MAX - 1)}…` : text).replace(/\*\*/g, "");

export function playFooter(tool: string, play: ActivePlay | null = active): string {
  if (!play) return "";
  const at = play.steps.findIndex((s) => s.tools.includes(tool));
  const next = at >= 0 ? play.steps[at + 1] : undefined;
  const lines = [`>>> PLAY ${play.id} (${play.title}).`];
  if (at >= 0) lines.push(`This call is step ${play.steps[at].n}: ${short(play.steps[at].step)} Done when: ${short(play.steps[at].done)}`);
  else lines.push(`${tool} isn't a step of this play. If the work changed, load the use case that covers it: getGuide({ useCase }).`);
  if (next) lines.push(`Next, step ${next.n}: ${short(next.step)} (${next.tools.join(", ") || "the agent"})`);
  else if (at >= 0) lines.push("That was the play's last step.");
  return lines.join("\n");
}

export function playRefusal(tool: string, useCasesOfTool: readonly string[], play: ActivePlay | null = active): string | null {
  if (!PLAY_REQUIRED.has(tool) || play) return null;
  const options = useCasesOfTool.length ? useCasesOfTool.map((id) => `getGuide({ useCase: "${id}" })`).join(", ") : "the use case that fits from getGuide({ topic: \"logMcpInstructions\" })";
  return `playMissing: ${tool} sends as matt, and no use case is loaded for this session, so nothing was sent (rule 157). Load the play that matches what matt asked for and follow its steps: ${options}. Every message is written from that person's own thread, and no two read alike.`;
}

export function withPlayFooter(tool: string, result: CallToolResult, play: ActivePlay | null = active): CallToolResult {
  const footer = playFooter(tool, play);
  if (!footer) return result;
  const content = [...result.content];
  const first = content[0];
  if (first && first.type === "text") content[0] = { ...first, text: `${first.text}\n\n${footer}` };
  else content.push({ type: "text", text: footer });
  return { ...result, content };
}
