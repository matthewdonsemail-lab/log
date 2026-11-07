import { RESTARTED_MID_CALL } from "../types.ts";
import type { RpcId, RpcMessage } from "../types.ts";

export function parseMessage(line: string): RpcMessage | null {
  const text = line.trim();
  if (!text.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as RpcMessage) : null;
  } catch {
    return null;
  }
}

export function isRequest(message: RpcMessage): message is RpcMessage & { id: RpcId; method: string } {
  return typeof message.method === "string" && message.id !== undefined && message.id !== null;
}

export function isResponse(message: RpcMessage): message is RpcMessage & { id: RpcId } {
  return message.method === undefined && message.id !== undefined && message.id !== null;
}

export function idKey(id: RpcId): string {
  return `${typeof id}:${String(id)}`;
}

export function restartedMidCall(id: RpcId, why: string): string {
  return JSON.stringify({ jsonrpc: "2.0", id, error: { code: RESTARTED_MID_CALL, message: `logMcpRestarted: the log MCP server restarted while this call ran (${why}), so its answer was lost; call it again` } });
}

export function toolsChanged(): string {
  return JSON.stringify({ jsonrpc: "2.0", method: "notifications/tools/list_changed" });
}

export function replayedInitialize(initialize: RpcMessage, id: string): string {
  return JSON.stringify({ ...initialize, jsonrpc: "2.0", id });
}

export function initialized(): string {
  return JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" });
}
