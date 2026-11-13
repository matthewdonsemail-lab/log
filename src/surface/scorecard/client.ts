import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { listFlows, loadFlow } from "../../browser/flow/index.ts";
import type { FlowDefinition } from "../../browser/flow/index.ts";
import { COMMANDS } from "../../cli/runner/index.ts";
import { COMMAND_INDEX } from "../../cli/runner/helpers/commandIndex.ts";
import { reportTool } from "../../mcp/apps/report/index.ts";
import { catalogTools } from "../../mcp/catalog/index.ts";
import { agentsRules, commandTools, GUIDE_TOPICS, guideOfCommand, guideTool, listUseCases, playRequiredTools, SERVER_INSTRUCTIONS, unnamedActingTools, toolsFromCommands, toolsFromFlows, withUseCases } from "../../mcp/server/helpers/index.ts";
import { NOTES } from "../../mcp/server/helpers/toolsFromCommands.ts";
import { hasMachine, measure } from "./helpers/index.ts";
import type { Metric, ScoredCommand, ScorecardInput, SourceText, ToolText } from "./types.ts";

export const REPO_ROOT = fileURLToPath(new URL("../../../", import.meta.url));
export const BASELINE_PATH = "scripts/checks/agnosticBaseline.json";

const text = (path: string): string => readFileSync(path, "utf8").replace(/\r\n/g, "\n");

export function filesIn(root: string, dir: string, extensions: readonly string[]): SourceText[] {
  const start = join(root, dir);
  if (!existsSync(start)) return [];
  const walk = (at: string): string[] =>
    readdirSync(at, { withFileTypes: true })
      .filter((entry) => entry.name !== "node_modules" && !entry.name.startsWith("."))
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap((entry) => {
        const path = join(at, entry.name);
        if (entry.isDirectory()) return walk(path);
        return extensions.some((ext) => entry.name.endsWith(ext)) ? [path] : [];
      });
  return walk(start).map((path) => ({ path: relative(root, path).split(sep).join("/"), text: text(path) }));
}

function flowsIn(root: string): FlowDefinition[] {
  const dir = join(root, "src/browser/flow/definitions");
  return listFlows(dir).flatMap((name) => {
    const flow = loadFlow(name, dir);
    return flow ? [flow] : [];
  });
}

export function repoInput(root: string = REPO_ROOT): ScorecardInput {
  const flows = flowsIn(root);
  const entries = commandTools(COMMANDS);
  const commandToolList = toolsFromCommands(COMMANDS, { shell: true });
  const flowToolList = toolsFromFlows(flows, { shell: true });
  const named = [...commandToolList, ...flowToolList];
  const useCases = listUseCases(named.map((t) => t.name), `${join(root, "docs/useCases")}${sep}`);
  const listedTools: ToolText[] = [guideTool(), ...catalogTools(), ...withUseCases(named, useCases), reportTool()];
  const guidesDir = join(root, "docs/guides");
  const guides = Object.fromEntries(Object.keys(GUIDE_TOPICS).filter((topic) => existsSync(join(guidesDir, `${topic}.md`))).map((topic) => [topic, text(join(guidesDir, `${topic}.md`))]));
  const modules = new Map(COMMAND_INDEX.map((e) => [`${e.platform}:${e.name}`, e]));
  return {
    commands: COMMANDS,
    commandTools: entries,
    flowTools: flowToolList.map((t) => t.name),
    listedTools,
    guideOf: (command: ScoredCommand) => guideOfCommand(command),
    notes: NOTES,
    playRequired: playRequiredTools(COMMANDS, flows, useCases),
    actingNamedByNoUseCase: unnamedActingTools(COMMANDS, flows, useCases),
    useCases,
    guides,
    serverInstructions: SERVER_INSTRUCTIONS,
    hookTypes: text(join(root, "src/agentHooks/registry/types.ts")),
    ruleIds: new Set(agentsRules(text(join(root, "AGENTS.md"))).keys()),
    useCaseFiles: filesIn(root, "docs/useCases", [".md"]),
    skillFiles: filesIn(root, "skills", [".md"]),
    codeFiles: [...filesIn(root, "src", [".ts", ".tsx", ".mjs", ".js"]), ...filesIn(root, "scripts", [".ts", ".mjs", ".js"])],
    declaredFlags: COMMANDS.flatMap((command) => {
      const entry = modules.get(`${command.platform}:${command.name}`);
      if (!entry || !command.input) return [];
      const folder = entry.module.slice(0, entry.module.lastIndexOf("/") + 1);
      return command.input.forms.flatMap((form) => form.flags.map((flag) => ({ folder, name: flag.name, kind: flag.kind })));
    }),
    hasMachine: (command: ScoredCommand) => {
      const entry = modules.get(`${command.platform}:${command.name}`);
      return entry ? hasMachine(root, entry.module, entry.exportName) : false;
    },
  };
}

export function measureRepo(root: string = REPO_ROOT): Metric[] {
  return measure(repoInput(root));
}

export function readBaseline(root: string = REPO_ROOT): Record<string, number> {
  const path = join(root, BASELINE_PATH);
  if (!existsSync(path)) return {};
  return (JSON.parse(readFileSync(path, "utf8")) as { metrics?: Record<string, number> }).metrics ?? {};
}
