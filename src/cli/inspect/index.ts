import { spawn } from "node:child_process";
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { addGoalEvent, clearCurrentInspect, currentInspectPath, evidenceOf, GOAL_FINDINGS_FILE, goalEvents, goalLine, goalProgress, goalProgressOf, INSPECT_ACTIONS, lastStepOf, stepBefore, LIVE_ACTIONS, openInspects, parseInspectAction, peeMarkdown, readCurrentInspect, renderInspectStep, runReadings, writeCurrentInspect } from "../../browser/inspect/index.ts";
import type { CurrentInspect } from "../../browser/inspect/index.ts";
import { findAccount } from "../../marketplace/socialAccount/index.ts";
import { inspectRuns, mapAllInspectRuns, mapInspectRun } from "../../rea/inspectMap/index.ts";
import { openAccount, withRun } from "../live/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, PROXY_MS_FLAG } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";
import { browserFor } from "../../browser/driver/index.ts";
import type { FacebookAccount } from "../../marketplace/socialAccount/index.ts";
import { loudText, readStep, timelineText } from "../../subq/stepReading/index.ts";
import type { StepReading } from "../../subq/stepReading/index.ts";
import type { CommandContext } from "../runner/types.ts";
import { watchCheckpoint } from "./helpers/index.ts";

export const INSPECT_USAGE = [
  "Usage: log inspect start --account <accountName> [--goal <text>] [--url <https://www.facebook.com/...>] [--bypass] [--now] [--noIdleMouse] [--detach]   (one session per account: two accounts can be open at once; --detach runs it as its own process and returns once it is open)",
  "       log inspect map [<runDir>] [--all]  (the recorded steps as states and transitions: flow.md, machine.json; default the latest run; --all collates every run)",
  "       log inspect do <goto <url>|snapshot|back|wait [s]|click <ref>|type <ref> <text>|press <key>|upload <ref> <file>|highlight <role> <name>|solve|signIn|code|pin|stop> [--live] [--goal <text>] [--timeout <s>] [--json] [--account <accountName>]   (--account picks the session when more than one is open; every step's internal API calls are read, and a step no known state names is read by SubQ against the goal, rules 73-74)",
  "       log inspect read <stepFolder> --account <accountName> [--goal <text>] [--json]   (read a recorded step again: its internal API calls, the page and the earlier steps, by SubQ when no known state names it)",
  "       log inspect goal [--set <text>] [--account <accountName>] [--json]   (the session's goal, whether a step's reading says it is reached, and its P.E.E. findings: what went wrong, the evidence, why, and how it was fixed; rule 75)",
  "       log inspect finding --step <step> --point <text> --explain <text> [--evidence <text>] [--account <accountName>]   (a step that went wrong: Point, the issue in one sentence; Evidence, quoted from the step's reading, plus your own; Explain, why the evidence shows it and what caused it)",
  "       log inspect finding --fixes <n> --fix <text> [--account <accountName>]   (how finding n was fixed)",
  "       log inspect sessions   (the open sessions)",
].join("\n");

const LOG_BIN = fileURLToPath(new URL("../../../bin/log.ts", import.meta.url));

export function hasMessengerPin(loginPath: string | null): boolean {
  if (!loginPath || !existsSync(loginPath)) return false;
  try {
    return /^\d{6}$/.test(String((JSON.parse(readFileSync(loginPath, "utf8")) as { messengerPin?: unknown }).messengerPin ?? ""));
  } catch {
    return false;
  }
}

export const inspectDetachDeps: {
  start: (argv: string[], logPath: string) => { exited: () => number | null };
  timeoutMs: number;
} = {
  start(argv, logPath) {
    mkdirSync(dirname(logPath), { recursive: true });
    const out = openSync(logPath, "a");
    const child = spawn(process.execPath, [LOG_BIN, ...argv], { detached: true, stdio: ["ignore", out, out], windowsHide: true });
    let code: number | null = null;
    child.on("exit", (c) => (code = c ?? 1));
    child.unref();
    closeSync(out);
    return { exited: () => code };
  },
  timeoutMs: 240_000,
};

async function startDetached(accountName: string, argv: string[]): Promise<{ code: number; stdout?: string; stderr?: string }> {
  const logPath = join(homedir(), ".logCli", "runs", "inspect", `${accountName}.start.log`);
  const from = existsSync(logPath) ? statSync(logPath).size : 0;
  const child = inspectDetachDeps.start(["inspect", ...argv.filter((a) => a !== "--detach")], logPath);
  const tail = () => (existsSync(logPath) ? readFileSync(logPath).subarray(from).toString("utf8").split(/\r?\n/).filter(Boolean).slice(-12).join("\n") : "");
  const deadline = Date.now() + inspectDetachDeps.timeoutMs;
  while (Date.now() < deadline) {
    const current = readCurrentInspect(undefined, accountName);
    if (current && existsSync(current.repliesPath) && readFileSync(current.repliesPath, "utf8").includes('"id": "ready"')) {
      const lines = tail().split("\n").filter((l) => /Gate passed|Self-check|Browser:|session open/i.test(l));
      return {
        code: 0,
        stdout: [`Inspect session for ${accountName} is open, as its own process: ${current.runDir}`, ...lines.map((l) => `  ${l.trim()}`), `  Its log: ${logPath}`, `  Steps: log inspect do <action> --account ${accountName}; close it: log inspect do stop --account ${accountName}`].join("\n"),
      };
    }
    const exited = child.exited();
    if (exited !== null) return { code: exited || 1, stderr: `log inspect: the session ended before its browser was ready (exit ${exited}):\n${tail()}` };
    await new Promise((r) => setTimeout(r, 500));
  }
  return { code: 2, stderr: `log inspect: no ready browser after ${Math.round(inspectDetachDeps.timeoutMs / 1000)} s (it may still be starting):\n${tail()}` };
}

export const INSPECT_INPUT: CommandInput = {
  forms: [
    {
      words: ["start"],
      summary: "Open the account's browser through every gate and keep it open; over MCP always with detach",
      positionals: [],
      flags: [
        { name: "account", kind: "string", required: true, description: "The account to open" },
        { name: "url", kind: "string", description: "The first page (https://www.facebook.com/...)" },
        { name: "bypass", kind: "boolean", bypass: true, description: "Outside the account's waking hours, only when matt asked (rule 20)" },
        { name: "now", kind: "boolean", description: "Skip the 10-minute launch gap only (rule 30)" },
        { name: "noIdleMouse", kind: "boolean", description: "No idle mouse loop between steps" },
        { name: "detach", kind: "boolean", description: "Run as its own process and return once open: set it over MCP" },
        { name: "goal", kind: "string", description: "What this session is for, in plain words: every step is read against it (rule 74)" },
        PROXY_MS_FLAG,
      ],
    },
    {
      words: ["do"],
      summary: "Send one step to the open browser; it returns the snapshot (element refs), requests and rea's reading",
      positionals: [
        { name: "action", kind: "enum", required: true, values: INSPECT_ACTIONS, description: "The step" },
        { name: "values", kind: "rest", description: "The step's values in order, each whole: goto [url], wait [s], click [ref], type [ref, text], press [key], upload [ref, file], highlight [role, name]" },
      ],
      flags: [
        { name: "live", kind: "boolean", live: true, description: `Needed for ${LIVE_ACTIONS.join(", ")}: they act on Facebook, only when matt asked (rule 8)` },
        { name: "goal", kind: "string", description: "What this step is for, if not the session's goal (rule 74)" },
        { name: "timeout", kind: "integer", description: "Seconds to wait for the step" },
        { name: "account", kind: "string", description: "Picks the session when more than one is open" },
        JSON_FLAG,
      ],
    },
    {
      words: ["read"],
      effect: "write",
      summary: "Read a recorded step again: its internal API calls with the page, the account and the earlier steps, by SubQ when no known state names it (rules 73-74)",
      positionals: [{ name: "stepFolder", kind: "string", required: true, description: "The step's folder: <run>/steps/NN_action" }],
      flags: [
        { name: "account", kind: "string", required: true, description: "The account the run was on" },
        { name: "goal", kind: "string", description: "What the step was for" },
        JSON_FLAG,
      ],
    },
    { words: ["map"], effect: "write", summary: "The recorded steps as states and transitions (flow.md, machine.json)", positionals: [{ name: "runDir", kind: "string", description: "The run folder (default the latest run)" }], flags: [{ name: "all", kind: "boolean", description: "Collate every run" }] },
    {
      words: ["goal"],
      effect: "write",
      summary: "The session's goal, whether a step's reading says it is reached, and its P.E.E. findings; --set gives the open session its goal (rule 75)",
      positionals: [],
      flags: [
        { name: "set", kind: "string", description: "Set the open session's goal, in plain words" },
        { name: "account", kind: "string", description: "Picks the session when more than one is open" },
        JSON_FLAG,
      ],
    },
    {
      words: ["finding"],
      effect: "write",
      summary: "Write a P.E.E. finding for a step that went wrong (Point, Evidence from its reading, Explain), or how finding n was fixed (rule 75)",
      positionals: [],
      flags: [
        { name: "step", kind: "string", description: "The step that went wrong (default: the one the goal says needs a finding)" },
        { name: "point", kind: "string", description: "Point: the issue, in one clear sentence" },
        { name: "evidence", kind: "string", description: "Evidence of your own, added to what the step's reading quotes" },
        { name: "explain", kind: "string", description: "Explain: why the evidence shows it, and what caused it" },
        { name: "fixes", kind: "integer", description: "The finding this fix is for" },
        { name: "fix", kind: "string", description: "How it was fixed" },
        { name: "account", kind: "string", description: "Picks the session when more than one is open" },
      ],
    },
    { words: ["sessions"], effect: "read", summary: "The open sessions", positionals: [], flags: [] },
  ],
};

export function stepAccountOf(account: FacebookAccount | null, name: string): { name: string; platform: string; homeCity: string | null; homeCountry: string | null; browser: string | null } {
  if (!account) return { name, platform: "facebook", homeCity: null, homeCountry: null, browser: null };
  return { name: account.accountName, platform: (account.platform ?? "facebook").toLowerCase(), homeCity: account.homeCity, homeCountry: account.homeCountry, browser: browserFor(account).driver };
}

export function goalText(accountName: string, runDir: string, goal: string | null, since: string | null = null): string | null {
  if (!goal) return null;
  const note = goalLine(accountName, goalProgressOf(goal, runReadings(runDir), goalEvents(runDir), since));
  return note ? `>>> GOAL: ${note.line}` : null;
}

async function pickSession(context: CommandContext, wanted: unknown): Promise<CurrentInspect | { code: number; stderr: string }> {
  const name = typeof wanted === "string" ? await findAccount(context.twenty, wanted).then((a) => a.accountName, () => wanted) : undefined;
  const current = readCurrentInspect(undefined, name);
  if (current) return current;
  const open = openInspects();
  if (!open.length) return { code: 1, stderr: "log inspect: no session is open. Start one: log inspect start --account <name> --goal <text>" };
  return { code: 1, stderr: name ? `log inspect: no session is open for ${name}` : `log inspect: ${open.length} sessions are open (${open.map((o) => o.account).join(", ")}): add --account <name>` };
}

export async function readInspectStep(context: CommandContext, accountName: string, folder: string | null, goal: string | null, since: string | null = null): Promise<{ reading: StepReading | null; text: string }> {
  if (!folder || !existsSync(folder)) return { reading: null, text: ">>> No recording for this step, so nothing was read (rule 73)." };
  const account = await findAccount(context.twenty, accountName).catch(() => null);
  try {
    const reading = await readStep(folder, { goal, account: stepAccountOf(account, accountName), decisions: context.decisions, now: context.now, since });
    const goalNote = goalText(accountName, dirname(dirname(folder)), goal, since);
    return { reading, text: [loudText(reading), ...(goalNote ? [goalNote] : []), timelineText(reading)].join("\n\n") };
  } catch (error) {
    return { reading: null, text: `>>> The step could not be read (rule 73): ${error instanceof Error ? error.message : String(error)}` };
  }
}

export const inspectCommand: Command = {
  usage: INSPECT_USAGE,
  platform: "any",
  name: "inspect",
  effect: "browser",
  input: INSPECT_INPUT,
  summary: "Drive the account's browser, gated and headed, a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)",
  args: "start --account <name> [--url <u>] [--bypass] | do <action> [args] [--live]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(INSPECT_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log inspect: ${parsed.error}\n${INSPECT_USAGE}` };
    const [sub, ...rest] = parsed.positionals;

    if (sub === "start") {
      const url = typeof parsed.flags["url"] === "string" ? parsed.flags["url"] : null;
      if (url && !parseInspectAction(["goto", url]).ok) return { code: 1, stderr: `log inspect: --url takes a https://*.facebook.com URL\n${INSPECT_USAGE}` };
      const wanted = typeof parsed.flags["account"] === "string" ? parsed.flags["account"] : null;
      if (wanted) {
        const accountName = await findAccount(context.twenty, wanted).then((a) => a.accountName, () => wanted);
        const existing = readCurrentInspect(undefined, accountName);
        if (existing) return { code: 1, stderr: `log inspect: a session is already open for ${existing.account} (${existing.runDir}). Stop it first: log inspect do stop --account ${existing.account}` };
        if (parsed.flags["detach"]) return startDetached(accountName, argv);
      }
      const opened = await openAccount(context, "inspect", INSPECT_USAGE, parsed.flags["account"], "connect", Boolean(parsed.flags["bypass"]), true, Boolean(parsed.flags["now"]));
      if (!("run" in opened)) return opened;
      const { account, run } = opened;
      const runDir = dirname(run.captureDir!);
      const messengerPin = hasMessengerPin(run.loginPath);
      const goal = typeof parsed.flags["goal"] === "string" ? parsed.flags["goal"] : null;
      const current = { account: account.accountName, runDir, commandsPath: join(runDir, "commands.jsonl"), repliesPath: join(runDir, "replies.jsonl"), startedAt: new Date().toISOString(), messengerPin, goal };
      return withRun(context, "inspect", account, run, async () => {
        writeCurrentInspect(current);
        context.err(`Inspect session for ${account.accountName}: ${runDir}. Send steps from another terminal: bun bin/log.ts inspect do snapshot`);
        let code: number;
        const checkpointWatch = watchCheckpoint(context, account, runDir);
        try {
          code = await context.inspectSession({
            accountId: account.id,
            storageStatePath: run.statePath,
            proxyPath: run.proxyPath,
            devicePath: run.devicePath,
            captureDir: run.captureDir!,
            commandsPath: current.commandsPath,
            repliesPath: current.repliesPath,
            loginPath: run.loginPath,
            idleMouse: !parsed.flags["noIdleMouse"],
            startUrl: url,
            browser: browserFor(account),
          });
        } finally {
          await checkpointWatch.stop();
          clearCurrentInspect(undefined, account.accountName);
        }
        return { code: code === 0 ? 0 : 1, stdout: `Inspect session for ${account.accountName} ended (exit ${code}). Every step: ${join(runDir, "steps")}` };
      });
    }

    if (sub === "do") {
      const action = parseInspectAction(rest);
      if (!action.ok) return { code: 1, stderr: `log inspect: ${action.error}\n${INSPECT_USAGE}` };
      if (LIVE_ACTIONS.includes(action.action) && !parsed.flags["live"]) {
        return { code: 1, stderr: `log inspect: ${action.action} acts on Facebook: add --live when matt asked for it (rule 8)` };
      }
      const open = openInspects();
      const wanted = typeof parsed.flags["account"] === "string" ? parsed.flags["account"] : undefined;
      const accountName = wanted ? await findAccount(context.twenty, wanted).then((a) => a.accountName, () => wanted) : undefined;
      const current = readCurrentInspect(undefined, accountName);
      if (!current) {
        if (!open.length) return { code: 1, stderr: "log inspect: no session is open. Start one: log inspect start --account <name>" };
        if (accountName) return { code: 1, stderr: `log inspect: no session is open for ${accountName} (open: ${open.map((s) => s.account).join(", ")})` };
        return { code: 1, stderr: `log inspect: ${open.length} sessions are open (${open.map((s) => s.account).join(", ")}): add --account <name>` };
      }
      const timeout = parsed.flags["timeout"] === undefined ? 120 : Number(parsed.flags["timeout"]);
      if (!Number.isFinite(timeout) || timeout < 5 || timeout > 900) return { code: 1, stderr: `log inspect: --timeout must be 5 to 900 seconds\n${INSPECT_USAGE}` };
      const reply = await context.sendInspect(current, action.action, action.args, timeout * 1000);
      if (!reply) return { code: 1, stderr: `log inspect: no reply from the session in ${timeout} s (is it still open? ${current.runDir})` };
      const goal = typeof parsed.flags["goal"] === "string" ? parsed.flags["goal"] : current.goal ?? null;
      const since = typeof parsed.flags["goal"] === "string" ? stepBefore(current.runDir, reply.folder ? basename(reply.folder) : null) : current.goalSince ?? null;
      const read = reply.stopped ? null : await readInspectStep(context, current.account, reply.folder ?? null, goal, since);
      if (parsed.flags["json"]) return { code: reply.ok === false ? 1 : 0, stdout: JSON.stringify({ ...reply, reading: read?.reading ?? null }, null, 2) };
      const rendered = renderInspectStep(reply);
      return { code: reply.ok === false ? 1 : 0, stdout: read ? `${read.text}\n\n${rendered}` : rendered };
    }

    if (sub === "read") {
      const folder = rest[0];
      if (!folder || !existsSync(join(folder, "network.har"))) return { code: 1, stderr: `log inspect: ${folder ?? "no folder"} is not a recorded step (no network.har)\n${INSPECT_USAGE}` };
      const goal = typeof parsed.flags["goal"] === "string" ? parsed.flags["goal"] : null;
      const read = await readInspectStep(context, String(parsed.flags["account"]), folder, goal);
      if (parsed.flags["json"]) return { code: read.reading ? 0 : 1, stdout: JSON.stringify(read.reading, null, 2) };
      return { code: read.reading ? 0 : 1, stdout: read.text };
    }

    if (sub === "goal") {
      const session = await pickSession(context, parsed.flags["account"]);
      if ("code" in session) return session;
      if (typeof parsed.flags["set"] === "string") {
        const goal = parsed.flags["set"].trim();
        if (!goal) return { code: 1, stderr: "log inspect: --set needs the goal in plain words" };
        const goalSince = lastStepOf(session.runDir);
        writeCurrentInspect({ ...session, goal, goalSince });
        session.goal = goal;
        session.goalSince = goalSince;
      }
      const progress = goalProgress(session);
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify(progress, null, 2) };
      const note = goalLine(session.account, progress);
      return { code: 0, stdout: [note ? `>>> GOAL: ${note.line}` : "No goal: set one with log inspect goal --set <text>.", "", peeMarkdown(progress, session.account)].join("\n") };
    }

    if (sub === "finding") {
      const session = await pickSession(context, parsed.flags["account"]);
      if ("code" in session) return session;
      const at = (context.now?.() ?? new Date()).toISOString();
      if (parsed.flags["fixes"] !== undefined) {
        const n = Number(parsed.flags["fixes"]);
        const fix = typeof parsed.flags["fix"] === "string" ? parsed.flags["fix"].trim() : "";
        if (!fix) return { code: 1, stderr: "log inspect: --fixes needs --fix <how it was fixed>" };
        if (!goalProgress(session).findings.some((f) => f.n === n)) return { code: 1, stderr: `log inspect: there is no finding ${n}` };
        const progress = addGoalEvent(session, { type: "fix", at, n, fix });
        return { code: 0, stdout: `Finding ${n} fixed. ${join(session.runDir, GOAL_FINDINGS_FILE)}\n${goalLine(session.account, progress)?.line ?? ""}` };
      }
      const point = typeof parsed.flags["point"] === "string" ? parsed.flags["point"].trim() : "";
      const explain = typeof parsed.flags["explain"] === "string" ? parsed.flags["explain"].trim() : "";
      if (!point || !explain) return { code: 1, stderr: "log inspect: a finding needs --point (the issue, one sentence) and --explain (why the evidence shows it, what caused it)" };
      const before = goalProgress(session);
      const step = typeof parsed.flags["step"] === "string" ? parsed.flags["step"] : before.needsFinding?.step ?? before.lastStep;
      if (!step) return { code: 1, stderr: "log inspect: no step to write a finding for: add --step <step>" };
      const reading = runReadings(session.runDir).find((r) => r.step === step);
      const evidence = [...(reading ? evidenceOf(reading) : []), ...(typeof parsed.flags["evidence"] === "string" && parsed.flags["evidence"].trim() ? [parsed.flags["evidence"].trim()] : [])];
      if (!evidence.length) return { code: 1, stderr: `log inspect: step ${step} has no reading to quote: add --evidence <what the internal API or the page showed>` };
      const progress = addGoalEvent(session, { type: "finding", at, step, point, evidence, explain });
      return { code: 0, stdout: `Finding ${progress.findings.length} written for ${step}. ${join(session.runDir, GOAL_FINDINGS_FILE)}\n${goalLine(session.account, progress)?.line ?? ""}` };
    }

    if (sub === "sessions") {
      const open = openInspects();
      if (!open.length) return { code: 0, stdout: "No inspect session is open." };
      return { code: 0, stdout: open.map((s) => `${s.account}  since ${s.startedAt}  ${s.runDir}`).join("\n") };
    }

    if (sub === "map") {
      const root = dirname(currentInspectPath());
      const runDir = rest[0] ?? inspectRuns(root).at(-1);
      if (!runDir) return { code: 1, stderr: "log inspect: no recorded inspect run to map" };
      const { flow, files } = parsed.flags["all"] ? mapAllInspectRuns(root) : mapInspectRun(runDir);
      const lines = [`${flow.states.length} screen(s), ${flow.transitions.length} transition(s) from ${parsed.flags["all"] ? "every inspect run" : runDir}`];
      for (const t of flow.transitions) lines.push(`  ${t.from} → ${t.to} on ${t.event}${t.ms ? ` (${t.ms} ms)` : ""}${t.requests.length ? `: ${t.requests.join("; ")}` : ""}`);
      lines.push(...files.map((f) => `  wrote ${f}`));
      return { code: 0, stdout: lines.join("\n") };
    }

    return { code: 1, stderr: `log inspect: expected "start", "do", "read", "goal", "finding" or "map"\n${INSPECT_USAGE}` };
  },
};
