export const RULES_REVIEWED_THROUGH = 178;

export const AGENTS_URI = "log://agents";

export const CORE_PRINCIPLES = [
  "The Log tools use platform-specific engines and governors, with private records in the selected workspace. Current code still has legacy dependencies; the native hosted target is specified separately (rules 171, 172, 175).",
  "1. Rule one: if we do not know, read the internal calls and their evidence, collate the moment, use the applicable REA/SubQ workflow, report the state and record Point/Evidence/Explain (rule 73).",
  "2. When the owner asks, do it completely within the authorized scope (rule 30).",
  "3. Keep current log.db identity/message/media/jobs/queue structures; add only missing native account/credential and hosted execution contracts (rules 134, 175).",
  "4. Hosted control owns identity, team authorization, grants and minimal routing. Private sessions, content and execution stay in the selected persistent runtime (rule 172).",
  "5. Treg is the control reference. Native V1 uses email OTP/team selection and paired outbound routing. AI-provider login and old listing features are outside current implementation scope (rules 171, 175).",
  "6. Read the relevant guide before platform work. Preserve existing authorization, refusal, governor, browser and session gates (rules 8, 35, 94, 105, 158).",
  "7. Use private DB context, current claims and the account owner before sending. Preserve voice/media checks (rules 109, 133, 137, 138, 160).",
  "8. Stream progress. Verify actual outcomes and reconcile uncertain writes rather than blindly replaying them (rules 25, 26, 172).",
  "9. No unrelated scope/spend; no personal secrets in hosted guidance. History is reference, not current authority (rules 39, 41, 47, 176).",
  "10. Discover commands through logSearch, logGet and logCall; use supported reload behavior (rules 163, 167).",
  "Active instructions are in AGENTS.md (log://agents). Every tool also falls under rules 30, 38, 39, 40 and 41. Platform procedures live in scoped guides/specs; superseded citations resolve to current rules."
].join("\n");

export type InstructionsHost = "local" | "hosted";

const SHARED_INSTRUCTIONS = [
  "1. Rule one: if we don't know, we do this: read internal API evidence, collate the moment, use the applicable REA/SubQ reading, report the state and P.E.E. (rule 73).",
  "2. When the owner asks, do it completely within authorized scope (rule 30).",
  "3. Preserve live authorization, browser/session/governor gates and stop on refusals (rules 8, 35, 94, 105).",
  "4. Read current private context and claims before sends; preserve voice/media checks (rules 109, 133, 137, 138, 160).",
  "5. No added scope/spend; do not raise Meta/Facebook rules unless the owner does (rules 38, 39, 41).",
  "6. Discover exact inputs with logSearch, logGet, logCall (rule 163).",
  "7. To show something, call report (getGuide({ topic: \"ui\" })); MCP Apps hosts draw it inline, others get text.",
];

const STREAM_LINE: Readonly<Record<InstructionsHost, string>> = {
  local: "8. Stream progress: with a shell start a Monitor on its live log, `tail -f ~/.logCli/mcp/<day>.log`. A client without a shell reads each result's `progress` instead (rule 26).",
  hosted: "8. Each result carries its run's `progress` lines; read them as the run goes (rule 26).",
};

const ASK_LINE = "9. With no log prompt hook in this app, pass each request word for word: getGuide({ ask: \"<the owner's words>\" }) routes it, and loads that use case as the play only on a clear match; otherwise it lists the close ones and loads nothing.";

export function serverInstructions(host: InstructionsHost): string {
  return [
    host === "hosted"
      ? "log runs the team's social accounts from its own cloud workspace: every tool runs there, with that workspace's accounts and limits, and nothing is stored by this server. Start with accountsList to see which accounts exist. Tools that post or send are not available over this connection yet."
      : "The Log tools use platform engines, governors and private workspace records; the rules are in AGENTS.md (log://agents).",
    "Load the core guide once per session before other log tools: getGuide({ topic: \"logMcpInstructions\" }). Load a tool's own guide before first using it.",
    ...SHARED_INSTRUCTIONS,
    STREAM_LINE[host],
    ASK_LINE,
  ].join("\n");
}

export const SERVER_INSTRUCTIONS = serverInstructions("local");

export const HOSTED_INSTRUCTIONS_FILE = "python/controlService/serverInstructions.txt";

const SOURCE_COMMAND_RULES: Readonly<Record<string, number[]>> = {
  logSearch: [106, 163],
  logGet: [106, 163],
  logCall: [8, 10, 20, 26, 106, 163],
  facebookJoin: [8, 10, 18, 20, 25, 26, 29, 35, 45, 64, 73],
  facebookRead: [8, 13, 18, 20, 22, 25, 26, 29, 35, 45, 54, 63, 64, 65, 73, 77],
  facebookPoll: [8, 13, 18, 22, 26, 35, 45, 63, 64, 65, 73],
  inspect: [8, 12, 17, 22, 24, 26, 29, 30, 35, 48, 54, 55, 68, 72, 73, 74, 75, 82, 84],
  facebookConnect: [12, 18, 21, 23, 24, 73],
  facebookPublish: [8, 10, 12, 18, 22, 24, 68, 72, 73],
  facebookProfile: [8, 28, 73],
  facebookHost: [18, 35, 73, 79],
  facebookLifecycle: [35],
  facebookPreflight: [12, 18, 24, 33, 35, 37, 79],
  warmup: [8, 18, 20, 25, 26, 29, 32, 35, 36, 49, 50, 51, 54, 55, 60, 64, 73],
  flow: [29, 31, 68, 72, 73, 79],
  facebookScan: [12, 18, 22, 73],
  facebookStatus: [12, 18, 22, 73],
  facebookWatch: [6, 18, 73],
  facebookDoctor: [12],
  proxy: [12, 33, 41, 43, 51, 52],
  adsPower: [42, 44, 78, 84],
  localAccount: [13, 42, 44, 78, 84, 97],
  capture: [19, 22, 26, 27, 46, 48, 85],
  facebookAccount: [13, 37, 78],
  facebookAccounts: [13],
  facebookListing: [13, 71, 72],
  facebookListings: [13],
  facebookCampaign: [13, 18, 71, 72],
  facebookConversation: [34],
  facebookMessenger: [8, 21, 29, 54, 63, 67],
  facebookCheck: [8, 13, 18, 22, 29, 35, 69, 73],
  twitterSession: [13, 21, 26, 63, 64, 73, 80, 81, 104, 105, 113, 150],
  twitterFollows: [13, 53, 63, 64, 73, 80, 81, 104, 105],
  twitterDms: [13, 63, 64, 73, 80, 81, 88, 94, 100, 104, 105, 108, 109, 110, 113, 126],
  twitterChat: [13, 21, 26, 63, 64, 73, 80, 81, 88, 94, 104, 105, 131, 132],
  twitterCookies: [13, 21, 63, 64, 73, 80, 81, 104, 105],
  voice: [30, 39, 41, 63, 64, 98, 112, 127, 149],
  search: [13, 26, 63, 64, 88, 89, 105],
  kb: [13, 26, 30, 93],
  runtime: [26, 73, 171, 172, 175],
  memelord: [41, 94, 119, 120],
  treg: [41, 53, 106, 119, 166],
  governor: [73, 86, 94, 104, 106, 168],
  sessions: [25, 73, 94, 163],
  chats: [89, 154, 160, 163],
  messages: [8, 89, 109, 133, 137, 154, 160, 163],
  watchers: [94, 105, 123, 163],
  voiceNotes: [8, 109, 133, 137, 142, 163],
  console: [47, 55, 134, 163, 168, 172, 177],
  credentials: [41, 47, 163, 164, 172],
  accounts: [154, 163, 172],
  balance: [41, 73, 94, 164],
  clone: [39, 41, 94, 106, 119, 142, 143, 145, 146, 147],
  transcribe: [26, 41, 88, 89, 94, 105, 106, 126],
  media: [26, 41, 126, 131, 137, 138, 139, 169],
  twitterFollowers: [13, 63, 64, 73, 80, 81, 104, 105],
  twitterNotifications: [13, 26, 63, 64, 73, 80, 81, 94, 104, 105],
  twitterReply: [8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 104, 105, 121],
  twitterQuote: [8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 104, 105],
  twitterPost: [8, 13, 63, 64, 73, 80, 81, 86, 94, 104, 105],
  twitterLike: [8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 104, 105],
  twitterRepost: [8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 104, 105],
  twitterFollow: [8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 104, 105],
  twitterDm: [8, 13, 53, 63, 64, 73, 80, 81, 86, 94, 98, 104, 105, 108, 109, 111, 130, 133, 135, 137, 138, 152, 153],
  twitterQueue: [6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87, 94, 104, 105, 107, 108, 109, 110, 111, 113, 114, 115, 121, 130, 133, 135, 136, 137, 138],
  runs: [19, 22, 25, 27, 66, 73],
  storage: [73, 134],
  timing: [26, 73, 165],
  inbox: [94, 105, 108, 109, 130, 131, 132, 133, 134, 135, 136, 138, 139, 150, 169],
  browsers: [29, 35, 54, 55],
  browser: [8, 19, 35, 94, 105],
  report: [134, 154, 160, 178],
  job: [10, 26, 35],
  mcp: [21, 47, 167, 170],
  facebookConversations: [34],
  errors: [25],
  graph: [6, 25],
  new: [1, 2, 63, 64, 83],
  logout: [],
  whoami: [],
  redditSession: [13, 63, 64, 73, 83],
  redditRead: [8, 53, 63, 64, 73, 94, 110],
  redditPost: [8, 10, 41, 63, 64, 73, 94],
  redditReply: [8, 10, 41, 63, 64, 73, 94],
  redditVote: [8, 63, 64, 73, 94],
  linkedinSession: [13, 63, 64, 73, 83, 102],
  linkedinPost: [8, 63, 64, 73, 94, 102, 111],
  linkedinDelete: [8, 63, 64, 73, 94, 102],
  linkedinSuggestions: [63, 64, 73, 94, 102],
  linkedinConnect: [8, 63, 64, 73, 94, 102],
  linkedinLike: [8, 63, 64, 73, 94, 102],
  linkedinInbox: [63, 64, 73, 94, 102],
  linkedinMessages: [63, 64, 73, 94, 102],
  linkedinCookies: [13, 21, 63, 64, 73, 83, 102],
  discordSession: [13, 63, 64, 73, 83, 94],
  discordSecrets: [13, 21, 63, 94],
  discordChats: [13, 63, 64, 73, 83, 94],
  discordServers: [13, 63, 64, 73, 83, 94],
  discordChannels: [13, 63, 64, 73, 83, 94],
  discordPosts: [13, 63, 64, 73, 83, 94],
  discordSearch: [13, 63, 64, 73, 83, 94],
  discordRead: [13, 63, 64, 73, 83, 94, 126],
  discordWatch: [13, 26, 63, 64, 73, 83, 94, 126, 131, 132],
  discordSend: [8, 13, 63, 64, 73, 83, 90, 91, 94, 122, 130, 133, 134, 135, 137, 138, 162],
  discordDelete: [8, 13, 63, 64, 73, 83, 94, 122],
  discordReact: [8, 13, 63, 64, 73, 83, 94, 122, 133, 140],
  slackReact: [8, 13, 63, 64, 73, 83, 94, 125, 133, 140],
  instagramReact: [8, 13, 63, 64, 73, 83, 94, 128, 129, 133, 140],
  discordVoice: [8, 13, 63, 64, 73, 83, 94, 122, 133, 135, 137, 142, 143, 144, 145, 146, 147, 148, 149],
  slackVoice: [8, 13, 63, 64, 73, 83, 94, 125, 133, 135, 137, 142, 143, 144, 145, 146, 147, 148, 149],
  instagramVoice: [8, 13, 63, 64, 73, 83, 94, 128, 129, 133, 135, 137, 142, 143, 144, 145, 146, 147, 148, 149],
  twitterVoice: [8, 13, 63, 64, 73, 80, 81, 88, 94, 104, 105, 133, 135, 137, 142, 143, 144, 145, 146, 147, 148, 149, 151],
  twitterList: [8, 13, 63, 64, 73, 80, 81, 94, 104, 105, 141],
  twitterReact: [8, 13, 63, 64, 73, 80, 81, 94, 104, 105, 133, 140],
  slackSession: [13, 63, 64, 73, 83, 125],
  slackWorkspaces: [13, 63, 64, 73, 83, 125],
  slackChats: [13, 63, 64, 73, 83, 94, 125],
  slackRead: [13, 63, 64, 73, 83, 94, 125, 126],
  slackWatch: [13, 26, 63, 64, 73, 83, 94, 123, 125, 131, 132],
  slackSend: [8, 13, 63, 64, 73, 83, 90, 94, 111, 125, 130, 133, 134, 135, 137, 138],
  slackCookies: [13, 21, 63, 64, 73, 83, 97, 125],
  instagramSession: [13, 63, 64, 73, 83, 129],
  instagramDms: [13, 63, 64, 73, 83, 94, 126, 129],
  instagramSend: [8, 13, 63, 64, 73, 83, 90, 94, 111, 129, 130, 133, 135, 137, 138],
  instagramWatch: [13, 26, 63, 64, 73, 83, 94, 123, 129, 131, 132],
};

const CONSOLIDATED_RULES: Readonly<Record<number, number | null>> = {
  "46": null,
  "60": null,
  "57": null,
  "58": null,
  "64": null,
  "116": null,
  "10": 8,
  "140": 8,
  "141": 8,
  "9": 35,
  "11": 35,
  "12": 35,
  "15": 35,
  "16": 35,
  "17": 35,
  "18": 35,
  "20": 35,
  "21": 35,
  "23": 35,
  "24": 35,
  "28": 35,
  "32": 35,
  "33": 35,
  "37": 35,
  "42": 35,
  "43": 35,
  "50": 35,
  "51": 35,
  "52": 35,
  "54": 35,
  "67": 35,
  "68": 35,
  "69": 35,
  "72": 35,
  "77": 35,
  "78": 35,
  "82": 35,
  "84": 35,
  "92": 35,
  "118": 35,
  "95": 47,
  "56": null,
  "59": null,
  "49": null,
  "74": 73,
  "75": 73,
  "76": 73,
  "85": 73,
  "80": null,
  "81": null,
  "102": null,
  "124": null,
  "125": null,
  "128": null,
  "88": 89,
  "91": 94,
  "96": 94,
  "101": 94,
  "122": 94,
  "150": 94,
  "104": 105,
  "107": 105,
  "129": 105,
  "130": 105,
  "131": 105,
  "132": 105,
  "98": 109,
  "99": 109,
  "100": 109,
  "108": 109,
  "110": 109,
  "114": 109,
  "115": 109,
  "121": 109,
  "135": 109,
  "136": 109,
  "155": 109,
  "156": 109,
  "162": 109,
  "111": 137,
  "112": 137,
  "127": 137,
  "144": 137,
  "152": 137,
  "126": 138,
  "139": 138,
  "169": 138,
  "119": 142,
  "120": 142,
  "143": 142,
  "145": 142,
  "146": 142,
  "147": 142,
  "148": 142,
  "149": 142,
  "151": 142,
  "159": 163,
  "161": 164,
  "166": 164,
  "3": null,
  "13": null,
  "14": null,
  "34": null,
  "45": null,
  "61": null,
  "62": null,
  "65": null,
  "71": null,
  "93": null,
  "97": null,
  "22": 19,
  "27": null,
  "36": 31,
  "48": null,
  "87": 109,
  "106": 163,
  "113": 105,
  "153": null
};

export const DEVELOPER_RULES: ReadonlySet<number> = new Set([1, 2, 4, 5, 6, 7, 55, 63, 70, 83, 103, 117, 170, 175, 177, 178]);

const DEVELOPER_COMMANDS: ReadonlySet<string> = new Set(["new"]);

export function currentRuleIds(ids: readonly number[]): number[] {
  return [...new Set(ids.flatMap((id) => {
    const current = Object.hasOwn(CONSOLIDATED_RULES, id) ? CONSOLIDATED_RULES[id] : id;
    return current === null ? [] : [current];
  }))];
}

export function operatingRuleIds(ids: readonly number[]): number[] {
  return currentRuleIds(ids).filter((id) => !DEVELOPER_RULES.has(id));
}

export function cite(...ids: number[]): string {
  const current = operatingRuleIds(ids);
  return current.length === 0 ? "" : `${current.length === 1 ? "rule" : "rules"} ${current.join(", ")}`;
}

export const COMMAND_RULES: Readonly<Record<string, number[]>> = Object.fromEntries(
  Object.entries(SOURCE_COMMAND_RULES).map(([command, ids]) => [command, DEVELOPER_COMMANDS.has(command) ? currentRuleIds(ids) : operatingRuleIds(ids)]),
);

export const EVERY_TOOL_RULES = [30, 38, 39, 40, 41];

export function rulesLine(command: string): string {
  const own = COMMAND_RULES[command] ?? [];
  return `AGENTS.md (${AGENTS_URI}): rules ${[...new Set([...own, ...EVERY_TOOL_RULES])].join(", ")}.`;
}

export function citedRules(): number[] {
  const fromText = [...SERVER_INSTRUCTIONS.matchAll(/rules? ([\d, -]+)/g)].flatMap((m) =>
    m[1].split(/[, ]+/).flatMap((part) => {
      const range = /^(\d+)-(\d+)$/.exec(part);
      if (range) return Array.from({ length: Number(range[2]) - Number(range[1]) + 1 }, (_, i) => Number(range[1]) + i);
      return /^\d+$/.test(part) ? [Number(part)] : [];
    }),
  );
  return [...new Set([...fromText, ...Object.values(COMMAND_RULES).flat(), ...EVERY_TOOL_RULES])].sort((a, b) => a - b);
}
