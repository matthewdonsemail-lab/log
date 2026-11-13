export const AI_CLIENTS = ["claudeCode", "codex", "opencode"] as const;
export type AiClientId = (typeof AI_CLIENTS)[number];

export interface ConsoleAiClient {
  id: AiClientId;
  label: string;
  command: string | null;
  configPath: string;
  config: string;
  note: string;
}

export interface ConsoleAiClients {
  schemaVersion: 1;
  source: "local";
  generatedAt: string;
  server: string[];
  clients: ConsoleAiClient[];
}
