import { afterEach, describe, expect, test } from "bun:test";
import { listAccounts } from "../../marketplace/account/index.ts";
import { listListings } from "../../marketplace/listing/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { CommandContext } from "../runner/types.ts";
import { launchDeps, parseLaunchArgs, runLaunch, setEnvValue, setupSummary, shouldPrompt, SETUP_HARNESSES } from "./index.ts";

const real = { ...launchDeps };
afterEach(() => Object.assign(launchDeps, real));

function capture() {
  const out: string[] = [];
  const err: string[] = [];
  const context: CommandContext = {
    load: () => ({ listings: listListings(), accounts: listAccounts() }),
    twenty: marketplaceFixture(),
    worker: async () => ({ ok: false, code: "crashed", detail: "worker not stubbed" }),
    session: () => {
      throw new Error("session not stubbed");
    },
    connectSession: () => {
      throw new Error("connectSession not stubbed");
    },
    profileSession: () => {
      throw new Error("profileSession not stubbed");
    },
    inspectSession: async () => {
      throw new Error("inspectSession not stubbed");
    },
    sendInspect: async () => null,
    out: (line) => out.push(line),
    err: (line) => err.push(line),
  };
  return { context, out, err };
}

function stubPrompts(answers: unknown[]) {
  const calls: string[] = [];
  const offered: string[][] = [];
  launchDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
  launchDeps.twentyReady = () => true;
  launchDeps.prompts = {
    intro: () => void calls.push("intro"),
    outro: () => void calls.push("outro"),
    cancel: () => void calls.push("cancel"),
    select: async (options) => {
      calls.push("select");
      offered.push(((options as { options?: { value: string }[] }).options ?? []).map((o) => o.value));
      if (answers.length === 0) throw new Error("prompt-stub: unexpected select");
      return answers.shift();
    },
    text: async () => {
      calls.push("text");
      if (answers.length === 0) throw new Error("prompt-stub: unexpected text");
      return answers.shift();
    },
    multiselect: async (options) => {
      calls.push("multiselect");
      offered.push(((options as { options?: { value: string }[] }).options ?? []).map((o) => o.value));
      if (answers.length === 0) throw new Error("prompt-stub: unexpected multiselect");
      return answers.shift();
    },
    password: async () => {
      calls.push("password");
      if (answers.length === 0) throw new Error("prompt-stub: unexpected password");
      return answers.shift();
    },
  };
  return { calls, offered };
}

describe("parseLaunchArgs / shouldPrompt", () => {
  test("accepts empty and --json, rejects the rest", () => {
    expect(parseLaunchArgs([])).toEqual({ ok: true, json: false, setup: false });
    expect(parseLaunchArgs(["--json"])).toEqual({ ok: true, json: true, setup: false });
    expect(parseLaunchArgs(["--setup"])).toEqual({ ok: true, json: false, setup: true });
    expect(parseLaunchArgs(["--setup=1"]).ok).toBe(false);
    expect(parseLaunchArgs(["--json=1"]).ok).toBe(false);
    expect(parseLaunchArgs(["listings"]).ok).toBe(false);
  });

  test("never prompts for --json or without both TTYs", () => {
    expect(shouldPrompt(true, { stdinTTY: true, stdoutTTY: true })).toBe(false);
    expect(shouldPrompt(false, { stdinTTY: true, stdoutTTY: false })).toBe(false);
    expect(shouldPrompt(false, { stdinTTY: true, stdoutTTY: true })).toBe(true);
  });
});

describe("runLaunch", () => {
  test("--json lists actions without prompting", async () => {
    const { calls } = stubPrompts([]);
    const result = await runLaunch(capture().context, ["--json"]);
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout!).start).toEqual(["setup", "add", "signIn", "check", "agent"]);
    expect(JSON.parse(result.stdout!).actions).toEqual(["browse", "status", "account", "accounts", "scan", "watch", "connect", "join", "answer", "fill", "reels", "doctor"]);
    expect(calls).toEqual([]);
  });

  test("no TTY exits 2 without prompting", async () => {
    const { calls } = stubPrompts([]);
    launchDeps.tty = () => ({ stdinTTY: false, stdoutTTY: false });
    expect((await runLaunch(capture().context, [])).code).toBe(2);
    expect(calls).toEqual([]);
  });

  test("browse delegates to `listing <id>`, with the listings from Twenty", async () => {
    const { calls } = stubPrompts(["marketplace", "browse", "readyOne"]);
    const delegated: string[][] = [];
    launchDeps.run = (command, context, argv) => {
      delegated.push([command.name, ...argv]);
      return real.run(command, context, argv);
    };
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(delegated).toEqual([["listing", "readyOne"]]);
    expect(out.join("\n")).toContain("Rubbish Removal Galway");
    expect(calls).toEqual(["intro", "select", "select", "select", "outro"]);
  });

  test("status offers the statuses in Twenty and delegates to `listings --status`", async () => {
    const { offered } = stubPrompts(["marketplace", "status", "SOLD"]);
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(offered[2]).toEqual(expect.arrayContaining(["DRAFT", "READY", "ACTIVE", "SOLD"]));
    expect(out.join("\n")).toContain("soldOne");
  });

  test("scan offers only accounts that may run (rule 12) and delegates to `scan --account <name>`", async () => {
    const { offered } = stubPrompts(["marketplace", "scan", "galwayOne"]);
    const delegated: string[][] = [];
    launchDeps.run = (command, _context, argv) => {
      delegated.push([command.name, ...argv]);
      return { code: 0, stdout: "scanned" };
    };
    expect((await runLaunch(capture().context, [])).code).toBe(0);
    expect(delegated).toEqual([["scan", "--account", "galwayOne"]]);
    expect(offered[2]).toEqual(expect.arrayContaining(["galwayOne", "galwayTwo", "vietnam"]));
    for (const refused of ["noProxy", "noCountry", "banned", "unset", "twitterOne"]) expect(offered[2]).not.toContain(refused);
  });

  test("join offers only accounts that may run, asks for the group, and delegates a dry run to `join group`", async () => {
    const { calls, offered } = stubPrompts(["marketplace", "join", "galwayOne", "https://www.facebook.com/groups/4191018610937243/"]);
    const delegated: string[][] = [];
    launchDeps.run = (command, _context, argv) => {
      delegated.push([command.name, ...argv]);
      return { code: 0, stdout: "read" };
    };
    expect((await runLaunch(capture().context, [])).code).toBe(0);
    expect(offered[1]).toContain("join");
    expect(offered[2]).not.toContain("banned");
    expect(calls).toEqual(["intro", "select", "select", "select", "text", "outro"]);
    expect(delegated).toEqual([["join", "group", "--account", "galwayOne", "--group", "https://www.facebook.com/groups/4191018610937243/"]]);
    expect(delegated[0]).not.toContain("--live");
  });

  test("Warm up Facebook Reels: the stepper asks the session's shape, likes default no, and plans it", async () => {
    const { calls } = stubPrompts(["marketplace", "reels", "8-20", "4-25", "0.6", "0.3", "0.15", "no", "no"]);
    const delegated: string[][] = [];
    launchDeps.run = (command, _context, argv) => {
      delegated.push([command.name, ...argv]);
      return { code: 0, stdout: "planned" };
    };
    expect((await runLaunch(capture().context, [])).code).toBe(0);
    expect(calls.filter((c) => c === "select")).toHaveLength(9);
    expect(delegated).toEqual([["warmup", "facebook", "reel", "plan", "--reels", "8-20", "--watch", "4-25", "--skip", "0.6", "--comments", "0.3", "--profile", "0.15"]]);
  });

  test("cancel exits 1", async () => {
    const { calls } = stubPrompts([Symbol("clack:cancel")]);
    expect((await runLaunch(capture().context, [])).code).toBe(1);
    expect(calls).toContain("cancel");
  });
});

describe("runLaunch: start here, no Twenty", () => {
  function recordRuns(answer: (name: string) => { code: number; stdout?: string } = () => ({ code: 0, stdout: "ok" })) {
    const delegated: string[][] = [];
    launchDeps.run = (command, _context, argv) => {
      delegated.push([command.name, ...argv]);
      return answer(command.name);
    };
    return delegated;
  }

  test("the start menu leads with adding an account and hides Facebook Marketplace without Twenty", async () => {
    const { offered } = stubPrompts(["agent"]);
    launchDeps.twentyReady = () => false;
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(offered[0]).toEqual(["setup", "add", "signIn", "check", "agent"]);
    expect(out.join("\n")).toContain("claude mcp add log -- logMcp");
  });

  test("Twenty set up adds the Facebook Marketplace menu", async () => {
    const { offered } = stubPrompts(["agent"]);
    await runLaunch(capture().context, []);
    expect(offered[0]).toEqual(["setup", "add", "signIn", "check", "agent", "marketplace"]);
  });

  test("add an X account goes straight to the masked cookie prompt", async () => {
    const { calls, offered } = stubPrompts(["add", "twitter", "@someHandle"]);
    launchDeps.twentyReady = () => false;
    const delegated = recordRuns();
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(offered[1]).toEqual(["twitter", "linkedin", "slack", "reddit", "discord", "instagram", "facebook"]);
    expect(delegated).toEqual([["cookies", "save", "--account", "someHandle"]]);
    expect(out.join("\n")).toContain("auth_token, ct0 and twid");
    expect(calls).toEqual(["intro", "select", "select", "text", "outro"]);
  });

  test("add a Reddit account saves it locally, then shows how to sign in in its browser", async () => {
    stubPrompts(["add", "reddit", "redditName", "k1abc"]);
    const delegated = recordRuns();
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(delegated).toEqual([["localAccount", "add", "--platform", "reddit", "--account", "redditName", "--adsPower", "k1abc"]]);
    expect(out.join("\n")).toContain("log inspect start --account redditName");
    expect(out.join("\n")).not.toContain("--adsPower <profileId>");
  });

  test("add a Facebook account asks its proxy, home and city, and connecting can wait", async () => {
    stubPrompts(["add", "facebook", "fbName", "", "http://u:p@host:1", "us", "Bethlehem", "no"]);
    const delegated = recordRuns();
    const { context, out } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(delegated).toEqual([["localAccount", "add", "--platform", "facebook", "--account", "fbName", "--proxy", "http://u:p@host:1", "--home", "US", "--city", "Bethlehem"]]);
    expect(out.join("\n")).toContain("log facebook connect --account fbName");
  });

  test("a failed add stops before signing in", async () => {
    stubPrompts(["add", "discord", "dcName", ""]);
    const delegated = recordRuns(() => ({ code: 1 }));
    expect((await runLaunch(capture().context, [])).code).toBe(1);
    expect(delegated).toEqual([["localAccount", "add", "--platform", "discord", "--account", "dcName"]]);
  });

  test("check offers every account but Facebook and runs its platform's session check", async () => {
    const { offered } = stubPrompts(["check", "0"]);
    const delegated = recordRuns();
    const { context } = capture();
    const accounts = (await context.twenty.list("socialAccounts")) as unknown as { platform?: string }[];
    expect(accounts.some((a) => a.platform === "TWITTER")).toBe(true);
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(offered[1]).toEqual(["0"]);
    expect(delegated).toEqual([["session", "check", "--account", "twitterOne"]]);
  });

  test("sign in a Facebook account offers to connect it", async () => {
    stubPrompts(["signIn", "0", "yes"]);
    const delegated = recordRuns();
    const { context } = capture();
    expect((await runLaunch(context, [])).code).toBe(0);
    expect(delegated[0][0]).toBe("connect");
  });
});

describe("log launch --setup", () => {
  function recordRuns() {
    const delegated: string[][] = [];
    launchDeps.run = (command, _context, argv) => {
      delegated.push([command.name, ...argv]);
      return { code: 0, stdout: "ok" };
    };
    return delegated;
  }

  function setupRig(adsPowerUp = true, tregFound = true) {
    const opened: string[] = [];
    const ran: string[] = [];
    const files: Record<string, string> = { "/home/.logCli/.env": "LOG_ACCOUNTS=local\n" };
    launchDeps.openUrl = (url) => (opened.push(url), true);
    launchDeps.runInTerminal = (command, args) => (ran.push([command, ...args].join(" ")), { found: tregFound, code: 0 });
    launchDeps.adsPowerUp = async () => adsPowerUp;
    launchDeps.harnesses = () => [];
    launchDeps.installHarness = () => ({ configPath: "/home/.config/opencode/opencode.jsonc", changed: true, pluginDir: "/home/.config/opencode/plugins/logHooks", pluginFiles: [] });
    launchDeps.envFile = () => "/home/.logCli/.env";
    launchDeps.readEnv = (file) => files[file] ?? "";
    launchDeps.writeEnv = (file, text) => void (files[file] = text);
    return { opened, ran, files };
  }

  test("picks platforms, signs each in, then sets up the extensions it was asked for, opening each sign-up page", async () => {
    const before = process.env.MEMELORD_API_KEY;
    const { calls, offered } = stubPrompts([["twitter"], "@someHandle", ["treg", "memelord"], "signUp", "signUp", "memeKey123"]);
    const { opened, ran, files } = setupRig();
    const delegated = recordRuns();
    const { context, out } = capture();
    expect((await runLaunch(context, ["--setup"])).code).toBe(0);
    expect(offered[0]).toEqual(["twitter", "linkedin", "slack", "reddit", "discord", "instagram", "facebook"]);
    expect(offered[1]).toEqual(["treg", "memelord", "inworld", "fishAudio"]);
    expect(delegated).toEqual([["cookies", "save", "--account", "someHandle"]]);
    expect(opened).toEqual(["https://treg.to/?ref=matthewdonse-aebsh", "https://www.memelord.com/sign-up?ref=kfwut9wc", "https://www.memelord.com/settings/developer"]);
    expect(ran).toEqual(["treg login"]);
    expect(files["/home/.logCli/.env"]).toBe("LOG_ACCOUNTS=local\nMEMELORD_API_KEY=memeKey123\n");
    expect(out.join("\n")).toContain("✓ treg: signed in");
    expect(out.join("\n")).toContain("✓ Memelord: MEMELORD_API_KEY saved");
    expect(out.join("\n")).not.toContain("memeKey123");
    expect(calls[0]).toBe("intro");
    if (before === undefined) delete process.env.MEMELORD_API_KEY;
    else process.env.MEMELORD_API_KEY = before;
  });

  test("a browser platform asks for AdsPower first, on its referral link, and checks its Local API", async () => {
    const { offered } = stubPrompts([["discord"], "signUp", "", "dcName", "", []]);
    const { opened } = setupRig(false);
    recordRuns();
    const { context, out } = capture();
    expect((await runLaunch(context, ["--setup"])).code).toBe(0);
    expect(offered[1]).toEqual(["signUp", "have", "skip"]);
    expect(opened).toEqual(["https://www.adspower.com/share/pD25Iu"]);
    expect(out.join("\n")).toContain("AdsPower: its Local API didn't answer");
  });

  test("Inworld says what its referral gives, and a skipped key is listed, never saved", async () => {
    stubPrompts([[], ["inworld", "fishAudio"], "signUp", "", "skip"]);
    const { opened, files } = setupRig();
    const { context, out } = capture();
    expect((await runLaunch(context, ["--setup"])).code).toBe(0);
    expect(opened).toEqual(["https://inworld.ai/signup?ref=FSNLMJ2H", "https://platform.inworld.ai"]);
    expect(out.join("\n")).toContain("$10 in credits");
    expect(out.join("\n")).toContain("· Inworld: no key");
    expect(out.join("\n")).toContain("· Fish Audio: skipped");
    expect(files["/home/.logCli/.env"]).toBe("LOG_ACCOUNTS=local\n");
  });

  test("treg not installed says where to get it", async () => {
    stubPrompts([[], ["treg"], "have"]);
    setupRig(true, false);
    const { context, out } = capture();
    expect((await runLaunch(context, ["--setup"])).code).toBe(0);
    expect(out.join("\n")).toContain("treg isn't installed: install it from https://treg.to/?ref=matthewdonse-aebsh");
  });

  test("offers the agent harnesses it can wire itself into, and says where it put each one", async () => {
    stubPrompts([[], [], ["opencode"]]);
    setupRig();
    launchDeps.harnesses = () => SETUP_HARNESSES;
    const installed: string[] = [];
    launchDeps.installHarness = (harness) => {
      installed.push(harness.id);
      return { configPath: "/home/.config/opencode/opencode.jsonc", changed: true, pluginDir: "/home/.config/opencode/plugins/logHooks", pluginFiles: [] };
    };
    const { context, out } = capture();
    expect((await runLaunch(context, ["--setup"])).code).toBe(0);
    expect(installed).toEqual(["opencode"]);
    expect(out.join("\n")).toContain("OpenCode: wired: /home/.config/opencode/opencode.jsonc");
  });

  test("setEnvValue replaces a key in place or adds it at the end", () => {
    expect(setEnvValue("A=1\nB=2\n", "A", "9")).toBe("A=9\nB=2\n");
    expect(setEnvValue("A=1", "C", "3")).toBe("A=1\nC=3\n");
    expect(setEnvValue("", "C", "3")).toBe("C=3\n");
    expect(setupSummary([], "/x/.env")).toContain("nothing was set up this time");
  });
});
