/** Usage text, generated from the command registry so it cannot drift. */
import type { Command } from "../types.ts";

const NOTES = [
  "Accounts and listings come from Twenty (socialAccounts, agencyListings). No browser opens without the account's proxy in its home country.",
  "Every command takes --json for machine-readable output and never prompts.",
];

export function renderUsage(commands: Command[], binary = "log"): string {
  const lines: string[] = [`${binary} — Facebook Marketplace listings from the command line`, "", "Usage"];
  const invocations = commands.map((command) => `  ${binary} ${command.name}${command.args ? ` ${command.args}` : ""}`);
  const width = Math.max(...invocations.map((line) => line.length)) + 2;
  commands.forEach((command, i) => lines.push(invocations[i].padEnd(width) + command.summary));
  lines.push("", "Notes");
  for (const note of NOTES) lines.push(`  - ${note}`);
  return lines.join("\n");
}
