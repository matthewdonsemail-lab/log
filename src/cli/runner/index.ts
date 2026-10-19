/**
 * Command registry and dispatcher.
 *
 * Commands are declared once here; usage text is generated from the same list,
 * so a new command cannot ship without documentation.
 */
import { runInspectSession, sendInspectCommand } from "../../camofox/inspect/index.ts";
import { startConnectSession, startProfileSession, startSession } from "../../camofox/session/index.ts";
import { runWorker } from "../../camofox/worker/index.ts";
import { listAccounts } from "../../marketplace/account/index.ts";
import { listListings } from "../../marketplace/listing/index.ts";
import { createTwentyClient } from "../../twenty/graphql/index.ts";
import { accountCommand, accountsCommand } from "../account/index.ts";
import { campaignCommand } from "../campaign/index.ts";
import { loginCommand, logoutCommand, whoamiCommand } from "../auth/index.ts";
import { errorsCommand, graphCommand } from "../errors/index.ts";
import { firefoxCaptureCommand } from "../firefoxCapture/index.ts";
import { launchCommand } from "../launch/index.ts";
import { listingCommand, listingsCommand } from "../listing/index.ts";
import { connectCommand, doctorCommand, scanCommand, statusCommand } from "../live/index.ts";
import { profileCommand } from "../profile/index.ts";
import { flowCommand } from "../flow/index.ts";
import { inspectCommand } from "../inspect/index.ts";
import { proxyCommand } from "../proxy/index.ts";
import { publishCommand } from "../publish/index.ts";
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
  doctorCommand,
  connectCommand,
  profileCommand,
  inspectCommand,
  flowCommand,
  scanCommand,
  statusCommand,
  watchCommand,
  proxyCommand,
  publishCommand,
  campaignCommand,
  errorsCommand,
  graphCommand,
  firefoxCaptureCommand,
  loginCommand,
  logoutCommand,
  whoamiCommand,
];

const ALIASES: Record<string, string> = {
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
    sendInspect: overrides.sendInspect ?? ((current, action, args, timeoutMs, expect) => sendInspectCommand(current, action, args, timeoutMs, 300, expect)),
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
export async function runCli(argv: string[], context?: Partial<CommandContext>): Promise<number> {
  const ctx = createContext(context);
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
