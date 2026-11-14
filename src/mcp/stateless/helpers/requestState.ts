import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { REQUEST_STATE_SECONDS } from "../types.ts";
import type { RequestStateBody } from "../types.ts";

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(",")}}`;
  return JSON.stringify(value ?? null);
}

export function argumentsDigest(input: Record<string, unknown> | undefined): string {
  return createHash("sha256").update(stable(input ?? {})).digest("base64url");
}

function signed(payload: string, key: Uint8Array): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function sealRequestState(body: Omit<RequestStateBody, "expiresAt">, key: Uint8Array, now: number = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ ...body, expiresAt: now + REQUEST_STATE_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${signed(payload, key)}`;
}

export function openRequestState(state: string | null, key: Uint8Array, expect: Omit<RequestStateBody, "expiresAt">, now: number = Date.now()): boolean {
  if (!state) return false;
  const [payload, signature, ...rest] = state.split(".");
  if (!payload || !signature || rest.length) return false;
  const want = Buffer.from(signed(payload, key));
  const got = Buffer.from(signature);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return false;
  let body: Partial<RequestStateBody>;
  try {
    body = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<RequestStateBody>;
  } catch {
    return false;
  }
  return body.tool === expect.tool && body.digest === expect.digest && body.principal === expect.principal && body.key === expect.key && typeof body.expiresAt === "number" && body.expiresAt > now;
}
