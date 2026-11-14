import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { isInputRequired } from "./helpers/index.ts";
import { ALL_PROTOCOL_VERSIONS, DISCOVER_CACHE, DISCOVER_METHOD, HTTP_HEADERS, LEGACY_PROTOCOL_VERSIONS, LIST_CACHE, META_KEYS, MODERN_PROTOCOL_VERSIONS, NAMED_METHODS, RPC_ERRORS } from "./types.ts";
import type { RequestId, RpcError, RpcResponse, StatelessCaller, StatelessHandlers } from "./types.ts";

type Message = { jsonrpc?: unknown; id?: unknown; method?: unknown; params?: unknown };

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function idOf(message: Message): RequestId | null {
  return typeof message.id === "string" || typeof message.id === "number" ? message.id : null;
}

export function metaVersionOf(message: unknown): string | null {
  const version = record(record(record(message)?.params)?._meta)?.[META_KEYS.protocolVersion];
  return typeof version === "string" ? version : null;
}

export function isModernMessage(message: unknown): boolean {
  const given = record(message) as Message | null;
  if (!given || typeof given.method !== "string") return false;
  if (given.method === DISCOVER_METHOD) return true;
  const meta = record(record(given.params)?._meta);
  return Boolean(meta && META_KEYS.protocolVersion in meta);
}

function failure(id: RequestId | null, code: number, message: string, data?: unknown): RpcResponse {
  const error: RpcError = { code, message, ...(data === undefined ? {} : { data }) };
  return { jsonrpc: "2.0", id, error };
}

function withServerInfo(handlers: StatelessHandlers, result: Record<string, unknown>): Record<string, unknown> {
  return { ...result, _meta: { ...(record(result._meta) ?? {}), [META_KEYS.serverInfo]: handlers.serverInfo } };
}

function complete(handlers: StatelessHandlers, result: Record<string, unknown>): Record<string, unknown> {
  return withServerInfo(handlers, { ...result, resultType: "complete" });
}

export function callerOf(params: Record<string, unknown>, signal?: AbortSignal): StatelessCaller | RpcError {
  const meta = record(params._meta) ?? {};
  const version = meta[META_KEYS.protocolVersion];
  if (typeof version !== "string" || !version) return { code: RPC_ERRORS.invalidParams, message: `_meta["${META_KEYS.protocolVersion}"] is required on every request` };
  if (!MODERN_PROTOCOL_VERSIONS.includes(version)) {
    const legacy = LEGACY_PROTOCOL_VERSIONS.includes(version) ? `: ${version} is served after an initialize request` : "";
    return { code: RPC_ERRORS.unsupportedProtocolVersion, message: `Unsupported protocol version${legacy}`, data: { supported: [...ALL_PROTOCOL_VERSIONS], requested: version } };
  }
  const capabilities = record(meta[META_KEYS.clientCapabilities]);
  if (!capabilities) return { code: RPC_ERRORS.invalidParams, message: `_meta["${META_KEYS.clientCapabilities}"] is required on every request` };
  const info = record(meta[META_KEYS.clientInfo]);
  return {
    version,
    capabilities,
    clientInfo: info ? { ...(typeof info.name === "string" ? { name: info.name } : {}), ...(typeof info.version === "string" ? { version: info.version } : {}) } : null,
    inputResponses: record(params.inputResponses),
    requestState: typeof params.requestState === "string" ? params.requestState : null,
    signal,
  };
}

export async function answerStateless(message: unknown, handlers: StatelessHandlers, signal?: AbortSignal): Promise<RpcResponse | null> {
  const given = record(message) as Message | null;
  if (!given || given.jsonrpc !== "2.0" || typeof given.method !== "string") return failure(given ? idOf(given) : null, RPC_ERRORS.invalidRequest, "Send one JSON-RPC 2.0 request");
  if (!("id" in given)) return null;
  const id = idOf(given);
  if (id === null) return failure(null, RPC_ERRORS.invalidRequest, "A request id is a string or a number");
  const params = record(given.params) ?? {};
  const caller = callerOf(params, signal);
  if ("code" in caller) return failure(id, caller.code, caller.message, caller.data);
  const ok = (result: Record<string, unknown>): RpcResponse => ({ jsonrpc: "2.0", id, result: complete(handlers, result) });
  try {
    switch (given.method) {
      case DISCOVER_METHOD:
        return ok({ supportedVersions: [...ALL_PROTOCOL_VERSIONS], capabilities: handlers.capabilities, instructions: handlers.instructions, ...DISCOVER_CACHE });
      case "tools/list":
        return ok({ tools: await handlers.listTools(caller), ...LIST_CACHE });
      case "resources/list":
        return ok({ resources: await handlers.listResources(caller), ...LIST_CACHE });
      case "resources/read": {
        if (typeof params.uri !== "string") return failure(id, RPC_ERRORS.invalidParams, "resources/read needs a uri");
        const read = await handlers.readResource(params.uri, caller);
        return read ? ok({ ...read, ...LIST_CACHE }) : failure(id, RPC_ERRORS.invalidParams, `Resource not found: ${params.uri}`, { uri: params.uri });
      }
      case "tools/call": {
        const args = params.arguments;
        if (typeof params.name !== "string" || (args !== undefined && !record(args))) return failure(id, RPC_ERRORS.invalidParams, "tools/call needs a tool name and an arguments object");
        const result = await handlers.callTool({ name: params.name, ...(args === undefined ? {} : { arguments: args as Record<string, unknown> }) }, caller);
        if (isInputRequired(result)) return { jsonrpc: "2.0", id, result: withServerInfo(handlers, { ...result }) };
        return ok({ ...(result as Record<string, unknown>) });
      }
      default:
        return failure(id, RPC_ERRORS.methodNotFound, `Method not found: ${given.method}`);
    }
  } catch (error) {
    return failure(id, RPC_ERRORS.internalError, error instanceof Error ? error.message : String(error));
  }
}

export function httpStatusOf(answer: RpcResponse): number {
  if (!("error" in answer)) return 200;
  const code = answer.error.code;
  if (code === RPC_ERRORS.methodNotFound) return 404;
  if (code === RPC_ERRORS.internalError) return 500;
  return 400;
}

export function headerValue(value: string): string | null {
  const encoded = /^=\?base64\?(.*)\?=$/.exec(value);
  if (!encoded) return value;
  try {
    return Buffer.from(encoded[1], "base64").toString("utf8");
  } catch {
    return null;
  }
}

export function headerMismatchOf(headers: Headers, message: unknown): string | null {
  const given = record(message) as Message | null;
  const version = headers.get(HTTP_HEADERS.protocolVersion);
  if (!version) return "the MCP-Protocol-Version header is missing";
  const metaVersion = metaVersionOf(message);
  if (metaVersion !== null && metaVersion !== version) return `the MCP-Protocol-Version header value '${version}' does not match the body value '${metaVersion}'`;
  if (!given || typeof given.method !== "string" || !("id" in given)) return null;
  const method = headers.get(HTTP_HEADERS.method);
  if (method !== given.method) return method === null ? "the Mcp-Method header is missing" : `the Mcp-Method header value '${method}' does not match the body value '${given.method}'`;
  const field = NAMED_METHODS[given.method];
  if (!field) return null;
  const body = record(given.params)?.[field];
  const raw = headers.get(HTTP_HEADERS.name);
  if (raw === null) return "the Mcp-Name header is missing";
  const name = headerValue(raw);
  return name === body ? null : `the Mcp-Name header value '${raw}' does not match the body value '${String(body)}'`;
}

export function hostAllowed(headers: Headers, allowed: readonly string[]): boolean {
  const host = headers.get("host");
  if (!host || !allowed.includes(host)) return false;
  const origin = headers.get("origin");
  if (!origin) return true;
  try {
    return allowed.includes(new URL(origin).host);
  } catch {
    return false;
  }
}

export function isModernHttp(headers: Headers, message: unknown): boolean {
  const version = headers.get(HTTP_HEADERS.protocolVersion);
  return isModernMessage(message) || (version !== null && MODERN_PROTOCOL_VERSIONS.includes(version));
}

export async function statelessHttp(headers: Headers, message: unknown, handlers: StatelessHandlers, signal?: AbortSignal): Promise<Response> {
  const given = record(message) as Message | null;
  const id = given ? idOf(given) : null;
  if (!given || given.jsonrpc !== "2.0" || typeof given.method !== "string") return Response.json(failure(id, RPC_ERRORS.invalidRequest, "Send one JSON-RPC 2.0 request"), { status: 400 });
  if (!("id" in given)) return new Response(null, { status: 202 });
  const mismatch = headerMismatchOf(headers, message);
  if (mismatch) return Response.json(failure(id, RPC_ERRORS.headerMismatch, `Header mismatch: ${mismatch}`), { status: 400 });
  const answer = (await answerStateless(message, handlers, signal)) as RpcResponse;
  return Response.json(answer, { status: httpStatusOf(answer) });
}

function cancelledId(message: Message): RequestId | null {
  if (message.method !== "notifications/cancelled") return null;
  const id = record(message.params)?.requestId;
  return typeof id === "string" || typeof id === "number" ? id : null;
}

export function dualEraTransport(inner: Transport, handlers: StatelessHandlers): Transport {
  let legacy = false;
  const running = new Map<RequestId, AbortController>();
  const outer: Transport = {
    start: () => inner.start(),
    close: () => inner.close(),
    send: (message, options) => (legacy || "id" in message ? inner.send(message, options) : Promise.resolve()),
    setProtocolVersion: (version) => inner.setProtocolVersion?.(version),
  };
  Object.defineProperty(outer, "sessionId", { get: () => inner.sessionId });
  inner.onclose = () => outer.onclose?.();
  inner.onerror = (error) => outer.onerror?.(error);
  inner.onmessage = (message, extra) => {
    const given = message as Message;
    if (isModernMessage(message)) {
      const id = idOf(given);
      const control = new AbortController();
      if (id !== null) running.set(id, control);
      void answerStateless(message, handlers, control.signal)
        .then((answer) => (answer && !control.signal.aborted ? inner.send(answer as JSONRPCMessage) : undefined))
        .catch((error) => outer.onerror?.(error instanceof Error ? error : new Error(String(error))))
        .finally(() => {
          if (id !== null && running.get(id) === control) running.delete(id);
        });
      return;
    }
    const cancelled = cancelledId(given);
    const control = cancelled === null ? undefined : running.get(cancelled);
    if (control) {
      control.abort();
      running.delete(cancelled as RequestId);
      return;
    }
    if (given.method === "initialize") legacy = true;
    outer.onmessage?.(message, extra);
  };
  return outer;
}
