import { readGroupDirect } from "../read/helpers/directApi.ts";
import { runTwitterEngine, runTwitterEngineLive } from "../../twitter/account/session/index.ts";
import { runInspectSession, sendInspectCommand } from "../../browser/inspect/index.ts";
import { startConnectSession, startProfileSession, startSession } from "../../camofox/session/index.ts";
import { runWorker } from "../../camofox/worker/index.ts";
import { listAccounts } from "../../marketplace/account/index.ts";
import { listListings } from "../../marketplace/listing/index.ts";
import { createTwentyClient } from "../../twenty/graphql/index.ts";
import { runRedditEngine } from "../../reddit/account/session/index.ts";
import { runDiscordEngine, runDiscordEngineLive } from "../../discord/account/session/index.ts";
import { isPlatform, renderUsage, resolvePlatformForm } from "./helpers/index.ts";
import { COMMAND_INDEX } from "./helpers/commandIndex.ts";
import type { CommandIndexEntry } from "./helpers/commandIndex.ts";
import type { Command, CommandContext } from "./types.ts";
import { runLinkedinEngine } from "../../linkedin/account/session/index.ts";

export const ALIASES: Record<string, string> = {
  firefoxCapture: "capture",
  "--help": "help",
  "-h": "help",
  help: "help",
};

export function createContext(overrides: Partial<CommandContext> = {}): CommandContext {
  return {
    load: overrides.load ?? (() => ({ listings: listListings(), accounts: listAccounts() })),
    twenty: overrides.twenty ?? createTwentyClient(),
    worker: overrides.worker ?? runWorker,
    session: overrides.session ?? startSession,
    connectSession: overrides.connectSession ?? startConnectSession,
    profileSession: overrides.profileSession ?? startProfileSession,
    inspectSession: overrides.inspectSession ?? runInspectSession,
    sendInspect: overrides.sendInspect ?? defaultSendInspect,
    adsPower: overrides.adsPower,
    decisions: overrides.decisions,
    connectTiming: overrides.connectTiming,
    out: overrides.out ?? ((line) => console.log(line)),
    err: overrides.err ?? ((line) => console.error(line)),
    now: overrides.now ?? (() => new Date()),
    sleep: overrides.sleep,
    cancelled: overrides.cancelled,
    directRead: overrides.directRead ?? readGroupDirect,
    directTwitter: overrides.directTwitter ?? runTwitterEngine,
    directTwitterLive: overrides.directTwitterLive ?? runTwitterEngineLive,
    directReddit: overrides.directReddit ?? runRedditEngine,
    directDiscord: overrides.directDiscord ?? runDiscordEngine,
    directDiscordLive: overrides.directDiscordLive ?? runDiscordEngineLive,
    directLinkedin: overrides.directLinkedin ?? runLinkedinEngine,
  };
}

export function takeProxyMs(argv: string[]): { argv: string[]; proxyMs: number | null; error: string | null } {
  const rest: string[] = [];
  let proxyMs: number | null = null;
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    const value = token === "--proxyMs" ? argv[++i] : token.startsWith("--proxyMs=") ? token.slice(10) : null;
    if (value === null) {
      rest.push(token);
      continue;
    }
    const ms = Number(value);
    if (!Number.isInteger(ms) || ms < 500 || ms > 60_000) return { argv, proxyMs: null, error: "--proxyMs must be 500 to 60000 ms" };
    proxyMs = ms;
  }
  return { argv: rest, proxyMs, error: null };
}

export const defaultSendInspect: CommandContext["sendInspect"] = (current, action, args, timeoutMs, expect, options) => sendInspectCommand(current, action, args, timeoutMs, 50, expect, options);

export async function runWith(argv: string[], context: Partial<CommandContext> | undefined, dispatch: (ctx: CommandContext, argv: string[]) => Promise<number>): Promise<number> {
  const ctx = createContext(context);
  const proxy = takeProxyMs(argv);
  if (proxy.error) {
    ctx.err(proxy.error);
    return 1;
  }
  if (proxy.proxyMs === null) return dispatch(ctx, proxy.argv);
  const before = process.env.LOG_PROXY_MAX_MS;
  process.env.LOG_PROXY_MAX_MS = String(proxy.proxyMs);
  ctx.err(`Proxy speed limit for this run: ${proxy.proxyMs} ms (--proxyMs).`);
  try {
    return await dispatch(ctx, proxy.argv);
  } finally {
    if (before === undefined) delete process.env.LOG_PROXY_MAX_MS;
    else process.env.LOG_PROXY_MAX_MS = before;
  }
}

function findIn<C extends { name: string; platform: string }>(all: readonly C[]) {
  return (name: string, platform?: string) => all.find((c) => c.name === (ALIASES[name] ?? name) && (!platform || c.platform === platform || !isPlatform(c.platform))) ?? all.find((c) => c.name === (ALIASES[name] ?? name));
}

export async function dispatchWith(ctx: CommandContext, argv: string[], commands: readonly Command[]): Promise<number> {
  const [first, ...rest] = argv;
  const requested = first === undefined ? "help" : (ALIASES[first] ?? first);
  if (requested === "help") {
    ctx.out(renderUsage([...commands]));
    return 0;
  }
  const form = resolvePlatformForm([requested, ...rest], findIn(commands));
  if (!form.ok) {
    ctx.err(form.error);
    return 1;
  }
  if (!form.command) {
    ctx.err(`Unknown command: ${first}
`);
    ctx.err(renderUsage([...commands]));
    return 2;
  }
  return runOne(ctx, form.command, form.argv);
}

async function runOne(ctx: CommandContext, command: Command, argv: string[]): Promise<number> {
  const result = await command.run(ctx, argv);
  if (result.stdout) ctx.out(result.stdout);
  if (result.stderr) ctx.err(result.stderr);
  return result.code;
}

export async function loadIndexed(entry: CommandIndexEntry): Promise<Command | undefined> {
  const loaded = (await import(`../../../${entry.module}`)) as Record<string, unknown>;
  return loaded[entry.exportName] as Command | undefined;
}

export async function runFast(argv: string[], context?: Partial<CommandContext>, full: () => Promise<(argv: string[], context?: Partial<CommandContext>) => Promise<number>> = async () => (await import("./index.ts")).runCli): Promise<number> {
  const [first, ...rest] = takeProxyMs(argv).argv;
  const requested = first === undefined ? "help" : (ALIASES[first] ?? first);
  const form = requested === "help" ? null : resolvePlatformForm([requested, ...rest], findIn(COMMAND_INDEX));
  const entry = form?.ok && form.command ? form.command : null;
  const command = entry ? await loadIndexed(entry) : undefined;
  if (!entry || !command || command.name !== entry.name) return (await full())(argv, context);
  return runWith(argv, context, (ctx, args) => {
    const again = resolvePlatformForm([ALIASES[args[0]] ?? args[0], ...args.slice(1)], findIn([command]));
    return again.ok && again.command ? runOne(ctx, again.command, again.argv) : dispatchWith(ctx, args, [command]);
  });
}
