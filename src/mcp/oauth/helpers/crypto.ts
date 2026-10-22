import { createHash, randomBytes } from "node:crypto";

export const randomToken = (bytes = 32): string => randomBytes(bytes).toString("base64url");

export const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

export const challengeOf = (verifier: string): string => createHash("sha256").update(verifier).digest("base64url");

export function basicAuthHeader(user: string, password: string): string {
  return `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
}

export function jwtClaims(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function userIdOf(token: string): string | null {
  const userId = jwtClaims(token)?.userId;
  return typeof userId === "string" && userId !== "" ? userId : null;
}
