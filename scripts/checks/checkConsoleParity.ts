import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CONSOLE_SCREENS } from "../../src/console/screens/index.ts";
import type { ConsoleScreen } from "../../src/console/screens/index.ts";
import { CONSOLE_OPERATIONS, CONSOLE_TWINS, RUNTIME_TWINS } from "../../src/console/operations/index.ts";
import type { ConsoleTwin } from "../../src/console/operations/index.ts";
import { formToolName } from "../../src/cli/runner/helpers/commandInput.ts";
import type { Command } from "../../src/cli/runner/types.ts";
import { commandTools } from "../../src/mcp/server/helpers/toolsFromCommands.ts";

export interface NavEntry {
  to: string;
  label: string;
}

export interface ParityFiles {
  read: (rel: string) => string | null;
}

const WEB = "site/apps/web/src";

export function navOf(layout: string): NavEntry[] {
  const block = /const NAV[^=]*=\s*\[([\s\S]*?)\n\]/.exec(layout)?.[1] ?? "";
  return [...block.matchAll(/\{\s*to:\s*'([^']+)',\s*label:\s*'([^']+)'/g)].map((match) => ({ to: match[1], label: match[2] }));
}

export function pageFileOf(app: string, route: string): string | null {
  const escaped = route.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  const element = new RegExp(`<Route path="${escaped}" element=\\{[^\\n]*?<(\\w+)`).exec(app)?.[1];
  if (!element) return null;
  const from = new RegExp(`import \\{[^}]*\\b${element}\\b[^}]*\\} from '\\./([^']+)'`).exec(app)?.[1];
  return from ? `${WEB}/${from}.tsx` : null;
}

function localImports(rel: string, text: string): string[] {
  return [...text.matchAll(/from '\.\/([\w]+)'/g)].map((match) => `${dirname(rel)}/${match[1]}`);
}

function webReads(files: ParityFiles, page: string, api: string): boolean {
  const text = files.read(page);
  if (text === null) return false;
  if (text.includes(`'${api}`) || text.includes(`\`${api}`)) return true;
  return localImports(page, text).some((base) => [".ts", ".tsx"].some((ext) => {
    const imported = files.read(`${base}${ext}`);
    return imported !== null && (imported.includes(`'${api}`) || imported.includes(`\`${api}`));
  }));
}

function importsLoader(text: string | null, prefix: string, domain: string): boolean {
  return text !== null && text.includes(`from "${prefix}${domain}/index.ts"`);
}

export function consoleParityProblems(files: ParityFiles, screens: readonly ConsoleScreen[] = CONSOLE_SCREENS): string[] {
  const problems: string[] = [];
  const layout = files.read(`${WEB}/pages/console/ConsoleLayout.tsx`);
  const app = files.read(`${WEB}/App.tsx`);
  if (layout === null || app === null) return [`${WEB}/pages/console/ConsoleLayout.tsx or ${WEB}/App.tsx is missing`];
  const nav = navOf(layout);
  if (!nav.length) problems.push("ConsoleLayout.tsx has no NAV entries the check can read");
  const navText = nav.map((entry) => `${entry.label} ${entry.to}`).join(", ");
  const screenText = screens.map((screen) => `${screen.label} ${screen.route}`).join(", ");
  if (navText !== screenText) problems.push(`the web NAV (${navText}) and CONSOLE_SCREENS in src/console/screens (${screenText}) differ: every web page needs its clack screen, in the same order`);
  const api = files.read("src/console/web/helpers/api.ts");
  const command = files.read("src/cli/console/index.ts");
  for (const screen of screens) {
    if (files.read(`src/console/${screen.domain}/index.ts`) === null) problems.push(`src/console/${screen.domain}/index.ts is missing: ${screen.label}'s loader`);
    const clack = `src/cli/console/helpers/${screen.domain}Screen.ts`;
    const clackText = files.read(clack);
    if (clackText === null) problems.push(`${clack} is missing: ${screen.label} has no clack screen`);
    else if (!importsLoader(clackText, "../../../console/", screen.domain)) problems.push(`${clack} doesn't read src/console/${screen.domain}: the clack screen must use the same loader as the web page`);
    if (command === null || !new RegExp(`\\b${screen.domain}: run\\w+Screen\\b`).test(command)) problems.push(`src/cli/console/index.ts doesn't open ${screen.label}'s clack screen from its menu`);
    if (!importsLoader(api, "../../", screen.domain)) problems.push(`src/console/web/helpers/api.ts doesn't answer ${screen.api} from src/console/${screen.domain}`);
    const page = pageFileOf(app, screen.route);
    if (!page) problems.push(`App.tsx has no page for ${screen.route}`);
    else if (!webReads(files, page, screen.api)) problems.push(`${page} (or a ./data module it imports) doesn't fetch ${screen.api}: the web page must read the same loader as the clack screen`);
  }
  return problems;
}

export function commandToolNames(commands: readonly Command[]): Map<string, { terminalOnly: boolean }> {
  const names = new Map<string, { terminalOnly: boolean }>(commandTools(commands).map((entry) => [entry.tool, { terminalOnly: false }]));
  for (const command of commands) for (const form of command.input?.forms ?? []) if (form.terminalOnly && !names.has(formToolName(command, form))) names.set(formToolName(command, form), { terminalOnly: true });
  return names;
}

export function consoleTwinProblems(operations: readonly string[], twins: Readonly<Record<string, ConsoleTwin>>, tools: ReadonlyMap<string, unknown>, appTools: ReadonlySet<string>, where = "CONSOLE_TWINS"): string[] {
  const problems: string[] = [];
  for (const operation of operations) {
    const twin = twins[operation];
    if (!twin || (!twin.commands.length && !twin.app?.length)) {
      problems.push(`${operation} has no twin in ${where} (src/console/operations/types.ts): make it a command, or name the command it calls, so the CLI and the MCP reach it too`);
      continue;
    }
    for (const name of twin.commands) if (!tools.has(name)) problems.push(`${where}.${operation} names ${name}, which no command form in COMMANDS is`);
    for (const name of twin.app ?? []) if (!appTools.has(name)) problems.push(`${where}.${operation} names ${name}, which no MCP App tool is`);
  }
  for (const operation of Object.keys(twins)) if (!operations.includes(operation)) problems.push(`${where} has ${operation}, which is not an operation`);
  return problems;
}

if (import.meta.main) {
  const root = join(import.meta.dir, "..", "..");
  const files: ParityFiles = { read: (rel) => (existsSync(join(root, rel)) ? readFileSync(join(root, rel), "utf8").replace(/\r\n/g, "\n") : null) };
  const [{ COMMANDS }, { appTools }] = await Promise.all([import("../../src/cli/runner/index.ts"), import("../../src/mcp/apps/browserView/index.ts")]);
  const tools = commandToolNames(COMMANDS);
  const apps = new Set(appTools().map((tool) => tool.name));
  const problems = [...consoleParityProblems(files), ...consoleTwinProblems(CONSOLE_OPERATIONS, CONSOLE_TWINS, tools, apps), ...consoleTwinProblems(Object.keys(RUNTIME_TWINS), RUNTIME_TWINS, tools, apps, "RUNTIME_TWINS")];
  if (problems.length) {
    console.error(`Console parity:\n${problems.map((problem) => `  - ${problem}`).join("\n")}`);
    process.exit(1);
  }
  console.log(`consoleParity: ${CONSOLE_SCREENS.length} web console pages each have a clack screen, and both read the same src/console loader; ${CONSOLE_OPERATIONS.length} console operations and ${Object.keys(RUNTIME_TWINS).length} runtime tool each have a command twin (or an MCP App twin).`);
}
