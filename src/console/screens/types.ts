export type ConsoleDomain = "start" | "connections" | "usage" | "events" | "aiClients" | "settings";

export interface ConsoleScreen {
  domain: ConsoleDomain;
  label: string;
  route: string;
  api: string;
  summary: string;
}

export const CONSOLE_SCREENS: readonly ConsoleScreen[] = [
  { domain: "start", label: "Start", route: "/console/start", api: "/api/console/start", summary: "log.db, the MCP, accounts and the last event" },
  { domain: "connections", label: "Connections", route: "/console/connections", api: "/api/console/connections", summary: "Accounts by platform with their session state" },
  { domain: "usage", label: "Usage", route: "/console/usage", api: "/api/console/usage", summary: "Calls by kind over 1, 7 or 30 days" },
  { domain: "events", label: "Events", route: "/console/events", api: "/api/console/events", summary: "Newest events, filtered by kind and status" },
  { domain: "aiClients", label: "AI clients", route: "/console/mcp", api: "/api/console/aiClients", summary: "The MCP config for Claude Code, Codex or opencode" },
  { domain: "settings", label: "Settings", route: "/console/settings", api: "/api/console/settings", summary: "Paths, each account's governor and the web console" },
];

export const DEFAULT_CONSOLE_PORT = 7338;

export const LOCAL_NO_TEAM = "local: no team or billing. Run `log login` to sign in to a team.";

export function screenOf(domain: ConsoleDomain): ConsoleScreen {
  return CONSOLE_SCREENS.find((screen) => screen.domain === domain) as ConsoleScreen;
}
