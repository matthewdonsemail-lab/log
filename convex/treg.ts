import { v } from "convex/values";
import type { FunctionReference } from "convex/server";
import { action } from "./lib/server";
import { requireOwner } from "./lib/server";
import { components } from "./_generated/api";

// TODO: drop this cast after root bindings regenerate (needs AUTH_ISSUER on
// dev for `convex codegen`); then components.treg types itself.
type TregCallArgs = {
  owner: string;
  endpoint: string;
  params?: Record<string, string | number | boolean>;
  maxCostUsd?: number;
};
const tregCall = (components as unknown as { treg: { treg: { call: FunctionReference<"action", "internal", TregCallArgs, unknown> } } }).treg.treg.call;

// TODO: domainCompetitors wrapper for the reveal competitors stage (auth,
// cooldown, then components.treg). The component's typed env is bound at
// install time in convex.config.ts, so wrappers only pass the owner.

// Public entry to the treg component: verifies the caller, then runs the
// catalog call as them. Component functions are internal references — they
// are only reachable through wrappers like this one.
export const call = action({
  args: {
    endpoint: v.string(),
    params: v.optional(
      v.record(v.string(), v.union(v.string(), v.number(), v.boolean())),
    ),
    maxCostUsd: v.optional(v.number()),
  },
  returns: v.any(),
  handler: async (ctx, args): Promise<unknown> => {
    const owner = await requireOwner(ctx);
    return await ctx.runAction(tregCall, { ...args, owner });
  },
});
