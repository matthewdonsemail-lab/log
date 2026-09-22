import { ConvexError } from "convex/values";
import { v } from "convex/values";
import { action, env } from "./_generated/server.js";
import { buildCallUrl, callFailureReason, TREG_DEFAULT_BASE_URL } from "./lib/treg.js";

// TODO: domainCompetitors { owner, domain } — validate the bare domain,
// call the spyfu row with seranking failover, clean to [{ domain, commonKeywords }].
// TODO: per-owner 30s cooldown from the calls ledger before spending.
// TODO: write every receipt (X-Treg-Call-Id, X-Treg-Cost-Micro) to calls.
// TODO: balance — read the team balance so the UI can disable paid stages.

/**
 * Call any catalogued treg endpoint by id. Auth lives in the app: the
 * caller passes its already-verified owner string (components have no
 * ctx.auth), which is hashed before it leaves as the ledger tag. The token
 * and base URL come only from the component's declared env, never from
 * arguments; every call carries a spend ceiling (X-Treg-Route-Max-Cost
 * refuses instead of overspending) and a fresh idempotency key so a retry
 * is never billed twice. The upstream answer relays verbatim.
 */
export const call = action({
  args: {
    owner: v.string(),
    endpoint: v.string(),
    params: v.optional(
      v.record(v.string(), v.union(v.string(), v.number(), v.boolean())),
    ),
    maxCostUsd: v.optional(v.number()),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<unknown> => {
    void ctx;
    const token = env.TREG_TOKEN;
    if (!token) throw new ConvexError("Treg is not switched on yet.");
    const baseUrl = env.TREG_BASE_URL ?? TREG_DEFAULT_BASE_URL;
    const url = buildCallUrl(baseUrl, { endpoint: args.endpoint, params: args.params });
    const ownerHash = await sha256Hex(args.owner);
    const res = await fetch(url, {
      headers: {
        "X-Treg-Token": token,
        "X-Treg-Route-Max-Cost": String(args.maxCostUsd ?? 0.05),
        "Idempotency-Key": crypto.randomUUID(),
        "X-Treg-Meta": `customer=${ownerHash}`,
      },
      signal: AbortSignal.timeout(55_000),
    });
    if (!res.ok) throw new ConvexError(callFailureReason(res.status));
    return (await res.json()) as unknown;
  },
});

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 16);
}
