import { loadConsoleAiClients } from "../../../console/aiClients/index.ts";
import type { ConsoleAiClient, ConsoleAiClients } from "../../../console/aiClients/index.ts";
import type { ConsoleUi } from "./ui.ts";

export function renderAiClient(client: ConsoleAiClient): string {
  return [
    `${client.label}`,
    ...(client.command ? [`  Run:    ${client.command}`] : []),
    `  Config: ${client.configPath}`,
    ...client.config.trimEnd().split("\n").map((line) => `    ${line}`),
    `  ${client.note}`,
  ].join("\n");
}

export function renderAiClients(data: ConsoleAiClients): string {
  return data.clients.map(renderAiClient).join("\n\n");
}

export async function runAiClientsScreen(ui: ConsoleUi): Promise<void> {
  const data = loadConsoleAiClients();
  const picked = await ui.pick("Which AI client?", data.clients.map((client) => ({ value: client.id, label: client.label, hint: client.command ?? client.configPath })));
  const client = data.clients.find((item) => item.id === picked);
  if (client) ui.context.out(renderAiClient(client));
}

export { loadConsoleAiClients };
