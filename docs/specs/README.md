---
title: "Specs"
---

# Specs

What log-cli must do, in order by domain: 36 domains, 429 requirements. Each one is checked against its code by SubQ on every commit, push and pull request (rule 117, `bun run check:specs`). AGENTS.md keeps the rules by date; these pages are the same rules as they stand today. Written by `bun run docs:build` from the spec pages, not edited by hand.

## [Command shape](./commandShape.md)

Every log command has one shape: a command that acts on one platform starts with that platform (`log <platform> <command> …`), a command that works on any platform takes none, and an old form is refused with the form it became. Each command declares its platform and carries its full usage, and the reference and the diagrams are written from the code and checked against it. Rules 56, 59, 60, 63, 64 and 103 (rule 63 replaces rule 60's `log warmup <platform>` form, and rule 103 moves rule 56's generated section from the README to `docs/reference.md`).

- **REQ-COMMAND-01** A platform's command runs as log, the platform, then the command
- **REQ-COMMAND-02** An old form without the platform is refused with the form it became
- **REQ-COMMAND-03** A command named under the wrong platform is refused
- **REQ-COMMAND-04** A command that works on any platform takes no platform
- **REQ-COMMAND-05** A platform word with no command after it is refused
- **REQ-COMMAND-06** The old warm-up forms are refused with the form they became
- **REQ-COMMAND-07** Every command declares its platform
- **REQ-COMMAND-08** Every command carries its full usage
- **REQ-COMMAND-09** Every typed input form and flag is in the usage
- **REQ-COMMAND-10** Usage lines put the platform first
- **REQ-COMMAND-11** The reference and the diagrams are written from the code
- **REQ-COMMAND-12** The docs check refuses anything out of date
- **REQ-COMMAND-13** Every diagram parses as Mermaid
- **REQ-COMMAND-14** A command summary doesn't name one browser

## [MCP server](./mcpServer.md)

The log MCP server is how every agent works with log-cli: it carries matt's rules into the agent's context, serves the guides and the use cases, names on every tool the rules, guide and use cases it falls under, and the hooks keep agents on it. Rules 47, 95 and 106 (rule 95 replaces rule 47's long instructions with short ones that send the agent to the full guide; rule 76 puts rule one first).

- **REQ-MCP-01** The instructions carry the core rules, rule one first
- **REQ-MCP-02** The instructions send the agent to the full guide first
- **REQ-MCP-03** AGENTS.md is the resource log://agents
- **REQ-MCP-04** Every tool names the rules it falls under
- **REQ-MCP-05** Every tool names its guide
- **REQ-MCP-06** getGuide reads a guide or a use case
- **REQ-MCP-07** Every tool names the use cases that call it
- **REQ-MCP-08** Every tool declares Claude Code's result limit
- **REQ-MCP-09** The pre-commit review asks SubQ whether the use cases are stale
- **REQ-MCP-10** A log command run by hand from a shell is refused
- **REQ-MCP-11** The terminal-only prompts are let through
- **REQ-MCP-12** A stale MCP server is said to matt
- **REQ-MCP-13** Uncommitted local changes are said loudly
- **REQ-MCP-14** They are said at session start and whenever they change

## [Agent hooks](./agentHooks.md)

The agent hooks put log-cli's state in front of the agent (Claude Code or Codex) at the right moment and stop it from running log the wrong way. One hook list writes both hosts' files, and a check refuses a commit when the hooks, the CLI and the MCP tools drift apart. Rule 55 (with rule 54 for the page states the hooks resolve, and rule 26 for the live log).

- **REQ-HOOKS-01** One hook list writes both hosts' files
- **REQ-HOOKS-02** The check refuses a host file that differs from the list
- **REQ-HOOKS-03** SessionStart and every prompt say where every open browser is
- **REQ-HOOKS-04** After every log or shell call a known state gets its resolver
- **REQ-HOOKS-05** Stop holds the turn while a browser sits on a state log-cli resolves itself
- **REQ-HOOKS-06** A log run that would hide its lines is refused before it starts
- **REQ-HOOKS-07** Every hook script answers its event
- **REQ-HOOKS-08** Every command is an MCP tool or terminal-only
- **REQ-HOOKS-09** Every MCP tool is hooked
- **REQ-HOOKS-10** Every long-running tool points at the live log
- **REQ-HOOKS-11** Every resolver is a real call
- **REQ-HOOKS-12** Every platform's push channel reaches the agent through the inbox hook
- **REQ-HOOKS-13** One watcher process per account, never two
- **REQ-HOOKS-14** One owner per account, every other watch attaches to its relay
- **REQ-HOOKS-15** Only the session that claims a chat acts on it
- **REQ-HOOKS-16** The inbox is one database, read from cursors
- **REQ-HOOKS-17** An account behind is caught up by its owner, and sends wait for it

## [Inspect rule one](./inspectRuleOne.md)

Rule one of the stack: if we don't know, we do this. In `log inspect`, where flows are made to be run again and again, every step's internal API calls are taken out of its recording and decide what the step means. A step no known state names is collated with everything around it and read by SubQ, the reading is said loudly to the agent, the session keeps going until its goal is reached, and what went wrong is written as P.E.E. with its fix. Rule one at the top of AGENTS.md and rules 29, 73, 74, 75 and 76.

- **REQ-INSPECT-01** Every inspect step's internal API calls are taken out of its recording by code
- **REQ-INSPECT-02** Each exchange is timed in seconds from the step's first request
- **REQ-INSPECT-03** A step a known page state names is decided by that state
- **REQ-INSPECT-04** A step no known state names is read by SubQ
- **REQ-INSPECT-05** The step is collated into one bundle
- **REQ-INSPECT-06** SubQ's Decisions API reads it with subq-snap-1.1 and at most 128 questions
- **REQ-INSPECT-07** SubQ is asked what the step means, not what to do next
- **REQ-INSPECT-08** The reading comes first in the step's result
- **REQ-INSPECT-09** The page-state hook puts the reading into the agent's context
- **REQ-INSPECT-10** A recorded step can be read again
- **REQ-INSPECT-11** An inspect session has a goal
- **REQ-INSPECT-12** The goal is reached when a step's reading says so
- **REQ-INSPECT-13** The Stop hook holds the turn until the goal is reached
- **REQ-INSPECT-14** The goal is put into the agent's context when it changes
- **REQ-INSPECT-15** A step that went wrong needs its finding before the next step
- **REQ-INSPECT-16** A finding is Point, Evidence and Explain
- **REQ-INSPECT-17** Once the goal is reached, every finding says how it was fixed
- **REQ-INSPECT-18** Findings are kept in the run
- **REQ-INSPECT-19** What only a person can clear never holds the turn
- **REQ-INSPECT-20** The hook holds the turn once per unchanged state

## [Page states](./pageStates.md)

A known state is resolved, never a reason to stop. When an open browser lands on a page log-cli already knows (a checkpoint's first page, a text captcha, the Remember password prompt, the login form, two-step, "automated behaviour"), its resolver runs, and only what a person must clear stops an account. A Claude Code hook reads the latest step of every open browser and puts the state and its resolver into the agent's context, and the Stop event keeps the turn going while a browser sits on a state log-cli resolves itself. Rule 54 and the page-state part of rule 55, with rule 73 (the internal API answer decides) and rule 77 (a state that needs nothing).

- **REQ-STATE-01** One map names the known page states
- **REQ-STATE-02** The internal API answer decides a state that has one
- **REQ-STATE-03** A checkpoint's first page is never pressed through
- **REQ-STATE-04** A text captcha is solved
- **REQ-STATE-05** The Remember password prompt is passed with Not now
- **REQ-STATE-06** The login form signs in and two-step types the code
- **REQ-STATE-07** "Automated behaviour" is dismissed
- **REQ-STATE-08** Any other checkpoint page stops the account
- **REQ-STATE-09** Only what a person must clear stops an account
- **REQ-STATE-10** A state that needs nothing is not resolved
- **REQ-STATE-11** The hook runs on four events
- **REQ-STATE-12** A session start and every prompt say where every open browser is
- **REQ-STATE-13** After a tool call a known state gets its resolver
- **REQ-STATE-14** A failed step is an unconfirmed page
- **REQ-STATE-15** The Stop event keeps the turn going on a state log-cli resolves
- **REQ-STATE-16** The turn is never held twice on the same unchanged state

## [Flows](./flows.md)

A procedure recorded with `log inspect` becomes the whole pipeline, not a one-off: the recording is turned into a flow definition, the flow gets its documentation and an XState machine, it runs on any account, and every saved flow is an MCP tool of its own. A flow is deterministic: each control is picked by one scored match, never by a page's exact wording or a person stepping in, and every step waits for the call it must cause and checks its answer before the next one fires. Rules 31 and 79.

- **REQ-FLOW-01** An inspect recording is turned into a saved flow
- **REQ-FLOW-02** Each step's control is taken from the snapshot it acted on
- **REQ-FLOW-03** Each step's confirming request is taken from what it sent
- **REQ-FLOW-04** Each step keeps rea's evidence
- **REQ-FLOW-05** Every flow has its documentation
- **REQ-FLOW-06** A flow is an XState machine
- **REQ-FLOW-07** A flow is a dry run unless --live
- **REQ-FLOW-08** Every saved flow is an MCP tool of its own
- **REQ-FLOW-09** A control is one scored match by role, then name
- **REQ-FLOW-10** The match is inside the dialog the step names
- **REQ-FLOW-11** Two equal matches are refused
- **REQ-FLOW-12** No match is controlMissing
- **REQ-FLOW-13** A disabled control is waited for
- **REQ-FLOW-14** Every step waits for the call it must cause
- **REQ-FLOW-15** The answer is checked before the next step
- **REQ-FLOW-16** Known overlays are cleared before the first click
- **REQ-FLOW-17** An overlay that stays stops the flow

## [Runs and rea](./runsAndRea.md)

Every browser action records a raw HAR of everything it did, and rea reads it. What each platform's client does is written up as one doc per request, by platform and then domain, built from the runs by `log facebook capture --docs` with rea reading each request's code. A run is deleted once it is analysed, and what it taught is kept. Rules 22, 27, 48, 66 and 85, with rule 73 (a step's exchanges are kept past the prune).

- **REQ-RUNS-01** Every browser context records a raw HAR
- **REQ-RUNS-02** A browser without a capture folder is refused
- **REQ-RUNS-03** rea settles every run's capture
- **REQ-RUNS-04** The capture is split per step and each step is read
- **REQ-RUNS-05** Facebook's requests are documented by domain
- **REQ-RUNS-06** rea reads each Facebook request's code
- **REQ-RUNS-07** Every browser platform's calls go through rea
- **REQ-RUNS-08** A doc keeps every row its pruned runs gave
- **REQ-RUNS-09** The docs gate refuses undocumented or unread requests
- **REQ-RUNS-10** A run may go only once it is analysed
- **REQ-RUNS-11** Pruning is a dry run unless --apply
- **REQ-RUNS-12** Every step's exchanges are taken out before a run goes
- **REQ-RUNS-13** What a run taught is kept
- **REQ-RUNS-14** The storage hook warns before the disk fills

## [Browser gate](./browserGate.md)

Before an account's browser loads anything, it goes through one gate: a headed launch, the account's proxy with its exit in the account's country, the account's one device, the locale of its home country, and a self-check in the page and a worker. The gate is `python/browser/proxyGate.py`, with the run's device and home prepared by `prepareRun`. Rules 11, 12, 15, 16, 17 and 92, with rule 84 for platforms that run without a proxy.

- **REQ-GATE-01** A Camoufox launch is never headless
- **REQ-GATE-02** The caller can only pass the options the gate allows
- **REQ-GATE-03** A launch that did not go through the gate is refused
- **REQ-GATE-04** No browser opens without the account's proxy
- **REQ-GATE-05** A Facebook account never runs direct
- **REQ-GATE-06** The exit IP must be in the account's country
- **REQ-GATE-07** An exit with no known timezone is refused
- **REQ-GATE-08** A proxy too slow to reach Facebook is refused
- **REQ-GATE-09** The first launch makes the account's one device
- **REQ-GATE-10** Every later launch replays the stored device
- **REQ-GATE-11** An unreadable stored device is refused
- **REQ-GATE-12** The locale comes from the home country's table
- **REQ-GATE-13** The pinned locale reaches the launch
- **REQ-GATE-14** The timezone must be the exit IP's, in page and worker
- **REQ-GATE-15** The language and Intl locale must be exactly the pinned locale
- **REQ-GATE-16** The language list must start with the pinned languages
- **REQ-GATE-17** The browser's exit IP is the one the gate checked, or in its country and timezone
- **REQ-GATE-18** A failed self-check stops the browser before Facebook loads

## [Launch budget](./launchBudget.md)

Before a run opens an account's browser, `prepareRun` checks when it may open: only inside the account's local waking hours, at most 8 launches a local day and at least 10 minutes apart. `--bypass` skips the hours only, `--now` skips the gap only, and only matt resets the count, with `log facebook account resetOpens`. Rules 18, 20, 24, 30 and 37.

- **REQ-LAUNCH-01** No run outside the account's waking hours
- **REQ-LAUNCH-02** The account's own hours replace the default
- **REQ-LAUNCH-03** --bypass skips the waking hours and nothing else
- **REQ-LAUNCH-04** At most 8 launches a local day
- **REQ-LAUNCH-05** Launches are at least 10 minutes apart
- **REQ-LAUNCH-06** A launch counts once it passed the self-check
- **REQ-LAUNCH-07** The day is the account's local day
- **REQ-LAUNCH-08** --now skips only the 10-minute gap
- **REQ-LAUNCH-09** Only a publish against the saved fixture form is not counted
- **REQ-LAUNCH-10** resetOpens writes one dated line and deletes nothing
- **REQ-LAUNCH-11** Launches before the latest reset stop counting
- **REQ-LAUNCH-12** resetOpens is refused while a browser is open

## [AdsPower](./adsPower.md)

AdsPower is the account's browser. Each account holds one AdsPower profile, linked in Twenty, which keeps its own fingerprint and cookies but never the proxy or the login. log opens it through the same gate and self-check as every browser and drives it with Playwright over CDP. A deactivated account, or one whose home is not in `LOG_ADSPOWER_HOMES`, gives its profile back. Rules 42, 44, 59, 78 and 84.

- **REQ-ADSPOWER-01** Each account is linked to one profile
- **REQ-ADSPOWER-02** A profile holds no proxy
- **REQ-ADSPOWER-03** The account's browser is AdsPower when it has a profile
- **REQ-ADSPOWER-04** An account without a profile is refused
- **REQ-ADSPOWER-05** The gate runs before the proxy goes on
- **REQ-ADSPOWER-06** The proxy goes on only to open
- **REQ-ADSPOWER-07** The proxy comes off at close
- **REQ-ADSPOWER-08** The profile starts headed
- **REQ-ADSPOWER-09** Playwright drives it over CDP
- **REQ-ADSPOWER-10** The self-check and the session HAR run on it
- **REQ-ADSPOWER-11** The profile keeps its own cookies
- **REQ-ADSPOWER-12** A deactivated account gives its profile back
- **REQ-ADSPOWER-13** Setting DEACTIVATED gives the profile back at once
- **REQ-ADSPOWER-14** The sync releases before it creates
- **REQ-ADSPOWER-15** Only the homes in LOG_ADSPOWER_HOMES hold a profile

## [Account lifecycle](./accountLifecycle.md)

Every account runs one lifecycle machine (`lifecycleMachine`, XState) that holds one browser open for the account's day: an onboarding lane (proxy, sign-in, account check, profile, name, location, a day's warm-up) and a host lane (open, watching, acting, resting). The browser opens once a local day, every action is a tab in it, and it closes only for a logged reason. An open browser that lands on a `/checkpoint` page deactivates its account. Rules 35 and 82.

- **REQ-LIFE-01** An account's status picks where the machine starts
- **REQ-LIFE-02** The browser is opened only when it is not already open
- **REQ-LIFE-03** The browser opens at most twice a local day
- **REQ-LIFE-04** An action runs in the open browser
- **REQ-LIFE-05** Every close is logged with its reason
- **REQ-LIFE-06** The end of the active hours closes the browser until morning
- **REQ-LIFE-07** Shutdown and a lost account close the browser
- **REQ-LIFE-08** A restriction or a ban closes the browser
- **REQ-LIFE-09** A crash is logged and the browser is opened again
- **REQ-LIFE-10** Onboarding runs its steps in order in the open browser
- **REQ-LIFE-11** The warm-up takes a day
- **REQ-LIFE-12** A sign-out goes back to signing in, twice at most
- **REQ-LIFE-13** A checkpoint page deactivates the account
- **REQ-LIFE-14** Every open account browser is watched for a checkpoint
- **REQ-LIFE-15** An account already deactivated is left as it is
- **REQ-LIFE-16** A checkpoint closes the browser and ends the lifecycle

## [Proxies](./proxies.md)

Every Facebook account goes out through its own proxy, kept as one URL in Twenty whichever provider it came from. log-cli reads the provider from the proxy's host, gives an account a proxy from 2Captcha or Byteful in its home city after checking it, sets the proxy speed limit per run, meters each account's proxy traffic against a 24 hour budget, and never buys from a provider. Rules 33, 43, 51 and 52 (rule 52 widens rule 43 to Byteful).

- **REQ-PROXY-01** --proxyMs sets the speed limit for one run
- **REQ-PROXY-02** The speed limit defaults to 2500 ms
- **REQ-PROXY-03** The provider is read from the proxy's host
- **REQ-PROXY-04** An assigned proxy is checked before it is saved
- **REQ-PROXY-05** Byteful gives a sticky 24 hour residential proxy in the home city
- **REQ-PROXY-06** Deactivated and non-Facebook accounts get no proxy
- **REQ-PROXY-07** log-cli never buys from a provider
- **REQ-PROXY-08** Each account has a 24 hour traffic budget of 1 GB by default
- **REQ-PROXY-09** A warm-up over its budget does not start
- **REQ-PROXY-10** The Reels warm-up checks its traffic every 5 reels and stops at the budget
- **REQ-PROXY-11** Each run's traffic is recorded
- **REQ-PROXY-12** A proxy is metered by its own provider, a static IP is not

## [Facebook groups](./facebookGroups.md)

Facebook group listening is OpenMagpie's triage job: an account joins a group, OpenMagpie polls it through log-cli's worker (`log facebook poll --request`), keeps every post and sends only the matches to Twenty. log-cli writes only the group's read state to Twenty. A group's members are read from its People tab, a scroll at a time, into files on disk. Rules 65 and 77 (rule 65 replaces rules 61 and 62).

- **REQ-GROUP-01** The poll worker answers OpenMagpie's groups.search
- **REQ-GROUP-02** Each group is read in an open browser of an account in it
- **REQ-GROUP-03** A poll clicks nothing and reads no comments
- **REQ-GROUP-04** A sign-in problem is auth_required to OpenMagpie
- **REQ-GROUP-05** Only the group's read state and identity are written to Twenty
- **REQ-GROUP-06** The cursor moves only when the feed read finished
- **REQ-GROUP-07** Members are read from the People tab, nothing clicked
- **REQ-GROUP-08** Members come from the page and each scroll's refetch answer
- **REQ-GROUP-09** It says up front how long it will take
- **REQ-GROUP-10** secondsPerScroll is the wait before each scroll
- **REQ-GROUP-11** It stops at the count, the end of the list or maxScrolls
- **REQ-GROUP-12** --owners keeps owners and pages
- **REQ-GROUP-13** Members go to files, never to Twenty
- **REQ-GROUP-14** A members page that answered is a known state that needs nothing

## [Warm-up](./warmup.md)

The warm-up makes an account look used before it sells: Listaro's five Facebook activities run as recorded flows (`log facebook warmup stages`), and the Reels activity (`log facebook warmup reel`) watches reels the way a real person with the account's persona would, each step checked against what it must achieve. Rules 36, 49 and 50, with the command forms of rules 60 and 63 and the code layout of rule 64.

- **REQ-WARMUP-01** The stages are Listaro's five activities, each a flow of its own
- **REQ-WARMUP-02** Recording turns each activity into a flow, never from a broken recording
- **REQ-WARMUP-03** Running needs every flow recorded, and runs them in turn in one browser
- **REQ-WARMUP-04** A checkpoint, login wall or restriction stops the stages
- **REQ-WARMUP-05** Each stage event goes to the stage log
- **REQ-WARMUP-06** Reels start with the sound on
- **REQ-WARMUP-07** Every Reels step says what it must achieve
- **REQ-WARMUP-08** The comments are scrolled over the panel
- **REQ-WARMUP-09** Each run writes the outline of the steps that did not work
- **REQ-WARMUP-10** A drawn session skips most reels after a glance
- **REQ-WARMUP-11** Likes need --likes, clicks need --live
- **REQ-WARMUP-12** One persona, one real viewer and one pack per account
- **REQ-WARMUP-13** SubQ reads each reel from its frame
- **REQ-WARMUP-14** The watch is the viewer's real play scaled by the interest effect
- **REQ-WARMUP-15** The watch counts from when the reel landed
- **REQ-WARMUP-16** At most one action per reel, by its score
- **REQ-WARMUP-17** A close call is settled by SubQ's pick
- **REQ-WARMUP-18** rea reads each step without holding up the next

## [X session](./xSession.md)

How log-cli talks to X: directly, with no proxy, through one curl_cffi client per account that lives in one engine host, one call at a time, spaced the way X's own web app spaces them, and signed with X's live operation ids. Rules 80, 81, 104, 105, 110 and 113.

- **REQ-XSESSION-01** An X account calls X directly, with no proxy
- **REQ-XSESSION-02** twikit goes out as curl_cffi impersonating Safari
- **REQ-XSESSION-03** One call per account at a time
- **REQ-XSESSION-04** Sends are spaced 4 to 11 seconds, reads 0.8 to 2.5 seconds
- **REQ-XSESSION-05** The transaction key is kept for 3 hours
- **REQ-XSESSION-06** Every X call goes through the account's one engine host
- **REQ-XSESSION-07** The host keeps one client for the account
- **REQ-XSESSION-08** A second host cannot start
- **REQ-XSESSION-09** A call that cannot reach the host is refused, never run on its own
- **REQ-XSESSION-10** The host closes when idle for 30 minutes or when its code changes
- **REQ-XSESSION-11** A call to a restarting session waits for the new one
- **REQ-XSESSION-12** A closing session drops its connections and exits at once
- **REQ-XSESSION-13** webClient writes X's live operation table
- **REQ-XSESSION-14** Every GraphQL call uses X's live id and exactly X's switches

## [Write budgets](./writeBudgets.md)

How many times an account may write on its platform in a day, how matt can push one call past the account's governor, and how a refusal stops an account instead of being pushed through. Every direct-API engine (X, Discord, LinkedIn, Reddit and any new platform) runs each call through the account's own governor. Rules 86, 91, 94, 96, 101 and 102.

- **REQ-BUDGET-01** Each platform has its own daily write budget
- **REQ-BUDGET-02** Every engine run carries the platform's budget
- **REQ-BUDGET-03** The governor's write cap is the platform's budget
- **REQ-BUDGET-04** Every call goes through the account's governor first
- **REQ-BUDGET-05** Only an X call with force set goes past the governor
- **REQ-BUDGET-06** --force is for that call or that run only
- **REQ-BUDGET-07** A forced answer says what it went past
- **REQ-BUDGET-08** The governor still counts a forced request
- **REQ-BUDGET-09** A throttle or block answer pauses the account
- **REQ-BUDGET-10** A Discord 429 stops the read and is never retried
- **REQ-BUDGET-11** A 429 on a session check is a throttle, not a session
- **REQ-BUDGET-13** A refusal stops the whole Discord read
- **REQ-BUDGET-12** LinkedIn goes out as curl_cffi impersonating Chrome

## [X queue](./xQueue.md)

An X account sends more than one thing only through its queue (`log twitter queue build|plan|run|add|edit`, MCP `twitterQueue…`), at random times, one queue and one run per account, a refusal from X stops the run, and the queue hook puts what the run did in front of the agent. Rules 94, 104, 107 and 114.

- **REQ-QUEUE-01** Every planned send gets a random time at least minGap apart
- **REQ-QUEUE-02** A run refuses a queue that is not approved as it stands
- **REQ-QUEUE-03** A run sends one item at a time, in time order
- **REQ-QUEUE-04** Two sends are never closer than minGap
- **REQ-QUEUE-05** One run per queue
- **REQ-QUEUE-06** queue add hands new items to a running run
- **REQ-QUEUE-07** The run takes additions in as it waits and fits them minGap apart
- **REQ-QUEUE-08** An addition due sooner goes first
- **REQ-QUEUE-09** One queue holds every kind of send
- **REQ-QUEUE-10** --keepOpen keeps the run going for more
- **REQ-QUEUE-11** The hook reads each queue's log since this session's last look
- **REQ-QUEUE-12** Held items, sends, refusals, stops and starts go into the agent's context
- **REQ-QUEUE-13** The hook says what to do
- **REQ-QUEUE-14** A refusal from X stops the run, and only a network drop is tried again
- **REQ-QUEUE-15** A reply goes only to an author with 1500 followers or fewer

## [Full context before a send](./fullContext.md)

Before anything goes to a person on X, log reads that person's full context through the tool: their whole thread, read from X, and what they did on the account's posts. It reads both again right before each queued send and holds the item when anything happened since it was drafted. Rule 109, with rule 110's notification freshness.

- **REQ-CONTEXT-01** twitterDms with a handle gives the thread and the person's activity
- **REQ-CONTEXT-02** Activity names what they did and their words
- **REQ-CONTEXT-03** Notifications are read again only when older than 2 minutes
- **REQ-CONTEXT-04** The queue reads the context again from the .db before each send
- **REQ-CONTEXT-05** Changes are counted since the item was drafted
- **REQ-CONTEXT-06** An item whose context changed is held, not sent
- **REQ-CONTEXT-07** A held item is put back only with queue edit
- **REQ-CONTEXT-08** An item cannot be edited while its run is going
- **REQ-CONTEXT-09** A like and the parts of a split dm ride on their send's context read
- **REQ-CONTEXT-10** The context before a send is read from the .db once the account has caught up

## [Voice gate](./voiceGate.md)

Every message log sends as matt passes the voice gate first (`log voice`, MCP `voice`). The gate asks SubQ whether matt typed it himself, reading his own writing across all his conversations. Rules 90, 98, 111 and 112.

- **REQ-VOICE-01** Every draft is read against matt's writing across all his conversations
- **REQ-VOICE-02** A chat with the person adds that chat's evidence
- **REQ-VOICE-03** Phrases matt never says fail the draft
- **REQ-VOICE-04** A first message is only the opener
- **REQ-VOICE-05** A draft with AI artifacts fails
- **REQ-VOICE-06** A draft passes only when every answer passes
- **REQ-VOICE-07** A draft written in word pairs matt has never written fails
- **REQ-VOICE-08** The vendored watermark scrambler reads every draft
- **REQ-VOICE-09** The gate runs inside every send and refuses a failing draft
- **REQ-VOICE-10** The chat's context is ranked for the moment and given in full
- **REQ-VOICE-11** Only embeddings are stored, each once, in the .db

## [AI tells and watermark](./aiTells.md)

Every X and Discord send's copy is read for what AI chat interfaces leave in text (the watermark reading), and every draft the voice gate reads is also read for AI phrasing against curated lists and matt's own writing. Rules 111 and 112.

- **REQ-AITELLS-01** The reading is clean, stylistic or artifacts
- **REQ-AITELLS-02** planSend refuses copy with artifacts
- **REQ-AITELLS-03** The plan carries the reading and every send logs it
- **REQ-AITELLS-13** A Discord send is read the same way before anything goes out
- **REQ-AITELLS-04** vale-ai-tells rules run on the draft
- **REQ-AITELLS-05** The index embeds every literal phrase with Jina
- **REQ-AITELLS-06** Phrases quoted on X are kept only when close to a curated one
- **REQ-AITELLS-07** matt's own p50 and p99 are measured
- **REQ-AITELLS-08** Vale rules matt uses himself are muted
- **REQ-AITELLS-09** Phrases matt says himself never fail a draft
- **REQ-AITELLS-10** Each chunk's closest AI phrase is found and reranked
- **REQ-AITELLS-11** A draft closer to AI phrasing than matt's p99 fails
- **REQ-AITELLS-12** The voice gate keeps the index current and fails on AI tells

## [Message split and the opener](./messageSplit.md)

How a message to a person goes out: a draft on several lines goes out one message per line in every chat, a one-line draft is split the way matt writes in that chat, and a first message is gated as the opener as a whole before any of it is sent. Rules 90 and 98.

- **REQ-SPLIT-01** A draft on several lines goes out one message per line
- **REQ-SPLIT-02** --asOne sends it as one message
- **REQ-SPLIT-03** A one-line draft is split the way matt writes in that chat
- **REQ-SPLIT-04** The parts go out with his usual gap
- **REQ-SPLIT-05** Every chat splits the same way
- **REQ-SPLIT-06** A part that is not sent stops the rest
- **REQ-SPLIT-08** A send stops the moment they write back
- **REQ-SPLIT-07** A first message is gated whole as the opener

## [X Chat](./xChat.md)

X Chat is X's encrypted DM inbox, separate from the old DM API. log reads it only through its own engine and vendored twikit, with the account's PIN from Twenty, uses it to keep cold dms away from people matt already talks to, and treats a reaction or a read receipt as a follow-up to send. Rules 87, 88 and 100.

- **REQ-XCHAT-01** A dm queue check reads the account's X Chat inbox
- **REQ-XCHAT-02** A pending dm to someone already in a conversation is dropped
- **REQ-XCHAT-03** A failed X Chat read refuses the check
- **REQ-XCHAT-04** --skipXChatCheck is the only way past it
- **REQ-XCHAT-05** X Chat is unlocked with the account's PIN from Twenty
- **REQ-XCHAT-06** The PIN is saved only from a masked prompt, after it unlocks
- **REQ-XCHAT-07** A person's old DM thread and X Chat thread are one conversation
- **REQ-XCHAT-08** A reaction as their last event is a follow-up
- **REQ-XCHAT-09** A read receipt past matt's last message is a follow-up
- **REQ-XCHAT-10** --waiting lists the follow-ups apart

## [X live](./xLive.md)

While an account's X Chat watch is open, its one session keeps X's own notification refresher going the way x.com does, writes each count and each new like, retweet, reply, quote, mention or follow to the account's `live.jsonl`, and a hook puts them in front of every Claude session, each with its own place in the file. Rule 115.

- **REQ-XLIVE-01** The watch polls X's badge counts every 120 seconds
- **REQ-XLIVE-02** A rise in unread notifications reads one page of new ones
- **REQ-XLIVE-03** Every count and new event goes to live.jsonl
- **REQ-XLIVE-04** A refused read stops the poll
- **REQ-XLIVE-05** The X live hook puts new events in front of the agent
- **REQ-XLIVE-06** Each Claude session reads from its own offsets
- **REQ-XLIVE-07** A refused read is said to matt

## [Platform scaffold](./platformScaffold.md)

A new platform is made whole with one command, `log new platform <name>` (MCP `newPlatform`), and one table, `PLATFORM_SITES`, says what each platform is: its Twenty value, cookie domain, hosts, home page, whether it needs a proxy and whether it has a browser path. `log inspect`, the account's browser and the AdsPower sync read that table, so a new platform is explored the same way as Facebook. Rules 83 and 84.

- **REQ-PLATFORM-01** One command writes the platform's files
- **REQ-PLATFORM-02** The repo is wired by editing each file through its syntax tree
- **REQ-PLATFORM-03** Every edit is checked to have landed before anything is written
- **REQ-PLATFORM-04** Without --apply it only lists what it would do
- **REQ-PLATFORM-05** Nothing is overwritten
- **REQ-PLATFORM-06** The name is camelCase
- **REQ-PLATFORM-07** It names what Twenty is missing and never changes Twenty
- **REQ-PLATFORM-08** The command writes the platform's row in the table
- **REQ-PLATFORM-09** The check refuses a platform half wired
- **REQ-PLATFORM-10** Each platform's row says what it is
- **REQ-PLATFORM-11** Inspect goes only to known platforms' hosts
- **REQ-PLATFORM-12** A no-proxy platform opens with no proxy
- **REQ-PLATFORM-13** The AdsPower sync gives every browser platform's accounts a profile
- **REQ-PLATFORM-14** A new platform is made with its spec and anchors

## [Conversation search](./search.md)

Finding context in conversations is a search, never reading every thread. `log search "<query>"` (MCP `search`) runs keyword and meaning search together over every conversation log has read, fused into one ranking, with filters for platform, account, person and day. `log search index` reads the conversations and keeps the indexes on disk; `log search bench` times it. Rule 89 (with rule 88 for X Chat, decrypted with the saved PIN).

- **REQ-SEARCH-01** Keyword and meaning search run together and are fused
- **REQ-SEARCH-02** Reciprocal rank fusion scores each hit by its ranks
- **REQ-SEARCH-03** The filters keep only matching chunks
- **REQ-SEARCH-04** The embeddings are local all-MiniLM-L6-v2
- **REQ-SEARCH-05** The index reads every conversation through the platform's engine
- **REQ-SEARCH-06** The indexes survive restarts
- **REQ-SEARCH-07** An update embeds only what changed
- **REQ-SEARCH-08** The bench prints p50, p95 and p99, cold and warm, beside a linear scan

## [Knowledge base](./knowledgeBase.md)

The knowledge base holds everything an agent should look up before it guesses: AGENTS.md's rules and sections, the skills, the docs, the Claude memory files, the known page states and the accounts. It lives in ListeningKit's Twenty on node02 and is searched through Redis on node02 by keyword and meaning at once. `log kb sync`, `log kb search`, `log kb remember` and `log kb show` (MCP `kbSync`, `kbSearch`, `kbRemember`, `kbShow`). Rule 93 (with rule 38 for the pages it leaves out).

- **REQ-KB-01** The articles live in Twenty's knowledgeArticles
- **REQ-KB-02** The logins are files outside the repo
- **REQ-KB-03** Search is keyword and meaning at once, fused
- **REQ-KB-04** Sync collects every source
- **REQ-KB-05** Some pages and fields are never collected
- **REQ-KB-06** Sync writes only what changed
- **REQ-KB-07** Redis is re-indexed from Twenty, only what changed
- **REQ-KB-08** Remember saves a note to Twenty and Redis at once
- **REQ-KB-09** Show reads one article in full
- **REQ-KB-10** Secrets are scrubbed before anything is written

## [Local accounts](./localAccounts.md)

Accounts can live in a local file instead of Twenty, on every platform, so log can run everything locally. `log localAccount pull|add|list` (MCP `localAccount`) fills and reads the file, and `LOG_ACCOUNTS=local` leaves Twenty out of accounts entirely. Listings, groups and conversations stay in Twenty. Rule 97, which narrows rule 13 for accounts only.

- **REQ-LOCAL-01** Accounts live in one local file
- **REQ-LOCAL-02** Pull copies every Twenty account in, keeping its Twenty id
- **REQ-LOCAL-03** Add makes an account Twenty never had
- **REQ-LOCAL-04** List shows the local accounts
- **REQ-LOCAL-05** A local row wins over Twenty's of the same name
- **REQ-LOCAL-06** LOG_ACCOUNTS=local leaves Twenty out of accounts
- **REQ-LOCAL-07** A session a run saves goes back to the file
- **REQ-LOCAL-08** Everything else stays in Twenty
- **REQ-LOCAL-09** The tool names the rule it falls under

## [Memelord extension](./memelord.md)

log's first extension: Memelord's meme templates, clips and stickers, searched for the moment in a chat and sent in context. Only its four free discovery tools are reachable, so nothing costs money. Rules 41, 94 and 119.

- **REQ-MEME-01** Only the four free discovery tools are reachable
- **REQ-MEME-02** Every call is a GET with the key as a bearer token
- **REQ-MEME-03** No key means no call
- **REQ-MEME-04** Memelord's own refusal is passed on
- **REQ-MEME-05** Each template comes back with its media url
- **REQ-MEME-06** Values are camelCase in log and converted at the boundary
- **REQ-MEME-07** A bad limit is refused before any call
- **REQ-MEME-08** The image tools are listed, never run
- **REQ-MEME-09** The taste index is read from the pictures he sent
- **REQ-MEME-10** Search ranks by his taste and says it first

## [Voice notes](./voiceNotes.md)

Every voice note on X and Discord, sent to matt or by him, is transcribed with AssemblyAI and written into the conversation store, so search, the voice gate and SubQ see what was said. Rules 26, 41, 88, 89, 94, 105, 106 and 126.

- **REQ-TRANSCRIBE-01** Upload, ask, poll until done
- **REQ-TRANSCRIBE-02** No key means no call
- **REQ-TRANSCRIBE-03** AssemblyAI's failure is passed on
- **REQ-TRANSCRIBE-04** A file is transcribed once
- **REQ-TRANSCRIBE-05** The marker becomes what was said
- **REQ-TRANSCRIBE-06** A fresh read never loses a transcript
- **REQ-TRANSCRIBE-07** Discord keeps its attachments
- **REQ-TRANSCRIBE-08** X voice notes come through the account's one session
- **REQ-TRANSCRIBE-09** Discord voice notes come from Discord's sound search
- **REQ-TRANSCRIBE-10** A refusal stops it
- **REQ-TRANSCRIBE-11** Reads and the inbox transcribe as they go
- **REQ-TRANSCRIBE-12** Audio is detected once, for every platform
- **REQ-TRANSCRIBE-13** A new platform keeps its attachments from the start

## [Media described](./mediaDescriber.md)

Every image, meme, gif and video sent or received is described by one local vision model into the .db before anyone replies, and anything not described yet is shown as such. Rules 126, 131, 137 and 138.

- **REQ-MEDIA-01** One describer per machine, the model loaded once
- **REQ-MEDIA-02** It beats, and stops loudly past its memory ceiling
- **REQ-MEDIA-03** Each description is labelled and embedded
- **REQ-MEDIA-04** Every attachment a watch receives is queued, bounded
- **REQ-MEDIA-05** The context shows the description, or that there is none yet
- **REQ-MEDIA-06** The engines keep a local copy of every image and video sent

## [Reactions](./reactions.md)

The account reacts to a message with an emoji on X, Discord, Slack and Instagram through each platform's own engine and its one session, never the browser, as a write like any send. Rule 140.

- **REQ-REACT-01** One react command per chat platform, a dry run unless --live
- **REQ-REACT-02** The chat is claimed first and released after
- **REQ-REACT-03** Each engine calls the platform's own reaction call, as a write
- **REQ-REACT-04** An emoji or its name works on every platform

## [Instagram](./instagram.md)

What `log new platform instagram` made, and what the platform's code must keep doing as it grows. Rules 83, 117 and 123.

- **REQ-INSTAGRAM-01** The account is found on its own platform's row and gated
- **REQ-INSTAGRAM-02** The engine runs the account through the shared platform kit
- **REQ-INSTAGRAM-03** Instagram's own answer is what gets recorded
- **REQ-INSTAGRAM-05** The session is checked through the vendored instagrapi over curl_cffi
- **REQ-INSTAGRAM-06** DMs are read through instagrapi, sending nothing and marking nothing seen
- **REQ-INSTAGRAM-07** Sending goes through instagrapi, a dry run unless --live
- **REQ-INSTAGRAM-08** New DMs are pushed by Instagram's realtime connection to the inbox hook
- **REQ-INSTAGRAM-09** One continuous session per account, never a cold start per call
- **REQ-INSTAGRAM-04** The platform is wired into the CLI and the direct-API routes

## [Marketplace copy versions](./marketplaceCopy.md)

An ad that goes out on more than one listing in a city says the same thing several ways: it carries copy versions (`agencyListings.copyVersions`, title and description pairs written by `skills/listingCopy`), and each copy takes the version least like what is already live in its city. Rule 71.

- **REQ-LISTING-10** Enough versions for the city, never fewer than 3
- **REQ-LISTING-11** Every two titles differ by at least half their words
- **REQ-LISTING-12** Each version keeps the checkable copy rules
- **REQ-LISTING-13** Each copy takes the version least like what is live in its city
- **REQ-LISTING-14** A replacement skips the lost copy's version
- **REQ-LISTING-15** Lint, create and fill refuse a version that breaks a rule

## [Marketplace location](./marketplaceLocation.md)

Where a Marketplace listing is and where an account sells from is typed as a place Facebook cannot mistake: "City, State" with the state written out ("Bethlehem, Pennsylvania") or "City, Country" ("Galway, Ireland"), never abbreviated, never a zip. A check refuses anything else before any action, and the suggestion picked is the one Facebook's own answer names as the place typed. Rules 68 and 72 (rule 72 repeats and widens rule 68's location part).

- **REQ-LISTING-01** An abbreviated place is refused with locationAbbreviated
- **REQ-LISTING-02** The Python sessions run the same check
- **REQ-LISTING-03** A US state code is written out
- **REQ-LISTING-04** A written-out state counts as the US
- **REQ-LISTING-05** A listing's locationQuery is checked
- **REQ-LISTING-06** log inspect do setLocation is checked
- **REQ-LISTING-07** A flow's location is checked before it runs
- **REQ-LISTING-08** The host sets the location from a written-out place, never a zip
- **REQ-LISTING-09** The suggestion is the one Facebook's answer names as the place typed

## [Marketplace publish and check](./marketplacePublish.md)

log-cli is read-only on Facebook except where matt asked for an action. Posting a listing is one he asked for: `log facebook publish` posts one listing through the publish machine, a dry run unless `--live`, with nothing retried once Publish is clicked. Once a listing is live, the account is checked on a schedule in the browser the host holds (`log facebook check` runs it once), reading Facebook's own answers and clicking nothing. Rules 8, 10 and 69.

- **REQ-LISTING-16** Publish is a dry run unless --live
- **REQ-LISTING-17** Nothing is retried once Publish is clicked
- **REQ-LISTING-18** Captchas go to CaptchaKraken first, then 2Captcha
- **REQ-LISTING-19** A live publish stops at the account's daily cap
- **REQ-LISTING-20** The check reads three pages and clicks nothing
- **REQ-LISTING-21** Anything but full access is the account's suspended issue
- **REQ-LISTING-22** Each listing's state on Selling goes into Twenty
- **REQ-LISTING-23** Seller chats are counted and kept as sent

## [Slack](./slack.md)

What `log new platform slack` made, and what the platform's code must keep doing as it grows. Rules 83, 117, 123, 124 and 125.

- **REQ-SLACK-01** The account is found on its own platform's row and gated
- **REQ-SLACK-02** The engine runs the account through the shared platform kit
- **REQ-SLACK-03** Slack's own answer is what gets recorded
- **REQ-SLACK-04** The platform is wired into the CLI and the direct-API routes
- **REQ-SLACK-05** Slack is reached only through one curl_cffi session that impersonates Chrome
