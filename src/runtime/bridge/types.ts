export const PROTOCOL_VERSION = 1;
export const RECONNECT_MS = [1_000, 2_000, 5_000, 10_000, 30_000] as const;

export interface Binding {
  origin: string;
  workspaceId: string;
  installationId: string;
  credential: string;
  generation: number;
  expiresAt: string;
  dispatchPublicKey: string;
  bridgeUrl: string;
  pairedAt: string;
}

export interface PendingPairing {
  origin: string;
  installationId: string;
  challengeProof: string;
  createdAt: string;
}

export interface Authority {
  teamId: string;
  workspaceId: string;
  actorUserId: string | null;
  grantId: string | null;
  tool: string;
  requestHash: string;
  routeGeneration: number;
  authzVersion: number;
  issuedAt: string;
  expiresAt: string;
  signature: string;
}

export type EnvelopeKind = "dispatch" | "accepted" | "progress" | "result" | "reconcile" | "cancel" | "heartbeat";

export interface Envelope {
  protocolVersion: number;
  kind: EnvelopeKind;
  workspaceId: string;
  routeGeneration: number;
  operationId?: string | null;
  sequence?: number;
  authority?: Authority | null;
  payload?: unknown;
}

export type OperationState = "accepted" | "running" | "succeeded" | "failed" | "cancelled" | "unknown";

export interface ResultPayload {
  state: OperationState;
  result?: unknown;
  error?: { code: string; message: string };
}

export type RunTool = (tool: string, args: Record<string, unknown>) => Promise<ResultPayload>;

export type Refusal = { ok: false; code: string; message: string };
