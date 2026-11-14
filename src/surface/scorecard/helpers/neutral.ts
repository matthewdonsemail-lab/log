import type { Metric } from "../types.ts";

export const PLATFORM_NEUTRAL_ZERO: Readonly<Record<string, string>> = {
  sharedCommandsUnderPlatformGuide: "a command with platform any or byArgument is filed under a platform-named guide topic (GUIDE_TOPICS, src/mcp/server/helpers/guides.ts)",
  sharedToolsUnderPlatformGuide: "a shared command's tool points at a platform-named guide",
  sharedCommandsNamingPlatform: "a shared command's usage, summary or tool note names one platform: say the platform, or list the platforms on a `Platforms:` line",
  flowToolsWithoutPlatform: "a flow tool has no platform in its name: give its definition a platform (src/browser/flow/definitions)",
  guidesOverLimit: "a generated guide is over the size limit: split its topic or move text out of it",
  "deadRuleCitations.toolDescriptions": "a tool description cites a rule that isn't in AGENTS.md",
  "deadRuleCitations.guides": "a guide cites a rule that isn't in AGENTS.md",
  "deadRuleCitations.useCases": "a use case cites a rule that isn't in AGENTS.md",
  "deadRuleCitations.skills": "a skill cites a rule that isn't in AGENTS.md",
  "deadRuleCitations.hooks": "hook or live-log text cites a rule that isn't in AGENTS.md",
  ownerNameInServedText: "served text carries the owner's name: say \"the owner\" (rule 47)",
};

export function platformNeutralProblems(metrics: readonly Metric[]): string[] {
  return Object.entries(PLATFORM_NEUTRAL_ZERO).flatMap(([key, why]) => {
    const found = metrics.find((m) => m.key === key);
    if (!found) return [`${key} is not measured`];
    if (found.value === 0) return [];
    return [`${key} is ${found.value}: ${why}${found.details?.length ? `\n      ${found.details.slice(0, 20).join("\n      ")}` : ""}`];
  });
}
