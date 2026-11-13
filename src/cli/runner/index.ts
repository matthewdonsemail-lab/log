import { chatCommand, cookiesCommand, dmCommand, dmsCommand, followersCommand, followCommand, followsCommand, likeCommand, listCommand, notificationsCommand, postCommand, repostCommand, queueCommand, quoteCommand, replyCommand, sessionCommand, voiceCommand } from "../twitter/index.ts";
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
import { consoleCommand } from "../console/index.ts";
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
import { runtimeCommand } from "../runtime/index.ts";
import { memelordCommand } from "../memelord/index.ts";
import { tregCommand } from "../treg/index.ts";
import { balanceCommand } from "../balance/index.ts";
import { governorCommand } from "../governor/index.ts";
import { sessionsCommand } from "../sessions/index.ts";
import { cloneCommand } from "../clone/index.ts";
import { discordVoiceCommand, instagramVoiceCommand, slackVoiceCommand, twitterVoiceCommand } from "../voiceNote/index.ts";
import { transcribeCommand } from "../transcribe/index.ts";
import { pollCommand } from "../poll/index.ts";
import { proxyCommand } from "../proxy/index.ts";
import { readCommand } from "../read/index.ts";
import { runsCommand } from "../runs/index.ts";
import { storageCommand } from "../storage/index.ts";
import { timingCommand } from "../timing/index.ts";
import { inboxCommand } from "../inbox/index.ts";
import { mediaCommand } from "../media/index.ts";
import { browsersCommand } from "../browsers/index.ts";
import { browserCommand } from "../browser/index.ts";
import { reportCommand } from "../report/index.ts";
import { jobCommand } from "../job/index.ts";
import { mcpCommand } from "../mcp/index.ts";
import { newCommand } from "../new/index.ts";
import { publishCommand } from "../publish/index.ts";
import { warmupCommand } from "../warmup/index.ts";
import { watchCommand } from "../watch/index.ts";
import { dispatchWith, runWith } from "./client.ts";
import type { Command, CommandContext } from "./types.ts";
import { redditPostCommand, redditReadCommand, redditReplyCommand, redditSessionCommand, redditVoteCommand } from "../reddit/index.ts";
import { discordChannelsCommand, discordChatsCommand, discordDeleteCommand, discordPostsCommand, discordReadCommand, discordSearchCommand, discordSendCommand, discordServersCommand, discordSessionCommand, discordWatchCommand } from "../discord/index.ts";
import { linkedinCookiesCommand, linkedinSessionCommand } from "../linkedin/index.ts";
import { slackChatsCommand, slackCookiesCommand, slackReadCommand, slackSendCommand, slackSessionCommand, slackWatchCommand, slackWorkspacesCommand } from "../slack/index.ts";
import { instagramDmsCommand, instagramSendCommand, instagramSessionCommand, instagramWatchCommand } from "../instagram/index.ts";
import { discordReactCommand, instagramReactCommand, slackReactCommand, twitterReactCommand } from "../react/index.ts";

export * from "./helpers/index.ts";
export { ALIASES, createContext, defaultSendInspect, runFast, takeProxyMs } from "./client.ts";
export type { Command, CommandContext, CommandResult, MarketplaceData } from "./types.ts";

export const COMMANDS: Command[] = [
  launchCommand,
  consoleCommand,
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
  storageCommand,
  timingCommand,
  inboxCommand,
  mediaCommand,
  browsersCommand,
  browserCommand,
  reportCommand,
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
  runtimeCommand,
  memelordCommand,
  tregCommand,
  balanceCommand,
  governorCommand,
  sessionsCommand,
  cloneCommand,
  transcribeCommand,
  followersCommand,
  notificationsCommand,
  replyCommand,
  quoteCommand,
  postCommand,
  likeCommand,
  listCommand,
  repostCommand,
  followCommand,
  dmCommand,
  twitterReactCommand,
  queueCommand,
  newCommand,
  redditSessionCommand,
  redditReadCommand,
  redditPostCommand,
  redditReplyCommand,
  redditVoteCommand,
  discordSessionCommand,
  discordChatsCommand,
  discordServersCommand,
  discordChannelsCommand,
  discordPostsCommand,
  discordSearchCommand,
  discordReadCommand,
  discordWatchCommand,
  discordSendCommand,
  discordDeleteCommand,
  discordReactCommand,
  discordVoiceCommand,
  linkedinSessionCommand,
  linkedinCookiesCommand,
  slackSessionCommand,
  slackWorkspacesCommand,
  slackChatsCommand,
  slackReadCommand,
  slackWatchCommand,
  slackSendCommand,
  slackCookiesCommand,
  slackReactCommand,
  slackVoiceCommand,
  instagramSessionCommand,
  instagramDmsCommand,
  instagramSendCommand,
  instagramWatchCommand,
  instagramReactCommand,
  instagramVoiceCommand,
  twitterVoiceCommand,
];

export async function runCli(argv: string[], context?: Partial<CommandContext>): Promise<number> {
  return runWith(argv, context, (ctx, rest) => dispatchWith(ctx, rest, COMMANDS));
}
