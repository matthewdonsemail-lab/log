import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installHermes, installedPluginYaml } from "../hermes/index.ts";
import { antigravityHooks, cursorHooks, HERMES_PLUGIN_DIR, hermesPluginYaml, hookFiles } from "../registry/index.ts";
import { SETUP_HARNESSES } from "../../cli/launch/helpers/setup.ts";
import { clipContext, contextOutput, harnessOf, harnessTable, hookHostOf, hostBody, positionalOf, scratchHookEnv, watcherLogsIn } from "./client.ts";
import { HARNESS_CAPABILITIES, HARNESS_IDS, HARNESSES, HOOK_HOSTS } from "./types.ts";

const root = join(import.meta.dir, "..", "..", "..");

describe("the harness table", () => {
  test("names every harness once, with every capability and a doc page that exists", () => {
    expect(HARNESSES.map((h) => h.id)).toEqual([...HARNESS_IDS]);
    for (const harness of HARNESSES) {
      expect(Object.keys(harness.capabilities).sort()).toEqual([...HARNESS_CAPABILITIES].sort());
      expect(existsSync(join(root, "docs", "harnesses", harness.doc.split("#")[0]))).toBe(true);
    }
  });

  test("every hook host has a hook file in the repo and a context limit; the hosts with no hooks have neither", () => {
    for (const harness of HARNESSES) {
      const hooked = (HOOK_HOSTS as readonly string[]).includes(harness.id);
      expect(Boolean(harness.hookFile)).toBe(hooked);
      expect(harness.contextLimit === null).toBe(!hooked);
      if (harness.hookFile) expect(existsSync(join(root, harness.hookFile))).toBe(true);
    }
  });

  test("routes by the prompt hook only where a hook can add context to a prompt", () => {
    expect(harnessOf("cursor").router).toBe("ask");
    expect(harnessOf("hermes").router).toBe("preLlmCall");
    for (const id of ["claudeApp", "chatgpt", "grok"] as const) expect(harnessOf(id).router).toBe("ask");
  });

  test("renders one markdown row per harness", () => {
    const table = harnessTable().split("\n");
    expect(table.length).toBe(HARNESSES.length + 2);
    expect(table[2]).toContain("[Claude Code](claudeApp.md#claude-code)");
  });
});

describe("each adapter cuts its text to the harness's limit", () => {
  test("Claude Code keeps 10,000 characters and Codex 7,500", () => {
    const long = "x".repeat(20000);
    expect(clipContext(long, "claudeCode").length).toBe(10000);
    expect(clipContext(long, "codex").length).toBe(7500);
    expect(clipContext(long, "codex")).toContain("log cut this context at 7500 characters, the limit for Codex");
    expect(clipContext("short", "codex")).toBe("short");
  });

  test("shapes the answer for each host", () => {
    const body = { decision: "block", hookSpecificOutput: { hookEventName: "Stop", additionalContext: "y".repeat(9000) } };
    expect((hostBody("claudeCode", "Stop", body)?.hookSpecificOutput as { additionalContext: string }).additionalContext.length).toBe(9000);
    expect(hostBody("claudeCode", "Stop", body)?.decision).toBe("block");
    expect((hostBody("codex", "Stop", body)?.hookSpecificOutput as { additionalContext: string }).additionalContext.length).toBe(7500);
    expect(Object.keys(hostBody("cursor", "SessionStart", body) ?? {})).toEqual(["additional_context"]);
    expect(Object.keys(hostBody("hermes", "UserPromptSubmit", body) ?? {})).toEqual(["context"]);
    expect(hostBody("cursor", "SessionStart", { decision: "block" })).toBeNull();
    expect(contextOutput("SessionStart", "", "codex")).toBe("");
    expect(JSON.parse(contextOutput("SessionStart", "hi", "hermes"))).toEqual({ context: "hi" });
  });

  test("reads the host from --host and leaves it out of the positional arguments", () => {
    expect(hookHostOf(["bun", "event.ts", "SessionStart", "--host", "cursor"])).toBe("cursor");
    expect(hookHostOf(["bun", "event.ts", "--host", "nope"])).toBe("claudeCode");
    expect(positionalOf(["--host", "cursor", "SessionStart"])).toEqual(["SessionStart"]);
  });
});

describe("the hook files, generated from AGENT_HOOKS", () => {
  test("Cursor gets sessionStart and postToolUse, run from the project root through event.ts", () => {
    const file = cursorHooks() as { version: number; hooks: Record<string, { command: string }[]> };
    expect(file.version).toBe(1);
    expect(Object.keys(file.hooks)).toEqual(["sessionStart", "postToolUse"]);
    expect(file.hooks.sessionStart[0].command).toBe("bun scripts/hooks/event.ts SessionStart --host cursor");
    expect(file.hooks.beforeSubmitPrompt).toBeUndefined();
  });

  test("Antigravity's file is the one in the repo", () => {
    expect(antigravityHooks()).toEqual(JSON.parse(readFileSync(join(root, ".agents", "hooks.json"), "utf8")));
  });

  test("the native Hermes plugin registers pre_llm_call", () => {
    expect(hermesPluginYaml("0.2.0")).toContain("provides_hooks:\n  - pre_llm_call\n");
    expect(hermesPluginYaml("0.2.0")).not.toContain("listeningkit");
  });

  test("every generated file in the repo matches", () => {
    const version = (JSON.parse(readFileSync(join(root, "hermesPlugin", "plugin.json"), "utf8")) as { version: string }).version;
    for (const file of hookFiles(undefined, version)) {
      const path = join(root, file.path);
      expect({ path: file.path, same: file.same(existsSync(path) ? readFileSync(path, "utf8") : null) }).toEqual({ path: file.path, same: true });
    }
  });
});

describe("log launch --setup installs user-level hooks", () => {
  test("offers every harness the table says setup installs", () => {
    expect(SETUP_HARNESSES.map((h) => h.id)).toEqual(["hermes", "opencode"]);
  });

  test("writes the native Hermes plugin under <home>/plugins/logHooks with the log checkout it runs", () => {
    const home = mkdtempSync(join(tmpdir(), "harnessContract-hermes-"));
    try {
      const first = installHermes(home, root);
      expect(first.changed).toBe(true);
      expect(first.pluginDir).toBe(join(home, "plugins", "logHooks"));
      const yaml = readFileSync(join(first.pluginDir, "plugin.yaml"), "utf8");
      expect(yaml).toContain("name: logHooks");
      expect(yaml).toContain(`log_root: '${root}'`);
      expect(readFileSync(join(first.pluginDir, "__init__.py"), "utf8")).toBe(readFileSync(join(root, HERMES_PLUGIN_DIR, "__init__.py"), "utf8"));
      expect(installHermes(home, root).changed).toBe(false);
      expect(installedPluginYaml(yaml, "/other").match(/log_root/g)?.length).toBe(1);
    } finally {
      rmSync(home, { recursive: true, force: true });
    }
  });
});

describe("the native Hermes plugin's pre_llm_call", () => {
  test("asks log's event script with --host hermes and returns its context, SessionStart first on the first turn", () => {
    const scratch = mkdtempSync(join(tmpdir(), "harnessContract-pyHermes-"));
    try {
      const stubRoot = join(scratch, "root");
      mkdirSync(join(stubRoot, "scripts", "hooks"), { recursive: true });
      writeFileSync(
        join(stubRoot, "scripts", "hooks", "event.ts"),
        "const raw = await Bun.stdin.text()\nconst input = JSON.parse(raw)\nprocess.stdout.write(JSON.stringify({ context: `${process.argv[2]}|${process.argv.slice(3).join(' ')}|${input.prompt}` }))\n",
      );
      const plugin = join(root, HERMES_PLUGIN_DIR, "__init__.py");
      const script = [
        "import importlib.util, json, sys",
        `spec = importlib.util.spec_from_file_location("logHooks", ${JSON.stringify(plugin)})`,
        "module = importlib.util.module_from_spec(spec)",
        "spec.loader.exec_module(module)",
        "hooks = {}",
        "class Ctx:",
        "    def register_hook(self, name, fn):",
        "        hooks[name] = fn",
        "module.register(Ctx())",
        "first = hooks['pre_llm_call'](session_id='s', user_message='check my x notifications', conversation_history=[], is_first_turn=True, model='m', platform='cli')",
        "later = hooks['pre_llm_call'](session_id='s', user_message='hi', is_first_turn=False)",
        "print(json.dumps({'names': sorted(hooks), 'first': first, 'later': later}))",
      ].join("\n");
      const run = spawnSync(process.env.LOG_PYTHON || "python", ["-c", script], { encoding: "utf8", windowsHide: true, env: { ...process.env, LOG_ROOT: stubRoot } });
      expect(run.status).toBe(0);
      const out = JSON.parse(run.stdout.trim()) as { names: string[]; first: { context: string }; later: { context: string } };
      expect(out.names).toEqual(["pre_llm_call"]);
      expect(out.first.context).toBe("SessionStart|--host hermes|check my x notifications\n\nUserPromptSubmit|--host hermes|check my x notifications");
      expect(out.later.context).toBe("UserPromptSubmit|--host hermes|hi");
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });
});

describe("the check's scratch state", () => {
  test("points every store the hooks open at the scratch folder and turns the service and the watchers off", () => {
    const dir = mkdtempSync(join(tmpdir(), "harnessContract-env-"));
    try {
      const env = scratchHookEnv(dir, { LOG_DB: "/real/log.db" });
      for (const key of ["LOG_DB", "LOG_INBOX_STATE", "LOG_CONTEXT_LAYER", "LOG_QUEUES_DIR", "LOG_TWITTER_STATE", "LOG_PLATFORM_STATE", "LOG_FBK_STATE", "LOG_HOOK_MEMORY"]) expect(String(env[key]).startsWith(dir)).toBe(true);
      expect(env.LOG_CONTEXT_SERVICE).toBe("off");
      expect(env.LOG_INBOX_POLL).toBe("off");
      expect(watcherLogsIn(dir)).toEqual([]);
      mkdirSync(join(dir, "inbox", "twitter", "fakeBird"), { recursive: true });
      writeFileSync(join(dir, "inbox", "twitter", "fakeBird", "watch.log"), "");
      expect(watcherLogsIn(dir).length).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
