import { afterAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { openDatabase } from "../../../storage/schema/index.ts";
import { getState, putState } from "../../../storage/state/index.ts";
import { marketplaceFixture } from "../../../twenty/graphql/index.ts";
import { createLogMcpServer } from "../../server/index.ts";
import { MCP_APP_MIME_TYPE, UI_EXTENSION_ID } from "../browserView/index.ts";
import { HERMES_VIEW_SCOPE, hermesClient, hermesViewTag, runReport } from "./index.ts";
import { FRESH_DB_MS, SPAWNS_PROCESS_MS } from "../../../../scripts/tests/timeouts.ts";

const root = join(import.meta.dir, "..", "..", "..", "..");
const load = <T>(...parts: string[]): Promise<T> => import(join(...parts)) as Promise<T>;
const { JSDOM } = await load<{ JSDOM: new (html: string) => { window: { DOMParser: new () => unknown } } }>("jsdom");
const { cleanViewHtml } = await load<{ cleanViewHtml: (html: string, parser: unknown) => string }>(import.meta.dir, "view", "hermesClean.ts");
const { hermesKitCss, scopeKitCss } = await load<{ hermesKitCss: () => string; scopeKitCss: (css: string) => string }>(import.meta.dir, "view", "server.tsx");
const { DESKTOP_BUNDLES } = await load<{ DESKTOP_BUNDLES: readonly { entry: string; out: string }[] }>(root, "scripts", "hermes", "desktopBundles.ts");
const scratch = mkdtempSync(join(tmpdir(), "logHermesView"));
const opened = new Set<string>();
const dbAt = (name: string) => {
  const path = join(scratch, name);
  opened.add(path);
  return path;
};
afterAll(() => {
  for (const path of opened) openDatabase(path).close();
  Bun.gc(true);
  rmSync(scratch, { recursive: true, force: true });
});

const SPEC = {
  title: "Who messaged the test account",
  subtitle: "Fake data",
  blocks: [
    { type: "stat", items: [{ label: "Messages in", value: 120 }, { label: "People", value: 3 }] },
    { type: "barChart", title: "Messages by person", unit: "msgs", data: [{ label: "Fake One", value: 64 }, { label: "Fake Two", value: 41 }] },
  ],
};

const HERMES_CLIENT_NAME = ["hermes", "agent"].join("-");
const views = (path: string) => (openDatabase(path).prepare("SELECT count(*) AS n FROM state WHERE scope = ?").get(HERMES_VIEW_SCOPE) as { n: number }).n;
const TAG = /::logapp\{tool="report" view="([0-9a-f]{8})"\}/;
const textOf = (result: { content: unknown }) => (result.content as { type: string; text?: string }[]).map((part) => part.text ?? "").join("\n");

describe("a report drawn for Hermes", () => {
  test("the Hermes MCP client is told apart from the others by its name", () => {
    expect(hermesClient(HERMES_CLIENT_NAME)).toBe(true);
    expect(hermesClient("Hermes")).toBe(true);
    expect(hermesClient("claude-code")).toBe(false);
    expect(hermesClient(undefined)).toBe(false);
  });

  test("keeps the view in log.db in log's look and hands the model the line that draws it", async () => {
    const db = openDatabase(dbAt("direct.db"));
    const result = await runReport(SPEC, false, {}, { hermes: true, db });
    const text = textOf(result);
    const id = TAG.exec(text)?.[1];
    expect(id).toBeDefined();
    expect(text).toContain(hermesViewTag(id as string));
    expect((result.structuredContent as { hermesView?: string }).hermesView).toBe(id);
    const stored = getState<{ title: string; html: string; text: string; compiled?: string; data?: Record<string, unknown> }>(HERMES_VIEW_SCOPE, id as string, {}, db)?.body as { title: string; html: string; text: string; compiled?: string; data?: Record<string, unknown> };
    expect(stored.title).toBe(SPEC.title);
    expect(stored.compiled).toContain("exports");
    expect(stored.data?.blocks).toHaveLength(2);
    expect(stored.html).toContain('class="sb-page');
    expect(stored.html).toContain("Messages in");
    expect(stored.text).toContain("Messages in");
    expect(stored.text).not.toContain("::logapp");
  }, FRESH_DB_MS);

  test("other hosts get the text alone and nothing is saved", async () => {
    const path = dbAt("other.db");
    const result = await runReport(SPEC, false, {}, { hermes: false, db: openDatabase(path) });
    expect(textOf(result)).not.toContain("::logapp");
    expect(views(path)).toBe(0);
  }, FRESH_DB_MS);

  test("over MCP, a client whose name starts with hermes gets the line and others don't", async () => {
    const before = process.env.LOG_DB;
    const path = dbAt("mcp.db");
    process.env.LOG_DB = path;
    try {
      const call = async (name: string) => {
        const server = createLogMcpServer({ twenty: marketplaceFixture() }, { logDir: null, watchFlows: false });
        const client = new Client({ name, version: "0.0.0" }, { capabilities: {} });
        const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
        await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
        return textOf((await client.callTool({ name: "report", arguments: SPEC })) as { content: unknown });
      };
      expect(await call(HERMES_CLIENT_NAME)).toMatch(TAG);
      expect(await call("fakeHost")).not.toMatch(TAG);
      expect(views(path)).toBe(1);
    } finally {
      if (before === undefined) delete process.env.LOG_DB;
      else process.env.LOG_DB = before;
    }
  });
  test("a Hermes client that declares MCP Apps still gets the line, because its cards draw from it", async () => {
    const before = process.env.LOG_DB;
    const path = dbAt("mcpUi.db");
    process.env.LOG_DB = path;
    try {
      const call = async (name: string, capabilities: Record<string, unknown>) => {
        const server = createLogMcpServer({ twenty: marketplaceFixture() }, { logDir: null, watchFlows: false });
        const client = new Client({ name, version: "0.0.0" }, { capabilities });
        const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
        await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
        return (await client.callTool({ name: "report", arguments: SPEC })) as { content: unknown; structuredContent?: Record<string, unknown> };
      };
      const ui = { extensions: { [UI_EXTENSION_ID]: { mimeTypes: [MCP_APP_MIME_TYPE] } } };
      const hermes = await call(HERMES_CLIENT_NAME, ui);
      const text = textOf(hermes);
      expect(text).toMatch(TAG);
      expect(text).not.toContain("is shown to the person");
      expect(hermes.structuredContent?.hermesView).toBe(TAG.exec(text)?.[1]);
      const other = await call("fakeHost", ui);
      expect(textOf(other)).not.toMatch(TAG);
      expect(textOf(other)).toContain("is shown to the person");
    } finally {
      if (before === undefined) delete process.env.LOG_DB;
      else process.env.LOG_DB = before;
    }
  });
});

describe("the kit inside Hermes's own page", () => {
  test("every page-wide rule is scoped to the view and dark mode follows Hermes's .dark class", () => {
    const css = scopeKitCss(":root {\n  --sb-bg: #fff;\n}\n@media (prefers-color-scheme: dark) {\n  :root,\n  [data-sb-theme='classic'] {\n    --sb-bg: #000;\n  }\n  .sb-card { color: red; }\n}\nhtml, body { margin: 0; }\n#root { min-height: 40px; }\n@media (max-width: 600px) { .sb-grid { gap: 4px; } }");
    expect(css).not.toContain(":root");
    expect(css).not.toContain("html, body");
    expect(css).not.toContain("@media (prefers");
    expect(css).toContain(".dark .logview {");
    expect(css).toContain(".dark .sb-card {");
    expect(css).toContain("@media (max-width: 600px)");
  });

  test("the real kit stylesheet carries Geist and touches nothing outside .logview", () => {
    const css = hermesKitCss();
    expect(css).toContain('font-family:"Geist"');
    expect(css).not.toMatch(/(^|[\s,}]):root\b/);
    expect(css).not.toMatch(/(^|[\s,}])(html|body)\s*[,{]/);
    expect(css).toContain(".dark .logview");
  });

  test("a stored view is cleaned before it is drawn: no scripts, handlers, links out or remote styles", () => {
    const { window } = new JSDOM("");
    const html = [
      '<div class="sb-page" onclick="steal()"><h1>Title</h1>',
      "<script>steal()</script><iframe src=\"https://example.com\"></iframe><style>body{display:none}</style>",
      '<a href="javascript:steal()" class="sb-link">who</a>',
      '<span style="background:url(https://example.com/x.png)">bg</span><span style="width:40%">bar</span>',
      '<img src="https://example.com/t.png"><img src="data:image/png;base64,AAAA" alt="face">',
      '<button data-ask="Who is waiting?" class="sb-btn">Ask</button>',
      '<svg viewBox="0 0 10 10"><path d="M0 0L10 10" stroke-width="2"></path></svg></div>',
    ].join("");
    const clean = cleanViewHtml(html, new window.DOMParser());
    expect(clean).toContain("<h1>Title</h1>");
    expect(clean).not.toContain("script");
    expect(clean).not.toContain("iframe");
    expect(clean).not.toContain("<style");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("javascript:");
    expect(clean).not.toContain("example.com");
    expect(clean).toContain('style="width:40%"');
    expect(clean).toContain('src="data:image/png;base64,AAAA"');
    expect(clean).toContain('data-ask="Who is waiting?"');
    expect(clean).toContain('type="button"');
    expect(clean).toContain('d="M0 0L10 10"');
    expect(clean).toContain('stroke-width="2"');
  });
});

describe("the Desktop half shipped in hermesPlugin", () => {
  test("each built bundle is committed, loads only what Hermes Desktop provides and carries its directive", () => {
    for (const bundle of DESKTOP_BUNDLES) {
      const text = readFileSync(join(root, bundle.out), "utf8");
      const imports = [...text.matchAll(/from\s*"([^"]+)"/g)].map((m) => m[1]);
      expect(imports.every((name) => ["react", "react/jsx-runtime", "@hermes/plugin-sdk"].includes(name))).toBe(true);
    }
    const log = readFileSync(join(root, DESKTOP_BUNDLES[0].out), "utf8");
    expect(log).toContain('"logview"');
    expect(log).toContain(".dark .logview");
    expect(log).toContain('"hermes-genui-tag"');
    expect(log).toContain('"logbrowser"');
    expect(log).toContain('"logapp"');
    expect(log).toContain(".logapp iframe");
    expect(log).toContain("ui/notifications/tool-result");
    const genui = readFileSync(join(root, DESKTOP_BUNDLES[1].out), "utf8");
    expect(genui).toContain("--hb-chart-1: #16181d");
  });
});

describe("the logHooks text fallback", () => {
  test("swaps the line for the view's text on chats that can't draw and leaves Desktop alone", () => {
    const path = dbAt("py.db");
    putState(HERMES_VIEW_SCOPE, "0a1b2c3d", { title: "T", html: "<div></div>", text: "# T\nMessages in 120" }, Date.now(), openDatabase(path));
    const plugin = join(root, "hermesPlugin", "__init__.py");
    const script = [
      "import importlib.util, json",
      `spec = importlib.util.spec_from_file_location("logHooks", ${JSON.stringify(plugin)})`,
      "module = importlib.util.module_from_spec(spec)",
      "spec.loader.exec_module(module)",
      "reply = 'Here it is:\\n::logview{id=\"0a1b2c3d\"}\\nMostly one person.'",
      "missing = 'See ::logview{id=\"ffffffff\"}'",
      "print(json.dumps({'telegram': module.transform_llm_output(response_text=reply, platform='telegram'), 'desktop': module.transform_llm_output(response_text=reply, platform='local'), 'missing': module.transform_llm_output(response_text=missing, platform='cli'), 'plain': module.transform_llm_output(response_text='no tag', platform='cli')}))",
    ].join("\n");
    const run = spawnSync(process.env.LOG_PYTHON || "python", ["-c", script], { encoding: "utf8", windowsHide: true, env: { ...process.env, LOG_DB: path } });
    expect(run.status).toBe(0);
    const out = JSON.parse(run.stdout.trim()) as Record<string, string | null>;
    expect(out.telegram).toBe("Here it is:\n# T\nMessages in 120\nMostly one person.");
    expect(out.desktop).toBeNull();
    expect(out.missing).toContain("draws only in Hermes Desktop");
    expect(out.plain).toBeNull();
  }, SPAWNS_PROCESS_MS);

  test("swaps the live browser line for a short note on chats that can't draw it", () => {
    const plugin = join(root, "hermesPlugin", "__init__.py");
    const script = [
      "import importlib.util, json",
      `spec = importlib.util.spec_from_file_location("logHooksBrowser", ${JSON.stringify(plugin)})`,
      "module = importlib.util.module_from_spec(spec)",
      "spec.loader.exec_module(module)",
      "reply = 'Sign in here:\\n::logbrowser{account=\"fakeSeller\"}'",
      "print(json.dumps({'telegram': module.transform_llm_output(response_text=reply, platform='telegram'), 'desktop': module.transform_llm_output(response_text=reply, platform='desktop')}))",
    ].join("\n");
    const run = spawnSync(process.env.LOG_PYTHON || "python", ["-c", script], { encoding: "utf8", windowsHide: true });
    expect(run.status).toBe(0);
    const out = JSON.parse(run.stdout.trim()) as Record<string, string | null>;
    expect(out.telegram).toBe("Sign in here:\n(fakeSeller's live browser, which shows only in Hermes Desktop)");
    expect(out.desktop).toBeNull();
  }, SPAWNS_PROCESS_MS);

  test("swaps a ::logapp line for the kept report's text, the browser note or a short note", () => {
    const path = dbAt("pyApp.db");
    putState(HERMES_VIEW_SCOPE, "0a1b2c3d", { title: "T", html: "<div></div>", text: "# T\nMessages in 120" }, Date.now(), openDatabase(path));
    const plugin = join(root, "hermesPlugin", "__init__.py");
    const script = [
      "import importlib.util, json",
      `spec = importlib.util.spec_from_file_location("logHooksApp", ${JSON.stringify(plugin)})`,
      "module = importlib.util.module_from_spec(spec)",
      "spec.loader.exec_module(module)",
      "report = 'Here:\\n::logapp{tool=\"report\" view=\"0a1b2c3d\"}'",
      "browser = 'Sign in:\\n::logapp{tool=\"browserView\" args=\\'{\"account\":\"fakeSeller\"}\\'}'",
      "other = '::logapp{tool=\"someView\"}'",
      "print(json.dumps({'report': module.transform_llm_output(response_text=report, platform='telegram'), 'browser': module.transform_llm_output(response_text=browser, platform='cli'), 'other': module.transform_llm_output(response_text=other, platform='cli'), 'desktop': module.transform_llm_output(response_text=report, platform='desktop')}))",
    ].join("\n");
    const run = spawnSync(process.env.LOG_PYTHON || "python", ["-c", script], { encoding: "utf8", windowsHide: true, env: { ...process.env, LOG_DB: path } });
    expect(run.status).toBe(0);
    const out = JSON.parse(run.stdout.trim()) as Record<string, string | null>;
    expect(out.report).toBe("Here:\n# T\nMessages in 120");
    expect(out.browser).toBe("Sign in:\n(fakeSeller's live browser, which shows only in Hermes Desktop)");
    expect(out.other).toBe("(log's someView view, which shows only in Hermes Desktop)");
    expect(out.desktop).toBeNull();
  }, SPAWNS_PROCESS_MS);
});

const genuiPython = spawnSync(process.env.LOG_PYTHON || "python", ["-c", "import httpx"], { windowsHide: true }).status === 0;

describe("log's plugin replaces the stock hermes-genui", () => {
  test.skipIf(!genuiPython)("logHooks registers every genui tool, recipe and the drawing rule, and one transform covers both tags", () => {
    const plugin = join(root, "hermesPlugin", "__init__.py");
    const script = [
      "import importlib.util, json, os",
      `os.environ["LOG_ROOT"] = ${JSON.stringify(root)}`,
      `spec = importlib.util.spec_from_file_location("logHooksGenui", ${JSON.stringify(plugin)})`,
      "module = importlib.util.module_from_spec(spec)",
      "spec.loader.exec_module(module)",
      "class Ctx:",
      "    def __init__(self): self.tools, self.hooks, self.skills, self.sections = [], [], [], []",
      "    def register_tool(self, **k): self.tools.append(k['name'])",
      "    def register_hook(self, name, callback): self.hooks.append(name)",
      "    def register_skill(self, name, *a, **k): self.skills.append(name)",
      "    def register_system_prompt_section(self, name, *a, **k): self.sections.append(name)",
      "    def dispatch_tool(self, *a, **k): return None",
      "ctx = Ctx()",
      "loaded = module.register_genui(ctx)",
      "print(json.dumps({'loaded': loaded, 'tools': sorted(ctx.tools), 'hooks': ctx.hooks, 'held': len(module.GENUI_TRANSFORMS), 'skills': len(ctx.skills), 'sections': ctx.sections}))",
    ].join("\n");
    const run = spawnSync(process.env.LOG_PYTHON || "python", ["-c", script], { encoding: "utf8", windowsHide: true, env: { ...process.env, LOG_INBOX_STATE: scratch } });
    const out = JSON.parse(run.stdout.trim().split("\n").pop() ?? "{}") as { loaded: boolean; tools: string[]; hooks: string[]; held: number; skills: number; sections: string[] };
    expect(out.loaded).toBe(true);
    expect(out.tools).toEqual(expect.arrayContaining(["show_blocks", "market_history", "find_photos", "save_recipe", "dashboard", "board_page", "assistant_setup", "assistant_ideas"]));
    expect(out.hooks).not.toContain("transform_llm_output");
    expect(out.held).toBe(1);
    expect(out.skills).toBeGreaterThan(0);
    expect(out.sections).toHaveLength(1);
  }, 60_000);
});
