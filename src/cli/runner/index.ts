/**
 * Command registry and dispatcher.
 *
 * Commands are declared once here; usage text is generated from the same list,
 * so a new command cannot ship without documentation.
 */
import { runInspectSession, sendInspectCommand } from "../../browser/inspect/index.ts";
import { startConnectSession, startProfileSession, startSession } from "../../camofox/session/index.ts";
import { runWorker } from "../../camofox/worker/index.ts";
import { listAccounts } from "../../marketplace/account/index.ts";
import { listListings } from "../../marketplace/listing/index.ts";
import { createTwentyClient } from "../../twenty/graphql/index.ts";
import { accountCommand, accountsCommand } from "../account/index.ts";
import { adsPowerCommand } from "../adsPower/index.ts";
import { campaignCommand } from "../campaign/index.ts";
import { conversationCommand, conversationsCommand } from "../conversation/index.ts";
import { loginCommand, logoutCommand, whoamiCommand } from "../auth/index.ts";
import { errorsCommand, graphCommand } from "../errors/index.ts";
import { captureCommand } from "../capture/index.ts";
import { launchCommand } from "../launch/index.ts";
import { lifecycleCommand } from "../lifecycle/index.ts";
import { listingCommand, listingsCommand } from "../listing/index.ts";
import { connectCommand, doctorCommand, scanCommand, statusCommand } from "../live/index.ts";
import { profileCommand } from "../profile/index.ts";
import { flowCommand } from "../flow/index.ts";
import { hostCommand } from "../host/index.ts";
import { inspectCommand } from "../inspect/index.ts";
import { joinCommand } from "../join/index.ts";
import { proxyCommand } from "../proxy/index.ts";
import { publishCommand } from "../publish/index.ts";
import { warmupCommand } from "../warmup/index.ts";
import { watchCommand } from "../watch/index.ts";
import { renderUsage } from "./helpers/index.ts";
import type { Command, CommandContext } from "./types.ts";

export * from "./helpers/index.ts";
export type { Command, CommandContext, CommandResult, MarketplaceData } from "./types.ts";

export const COMMANDS: Command[] = [
  launchCommand,
  listingsCommand,
  listingCommand,
  accountsCommand,
  accountCommand,
  adsPowerCommand,
  lifecycleCommand,
  doctorCommand,
  connectCommand,
  profileCommand,
  hostCommand,
  inspectCommand,
  flowCommand,
  warmupCommand,
  joinCommand,
  scanCommand,
  statusCommand,
  watchCommand,
  proxyCommand,
  publishCommand,
  campaignCommand,
  conversationsCommand,
  conversationCommand,
  errorsCommand,
  graphCommand,
  captureCommand,
  loginCommand,
  logoutCommand,
  whoamiCommand,
];

const ALIASES: Record<string, string> = {
  // rule 46: the old browser-named command, for a settle already running in the background and older MCP clients.
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
    sendInspect: overrides.sendInspect ?? ((current, action, args, timeoutMs, expect, options) => sendInspectCommand(current, action, args, timeoutMs, 50, expect, options)),
    adsPower: overrides.adsPower,
    connectTiming: overrides.connectTiming,
    out: overrides.out ?? ((line) => console.log(line)),
    err: overrides.err ?? ((line) => console.error(line)),
    now: overrides.now ?? (() => new Date()),
  };
}

/**
 * Run one CLI invocation and return its exit code.
 *
 * Never throws for an unknown command: it reports and returns a non-zero code
 * so the binary can stay a thin wrapper.
 */
/**
 * `--proxyMs <ms>` on any command (rule 33): this run's limit for the proxy's speed to Facebook
 * (default 2500 ms), set as LOG_PROXY_MAX_MS for the run and its Python, then restored.
 */
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

export async function runCli(argv: string[], context?: Partial<CommandContext>): Promise<number> {
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

async function dispatch(ctx: CommandContext, argv: string[]): Promise<number> {
  const [first, ...rest] = argv;
  const requested = first === undefined ? "help" : (ALIASES[first] ?? first);
  if (requested === "help") {
    ctx.out(renderUsage(COMMANDS));
    return 0;
  }

  const command = COMMANDS.find((c) => c.name === requested);
  if (!command) {
    ctx.err(`Unknown command: ${first}\n`);
    ctx.err(renderUsage(COMMANDS));
    return 2;
  }

  const result = await command.run(ctx, rest);
  if (result.stdout) ctx.out(result.stdout);
  if (result.stderr) ctx.err(result.stderr);
  return result.code;
}
