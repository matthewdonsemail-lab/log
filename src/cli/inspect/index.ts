/**
 * `log inspect` (rule 29): look at a Facebook page before writing code for it
 * (rule 25), the way camofox-mcp drives a browser, through log-cli's own gated
 * launch.
 *
 *   log inspect start --account <a> [--url <facebook url>] [--bypass]
 *       opens one headed Camoufox for the account and keeps it open (run it
 *       live in its own terminal or Monitor); every step streams here.
 *   log inspect do <action> [args] [--live] [--timeout <s>]
 *       one step in the open session: goto <url>, snapshot, back, wait [s],
 *       click <ref>, type <ref> <text>, press <key>, stop. click, type and
 *       press act on Facebook and need --live (rule 8).
 *
 * Each step records its accessibility snapshot (refs to click), a screenshot,
 * its own HAR and rea's reading of it, in order, in the run's `steps/`.
 */
import { dirname, join } from "node:path";
import { clearCurrentInspect, currentInspectPath, LIVE_ACTIONS, openInspects, parseInspectAction, readCurrentInspect, renderInspectStep, writeCurrentInspect } from "../../camofox/inspect/index.ts";
import { findAccount } from "../../marketplace/socialAccount/index.ts";
import { inspectRuns, mapAllInspectRuns, mapInspectRun } from "../../rea/inspectMap/index.ts";
import { openAccount, withRun } from "../live/index.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";

export const INSPECT_USAGE = [
  "Usage: log inspect start --account <accountName> [--url <https://www.facebook.com/...>] [--bypass] [--now] [--noIdleMouse]   (one session per account: two accounts can be open at once)",
  "       log inspect map [<runDir>] [--all]  (the recorded steps as states and transitions: flow.md, machine.json; default the latest run; --all collates every run)",
  "       log inspect do <goto <url>|snapshot|back|wait [s]|click <ref>|type <ref> <text>|press <key>|upload <ref> <file>|highlight <role> <name>|solve|signIn|code|stop> [--live] [--timeout <s>] [--json] [--account <accountName>]   (--account picks the session when more than one is open)",
  "       log inspect sessions   (the open sessions)",
].join("\n");

export const inspectCommand: Command = {
  name: "inspect",
  summary: "Drive one gated Camoufox a step at a time: each step's snapshot, screenshot, HAR and rea, recorded as it happens (rule 29)",
  args: "start --account <name> [--url <u>] [--bypass] | do <action> [args] [--live]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["bypass", "live", "json", "all", "now", "noIdleMouse"], valued: ["account", "url", "timeout"] });
    if (!parsed.ok) return { code: 1, stderr: `log inspect: ${parsed.error}\n${INSPECT_USAGE}` };
    const [sub, ...rest] = parsed.positionals;

    if (sub === "start") {
      const url = typeof parsed.flags["url"] === "string" ? parsed.flags["url"] : null;
      if (url && !parseInspectAction(["goto", url]).ok) return { code: 1, stderr: `log inspect: --url takes a https://*.facebook.com URL\n${INSPECT_USAGE}` };
      // One session per account: a second account may open alongside (rule 34's seller and buyer), the same one may not.
      const wanted = typeof parsed.flags["account"] === "string" ? parsed.flags["account"] : null;
      if (wanted) {
        const accountName = await findAccount(context.twenty, wanted).then((a) => a.accountName, () => wanted);
        const existing = readCurrentInspect(undefined, accountName);
        if (existing) return { code: 1, stderr: `log inspect: a session is already open for ${existing.account} (${existing.runDir}). Stop it first: log inspect do stop --account ${existing.account}` };
      }
      // Connect's statuses: an account that has never signed in through us (NEEDSLOGIN) can be looked at too, signing in included.
      const opened = await openAccount(context, "inspect", INSPECT_USAGE, parsed.flags["account"], "connect", Boolean(parsed.flags["bypass"]), true, Boolean(parsed.flags["now"]));
      if (!("run" in opened)) return opened;
      const { account, run } = opened;
      const runDir = dirname(run.captureDir!);
      const current = { account: account.accountName, runDir, commandsPath: join(runDir, "commands.jsonl"), repliesPath: join(runDir, "replies.jsonl"), startedAt: new Date().toISOString() };
      return withRun(context, "inspect", account, run, async () => {
        writeCurrentInspect(current);
        context.err(`Inspect session for ${account.accountName}: ${runDir}. Send steps from another terminal: bun bin/log.ts inspect do snapshot`);
        let code: number;
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
          });
        } finally {
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
      if (parsed.flags["json"]) return { code: reply.ok === false ? 1 : 0, stdout: JSON.stringify(reply, null, 2) };
      return { code: reply.ok === false ? 1 : 0, stdout: renderInspectStep(reply) };
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

    return { code: 1, stderr: `log inspect: expected "start", "do" or "map"\n${INSPECT_USAGE}` };
  },
};
