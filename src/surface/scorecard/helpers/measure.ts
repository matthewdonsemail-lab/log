import { stepsOf } from "../../../mcp/server/helpers/activePlay.ts";
import { PLATFORMS } from "../../../cli/runner/helpers/platforms.ts";
import { commandKey } from "../../../cli/runner/helpers/platforms.ts";
import { GUIDE_LIMIT } from "../types.ts";
import type { Metric, ScoredCommand, ScoredCommandTool, ScorecardInput, SourceText, ToolText, UseCaseText } from "../types.ts";
import { deadCitations } from "./citations.ts";
import { stringFlagReparses } from "./flagReparses.ts";
import { uncodedRefusals } from "./uncodedRefusals.ts";
import { marketplaceImports } from "./marketplaceImports.ts";
import { isShared, platformOfToolName, platformOfTopic, platformsNamed } from "./platformWords.ts";

const GUIDE_LINE = "Before first using this tool";
const RULES_LINE = "AGENTS.md (log://agents): rules";
const FALLBACKS: readonly RegExp[] = [/\?\?\s*(["'`])(?:facebook|Facebook|FACEBOOK)\1/g, /\bPLATFORMS\[0\]/g];

const where = (command: ScoredCommand): string => commandKey(command);
const SUPPORT_LINE = /^\s*Platforms:/;
const OWNER_NAME = /\bmatt\b/gi;

export function ownerNameIn(files: readonly SourceText[]): string[] {
  return files.flatMap((file) => {
    const n = [...file.text.matchAll(OWNER_NAME)].length;
    return n ? [`${file.path} (${n})`] : [];
  });
}

export function servedText(input: Pick<ScorecardInput, "listedTools" | "guides" | "serverInstructions" | "hostedInstructions" | "useCaseFiles">): SourceText[] {
  return [
    ...input.listedTools.map((t) => ({ path: `tool ${t.name}`, text: t.description })),
    ...Object.entries(input.guides).map(([topic, text]) => ({ path: `guide ${topic}`, text })),
    { path: "server instructions", text: input.serverInstructions },
    { path: "hosted instructions", text: input.hostedInstructions },
    ...input.useCaseFiles,
  ];
}

export function sharedUnderPlatformGuide(commands: readonly ScoredCommand[], guideOf: ScorecardInput["guideOf"]): string[] {
  return commands.filter((c) => isShared(c.platform)).flatMap((c) => {
    const topic = guideOf(c);
    return topic && platformOfTopic(topic) ? [`${where(c)} (${topic})`] : [];
  });
}

export function sharedToolsUnderPlatformGuide(tools: readonly ScoredCommandTool[], guideOf: ScorecardInput["guideOf"]): string[] {
  return tools.filter((t) => isShared(t.command.platform)).flatMap((t) => {
    const topic = guideOf(t.command);
    return topic && platformOfTopic(topic) ? [`${t.tool} (${topic})`] : [];
  });
}

export function sharedNamingPlatform(commands: readonly ScoredCommand[], tools: readonly ScoredCommandTool[], notes: ScorecardInput["notes"]): string[] {
  return commands.filter((c) => isShared(c.platform)).flatMap((c) => {
    const own = tools.filter((t) => t.command === c).flatMap((t) => notes[t.tool] ?? []);
    const lines = [c.summary, c.usage, ...(notes[c.name] ?? []), ...own].join("\n").split("\n").filter((line) => !SUPPORT_LINE.test(line));
    const named = platformsNamed(lines.join("\n"));
    return named.length === 1 ? [`${where(c)} (${named[0]})`] : [];
  });
}

export function toolsPerPlatform(tools: readonly ScoredCommandTool[], flowTools: readonly string[]): Record<string, number> {
  const out: Record<string, number> = { shared: 0, flow: flowTools.length };
  for (const platform of PLATFORMS) out[platform] = 0;
  for (const t of tools) out[isShared(t.command.platform) ? "shared" : t.command.platform] += 1;
  return out;
}

export const flowToolsWithoutPlatform = (flowTools: readonly string[]): string[] => flowTools.filter((name) => !platformOfToolName(name));

export function useCaseCounts(useCases: readonly UseCaseText[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const u of useCases) {
    const folder = u.id.split("/")[0];
    out[folder] = (out[folder] ?? 0) + 1;
  }
  return out;
}

export const useCasesWithoutAsks = (useCases: readonly UseCaseText[]): string[] => useCases.filter((u) => !u.asks).map((u) => u.id);

export const useCasesWithoutSteps = (useCases: readonly UseCaseText[]): string[] => useCases.filter((u) => stepsOf(u.text).length === 0).map((u) => u.id);

export function toolsInNoUseCase(toolNames: readonly string[], useCases: readonly UseCaseText[]): string[] {
  const named = new Set(useCases.flatMap((u) => u.tools));
  return toolNames.filter((name) => !named.has(name));
}

export function argsTools(tools: readonly ToolText[]): string[] {
  return tools.filter((t) => {
    const properties = t.inputSchema?.properties;
    return typeof properties === "object" && properties !== null && "args" in properties;
  }).map((t) => t.name);
}

export function actingTools(tools: readonly ScoredCommandTool[], flowTools: readonly string[]): string[] {
  return [...tools.filter((t) => t.live && t.effect !== "spend").map((t) => t.tool), ...flowTools.filter((name) => name.endsWith("Live"))];
}

export const ungatedActingTools = (acting: readonly string[], playRequired: ReadonlySet<string>): string[] => acting.filter((name) => !playRequired.has(name));

export function liveCommands(tools: readonly ScoredCommandTool[]): ScoredCommand[] {
  return [...new Set(tools.filter((t) => t.live && t.effect !== "spend").map((t) => t.command))];
}

export function hookHosts(typesText: string): string[] {
  const union = /export\s+type\s+HookHost\s*=\s*([^;]+);/.exec(typesText)?.[1] ?? "";
  return [...union.matchAll(/["'](\w+)["']/g)].map((m) => m[1]);
}

export function boilerplateShare(tools: readonly ToolText[]): number {
  const total = tools.reduce((n, t) => n + t.description.length, 0);
  const boiler = tools.reduce((n, t) => n + t.description.split("\n").filter((line) => line.startsWith(GUIDE_LINE) || line.startsWith(RULES_LINE)).reduce((m, line) => m + line.length, 0), 0);
  return total ? Math.round((boiler / total) * 1000) / 10 : 0;
}

export function platformFallbacks(files: readonly SourceText[]): string[] {
  return files.flatMap((file) =>
    file.text.split("\n").flatMap((line, i) => FALLBACKS.flatMap((pattern) => [...line.matchAll(pattern)].map(() => `${file.path}:${i + 1}`))),
  );
}

const metric = (key: string, label: string, better: Metric["better"], list: readonly string[]): Metric => ({ key, label, value: list.length, better, details: [...list] });
const count = (key: string, label: string, better: Metric["better"], value: number, details?: string[]): Metric => ({ key, label, value, better, ...(details ? { details } : {}) });

export function measure(input: ScorecardInput): Metric[] {
  const out: Metric[] = [];
  out.push(metric("sharedCommandsUnderPlatformGuide", "Shared commands under a platform-named guide", "lower", sharedUnderPlatformGuide(input.commands, input.guideOf)));
  out.push(metric("sharedToolsUnderPlatformGuide", "Shared tools under a platform-named guide", "lower", sharedToolsUnderPlatformGuide(input.commandTools, input.guideOf)));
  out.push(metric("sharedCommandsNamingPlatform", "Shared commands whose summary, usage or note names exactly one platform", "lower", sharedNamingPlatform(input.commands, input.commandTools, input.notes)));
  for (const [platform, n] of Object.entries(toolsPerPlatform(input.commandTools, input.flowTools))) out.push(count(`toolsPerPlatform.${platform}`, `Tools: ${platform}`, "info", n));
  out.push(metric("flowToolsWithoutPlatform", "Flow tools with no platform in their name", "lower", flowToolsWithoutPlatform(input.flowTools)));
  for (const [folder, n] of Object.entries(useCaseCounts(input.useCases)).sort(([a], [b]) => a.localeCompare(b))) out.push(count(`useCases.${folder}`, `Use cases: ${folder}`, "info", n));
  out.push(metric("useCasesWithoutAsks", "Use cases with no asks line", "lower", useCasesWithoutAsks(input.useCases)));
  out.push(metric("useCasesWithoutSteps", "Use cases whose step table parses to zero steps", "lower", useCasesWithoutSteps(input.useCases)));
  const toolNames = [...input.commandTools.map((t) => t.tool), ...input.flowTools];
  out.push(metric("toolsInNoUseCase", "Tools named by no use case", "lower", toolsInNoUseCase(toolNames, input.useCases)));
  out.push(metric("argsTools", "Tools that take a raw args list", "lower", argsTools(input.listedTools)));
  const acting = actingTools(input.commandTools, input.flowTools);
  out.push(count("actingTools", "Live (acting) tools", "info", acting.length));
  out.push(metric("actingToolsWithoutPlay", "Live (acting) tools that can run with no play loaded", "lower", ungatedActingTools(acting, input.playRequired)));
  out.push(metric("actingToolsInNoUseCase", "Live tools that act as the owner and no use case names (not play-gated)", "lower", [...input.actingNamedByNoUseCase]));
  const live = liveCommands(input.commandTools);
  out.push(count("liveCommands", "Commands with a live (acting) tool", "info", live.length));
  out.push(metric("liveCommandsWithoutMachine", "Commands with a live tool and no machine behind them", "lower", live.filter((c) => !input.hasMachine(c)).map(where)));
  out.push(metric("hookHosts", "Hook hosts (HookHost)", "higher", hookHosts(input.hookTypes)));
  out.push(count("serverInstructionsChars", "Server instructions, characters", "lower", input.serverInstructions.length));
  const descriptions = input.listedTools.reduce((n, t) => n + t.description.length, 0);
  out.push(count("toolsListed", "Tools listed to a host", "info", input.listedTools.length));
  out.push(count("toolDescriptionChars", "Tool descriptions, total characters", "lower", descriptions));
  out.push(count("toolDescriptionAverage", "Tool descriptions, average characters", "lower", input.listedTools.length ? Math.round(descriptions / input.listedTools.length) : 0));
  out.push(count("boilerplatePercent", "Share of description text that is the guide and rules lines, %", "lower", boilerplateShare(input.listedTools)));
  const guides = Object.entries(input.guides).sort(([a], [b]) => a.localeCompare(b));
  for (const [topic, text] of guides) out.push(count(`guideChars.${topic}`, `Guide ${topic}, characters`, "lower", text.length));
  out.push(metric("guidesOverLimit", `Guides over ${GUIDE_LIMIT.toLocaleString("en-GB")} characters`, "lower", guides.filter(([, text]) => text.length > GUIDE_LIMIT).map(([topic]) => topic)));
  const toolFiles = input.listedTools.map((t) => ({ path: `tool ${t.name}`, text: t.description }));
  for (const [key, label, files] of [
    ["useCases", "use cases", input.useCaseFiles],
    ["skills", "skills", input.skillFiles],
    ["toolDescriptions", "tool descriptions", toolFiles],
    ["guides", "guides", Object.entries(input.guides).map(([topic, text]) => ({ path: `guide ${topic}`, text }))],
    ["hooks", "hook and live-log source", input.hookFiles],
  ] as const) {
    const found = deadCitations(files, input.ruleIds);
    out.push(count(`ruleCitations.${key}`, `Rule citations in ${label}`, "info", found.citations));
    out.push(count(`deadRuleCitations.${key}`, `Dead rule citations in ${label}`, "lower", found.dead, found.worst.map((w) => `${w.path} (${w.dead})`)));
  }
  out.push(count("ownerNameInServedText", "The owner's name in served text (tool descriptions, guides, instructions, use cases)", "lower", ownerNameIn(servedText(input)).reduce((n, d) => n + Number(/\((\d+)\)$/.exec(d)?.[1] ?? 0), 0), ownerNameIn(servedText(input))));
  out.push(metric("stringFlagReparses", "Flags declared string that a command reads through Number(...) or .split(\",\")", "lower", stringFlagReparses(input.codeFiles, input.declaredFlags)));
  out.push(metric("uncodedRefusals", "Command refusals in src/cli/ that return stderr with no catalog code field (they reach a caller as commandFailed)", "lower", uncodedRefusals(input.codeFiles)));
  out.push(metric("platformFallbacks", "Hard-coded Facebook fallbacks in src/ and scripts/", "lower", platformFallbacks(input.codeFiles)));
  out.push(metric("marketplaceImports", "Files in src/ outside src/facebook/ and src/marketplace/ that import from src/marketplace/", "lower", marketplaceImports(input.codeFiles)));
  return out;
}
