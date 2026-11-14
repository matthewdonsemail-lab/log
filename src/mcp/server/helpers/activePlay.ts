import { randomBytes } from "node:crypto";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export interface PlayStep {
  n: string;
  step: string;
  tools: string[];
  done: string;
}

export type PlayLoadedBy = "useCase" | "ask";

export interface ActivePlay {
  id: string;
  title: string;
  steps: PlayStep[];
  loadedAt: string;
  usedAt: string;
  handle: string;
  owner: string;
  loadedBy: PlayLoadedBy;
}

export interface PlayScope {
  owner: string;
  handle: string;
}

export interface PlayLoad {
  scope?: PlayScope;
  handle?: unknown;
  loadedBy?: PlayLoadedBy;
  now?: Date;
}

export const PLAY_IDLE_MS = 2 * 60 * 60 * 1000;

export const PLAY_HANDLE_FIELD = "playHandle";

export const PLAY_HANDLE_PATTERN = /^play_[A-Za-z0-9_-]{16,64}$/;

export const PROCESS_PLAY_OWNER = "process";

export const LIVE_TOOL_SUFFIX = "Live";

const STEP_TEXT_MAX = 160;

const plays = new Map<string, ActivePlay>();

const defaults = new Map<string, string>();

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

export function mintPlayHandle(): string {
  return `play_${randomBytes(18).toString("base64url")}`;
}

export function playScope(owner: string): PlayScope {
  const known = defaults.get(owner);
  if (known) return { owner, handle: known };
  const handle = mintPlayHandle();
  defaults.set(owner, handle);
  return { owner, handle };
}

export function processPlayScope(): PlayScope {
  return playScope(PROCESS_PLAY_OWNER);
}

export function hostedPlayOwner(authority: { teamId?: string | null; actorUserId?: string | null; grantId?: string | null } | null | undefined): string {
  return `hosted:${authority?.teamId ?? "team"}:${authority?.actorUserId ?? authority?.grantId ?? "grant"}`;
}

export function handleOf(input: unknown): string | null {
  const given = (input as Record<string, unknown> | null | undefined)?.[PLAY_HANDLE_FIELD];
  return typeof given === "string" && PLAY_HANDLE_PATTERN.test(given) ? given : null;
}

export function withoutHandle<T extends Record<string, unknown> | undefined>(input: T): T {
  if (!input || !(PLAY_HANDLE_FIELD in input)) return input;
  const { [PLAY_HANDLE_FIELD]: _handle, ...rest } = input;
  return rest as T;
}

function expired(play: ActivePlay, now: Date): boolean {
  return now.getTime() - Date.parse(play.usedAt) > PLAY_IDLE_MS;
}

function handleFor(scope: PlayScope, given: unknown): string {
  const handle = typeof given === "string" ? given : null;
  if (!handle || handle === scope.handle) return scope.handle;
  const known = plays.get(handle);
  return known && known.owner === scope.owner ? handle : scope.handle;
}

export function setActivePlay(id: string, page: string, load: PlayLoad = {}): ActivePlay {
  const scope = load.scope ?? processPlayScope();
  const now = load.now ?? new Date();
  const handle = handleFor(scope, load.handle);
  sweepPlays(now);
  const play: ActivePlay = { id, title: (/^# (.+)$/m.exec(page)?.[1] ?? id).trim(), steps: stepsOf(page), loadedAt: now.toISOString(), usedAt: now.toISOString(), handle, owner: scope.owner, loadedBy: load.loadedBy ?? "useCase" };
  plays.set(handle, play);
  return play;
}

export function activePlay(scope: PlayScope = processPlayScope(), given: unknown = null, now: Date = new Date()): ActivePlay | null {
  const handle = handleFor(scope, given);
  const play = plays.get(handle);
  if (!play || play.owner !== scope.owner) return null;
  if (expired(play, now)) {
    plays.delete(handle);
    return null;
  }
  return play;
}

export function touchPlay(play: ActivePlay | null, now: Date = new Date()): void {
  if (play && plays.get(play.handle) === play) play.usedAt = now.toISOString();
}

export function clearActivePlay(scope?: PlayScope, given: unknown = null): boolean {
  if (!scope) {
    const had = plays.size > 0;
    plays.clear();
    return had;
  }
  const handle = handleFor(scope, given);
  const play = plays.get(handle);
  if (!play || play.owner !== scope.owner) return false;
  return plays.delete(handle);
}

export function forgetPlayScope(owner: string): void {
  defaults.delete(owner);
  for (const [handle, play] of plays) if (play.owner === owner) plays.delete(handle);
}

export function sweepPlays(now: Date = new Date()): number {
  let removed = 0;
  for (const [handle, play] of plays) {
    if (!expired(play, now)) continue;
    plays.delete(handle);
    removed++;
  }
  return removed;
}

const twinOf = (tool: string) => (tool.endsWith(LIVE_TOOL_SUFFIX) ? tool.slice(0, -LIVE_TOOL_SUFFIX.length) : `${tool}${LIVE_TOOL_SUFFIX}`);

export function playCovers(play: ActivePlay, tool: string, platform: string | null = null): boolean {
  const named = new Set(play.steps.flatMap((s) => s.tools));
  return named.has(tool) || named.has(twinOf(tool)) || (platform !== null && play.id.split("/")[0] === platform);
}

const short = (text: string) => (text.length > STEP_TEXT_MAX ? `${text.slice(0, STEP_TEXT_MAX - 1)}…` : text).replace(/\*\*/g, "");

export function playFooter(tool: string, play: ActivePlay | null = activePlay()): string {
  if (!play) return "";
  const at = play.steps.findIndex((s) => s.tools.includes(tool) || s.tools.includes(twinOf(tool)));
  const next = at >= 0 ? play.steps[at + 1] : undefined;
  const lines = [`>>> PLAY ${play.id} (${play.title}), handle ${play.handle}.`];
  if (at >= 0) lines.push(`This call is step ${play.steps[at].n}: ${short(play.steps[at].step)} Done when: ${short(play.steps[at].done)}`);
  else lines.push(`${tool} isn't a step of this play. A different play loads with getGuide({ useCase }), and it replaces this one.`);
  if (next) lines.push(`Next, step ${next.n}: ${short(next.step)} (${next.tools.join(", ") || "the agent"})`);
  else if (at >= 0) lines.push("That was the play's last step.");
  return lines.join("\n");
}

export interface PlayGate {
  mode: "required" | "anyPlay" | "ifPlay" | "none";
  platform?: string | null;
  useCases: readonly string[];
  play?: ActivePlay | null;
}

export function playRefusal(tool: string, gate: PlayGate): string | null {
  if (gate.mode === "none") return null;
  const play = gate.play === undefined ? activePlay() : gate.play;
  const options = gate.useCases.length ? gate.useCases.map((id) => `getGuide({ useCase: "${id}" })`).join(", ") : 'the use case that fits, from getGuide({ topic: "logMcpInstructions" })';
  if (!play) {
    if (gate.mode === "ifPlay") return null;
    return `playMissing: ${tool} sends as the owner, and no play is loaded for this caller (none was loaded, it expired after ${PLAY_IDLE_MS / 3_600_000} idle hours, or its handle is unknown), so nothing was sent. The plays that use it: ${options}. Every message in a play is written from that person's own thread, and no two read alike.`;
  }
  if (gate.mode === "anyPlay" || playCovers(play, tool, gate.platform ?? null)) return null;
  return `playNotCovering: ${tool} sends as the owner, and the active play ${play.id} neither names it in its steps nor is filed under its platform, so nothing was sent. Two ways out: end the play with getGuide({ clearPlay: true }), or load the play that fits (${options}), which replaces ${play.id}.`;
}

export function playMeta(play: ActivePlay | null): { id: string; handle: string; loadedBy: PlayLoadedBy } | null {
  return play ? { id: play.id, handle: play.handle, loadedBy: play.loadedBy } : null;
}

export function withPlayFooter(tool: string, result: CallToolResult, play: ActivePlay | null = activePlay()): CallToolResult {
  const footer = playFooter(tool, play);
  if (!footer) return result;
  const content = [...(result.content ?? [])];
  const first = content[0];
  if (first && first.type === "text") content[0] = { ...first, text: `${first.text}\n\n${footer}` };
  else content.push({ type: "text", text: footer });
  const structured = result.structuredContent && typeof result.structuredContent === "object" ? { ...result.structuredContent, play: { ...playMeta(play), footer } } : result.structuredContent;
  return { ...result, content, ...(structured === undefined ? {} : { structuredContent: structured }) };
}
