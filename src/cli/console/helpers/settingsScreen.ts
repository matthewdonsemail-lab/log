import { loadConsoleSettings } from "../../../console/settings/index.ts";
import type { ConsoleSettings } from "../../../console/settings/index.ts";
import { renderTable } from "../../runner/helpers/index.ts";
import type { ConsoleUi } from "./ui.ts";
import { BACK } from "./ui.ts";

export function renderSettings(data: ConsoleSettings): string {
  const governors = data.governors.length
    ? renderTable(
        ["Platform", "Account", "Requests", "Writes", "This hour", "Cooldown"],
        data.governors.map((g) => [g.platform, g.account, `${g.requests}/${data.requestsPerDay}`, `${g.writes}/${g.writesPerDay}`, String(g.hourRequests), g.cooldownSeconds ? `${Math.ceil(g.cooldownSeconds / 60)} min` : "-"]),
      )
    : "No account has a governor count yet.";
  return [
    "Paths",
    `  log.db    ${data.paths.database}`,
    `  runs      ${data.paths.runs}`,
    `  accounts  ${data.paths.accounts}`,
    `  settings  ${data.paths.env}`,
    "",
    "Governor (today, per account)",
    governors,
    "",
    `Web console: ${data.webConsole.command} (${data.webConsole.url})`,
  ].join("\n");
}

export async function runSettingsScreen(ui: ConsoleUi): Promise<void> {
  const data = loadConsoleSettings();
  ui.context.out(renderSettings(data));
  const next = await ui.pick("Next", [{ value: "web", label: "Open the web console", hint: data.webConsole.command }, { value: BACK, label: "Back" }]);
  if (next !== "web") return;
  const url = await ui.webUrl();
  if (url) ui.context.out(ui.openUrl(url) ? `Opened ${url} in your browser.` : `Open ${url} in your browser.`);
}

export { loadConsoleSettings };
