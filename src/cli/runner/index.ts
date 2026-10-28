import { readGroupDirect } from "../read/helpers/directApi.ts";
import { chatCommand, dmCommand, dmsCommand, followersCommand, followsCommand, likeCommand, queueCommand, quoteCommand, replyCommand, sessionCommand, voiceCommand } from "../twitter/index.ts";
import { runTwitterEngine, runTwitterEngineLive } from "../../twitter/account/session/index.ts";
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
import { checkCommand } from "../check/index.ts";
import { launchCommand } from "../launch/index.ts";
import { lifecycleCommand } from "../lifecycle/index.ts";
import { preflightCommand } from "../preflight/index.ts";
import { listingCommand, listingsCommand } from "../listing/index.ts";
import { connectCommand, doctorCommand, scanCommand, statusCommand } from "../live/index.ts";
import { profileCommand } from "../profile/index.ts";
import { flowCommand } from "../flow/index.ts";
import { hostCommand } from "../host/index.ts";
import { inspectCommand } from "../inspect/index.ts";
import { joinCommand } from "../join/index.ts";
import { messengerCommand } from "../messenger/index.ts";
import { searchCommand } from "../search/index.ts";
import { pollCommand } from "../poll/index.ts";
import { proxyCommand } from "../proxy/index.ts";
import { readCommand } from "../read/index.ts";
import { runsCommand } from "../runs/index.ts";
import { browsersCommand } from "../browsers/index.ts";
import { jobCommand } from "../job/index.ts";
import { mcpCommand } from "../mcp/index.ts";
import { newCommand } from "../new/index.ts";
import { publishCommand } from "../publish/index.ts";
import { warmupCommand } from "../warmup/index.ts";
import { watchCommand } from "../watch/index.ts";
import { isPlatform, renderUsage, resolvePlatformForm } from "./helpers/index.ts";
import type { Command, CommandContext } from "./types.ts";
import { redditSessionCommand } from "../reddit/index.ts";
import { runRedditEngine } from "../../reddit/account/session/index.ts";
import { discordSessionCommand } from "../discord/index.ts";
import { runDiscordEngine } from "../../discord/account/session/index.ts";

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
  preflightCommand,
  doctorCommand,
  connectCommand,
  profileCommand,
  hostCommand,
  inspectCommand,
  flowCommand,
  warmupCommand,
  joinCommand,
  readCommand,
  pollCommand,
  checkCommand,
  scanCommand,
  statusCommand,
  watchCommand,
  proxyCommand,
  publishCommand,
  campaignCommand,
  conversationsCommand,
  conversationCommand,
  messengerCommand,
  errorsCommand,
  graphCommand,
  captureCommand,
  runsCommand,
  browsersCommand,
  jobCommand,
  mcpCommand,
  loginCommand,
  logoutCommand,
  whoamiCommand,
  sessionCommand,
  followsCommand,
  dmsCommand,
  chatCommand,
  voiceCommand,
  searchCommand,
  followersCommand,
  replyCommand,
  quoteCommand,
  likeCommand,
  dmCommand,
  queueCommand,
  newCommand,
  redditSessionCommand,
  discordSessionCommand,
];

const ALIASES: Record<string, string> = {
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

  const form = resolvePlatformForm([requested, ...rest], (name, platform) => COMMANDS.find((c) => c.name === (ALIASES[name] ?? name) && (!platform || c.platform === platform || !isPlatform(c.platform))) ?? COMMANDS.find((c) => c.name === (ALIASES[name] ?? name)));
  if (!form.ok) {
    ctx.err(form.error);
    return 1;
  }
  if (!form.command) {
    ctx.err(`Unknown command: ${first}\n`);
    ctx.err(renderUsage(COMMANDS));
    return 2;
  }
  const command = form.command;

  const result = await command.run(ctx, form.argv);
  if (result.stdout) ctx.out(result.stdout);
  if (result.stderr) ctx.err(result.stderr);
  return result.code;
}
