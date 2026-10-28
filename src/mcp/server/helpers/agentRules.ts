export const RULES_REVIEWED_THROUGH = 89;

export const AGENTS_URI = "log://agents";

export const SERVER_INSTRUCTIONS = [
  "The `log` tools run log-cli: Facebook accounts (Twenty socialAccounts) and what they do on Facebook (Marketplace listings, groups).",
  `Its rules are matt's, in AGENTS.md (read the resource ${AGENTS_URI}; the newest rules are at the bottom and win). The core of them:`,
  "1. Rule one, above every other: if we don't know, we do this. Read the step's internal API (what we sent and what came back; the answers decide, never the screen, a timer or the step having run); collate everything about the moment (goal, account, what we did, every call, the page, the screenshot, the earlier steps); ask SubQ what it means; say it loudly; keep going until the goal is reached; write what went wrong as P.E.E. (point, evidence, explain) with how it was fixed; and name the state so next time it is known. In `inspect`: `goal`, `inspectFinding`, `inspectGoal`, `inspectRead` (rules 73-76).",
  "2. When matt says to do something, do it completely, in the same turn: not stopped to ask again, not narrowed to what you think (rule 30).",
  "3. Only what matt said: never add options, scope, context or spending he didn't ask for; paid work does exactly what he said (rules 39-41).",
  "4. Never mention or discuss Meta's or Facebook's rules, terms or account ownership with matt unless he raises them (rule 38).",
  "5. Read-only on Facebook unless matt asked: anything that posts, joins, answers, clicks or edits is its own `…Live` tool (`publishLive`, `inspectDoLive`, `hostStartLive`, `joinLive`, `warmupLive`, `flow…Live`), annotated destructive, and needs confirmLive: true; every other tool never acts on Facebook and refuses live (rules 8, 10). Outside an account's local hours only with --bypass and confirmBypass: true, when matt asked (rules 18, 20).",
  "6. One browser per account for its day, every action a step in it: open it with `inspectStart` (account, detach: true), never a launch per action; at most 8 opens a day, 10 minutes apart (rules 24, 35).",
  "7. Every browser opens through its gates: proxy in the account's country, the self-check, headed, recorded (rules 11, 12, 17, 22).",
  "8. A run that fails is fixed from its own recording (its HAR read with rea), never by guessing; code that clicks a page is written from a recording of that page (rules 25, 29).",
  "9. matt sees everything as it happens (rule 26). Before any call that takes more than a few seconds (a browser open, a join, a fill, a publish, a capture), start a Monitor on its live log, `tail -f ~/.logCli/mcp/<day>.log` (UTC day, `YYYY-MM-DD`), so every line shows in the client while it runs, and say in plain words what each stage means. Never wait silently for the result. A client without a shell (a claude.ai connector, Duet) reads each result's `progress` (every streamed line, timed) instead. Every result also says where every open browser is (`browsers`), the call that resolves its known page state (`next`: make it, do not stop, rule 54) and what only matt can clear (`needsMatt`); `browsers` is a tool too. A long run that outlasts its call's wait (`waitMs`, default 20 s) comes back as a job (`exit` -1, `job.id`): follow it with `jobStatus` { jobId, afterLine } until it ends, stop it with `jobCancel` (at its next browser step, never past Publish, rule 10); one job holds an account at a time (`accountBusy`, rule 35).",
  "10. What a platform's client sends is documented per platform, then domain: `docs/platforms/<platform>/<domain>/<request>.md` (Facebook: `docs/platforms/facebook/`, groups in `groups/`), built by `capture --docs` from the runs' recordings (rule 27). A new platform or domain is explored with `inspect` first and gets its own folder (rule 29). Every platform's calls go through rea, their code as well as their network: `capture --docs` finds each call's code in that platform's own bundles by syntax tree and rea reads it, never Facebook's alone (rule 85).",
  "11. Twenty is the only place accounts, listings and groups live: never delete a row, fields are only added (rules 13, 14).",
  "12. Names are camelCase (rule 1) and say what a thing does, never which browser runs it (rule 46). Groups are their own library (rule 45). The warm-up is by platform and activity (`facebook warmup reel`): each activity's steps say what they must do, and every run outlines the ones that didn't (rule 49). The Reels warm-up with --persona builds the persona's For you feed: SubQ reads each reel from its frame (theirs or not), and the action orderer plans it from the persona pack (every dataset a trait) and its real KuaiRand-1K viewer, longer and more engaged on their kind as measured on real viewers, one action per reel, only what the run allows (rule 50). Proxy traffic is money: each account has a 24-hour traffic budget (1 GB), checked before and during a warm-up and written to ~/.logCli/proxyTraffic.jsonl (rule 51). Proxies are provider-agnostic: Twenty keeps one proxy URL per account from any provider (2Captcha, Byteful); `proxy assign --vendor byteful` checks before it saves, and log-cli never buys (rule 52). Anything that has to be found (a group, a provider, a fact) comes from an external search, TinyFish through treg, never memory; a suggestion names its source (rule 53). A known page state (a checkpoint's first page, a text captcha, a prompt, the login form) is resolved, never a reason to stop: press its Continue, solve the captcha; only a video selfie, ID or disabled account goes to matt (rule 54). The agent's hooks (Claude Code and Codex, one list) say where every open browser is after each call and keep the turn going while one sits on a state log-cli resolves; the terminal CLI writes the same live log as these tools (rule 55). Every tool's description carries its command's full usage, the same the README lists (rule 56). What every browser uses is under src/browser, never named for one browser (rules 46, 57). No loose files: python/ and scripts/ hold domain folders only (rule 58). log-cli is browser-agnostic, AdsPower first: a command runs on the account's browser through the driver, or on Camoufox only while it isn't on the driver yet (rule 59). It is platform-agnostic too: Facebook is the first platform, every command declares its platform, and what is scoped by platform names it in every form (`warmup facebook reel|feed|stages`, never `warmup run`) (rule 60).",
  "13. Facebook group listening is obris-dev/openmagpie#188's triage job: an account joins (`facebook join group`), OpenMagpie polls with `facebook poll --request` (a read in the account's open browser), keeps every post, triages them with its watch, and sends only the matches to Twenty's socialListening. log-cli writes only the group's cursor to Twenty; `facebook read group` (`readGroup`) reads by hand and saves nothing else (rule 65). `facebook read members` (`readMembers`) reads a group's newest members (name, profile, bio, page category, followers, when they joined) from its People tab in the account's open browser, nothing clicked: it says up front `count N → ~S scrolls, ~M min at Xs per scroll`, waits `secondsPerScroll` (default 15) before each scroll, stops at `count`, the list's end or `maxScrolls`, `owners` keeps owners (a bio naming owner, co-owner, founder, CEO, president, proprietor or self-employed, or a page), and the members go to ~/.logCli/members/<group>/<run time>.tsv and .json, never to Twenty. A members page whose refetch answered with members is the known state `groupMembersList`: nothing to resolve (rule 77).",
  "14. The platform comes first in every command that acts on one: `log <platform> <command> …` (`log facebook connect`, `log facebook warmup reel`, `log facebook poll <group> <account> <how long to poll>`); there is no form without it, and an old form is refused with the one it became. Most tools are one form of a command each (`inspectStart`, `inspectDo`, `accountShow`, `runsPrune`…) and take named fields, each value passed whole; the rest take `args`, what follows the command (the warm-up's start with its platform) (rule 63). The code is laid out the same way, `src/<platform>/<area>/<domain>`: `src/facebook/group/…`, `src/facebook/warmup/…`; what any platform uses stays shared (rule 64).",
  "15. Code carries no comments and no docstrings: names, types, tests, skills and docs say what it does; `check:noComments` refuses a commit or push with one (rule 70).",
  "16. An ad on more than one listing in a city carries copy versions (`copyVersions`, written by skills/listingCopy): at least as many as its live listings there, never fewer than 3, titles differing by half their words; each copy takes the one least like what's live; `listing lint` checks them, `campaign fill` refuses too few (rule 71).",
  "17. A Marketplace location is typed by name, never abbreviated: \"City, State\" with the state written out (\"Bethlehem, Pennsylvania\") or \"City, Country\". An abbreviation (\"Bethlehem, PA\" was offered only as the West Bank), a zip or a number (a bare zip offered Granada, Spain) is refused with `locationAbbreviated` before anything is typed: in a listing's locationQuery, `inspectDo setLocation`, a flow's `location`, publish and the host (rule 72).",
  "18. In `inspect`, every step reads its internal API calls (what was sent and what came back) into exchanges.json; a step no known state names is read by SubQ with the goal (`goal`), the account, what we did, every call, the page, the screenshot and the earlier steps, for what it means. Its reading comes first in the result (`>>> UNKNOWN STATE`): name that state before the flow goes on. `inspectRead` reads a recorded step again (rule 74).",
  "19. An inspect session has a goal (`goal` on `inspectStart`, or `inspectGoal` with `set`), and the turn is not over until a step's reading says it is reached. A step that went wrong gets its P.E.E. finding before the next step, with `inspectFinding`: point (the issue, one sentence), explain (why the evidence shows it, what caused it); the evidence is quoted from the step's reading. Once reached, each finding says how it was fixed (`fixes`, `fix`). What only a person can clear is said to matt (rule 75).",
  "20. Flows are deterministic: a control is one scored match by role and name (accessible name, aria-label, label, text or placeholder, case ignored) inside the dialog the step names (`within`), never a guess (`controlAmbiguous`, `controlMissing`, `controlDisabled`); every step waits for the call it must cause and checks its answer before the next fires; before its first click a flow clears the known overlays (the browser-notifications notice, an ended \"What happened\" notice) with Escape, each checked, or stops with `overlayNotCleared`. Run `preflight` before opening accounts: it says what would stop each one (timezone, hours, proxy, kernel, opens left, a session left open, its picture) and `--apply` fetches a missing kernel (rule 79).",
  "21. X (Twitter) is a platform of its own, `log twitter <command>`, on the direct-API engine only: twikit (vendor/twikit) with the account's saved cookies from Twenty, no browser and no proxy. X accounts call X directly, as twitter-controller does. X's own answer decides (`socialAccounts.sessionState`), each account has its own governor, and refreshed cookies are merged back (rule 80). We maintain vendor/twikit ourselves: its transport is curl_cffi (impersonating Safari), never httpx (`check:twikitTransport`, rule 81). When matt says to send anyway, `force` goes past the account's governor (its pause and caps) for that call or run only; X's answer still decides (rule 86).",
  "22. A new platform is made whole with `log new platform <name>` (`newPlatform`): its session, `log <name> session check`, its engine and docs, wired into the repo through the syntax tree; a dry run until `apply`, and `check:platforms` refuses one half wired (rule 83).",
  "23. `inspect` and the account's browser work on every platform with a browser path: `PLATFORM_SITES` says its hosts, home and whether it needs a proxy. Facebook always does (rule 12); a platform marked no-proxy (Reddit) opens direct on this machine's exit (rule 84).",
  "A refusal names its error code and what to do (`errors` tool). Each tool's description ends with the AGENTS.md rules it falls under.",
].join("\n");

export const COMMAND_RULES: Readonly<Record<string, number[]>> = {
  join: [8, 10, 18, 20, 25, 26, 29, 35, 45, 64, 73],
  read: [8, 13, 18, 20, 22, 25, 26, 29, 35, 45, 54, 63, 64, 65, 73, 77],
  poll: [8, 13, 18, 22, 26, 35, 45, 63, 64, 65, 73],
  inspect: [8, 12, 17, 22, 24, 26, 29, 30, 35, 48, 54, 55, 68, 72, 73, 74, 75, 82, 84],
  connect: [12, 18, 21, 23, 24, 73],
  publish: [8, 10, 12, 18, 22, 24, 68, 72, 73],
  profile: [8, 28, 73],
  host: [18, 35, 73, 79],
  lifecycle: [35],
  preflight: [12, 18, 24, 33, 35, 37, 79],
  warmup: [8, 18, 20, 25, 26, 29, 32, 35, 36, 49, 50, 51, 54, 55, 60, 64, 73],
  flow: [29, 31, 68, 72, 73, 79],
  scan: [12, 18, 22, 73],
  status: [12, 18, 22, 73],
  watch: [6, 18, 73],
  doctor: [12],
  proxy: [12, 33, 41, 43, 51, 52],
  adsPower: [42, 44, 78, 84],
  capture: [19, 22, 26, 27, 46, 48, 85],
  account: [13, 37, 78],
  accounts: [13],
  listing: [13, 71, 72],
  listings: [13],
  campaign: [13, 18, 71, 72],
  conversation: [34],
  messenger: [8, 21, 29, 54, 63, 67],
  check: [8, 13, 18, 22, 29, 35, 69, 73],
  twitterSession: [13, 21, 26, 63, 64, 73, 80, 81],
  twitterFollows: [13, 53, 63, 64, 73, 80, 81],
  twitterDms: [13, 63, 64, 73, 80, 81, 88],
  twitterChat: [13, 21, 26, 63, 64, 73, 80, 81, 88],
  voice: [30, 39, 41, 63, 64],
  search: [13, 26, 63, 64, 88, 89],
  twitterFollowers: [13, 63, 64, 73, 80, 81],
  twitterReply: [8, 13, 53, 63, 64, 73, 80, 81, 86],
  twitterQuote: [8, 13, 53, 63, 64, 73, 80, 81, 86],
  twitterLike: [8, 13, 53, 63, 64, 73, 80, 81, 86],
  twitterDm: [8, 13, 53, 63, 64, 73, 80, 81, 86],
  twitterQueue: [6, 8, 26, 53, 63, 64, 73, 80, 81, 86, 87],
  runs: [19, 22, 25, 27, 66, 73],
  browsers: [29, 35, 54, 55],
  job: [10, 26, 35],
  mcp: [21, 47],
  conversations: [34],
  errors: [25],
  graph: [6, 25],
  new: [1, 2, 63, 64, 83],
  logout: [],
  whoami: [],
  redditSession: [13, 63, 64, 73, 83],
  discordSession: [13, 63, 64, 73, 83],
  discordChats: [13, 63, 64, 73, 83],
  discordRead: [13, 63, 64, 73, 83],
  discordWatch: [13, 26, 63, 64, 73, 83],
  discordSend: [8, 13, 63, 64, 73, 83],
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
