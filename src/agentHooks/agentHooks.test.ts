import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendLiveLine, logFileName } from "../observability/liveLog/index.ts";
import { buffersOutput, liveLogVerdict, logCommandOf } from "./liveLog/index.ts";
import { findingOf, hookReply, parseMemory } from "./pageState/index.ts";
import type { BrowserAt } from "./pageState/index.ts";
import { AGENT_HOOKS, hookCommand, hooksFor, toolIsHooked } from "./registry/index.ts";

const empty = { seen: {}, stopBlocked: null };
const at = (over: Partial<BrowserAt> = {}): BrowserAt => ({ account: "reading", step: "41_snapshot", url: "https://www.facebook.com/", text: "", failed: null, ...over });
const captcha = at({ url: "https://www.facebook.com/checkpoint/1/", text: 'heading "Enter the text from the image"' });
const selfie = at({ url: "https://www.facebook.com/checkpoint/1/", text: 'button "Start video selfie"' });

describe("registry", () => {
  test("both hosts get every event, each with its script", () => {
    for (const host of ["claudeCode", "codex"] as const) {
      const hooks = hooksFor(host);
      expect(Object.keys(hooks).sort()).toEqual(["PostToolUse", "PreToolUse", "SessionStart", "Stop", "UserPromptSubmit"]);
    }
    expect(hookCommand("claudeCode", "scripts/hooks/pageState.ts")).toBe('bun "$CLAUDE_PROJECT_DIR/scripts/hooks/pageState.ts"');
    expect(hookCommand("codex", "scripts/hooks/pageState.ts")).toContain("git rev-parse --show-toplevel");
  });

  test("every log MCP tool and the shells are hooked after the call", () => {
    expect(toolIsHooked("inspect")).toBe(true);
    expect(toolIsHooked("flowProfileSetup")).toBe(true);
    expect(AGENT_HOOKS.find((h) => h.event === "PostToolUse")?.matcher).toContain("Bash|PowerShell|Monitor");
  });
});

describe("page state hook", () => {
  test("a known state carries its resolver; a person's state says so", () => {
    expect(findingOf(captcha)).toMatchObject({ kind: "state", resolvable: true });
    expect(findingOf(captcha).line).toContain("log inspect do solve");
    expect(findingOf(selfie)).toMatchObject({ kind: "state", resolvable: false });
    expect(findingOf(selfie).line).toContain("tell matt");
  });

  test("Messenger's Create PIN is resolved with the flow when the session has the PIN, and is matt's when not (rule 67)", () => {
    const create = { url: "https://www.facebook.com/messages/", text: 'heading "Create a PIN to access your chats on any device" [level=2]' };
    const withPin = findingOf(at({ ...create, messengerPin: true }));
    expect(withPin).toMatchObject({ kind: "state", resolvable: true });
    expect(withPin.line).toContain("log flow run messengerPinCreate");
    const without = findingOf(at(create));
    expect(without).toMatchObject({ kind: "state", resolvable: false });
    expect(without.line).toContain("tell matt");
  });

  test("a failed step is an unconfirmed page: snapshot, then resolve", () => {
    const f = findingOf(at({ failed: 'RuntimeError: no visible heading "Comments"' }));
    expect(f).toMatchObject({ kind: "failed", resolvable: true });
    expect(f.line).toContain("log inspect do snapshot --account reading");
  });

  test("PostToolUse speaks once per change; prompts always", () => {
    const first = hookReply("PostToolUse", [captcha], empty);
    expect(JSON.stringify(first.output)).toContain("textCaptcha");
    expect(hookReply("PostToolUse", [captcha], first.memory).output).toBeNull();
    expect(hookReply("PostToolUse", [at()], empty).output).toBeNull();
    expect(JSON.stringify(hookReply("UserPromptSubmit", [at()], first.memory).output)).toContain("no known blocking state");
    expect(JSON.stringify(hookReply("SessionStart", [captcha], first.memory).output)).toContain("additionalContext");
  });

  test("Stop blocks on what log-cli resolves, never on a person's state, and never loops", () => {
    const blocked = hookReply("Stop", [captcha], empty);
    expect(blocked.output).toMatchObject({ decision: "block" });
    expect(String(blocked.output?.reason)).toContain("log inspect do solve");
    // Sent back once and nothing moved: the turn may end.
    expect(hookReply("Stop", [captcha], blocked.memory, true).output).toBeNull();
    // Something moved (a new step on the same state): blocked again.
    expect(hookReply("Stop", [{ ...captcha, step: "43_solve" }], blocked.memory, true).output).toMatchObject({ decision: "block" });
    expect(hookReply("Stop", [selfie], empty).output).toBeNull();
    expect(hookReply("Stop", [at()], empty).output).toBeNull();
  });

  test("memory reads the older shape and survives junk", () => {
    expect(parseMemory('{"reading":"41_x:none"}')).toEqual({ seen: { reading: "41_x:none" }, stopBlocked: null });
    expect(parseMemory("not json")).toEqual(empty);
    expect(parseMemory('{"seen":{"a":"1"},"stopBlocked":"a=1"}')).toEqual({ seen: { a: "1" }, stopBlocked: "a=1" });
  });
});

describe("live logs hook", () => {
  test("finds the log command a shell line runs", () => {
    expect(logCommandOf("bun bin/log.ts facebook warmup feed run --account a 2>&1 | tee x.log")).toBe("warmup");
    expect(logCommandOf('bun "C:\\repo\\bin\\log.ts" inspect do snapshot')).toBe("inspect");
    expect(logCommandOf("git status")).toBeNull();
  });

  test("tail/head buffer; tail -f and tee don't", () => {
    expect(buffersOutput("bun bin/log.ts facebook capture --docs 2>&1 | tail -20")).toBe(true);
    expect(buffersOutput("bun bin/log.ts facebook capture --docs | head")).toBe(true);
    expect(buffersOutput("bun bin/log.ts facebook capture --docs | Select-Object -Last 5")).toBe(true);
    expect(buffersOutput("bun bin/log.ts facebook capture --docs 2>&1 | tee run.log")).toBe(false);
    expect(buffersOutput("tail -f ~/.logCli/mcp/2026-10-20.log | grep warmup")).toBe(false);
    // A tail on a later command of the line isn't the log run's.
    expect(buffersOutput("bun bin/log.ts errors >/dev/null 2>&1; grep cli ~/.logCli/mcp/x.log | tail -3")).toBe(false);
    expect(buffersOutput("cd repo && bun bin/log.ts facebook capture --docs | tail -3")).toBe(true);
  });

  test("a buffered log run is refused; a long one off a Monitor is reminded; Monitor with tee goes through", () => {
    expect(liveLogVerdict("Monitor", "bun bin/log.ts facebook warmup feed run | tail -5").deny).toContain("rule 26");
    expect(liveLogVerdict("Bash", "bun bin/log.ts facebook warmup feed run 2>&1 | tee w.log").context).toContain("Monitor");
    expect(liveLogVerdict("Monitor", "bun bin/log.ts facebook warmup feed run 2>&1 | tee w.log")).toEqual({ deny: null, context: null });
    expect(liveLogVerdict("Bash", "bun bin/log.ts facebook accounts --json")).toEqual({ deny: null, context: null });
    expect(liveLogVerdict("Bash", "ls | head")).toEqual({ deny: null, context: null });
  });
});

describe("live log", () => {
  test("the CLI and the MCP append to the same day's file", () => {
    const dir = mkdtempSync(join(tmpdir(), "liveLog-"));
    try {
      appendLiveLine(dir, "cli:warmup", "out", "▶ log facebook warmup", "2026-10-20T10:00:00.000Z");
      appendLiveLine(dir, "warmup", "session", "step 3/12", "2026-10-20T10:00:01.000Z");
      const text = readFileSync(join(dir, logFileName("2026-10-20T10:00:00.000Z")), "utf8");
      expect(text).toBe("2026-10-20T10:00:00.000Z cli:warmup out    | ▶ log facebook warmup\n2026-10-20T10:00:01.000Z warmup session| step 3/12\n");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
