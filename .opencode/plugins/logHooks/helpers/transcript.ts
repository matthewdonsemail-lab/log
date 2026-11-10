import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { logToolName } from "./names";

export const TRANSCRIPT_DIR = process.env.LOG_OPENCODE_TRANSCRIPTS || join(homedir(), ".logCli", "opencode");

interface ToolPart {
  type?: string;
  name?: string;
  state?: { input?: Record<string, unknown> };
}

interface AssistantMessage {
  type?: string;
  content?: ToolPart[];
}

interface ToolUse {
  type: "tool_use";
  name: string;
  input: Record<string, unknown>;
}

export function transcriptPathOf(sessionID: string): string {
  return join(TRANSCRIPT_DIR, `${sessionID}.jsonl`);
}

function codeModeUses(code: string): ToolUse[] {
  const uses: ToolUse[] = [];
  const call = /tools\.(?:log|mcp__log__)\.([A-Za-z0-9_]+)\s*\(/g;
  const starts = [...code.matchAll(call)].map((match) => ({ name: match[1], at: match.index ?? 0, end: (match.index ?? 0) + match[0].length }));
  for (const [index, start] of starts.entries()) {
    const slice = code.slice(start.end, starts[index + 1]?.at ?? code.length);
    const useCase = /useCase\s*:\s*"([^"]+)"/.exec(slice)?.[1];
    uses.push({ type: "tool_use", name: `mcp__log__${start.name}`, input: useCase ? { useCase } : {} });
  }
  return uses;
}

export function transcriptOf(messages: readonly AssistantMessage[]): string {
  const lines: string[] = [];
  for (const message of messages) {
    if (message.type !== "assistant" || !Array.isArray(message.content)) continue;
    const uses: ToolUse[] = [];
    for (const part of message.content) {
      if (part?.type !== "tool") continue;
      const name = logToolName(String(part.name ?? ""));
      if (name.startsWith("mcp__log__")) {
        uses.push({ type: "tool_use", name, input: part.state?.input ?? {} });
        continue;
      }
      const code = part.state?.input?.code;
      if (typeof code === "string") uses.push(...codeModeUses(code));
    }
    if (uses.length) lines.push(JSON.stringify({ type: "assistant", message: { content: uses } }));
  }
  return lines.length ? `${lines.join("\n")}\n` : "";
}

export function writeTranscript(sessionID: string, messages: readonly AssistantMessage[]): string {
  try {
    const text = transcriptOf(messages);
    if (!text) return "";
    const path = transcriptPathOf(sessionID);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
    return path;
  } catch {
    return "";
  }
}
