import { intro, isCancel, outro, select } from "@clack/prompts";
import { AI_CLIENTS } from "../../console/aiClients/index.ts";
import { EVENT_STATUSES } from "../../console/events/index.ts";
import type { EventStatus } from "../../console/events/index.ts";
import { CONSOLE_SCREENS, DEFAULT_CONSOLE_PORT, LOCAL_NO_TEAM } from "../../console/screens/index.ts";
import type { ConsoleDomain } from "../../console/screens/index.ts";
import { USAGE_DAYS, usageDaysOf } from "../../console/usage/index.ts";
import { serveConsoleWeb } from "../../console/web/index.ts";
import type { ConsoleWebOptions, ConsoleWebServer } from "../../console/web/index.ts";
import { authDeps } from "../auth/index.ts";
import { shouldPrompt } from "../launch/helpers/shouldPrompt.ts";
import type { LaunchTTY } from "../launch/helpers/shouldPrompt.ts";
import { JSON_FLAG, numberOf, parseArgs, parserSpecOf, PLATFORMS } from "../runner/helpers/index.ts";
import type { FlagValue } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput, CommandResult } from "../runner/types.ts";
import {
  loadConsoleAiClients,
  loadConsoleConnections,
  loadConsoleEvents,
  loadConsoleSettings,
  loadConsoleStart,
  loadConsoleUsage,
  renderAiClients,
  renderConnections,
  renderEvents,
  renderSettings,
  renderStart,
  renderUsage,
  runAiClientsScreen,
  runConnectionsScreen,
  runEventsScreen,
  runSettingsScreen,
  runStartScreen,
  runUsageScreen,
} from "./helpers/index.ts";
import type { ConsoleOption, ConsoleUi } from "./helpers/index.ts";

export * from "./helpers/index.ts";

export const CONSOLE_USAGE = [
  "Usage: log console   (an interactive console in this terminal: Start, Connections, Usage, Events, AI clients and Settings, all read on this machine)",
  "       log console --web [--port <n>] [--noOpen]   (serves the web console on 127.0.0.1 in local mode and opens /console/start)",
  "       log console start [--json]",
  "       log console connections [--platform <p>] [--json]",
  "       log console usage [--days <1|7|30>] [--json]",
  "       log console events [--kind <kind>] [--status <recorded|succeeded|failed|unknown>] [--page <n>] [--pageSize <n>] [--json]",
  "       log console aiClients [--client <claudeCode|codex|opencode>] [--json]",
  "       log console settings [--json]",
  "Everything is local: no sign-in, no team. Each screen reads the same src/console loader as the web console's /api/console endpoint.",
].join("\n");

export const CONSOLE_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      effect: "read",
      terminalOnly: "serves the web console on loopback until it is stopped, or opens the interactive console: run it in a terminal",
      summary: "Serve the web console on 127.0.0.1 in local mode and open /console/start, or without --web open the interactive console",
      positionals: [],
      flags: [
        { name: "web", kind: "boolean", description: "Serve the web console on loopback (127.0.0.1)" },
        { name: "port", kind: "integer", min: 0, max: 65535, description: "The port to serve it on" },
        { name: "noOpen", kind: "boolean", description: "Serve it without opening a browser" },
        JSON_FLAG,
      ],
    },
    { words: ["start"], effect: "read", summary: "Whether log.db is here and the MCP is running, how many accounts there are and when the last event came in", positionals: [], flags: [JSON_FLAG] },
    { words: ["connections"], effect: "read", summary: "Local accounts by platform with their session state", positionals: [], flags: [{ name: "platform", kind: "enum", values: PLATFORMS, description: "Only this platform's accounts" }, JSON_FLAG] },
    { words: ["usage"], effect: "read", summary: "Calls by kind over 1, 7 or 30 days, from platform reads and actions to decisions and media", positionals: [], flags: [{ name: "days", kind: "enum", values: USAGE_DAYS.map(String), description: "How many days back (default 7)" }, JSON_FLAG] },
    {
      words: ["events"],
      effect: "read",
      summary: "The newest log.db events and inference calls, filtered by kind and status, a page at a time",
      positionals: [],
      flags: [
        { name: "kind", kind: "string", description: "Only this kind, e.g. Message received or Inference call" },
        { name: "status", kind: "enum", values: EVENT_STATUSES, description: "Only this status" },
        { name: "page", kind: "integer", min: 0, description: "Which page, from 0" },
        { name: "pageSize", kind: "integer", min: 1, description: "Events per page (default 12, at most 1000)" },
        JSON_FLAG,
      ],
    },
    { words: ["aiClients"], effect: "read", summary: "The MCP config for this machine for Claude Code, Codex or opencode", positionals: [], flags: [{ name: "client", kind: "enum", values: AI_CLIENTS, description: "Only this client" }, JSON_FLAG] },
    { words: ["settings"], effect: "read", summary: "Where log.db, runs, accounts and settings live, each account's governor today and the web console's address", positionals: [], flags: [JSON_FLAG] },
  ],
};

const SUBCOMMANDS: readonly ConsoleDomain[] = CONSOLE_SCREENS.map((screen) => screen.domain);
const TEAMS = "teams";
const WEB = "web";
const QUIT = "quit";

export const consoleDeps: {
  select: (options: Parameters<typeof select>[0]) => Promise<unknown>;
  intro: (title: string) => void;
  outro: (message?: string) => void;
  tty: () => LaunchTTY;
  openUrl: (url: string) => boolean;
  serve: (options: ConsoleWebOptions) => ConsoleWebServer;
  wait: () => Promise<void>;
} = {
  select: (options) => select(options),
  intro,
  outro,
  tty: () => ({ stdinTTY: process.stdin?.isTTY, stdoutTTY: process.stdout?.isTTY }),
  openUrl: (url) => authDeps.openBrowser(url),
  serve: (options) => serveConsoleWeb(options),
  wait: () => new Promise<void>(() => {}),
};

const SCREEN_RUNS: Readonly<Record<ConsoleDomain, (ui: ConsoleUi) => Promise<void>>> = {
  start: runStartScreen,
  connections: runConnectionsScreen,
  usage: runUsageScreen,
  events: runEventsScreen,
  aiClients: runAiClientsScreen,
  settings: runSettingsScreen,
};

function json(value: unknown): CommandResult {
  return { code: 0, stdout: JSON.stringify(value, null, 2) };
}

export function runScreenCommand(domain: ConsoleDomain, parsed: { flags: Record<string, string | true>; values: Record<string, FlagValue> }): CommandResult {
  const { flags } = parsed;
  const asJson = flags["json"] === true;
  const text = (name: string) => (typeof flags[name] === "string" ? String(flags[name]).trim() : undefined);
  if (domain === "start") {
    const data = loadConsoleStart();
    return asJson ? json(data) : { code: 0, stdout: renderStart(data) };
  }
  if (domain === "connections") {
    const platform = text("platform");
    if (platform && !(PLATFORMS as readonly string[]).includes(platform)) return { code: 1, stderr: `log console connections: --platform is one of ${PLATFORMS.join(", ")}` };
    const data = loadConsoleConnections({ platform });
    return asJson ? json(data) : { code: 0, stdout: renderConnections(data) };
  }
  if (domain === "usage") {
    const days = usageDaysOf(text("days") ?? "7");
    if (!days) return { code: 1, stderr: `log console usage: --days is one of ${USAGE_DAYS.join(", ")}` };
    const data = loadConsoleUsage(days);
    return asJson ? json(data) : { code: 0, stdout: renderUsage(data, days) };
  }
  if (domain === "events") {
    const status = text("status");
    if (status && !(EVENT_STATUSES as readonly string[]).includes(status)) return { code: 1, stderr: `log console events: --status is one of ${EVENT_STATUSES.join(", ")}` };
    const page = numberOf(parsed, "page");
    const pageSize = numberOf(parsed, "pageSize");
    const filter = { kind: text("kind"), status: status as EventStatus | undefined, page, pageSize };
    const data = loadConsoleEvents(filter);
    return asJson ? json(data) : { code: 0, stdout: renderEvents(data, filter) };
  }
  if (domain === "aiClients") {
    const client = text("client");
    if (client && !(AI_CLIENTS as readonly string[]).includes(client)) return { code: 1, stderr: `log console aiClients: --client is one of ${AI_CLIENTS.join(", ")}` };
    const data = loadConsoleAiClients({ client });
    return asJson ? json(data) : { code: 0, stdout: renderAiClients(data) };
  }
  const data = loadConsoleSettings();
  return asJson ? json(data) : { code: 0, stdout: renderSettings(data) };
}

function startWeb(context: CommandContext, port: number | undefined): ConsoleWebServer | null {
  try {
    return consoleDeps.serve({ port: port ?? DEFAULT_CONSOLE_PORT });
  } catch (error) {
    context.err(`log console --web: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

export async function runConsoleWeb(context: CommandContext, options: { port?: number; open: boolean }): Promise<CommandResult> {
  const server = startWeb(context, options.port);
  if (!server) return { code: 1 };
  const url = `${server.url}/console/start`;
  context.out(`log console --web: serving the web console in local mode at ${url} (loopback only, no sign-in). Ctrl+C stops it.`);
  if (options.open) context.out(consoleDeps.openUrl(url) ? `Opened ${url} in your browser.` : `Couldn't open a browser. Open ${url} yourself.`);
  try {
    await consoleDeps.wait();
  } finally {
    server.stop();
  }
  return { code: 0 };
}

function menuUi(context: CommandContext): ConsoleUi {
  let server: ConsoleWebServer | null = null;
  return {
    context,
    async pick(message: string, options: ConsoleOption[]) {
      const value = await consoleDeps.select({ message, options });
      return isCancel(value) || typeof value !== "string" ? null : value;
    },
    openUrl: (url) => consoleDeps.openUrl(url),
    async webUrl() {
      server ??= startWeb(context, undefined);
      return server ? `${server.url}/console/start` : null;
    },
  };
}

export async function runConsoleMenu(context: CommandContext): Promise<CommandResult> {
  const ui = menuUi(context);
  for (;;) {
    const choice = await ui.pick("Console: what do you want to see?", [
      ...CONSOLE_SCREENS.map((screen) => ({ value: screen.domain, label: screen.label, hint: screen.summary })),
      { value: TEAMS, label: "Teams and billing", hint: "local" },
      { value: WEB, label: "Open the web console", hint: "log console --web" },
      { value: QUIT, label: "Quit" },
    ]);
    if (choice === null || choice === QUIT) return { code: 0 };
    if (choice === TEAMS) context.out(LOCAL_NO_TEAM);
    else if (choice === WEB) {
      const url = await ui.webUrl();
      if (url) context.out(ui.openUrl(url) ? `Opened ${url} in your browser. It keeps serving while this console is open.` : `Open ${url} in your browser. It keeps serving while this console is open.`);
    } else await SCREEN_RUNS[choice as ConsoleDomain](ui);
  }
}

export async function runConsole(context: CommandContext, argv: string[]): Promise<CommandResult> {
  const parsed = parseArgs(argv, parserSpecOf(CONSOLE_INPUT));
  if (!parsed.ok) return { code: 1, stderr: `log console: ${parsed.error}\n${CONSOLE_USAGE}` };
  const [sub, ...rest] = parsed.positionals;
  if (rest.length) return { code: 1, stderr: `log console: unexpected argument "${rest[0]}"\n${CONSOLE_USAGE}` };
  if (sub !== undefined) {
    if (!(SUBCOMMANDS as readonly string[]).includes(sub)) return { code: 1, stderr: `log console: pick one of ${SUBCOMMANDS.join(", ")}\n${CONSOLE_USAGE}` };
    if (parsed.flags["web"]) return { code: 1, stderr: `log console: --web goes on its own: log console --web\n${CONSOLE_USAGE}` };
    try {
      return runScreenCommand(sub as ConsoleDomain, parsed);
    } catch (error) {
      return { code: 2, stderr: `log console ${sub}: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
  if (parsed.flags["web"]) {
    const port = numberOf(parsed, "port");
    return runConsoleWeb(context, { port, open: parsed.flags["noOpen"] !== true });
  }
  if (parsed.flags["json"]) return json({ ok: true, interactive: false, screens: CONSOLE_SCREENS, hint: "Run `log console <screen> --json` for a screen's data, or `log console` in a terminal." });
  if (!shouldPrompt(false, consoleDeps.tty())) return { code: 2, stderr: `log console: the interactive console needs a terminal. Use a screen instead: log console <${SUBCOMMANDS.join("|")}> [--json], or log console --web.\n${CONSOLE_USAGE}` };
  consoleDeps.intro("log console");
  const result = await runConsoleMenu(context);
  if (result.code === 0) consoleDeps.outro("Done.");
  return result;
}

export const consoleCommand: Command = {
  usage: CONSOLE_USAGE,
  platform: "any",
  name: "console",
  effect: "read",
  input: CONSOLE_INPUT,
  summary: "The local console: this machine's status, accounts, usage, events, AI client config and settings, as an interactive terminal console, as JSON per screen, or as the web console served on loopback (--web)",
  args: "[start|connections|usage|events|aiClients|settings] [--json] | --web [--port <n>] [--noOpen]",
  run: runConsole,
};
