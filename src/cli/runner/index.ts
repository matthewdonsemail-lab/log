import { chatCommand, cookiesCommand, dmCommand, dmsCommand, followersCommand, followCommand, followsCommand, likeCommand, postCommand, queueCommand, quoteCommand, replyCommand, sessionCommand, voiceCommand } from "../twitter/index.ts";
import { accountCommand, accountsCommand } from "../account/index.ts";
import { adsPowerCommand } from "../adsPower/index.ts";
import { localAccountCommand } from "../localAccount/index.ts";
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
import { kbCommand } from "../kb/index.ts";
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
import { dispatchWith, runWith } from "./client.ts";
import type { Command, CommandContext } from "./types.ts";
import { redditSessionCommand } from "../reddit/index.ts";
import { discordChatsCommand, discordReadCommand, discordSendCommand, discordSessionCommand, discordWatchCommand } from "../discord/index.ts";

export * from "./helpers/index.ts";
export { ALIASES, createContext, defaultSendInspect, runFast, takeProxyMs } from "./client.ts";
export type { Command, CommandContext, CommandResult, MarketplaceData } from "./types.ts";

export const COMMANDS: Command[] = [
  launchCommand,
  listingsCommand,
  listingCommand,
  accountsCommand,
  accountCommand,
  adsPowerCommand,
  localAccountCommand,
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
  cookiesCommand,
  voiceCommand,
  searchCommand,
  kbCommand,
  followersCommand,
  replyCommand,
  quoteCommand,
  postCommand,
  likeCommand,
  followCommand,
  dmCommand,
  queueCommand,
  newCommand,
  redditSessionCommand,
  discordSessionCommand,
  discordChatsCommand,
  discordReadCommand,
  discordWatchCommand,
  discordSendCommand,
];

export async function runCli(argv: string[], context?: Partial<CommandContext>): Promise<number> {
  return runWith(argv, context, (ctx, rest) => dispatchWith(ctx, rest, COMMANDS));
}
