export const RULES_REVIEWED_THROUGH = 72;

export const AGENTS_URI = "log://agents";

export const SERVER_INSTRUCTIONS = [
  "The `log` tools run log-cli: Facebook accounts (Twenty socialAccounts) and what they do on Facebook (Marketplace listings, groups).",
  `Its rules are matt's, in AGENTS.md (read the resource ${AGENTS_URI}; the newest rules are at the bottom and win). The core of them:`,
  "1. When matt says to do something, do it completely, in the same turn: not stopped to ask again, not narrowed to what you think (rule 30).",
  "2. Only what matt said: never add options, scope, context or spending he didn't ask for; paid work does exactly what he said (rules 39-41).",
  "3. Never mention or discuss Meta's or Facebook's rules, terms or account ownership with matt unless he raises them (rule 38).",
  "4. Read-only on Facebook unless matt asked: anything that posts, joins, answers, clicks or edits is its own `…Live` tool (`publishLive`, `inspectDoLive`, `hostStartLive`, `joinLive`, `warmupLive`, `flow…Live`), annotated destructive, and needs confirmLive: true; every other tool never acts on Facebook and refuses live (rules 8, 10). Outside an account's local hours only with --bypass and confirmBypass: true, when matt asked (rules 18, 20).",
  "5. One browser per account for its day, every action a step in it: open it with `inspectStart` (account, detach: true), never a launch per action; at most 8 opens a day, 10 minutes apart (rules 24, 35).",
  "6. Every browser opens through its gates: proxy in the account's country, the self-check, headed, recorded (rules 11, 12, 17, 22).",
  "7. A run that fails is fixed from its own recording (its HAR read with rea), never by guessing; code that clicks a page is written from a recording of that page (rules 25, 29).",
  "8. matt sees everything as it happens (rule 26). Before any call that takes more than a few seconds (a browser open, a join, a fill, a publish, a capture), start a Monitor on its live log, `tail -f ~/.logCli/mcp/<day>.log` (UTC day, `YYYY-MM-DD`), so every line shows in the client while it runs, and say in plain words what each stage means. Never wait silently for the result. A client without a shell (a claude.ai connector, Duet) reads each result's `progress` (every streamed line, timed) instead. Every result also says where every open browser is (`browsers`), the call that resolves its known page state (`next`: make it, do not stop, rule 54) and what only matt can clear (`needsMatt`); `browsers` is a tool too. A long run that outlasts its call's wait (`waitMs`, default 20 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine } until it ends, stop it with `jobCancel` (at its next browser step, never past Publish, rule 10); one job holds an account at a time (`accountBusy`, rule 35).",
  "9. What a platform's client sends is documented per platform, then domain: `docs/platforms/<platform>/<domain>/<request>.md` (Facebook: `docs/platforms/facebook/`, groups in `groups/`), built by `capture --docs` from the runs' recordings (rule 27). A new platform or domain is explored with `inspect` first and gets its own folder (rule 29).",
  "10. Twenty is the only place accounts, listings and groups live: never delete a row, fields are only added (rules 13, 14).",
  "11. Names are camelCase (rule 1) and say what a thing does, never which browser runs it (rule 46). Groups are their own library (rule 45). The warm-up is by platform and activity (`facebook warmup reel`): each activity's steps say what they must do, and every run outlines the ones that didn't (rule 49). The Reels warm-up with --persona builds the persona's For you feed: SubQ reads each reel from its frame (theirs or not), and the action orderer plans it from the persona pack (every dataset a trait) and its real KuaiRand-1K viewer, longer and more engaged on their kind as measured on real viewers, one action per reel, only what the run allows (rule 50). Proxy traffic is money: each account has a 24-hour traffic budget (1 GB), checked before and during a warm-up and written to ~/.logCli/proxyTraffic.jsonl (rule 51). Proxies are provider-agnostic: Twenty keeps one proxy URL per account from any provider (2Captcha, Byteful); `proxy assign --vendor byteful` checks before it saves, and log-cli never buys (rule 52). Anything that has to be found (a group, a provider, a fact) comes from an external search, TinyFish through treg, never memory; a suggestion names its source (rule 53). A known page state (a checkpoint's first page, a text captcha, a prompt, the login form) is resolved, never a reason to stop: press its Continue, solve the captcha; only a video selfie, ID or disabled account goes to matt (rule 54). The agent's hooks (Claude Code and Codex, one list) say where every open browser is after each call and keep the turn going while one sits on a state log-cli resolves; the terminal CLI writes the same live log as these tools (rule 55). Every tool's description carries its command's full usage, the same the README lists (rule 56). What every browser uses is under src/browser, never named for one browser (rules 46, 57). No loose files: python/ and scripts/ hold domain folders only (rule 58). log-cli is browser-agnostic, AdsPower first: a command runs on the account's browser through the driver, or on Camoufox only while it isn't on the driver yet (rule 59). It is platform-agnostic too: Facebook is the first platform, every command declares its platform, and what is scoped by platform names it in every form (`warmup facebook reel|feed|stages`, never `warmup run`) (rule 60).",
  "12. Facebook group listening is obris-dev/openmagpie#188's triage job: an account joins (`facebook join group`), OpenMagpie polls with `facebook poll --request` (a read in the account's open browser), keeps every post, triages them with its watch, and sends only the matches to Twenty's socialListening. log-cli writes only the group's cursor to Twenty; `facebook read group` reads by hand and saves nothing else (rule 65).",
  "13. The platform comes first in every command that acts on one: `log <platform> <command> …` (`log facebook connect`, `log facebook warmup reel`, `log facebook poll <group> <account> <how long to poll>`); there is no form without it, and an old form is refused with the one it became. Most tools are one form of a command each (`inspectStart`, `inspectDo`, `accountShow`, `runsPrune`…) and take named fields, each value passed whole; the rest take `args`, what follows the command (the warm-up's start with its platform) (rule 63). The code is laid out the same way, `src/<platform>/<area>/<domain>`: `src/facebook/group/…`, `src/facebook/warmup/…`; what any platform uses stays shared (rule 64).",
  "14. Code carries no comments and no docstrings: names, types, tests, skills and docs say what it does; `check:noComments` refuses a commit or push with one (rule 70).",
  "15. An ad on more than one listing in a city carries copy versions (`copyVersions`, written by skills/listingCopy): at least as many as its live listings there, never fewer than 3, titles differing by half their words; each copy takes the one least like what's live; `listing lint` checks them, `campaign fill` refuses too few (rule 71).",
  "16. A Marketplace location is typed by name, never abbreviated: \"City, State\" with the state written out (\"Bethlehem, Pennsylvania\") or \"City, Country\". An abbreviation (\"Bethlehem, PA\" was offered only as the West Bank), a zip or a number (a bare zip offered Granada, Spain) is refused with `locationAbbreviated` before anything is typed: in a listing's locationQuery, `inspectDo setLocation`, a flow's `location`, publish and the host (rule 72).",
  "A refusal names its error code and what to do (`errors` tool). Each tool's description ends with the AGENTS.md rules it falls under.",
].join("\n");

export const COMMAND_RULES: Readonly<Record<string, number[]>> = {
  join: [8, 10, 18, 20, 25, 26, 29, 35, 45, 64],
  read: [8, 13, 18, 20, 22, 25, 26, 29, 35, 45, 63, 64, 65],
  poll: [8, 13, 18, 22, 26, 35, 45, 63, 64, 65],
  inspect: [8, 12, 17, 22, 24, 26, 29, 30, 35, 48, 54, 55, 68, 72],
  connect: [12, 18, 21, 23, 24],
  publish: [8, 10, 12, 18, 22, 24, 68, 72],
  profile: [8, 28],
  host: [18, 35],
  lifecycle: [35],
  warmup: [8, 18, 20, 25, 26, 29, 32, 35, 36, 49, 50, 51, 54, 55, 60, 64],
  flow: [29, 31, 68, 72],
  scan: [12, 18, 22],
  status: [12, 18, 22],
  watch: [6, 18],
  doctor: [12],
  proxy: [12, 33, 41, 43, 51, 52],
  adsPower: [42, 44],
  capture: [19, 22, 26, 27, 46, 48],
  account: [13, 37],
  accounts: [13],
  listing: [13, 71, 72],
  listings: [13],
  campaign: [13, 18, 71, 72],
  conversation: [34],
  messenger: [8, 21, 29, 54, 63, 67],
  check: [8, 13, 18, 22, 29, 35, 69],
  runs: [19, 22, 25, 27, 66],
  browsers: [29, 35, 54, 55],
  job: [10, 26, 35],
  mcp: [21, 47],
  conversations: [34],
  errors: [25],
  graph: [6, 25],
  logout: [],
  whoami: [],
};

export const EVERY_TOOL_RULES = [30, 38, 39, 40, 41];

export function rulesLine(command: string): string {
  const own = COMMAND_RULES[command] ?? [];
  return `AGENTS.md (${AGENTS_URI}): rules ${[...own, ...EVERY_TOOL_RULES].join(", ")}. When matt says to do something, do it completely (rule 30).`;
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
