import { configPathIn, logMcpCommand, mergeConfig, opencodeConfigDir, PACKAGE_ROOT, SERVER } from "../../agentHooks/opencode/index.ts";
import { AI_CLIENTS } from "./types.ts";
import type { AiClientId, ConsoleAiClient, ConsoleAiClients } from "./types.ts";

export function shellWord(word: string): string {
  return /^[\w@%+=:,./\\-]+$/.test(word) ? word : `"${word.replace(/(["\\$`])/g, "\\$1")}"`;
}

export function aiClientConfigs(server: readonly string[], opencodePath: string = configPathIn(opencodeConfigDir())): ConsoleAiClient[] {
  const [command, ...args] = server;
  const line = server.map(shellWord).join(" ");
  return [
    {
      id: "claudeCode",
      label: "Claude Code",
      command: `claude mcp add ${SERVER} -- ${line}`,
      configPath: ".mcp.json in a project, or the user config `claude mcp add` writes",
      config: `${JSON.stringify({ mcpServers: { [SERVER]: { command, args } } }, null, 2)}\n`,
      note: "Run the command once, or put the JSON in a project's .mcp.json.",
    },
    {
      id: "codex",
      label: "Codex",
      command: `codex mcp add ${SERVER} -- ${line}`,
      configPath: "~/.codex/config.toml",
      config: `[mcp_servers.${SERVER}]\ncommand = ${JSON.stringify(command)}\nargs = [${args.map((arg) => JSON.stringify(arg)).join(", ")}]\n`,
      note: "Run the command once, or add the table to Codex's config.toml.",
    },
    {
      id: "opencode",
      label: "opencode",
      command: null,
      configPath: opencodePath,
      config: mergeConfig("", [...server]).text,
      note: "`log launch --setup` writes this into opencode's config and copies log's hooks; or merge the mcp block yourself.",
    },
  ];
}

export function loadConsoleAiClients(options: { client?: string; root?: string } = {}): ConsoleAiClients {
  const wanted = options.client?.trim();
  if (wanted && !(AI_CLIENTS as readonly string[]).includes(wanted)) throw new Error("consoleAiClientInvalid");
  const server = logMcpCommand(options.root ?? PACKAGE_ROOT);
  const clients = aiClientConfigs(server).filter((client) => !wanted || client.id === (wanted as AiClientId));
  return { schemaVersion: 1, source: "local", generatedAt: new Date().toISOString(), server, clients };
}
