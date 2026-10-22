/**
 * AGENTS.md in the MCP server: the core principles any agent using these
 * tools works by, distilled, each with its rule number, and the rules each
 * tool falls under. The full file is the resource `log://agents`, read from
 * the repo on every request, so it is never older than the file. A test
 * checks every rule number cited here exists in AGENTS.md (no drift).
 */

/**
 * The last AGENTS.md rule this summary was reviewed against. A rule added
 * after it fails the test until the instructions and the table below are
 * checked against it (and this number raised), so the MCP never falls behind
 * the file.
 */
export const RULES_REVIEWED_THROUGH = 64;

/** The resource that serves AGENTS.md itself. */
export const AGENTS_URI = "log://agents";

/**
 * The server's `instructions` (MCP initialize): what a host puts in the
 * model's context before any tool is called. matt's rules, distilled; the
 * file wins where they differ, and its newest rules are at the bottom.
 */
export const SERVER_INSTRUCTIONS = [
  "The `log` tools run log-cli: Facebook accounts (Twenty socialAccounts) and what they do on Facebook (Marketplace listings, groups).",
  `Its rules are matt's, in AGENTS.md (read the resource ${AGENTS_URI}; the newest rules are at the bottom and win). The core of them:`,
  "1. When matt says to do something, do it completely, in the same turn: not stopped to ask again, not narrowed to what you think (rule 30).",
  "2. Only what matt said: never add options, scope, context or spending he didn't ask for; paid work does exactly what he said (rules 39-41).",
  "3. Never mention or discuss Meta's or Facebook's rules, terms or account ownership with matt unless he raises them (rule 38).",
  "4. Read-only on Facebook unless matt asked: anything that posts, joins, answers or edits is --live with confirmLive: true (rules 8, 10). Outside an account's local hours only with --bypass and confirmBypass: true, when matt asked (rules 18, 20).",
  "5. One browser per account for its day, every action a step in it: open it with `inspect start --account <a> --detach`, never a launch per action; at most 8 opens a day, 10 minutes apart (rules 24, 35).",
  "6. Every browser opens through its gates: proxy in the account's country, the self-check, headed, recorded (rules 11, 12, 17, 22).",
  "7. A run that fails is fixed from its own recording (its HAR read with rea), never by guessing; code that clicks a page is written from a recording of that page (rules 25, 29).",
  "8. matt sees everything as it happens (rule 26). Before any call that takes more than a few seconds (a browser open, a join, a fill, a publish, a capture), start a Monitor on its live log, `tail -f ~/.logCli/mcp/<day>.log` (UTC day, `YYYY-MM-DD`), so every line shows in the client while it runs, and say in plain words what each stage means. Never wait silently for the result.",
  "9. What a platform's client sends is documented per platform, then domain: `docs/platforms/<platform>/<domain>/<request>.md` (Facebook: `docs/platforms/facebook/`, groups in `groups/`), built by `capture --docs` from the runs' recordings (rule 27). A new platform or domain is explored with `inspect` first and gets its own folder (rule 29).",
  "10. Twenty is the only place accounts, listings and groups live: never delete a row, fields are only added (rules 13, 14).",
  "11. Names are camelCase (rule 1) and say what a thing does, never which browser runs it (rule 46). Groups are their own library (rule 45). The warm-up is by platform and activity (`facebook warmup reel`): each activity's steps say what they must do, and every run outlines the ones that didn't (rule 49). The Reels warm-up with --persona builds the persona's For you feed: SubQ reads each reel from its frame (theirs or not), and the action orderer plans it from the persona pack (every dataset a trait) and its real KuaiRand-1K viewer, longer and more engaged on their kind as measured on real viewers, one action per reel, only what the run allows (rule 50). Proxy traffic is money: each account has a 24-hour traffic budget (1 GB), checked before and during a warm-up and written to ~/.logCli/proxyTraffic.jsonl (rule 51). Proxies are provider-agnostic: Twenty keeps one proxy URL per account from any provider (2Captcha, Byteful); `proxy assign --vendor byteful` checks before it saves, and log-cli never buys (rule 52). Anything that has to be found (a group, a provider, a fact) comes from an external search, TinyFish through treg, never memory; a suggestion names its source (rule 53). A known page state (a checkpoint's first page, a text captcha, a prompt, the login form) is resolved, never a reason to stop: press its Continue, solve the captcha; only a video selfie, ID or disabled account goes to matt (rule 54). The agent's hooks (Claude Code and Codex, one list) say where every open browser is after each call and keep the turn going while one sits on a state log-cli resolves; the terminal CLI writes the same live log as these tools (rule 55). Every tool's description carries its command's full usage, the same the README lists (rule 56). What every browser uses is under src/browser, never named for one browser (rules 46, 57). No loose files: python/ and scripts/ hold domain folders only (rule 58). log-cli is browser-agnostic, AdsPower first: a command runs on the account's browser through the driver, or on Camoufox only while it isn't on the driver yet (rule 59). It is platform-agnostic too: Facebook is the first platform, every command declares its platform, and what is scoped by platform names it in every form (`warmup facebook reel|feed|stages`, never `warmup run`) (rule 60).",
  "12. A group's posts and comments are read with `facebook read group --account <a> --group <g>` in the account's open browser, only what is new since the group's cursor, and saved to Twenty's agencyGroupPosts and agencyGroupComments before the cursor moves; --live only switches each post's comments to Newest (rule 61). It is a firehose: the host reads each group its account is in on its own clock (`facebook host start --groupMinutes`), and `facebook poll` (OpenMagpie's worker) answers (rule 62).",
  "13. The platform comes first in every command that acts on one: `log <platform> <command> …` (`log facebook connect`, `log facebook warmup reel`, `log facebook poll <group> <account> <how long to poll>`); there is no form without it, and an old form is refused with the one it became. A tool runs its command that way: its `args` are what follows the command (the warm-up's start with its platform) (rule 63). The code is laid out the same way, `src/<platform>/<area>/<domain>`: `src/facebook/group/…`, `src/facebook/warmup/…`; what any platform uses stays shared (rule 64).",
  "A refusal names its error code and what to do (`errors` tool). Each tool's description ends with the AGENTS.md rules it falls under.",
].join("\n");

/** The AGENTS.md rules each command falls under, besides the ones every tool does (1, 30, 38-41). */
export const COMMAND_RULES: Readonly<Record<string, number[]>> = {
  join: [8, 10, 18, 20, 25, 26, 29, 35, 45, 64],
  read: [8, 13, 18, 20, 22, 25, 26, 29, 35, 45, 61, 62, 63, 64],
  poll: [8, 13, 18, 22, 26, 35, 45, 61, 62, 63, 64],
  inspect: [8, 12, 17, 22, 24, 26, 29, 30, 35, 48, 54, 55],
  connect: [12, 18, 21, 23, 24],
  publish: [8, 10, 12, 18, 22, 24],
  profile: [8, 28],
  host: [18, 35, 61, 62],
  lifecycle: [35],
  warmup: [8, 18, 20, 25, 26, 29, 32, 35, 36, 49, 50, 51, 54, 55, 60, 64],
  flow: [29, 31],
  scan: [12, 18, 22],
  status: [12, 18, 22],
  watch: [6, 18],
  doctor: [12],
  proxy: [12, 33, 41, 43, 51, 52],
  adsPower: [42, 44],
  capture: [19, 22, 26, 27, 46, 48],
  account: [13, 37],
  accounts: [13],
  listing: [13],
  listings: [13],
  campaign: [13, 18],
  conversation: [34],
  conversations: [34],
  errors: [25],
  graph: [6, 25],
  // Sign-in to blaster only: the rules every tool falls under.
  logout: [],
  whoami: [],
};

/** The rules every tool falls under. */
export const EVERY_TOOL_RULES = [30, 38, 39, 40, 41];

/** A tool description's last line: its AGENTS.md rules, and where to read them. Pure. */
export function rulesLine(command: string): string {
  const own = COMMAND_RULES[command] ?? [];
  return `AGENTS.md (${AGENTS_URI}): rules ${[...own, ...EVERY_TOOL_RULES].join(", ")}. When matt says to do something, do it completely (rule 30).`;
}

/** Every rule number cited here, for the drift test. Pure. */
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
