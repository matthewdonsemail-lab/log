import { loadConsoleStart } from "../../../console/start/index.ts";
import type { ConsoleStart } from "../../../console/start/index.ts";
import type { ConsoleUi } from "./ui.ts";
import { utcText } from "./ui.ts";

export function renderStart(data: ConsoleStart): string {
  return [
    `log.db      ${data.database.found ? `found: ${data.database.path}` : `not found: ${data.database.path} (log makes it the first time it runs)`}`,
    `MCP         ${data.mcp.running ? `running (pid ${data.mcp.pid}${data.mcp.startedAt ? `, since ${utcText(data.mcp.startedAt)}` : ""})` : "not running: your agent starts it (see AI clients)"}`,
    `Accounts    ${data.accounts}${data.accounts ? "" : " (add one: log launch, Add an account)"}`,
    `Last event  ${utcText(data.lastEventAt)}`,
  ].join("\n");
}

export async function runStartScreen(ui: ConsoleUi): Promise<void> {
  ui.context.out(renderStart(loadConsoleStart()));
}

export { loadConsoleStart };
