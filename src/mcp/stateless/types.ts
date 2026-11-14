import { SUPPORTED_PROTOCOL_VERSIONS } from "@modelcontextprotocol/sdk/types.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const MODERN_PROTOCOL_VERSIONS: readonly string[] = ["2026-07-28"];

export const LEGACY_PROTOCOL_VERSIONS: readonly string[] = SUPPORTED_PROTOCOL_VERSIONS;

export const ALL_PROTOCOL_VERSIONS: readonly string[] = [...MODERN_PROTOCOL_VERSIONS, ...LEGACY_PROTOCOL_VERSIONS];

export const META_KEYS = {
  protocolVersion: "io.modelcontextprotocol/protocolVersion",
  clientCapabilities: "io.modelcontextprotocol/clientCapabilities",
  clientInfo: "io.modelcontextprotocol/clientInfo",
  logLevel: "io.modelcontextprotocol/logLevel",
  serverInfo: "io.modelcontextprotocol/serverInfo",
} as const;

export const RPC_ERRORS = {
  parseError: -32700,
  invalidRequest: -32600,
  methodNotFound: -32601,
  invalidParams: -32602,
  internalError: -32603,
  headerMismatch: -32020,
  missingRequiredClientCapability: -32021,
  unsupportedProtocolVersion: -32022,
} as const;

export const DISCOVER_METHOD = "server/discover";

export const NAMED_METHODS: Readonly<Record<string, "name" | "uri">> = { "tools/call": "name", "prompts/get": "name", "resources/read": "uri" };

export const HTTP_HEADERS = { protocolVersion: "mcp-protocol-version", method: "mcp-method", name: "mcp-name" } as const;

export const LIST_CACHE = { ttlMs: 60_000, cacheScope: "private" } as const;

export const DISCOVER_CACHE = { ttlMs: 3_600_000, cacheScope: "private" } as const;

export const REQUEST_STATE_SECONDS = 600;

export type RequestId = string | number;

export interface RpcRequest {
  jsonrpc: "2.0";
  id: RequestId;
  method: string;
  params?: Record<string, unknown>;
}

export interface RpcError {
  code: number;
  message: string;
  data?: unknown;
}

export type RpcResponse = { jsonrpc: "2.0"; id: RequestId | null; result: Record<string, unknown> } | { jsonrpc: "2.0"; id: RequestId | null; error: RpcError };

export interface Implementation {
  name: string;
  version: string;
  title?: string;
}

export interface StatelessCaller {
  version: string;
  capabilities: Record<string, unknown>;
  clientInfo: { name?: string; version?: string } | null;
  inputResponses: Record<string, unknown> | null;
  requestState: string | null;
  signal?: AbortSignal;
}

export interface InputRequest {
  method: string;
  params: Record<string, unknown>;
}

export interface InputRequiredResult {
  resultType: "input_required";
  inputRequests?: Record<string, InputRequest>;
  requestState?: string;
}

export type StatelessCallResult = CallToolResult | InputRequiredResult;

export interface StatelessResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface StatelessHandlers {
  serverInfo: Implementation;
  instructions: string;
  capabilities: Record<string, unknown>;
  listTools: (caller: StatelessCaller) => Promise<Record<string, unknown>[]>;
  listResources: (caller: StatelessCaller) => Promise<StatelessResource[]>;
  readResource: (uri: string, caller: StatelessCaller) => Promise<Record<string, unknown> | null>;
  callTool: (params: { name: string; arguments?: Record<string, unknown> }, caller: StatelessCaller) => Promise<StatelessCallResult>;
}

export interface RequestStateBody {
  tool: string;
  digest: string;
  principal: string;
  key: string;
  expiresAt: number;
}
