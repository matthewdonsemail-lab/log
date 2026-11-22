import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { AjvJsonSchemaValidator } from "@modelcontextprotocol/sdk/validation/ajv";
import type { JsonSchemaType } from "@modelcontextprotocol/sdk/validation";
import { appCsp } from "../../../src/mcp/apps/report/view/appBridge.ts";
import { buildGraph } from "../../../src/relate/graph/index.ts";
import { MACHINE_NOW, seedMachineWorld } from "../../../src/relate/machine/fixtures/machineWorld.ts";
import { openDatabase } from "../../../src/storage/schema/index.ts";
import { Chrome, freePort, type Tab } from "./render.ts";
import { HOST_STATE, INSPECT, mcpAppsPage, type Drawn } from "./hostPage.ts";
import { HERMES_STATE, PLUGIN_HOST, hermesPage } from "./hermesPage.ts";

const root = join(import.meta.dir, "..", "..", "..");
const shots = process.argv[2] ?? join(process.env.LOCALAPPDATA ?? ".", "logMcpAppsShots");
const UI_EXTENSION = "io.modelcontextprotocol/ui";
const APP_MIME = "text/html;profile=mcp-app";
const UI = { extensions: { [UI_EXTENSION]: { mimeTypes: [APP_MIME] } } };
const TEXT_HOST = ["no", "ui", "host"].join(" ");
const ACCOUNT = "benchAccount";

interface Case {
  name: string;
  tool: string;
  args: Record<string, unknown>;
  uri: string;
  view: boolean;
  refusal?: true;
}

const CASES: Case[] = [
  { name: "report", view: true, tool: "report", args: { title: "Who messaged me", subtitle: "Last 30 days", blocks: [{ type: "stat", items: [{ label: "Messages in", value: 120 }, { label: "People", value: 3 }] }, { type: "barChart", title: "Messages by person", unit: "msgs", data: [{ label: "linus_k", value: 64 }, { label: "grace_ships", value: 41 }] }] }, uri: "ui://log/report" },
  { name: "machinePerson", view: true, tool: "relateMachine", args: { person: "ivy_ops", view: "person" }, uri: "ui://log/report" },
  { name: "machineRoute", view: true, tool: "relateMachine", args: { view: "route", person: "ivy_ops", to: "grace_ships" }, uri: "ui://log/report" },
  { name: "machineNetwork", view: true, tool: "relateMachine", args: { view: "network" }, uri: "ui://log/report" },
  { name: "machineGenui", view: false, tool: "relateMachine", args: { view: "network", form: "genui" }, uri: "ui://log/report" },
  { name: "browserMissing", view: true, tool: "browserView", args: { account: ACCOUNT }, uri: "ui://log/browserView" },
  { name: "signIn", view: false, tool: "sessionsSignIn", args: { account: ACCOUNT }, uri: "ui://log/browserView" },
  { name: "reportRefused", view: true, refusal: true, tool: "report", args: { title: "Nothing", blocks: [{ type: "nothing" }] }, uri: "ui://log/report" },
];

const REFUSALS = /^[a-z][A-Za-z]+: /;
const problems: string[] = [];
const note = (problem: string) => problems.push(problem);

const env = (db: string): Record<string, string> => {
  const clean = { ...process.env } as Record<string, string | undefined>;
  for (const key of ["LOG_TWENTY_BASE_URL", "LOG_TWENTY_API_KEY", "LOG_HOME", "LOG_VOXL_URL", "LOG_INSPECT_CURRENT"]) delete clean[key];
  return { ...(clean as Record<string, string>), LOG_DB: db, LOG_CONTEXT_SERVICE: "off", LOG_BROWSER_VIEW_LOCATION: "local", LOG_MCP_RELOAD: "off" };
};

async function connect(name: string, capabilities: Record<string, unknown>, db: string): Promise<Client> {
  const client = new Client({ name, version: "0.0.0" }, { capabilities: capabilities as never });
  const transport = new StdioClientTransport({ command: process.execPath, args: [join(root, "bin", "logMcp.ts"), "--child"], cwd: root, env: env(db) as never, stderr: "pipe", windowsHide: true });
  await client.connect(transport);
  return client;
}

const validator = new AjvJsonSchemaValidator();

interface Answer {
  result: Record<string, unknown>;
  text: string;
  isError: boolean;
}

async function answerOf(client: Client, spec: Case): Promise<Answer> {
  const result = (await client.callTool({ name: spec.tool, arguments: spec.args })) as Record<string, unknown>;
  const text = ((result.content ?? []) as { text?: string }[]).map((part) => part.text ?? "").join("\n");
  return { result, text, isError: result.isError === true };
}

function checkSchema(listed: Map<string, { outputSchema?: unknown }>, spec: Case, answer: Answer): void {
  const schema = listed.get(spec.tool)?.outputSchema as JsonSchemaType | undefined;
  if (!schema) {
    note(`${spec.name}: ${spec.tool} lists no outputSchema`);
    return;
  }
  if (answer.isError && !REFUSALS.test(answer.text)) {
    note(`${spec.name}: ${spec.tool} answered isError: ${answer.text.slice(0, 200)}`);
    return;
  }
  if (answer.isError) return;
  const verdict = validator.getValidator(schema)(answer.result.structuredContent);
  if (verdict.valid === false) note(`${spec.name}: structuredContent does not match the listed outputSchema: ${verdict.errorMessage ?? "invalid"}`);
}

function viewOf(answer: Answer): Record<string, unknown> | null {
  const meta = answer.result._meta as Record<string, unknown> | undefined;
  const view = meta?.["log/view"];
  return view && typeof view === "object" ? (view as Record<string, unknown>) : null;
}

function troubleOf(drawn: Drawn & { fonts?: { family: string; status: string }[] }, theme: "light" | "dark", trouble: { text: string }[], name: string): void {
  for (const face of drawn.fonts ?? []) if (drawn.family?.includes(face.family) && face.status !== "loaded") note(`${name} (${theme}): the ${face.family} font it draws with did not load`);
  if (!drawn.initialized) note(`${name} (${theme}): the view never finished ui/initialize`);
  if (drawn.textLength < 20) note(`${name} (${theme}): drew almost nothing (${JSON.stringify(drawn.text)})`);
  if (drawn.raw) note(`${name} (${theme}): shows a raw value ${drawn.raw}`);
  if (drawn.scrollers.length) note(`${name} (${theme}): scrolls inside the card (${drawn.scrollers.slice(0, 3).join(", ")})`);
  if (drawn.scrollHeight > drawn.clientHeight + 2) note(`${name} (${theme}): taller than its frame (${drawn.scrollHeight} > ${drawn.clientHeight})`);
  if (drawn.lightness !== null && drawn.lightness < 0.5 !== (theme === "dark")) note(`${name} (${theme}): drawn ${drawn.lightness < 0.5 ? "dark" : "light"} on a ${theme} host`);
  if (drawn.unknown.length) note(`${name} (${theme}): the view sent methods the host does not answer (${drawn.unknown.join(", ")})`);
  for (const entry of trouble.slice(0, 4)) note(`${name} (${theme}): ${entry.text.slice(0, 300)}`);
}

async function main(): Promise<void> {
  mkdirSync(shots, { recursive: true });
  const scratch = mkdtempSync(join(process.env.TMPDIR ?? ".", "logMcpApps"));
  const db = join(scratch, "log.db");
  const handle = openDatabase(db);
  seedMachineWorld(handle);
  handle.close();
  buildGraph(db, new Date(MACHINE_NOW));

  const client = await connect("mcpAppsCheck", UI, db);
  const listed = new Map((await client.listTools()).tools.map((tool) => [tool.name, tool]));
  const appToolNames = [...listed.values()].filter((tool) => (tool._meta as { ui?: unknown } | undefined)?.ui).map((tool) => tool.name);
  for (const name of ["report", "relateMachine", "browserView", "sessionsSignIn", "browserViewStream", "browserViewFrame", "browserViewInput", "browserViewDone"]) if (!appToolNames.includes(name)) note(`${name} is not offered as an MCP App tool`);
  for (const tool of listed.values()) {
    const ui = (tool._meta as { ui?: { resourceUri?: string; visibility?: string[] } } | undefined)?.ui;
    if (!ui?.resourceUri) continue;
    if (!ui.resourceUri.startsWith("ui://log/")) note(`${tool.name}: its resource uri is ${ui.resourceUri}`);
  }

  const resources = new Map((await client.listResources()).resources.map((resource) => [resource.uri, resource]));
  for (const [uri, resource] of resources) if (uri.startsWith("ui://")) if (resource.mimeType !== APP_MIME) note(`${uri}: listed with ${resource.mimeType}, not ${APP_MIME}`);
  for (const [name, tool] of listed) {
    const uri = (tool._meta as { ui?: { resourceUri?: string } } | undefined)?.ui?.resourceUri;
    if (uri && !resources.has(uri)) note(`${name}: points at ${uri}, which resources/list does not offer`);
  }

  const rendered = new Map<string, { html: string; csp: { connectDomains: string[]; resourceDomains: string[] } }>();
  for (const uri of new Set(CASES.filter((spec) => spec.view).map((spec) => spec.uri))) {
    if (!resources.has(uri)) {
      note(`${uri}: not in resources/list`);
      continue;
    }
    const read = (await client.readResource({ uri })) as { contents: { uri: string; mimeType?: string; text?: string; _meta?: Record<string, unknown> }[] };
    const content = read.contents[0];
    if (!content) {
      note(`${uri}: reads back empty`);
      continue;
    }
    if (content.mimeType !== APP_MIME) note(`${uri}: read with ${content.mimeType}, not ${APP_MIME}`);
    if (!content.text || content.text.length < 200) note(`${uri}: the resource html is ${content.text?.length ?? 0} characters`);
    const ui = (content._meta?.ui ?? {}) as { csp?: { connectDomains?: string[]; resourceDomains?: string[] } };
    if (!ui.csp) note(`${uri}: the resource declares no _meta.ui.csp`);
    if (!content.text?.includes("<div id=\"root\">") && !content.text?.includes("id=\"app\"")) note(`${uri}: the html has no mount point`);
    rendered.set(uri, { html: content.text ?? "", csp: { connectDomains: ui.csp?.connectDomains ?? [], resourceDomains: ui.csp?.resourceDomains ?? [] } });
  }

  const answers = new Map<string, Answer>();
  for (const spec of CASES) {
    const answer = await answerOf(client, spec);
    answers.set(spec.name, answer);
    if (spec.refusal && !answer.isError) note(`${spec.name}: ${spec.tool} drew a view instead of refusing`);
    checkSchema(listed, spec, answer);
    if (spec.view && spec.uri === "ui://log/report" && !answer.isError && !viewOf(answer)) note(`${spec.name}: _meta contains no log view for the widget to draw`);
    if (spec.tool === "relateMachine" && spec.args.form === "genui" && !answer.result.structuredContent) note("machineGenui: no structuredContent for the genui block");
  }

  const virtual = (name: string, contents: string) => ({
    name: "mcpAppsShim",
    setup(build: { onResolve: (options: { filter: RegExp }, run: () => { path: string; namespace: string }) => void; onLoad: (options: { filter: RegExp; namespace: string }, run: () => { contents: string; loader: string }) => void }) {
      build.onResolve({ filter: new RegExp(`^${name}$`) }, () => ({ path: name, namespace: "mcpAppsShim" }));
      build.onLoad({ filter: /.*/, namespace: "mcpAppsShim" }, () => ({ contents, loader: "js" }));
    },
  });
  const bundles = new Map<string, Promise<string>>();
  const built = (file: string, source: string, external: string[]): Promise<string> => {
    let answer = bundles.get(file);
    if (!answer) {
      answer = Bun.build({ entrypoints: [file], target: "browser", format: "esm", external, minify: true, define: { "process.env.NODE_ENV": '"production"' }, plugins: [virtual(file, source)] as never }).then(async (output) => {
        if (!output.success || !output.outputs[0]) throw new Error(`mcpApps: could not bundle ${file}: ${output.logs.map((log) => log.message).join("; ")}`);
        return output.outputs[0].text();
      });
      bundles.set(file, answer);
    }
    return answer;
  };
  const named = (namespace: string, module: Record<string, unknown>, skip: Set<string>): string[] =>
    Object.keys(module)
      .filter((key) => key !== "default" && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) && !skip.has(key))
      .map((key) => `export const ${key} = ${namespace}.${key};`);
  const resolved = (namespace: string, probe: string): string => `const ${namespace} = Raw && typeof Raw.${probe} === "function" ? Raw : (Raw.default ?? Raw);`;
  const reactSource = [`import * as Raw from "react";`, resolved("React", "createElement"), "export default React;", ...named("React", (await import("react")) as Record<string, unknown>, new Set())].join("\n");
  const jsxShim = [
    `import React from "react";`,
    "export const Fragment = React.Fragment;",
    "export const jsx = (type, props, key) => React.createElement(type, key === undefined ? (props ?? {}) : { ...props, key });",
    "export const jsxs = jsx;",
    "export default { Fragment, jsx, jsxs };",
    "",
  ].join("\n");
  const domKeys = new Set(Object.keys((await import("react-dom")) as Record<string, unknown>));
  const domSource = [
    `import * as Raw from "react-dom";`,
    `import * as RawClient from "react-dom/client";`,
    resolved("Dom", "createPortal"),
    `const Client = RawClient && typeof RawClient.createRoot === "function" ? RawClient : (RawClient.default ?? RawClient);`,
    "export default Dom;",
    ...named("Dom", (await import("react-dom")) as Record<string, unknown>, new Set()),
    ...named("Client", (await import("react-dom/client")) as Record<string, unknown>, domKeys),
  ].join("\n");
  const pluginSdkShim = ["export const TRANSCRIPT_DIRECTIVE_AREA = \"transcript\";", "export const host = { composer: { send: () => {}, fill: () => {} } };", ""].join("\n");
  const pluginScript = await Bun.file(join(root, "hermesPlugin", "desktop", "plugin.js")).text();
  const genui = answers.get("machineGenui");
  const genuiBlock = ((genui?.result.structuredContent ?? {}) as { block?: Record<string, unknown> }).block;
  if (!genuiBlock) note("machineGenui: relateMachine answered without a stateMachine block for show_blocks");

  const port = freePort();
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port,
    idleTimeout: 120,
    async fetch(request) {
      const url = new URL(request.url);
      if (url.pathname === "/page") {
        const name = url.searchParams.get("case") ?? "";
        const theme = url.searchParams.get("theme") === "dark" ? "dark" : "light";
        const spec = CASES.find((each) => each.name === name);
        const resource = spec ? rendered.get(spec.uri) : undefined;
        if (!spec || !resource) return new Response("missing case", { status: 404 });
        const answer = answers.get(name);
        return new Response(mcpAppsPage({ name, theme, html: resource.html, csp: resource.csp, tool: spec.tool, toolInput: spec.args, result: (answer?.result ?? {}) as Record<string, unknown> }, appCsp(resource.csp)), { headers: { "content-type": "text/html; charset=utf-8" } });
      }
      if (url.pathname === "/hermes/plugin.js") return new Response(pluginScript, { headers: { "content-type": "text/javascript" } });
      if (url.pathname === "/hermes/host.js") return new Response(PLUGIN_HOST, { headers: { "content-type": "text/javascript" } });
      if (url.pathname === "/hermes/react.js") return new Response(await built("reactShim", reactSource, []), { headers: { "content-type": "text/javascript" } });
      if (url.pathname === "/hermes/jsxRuntime.js") return new Response(jsxShim, { headers: { "content-type": "text/javascript" } });
      if (url.pathname === "/hermes/reactDom.js") return new Response(await built("domShim", domSource, ["react"]), { headers: { "content-type": "text/javascript" } });
      if (url.pathname === "/hermes/pluginSdk.js") return new Response(await built("pluginSdkShim", pluginSdkShim, []), { headers: { "content-type": "text/javascript" } });
      if (url.pathname === "/hermes") {
        const theme = url.searchParams.get("theme") === "dark" ? "dark" : "light";
        return new Response(hermesPage(theme, "aaaaaaaa", genuiBlock ? [genuiBlock] : []), { headers: { "content-type": "text/html; charset=utf-8" } });
      }
      if (url.pathname === "/call") {
        const body = (await request.json()) as { name?: string; arguments?: Record<string, unknown> };
        if (typeof body.name !== "string") return new Response("missing tool", { status: 400 });
        const result = await client.callTool({ name: body.name, arguments: body.arguments ?? {} });
        return Response.json(result);
      }
      return new Response("not found", { status: 404 });
    },
  });

  const chrome = await Chrome.launch(join(scratch, "chrome"));
  const renders: { name: string; theme: string; file: string; drawn: Drawn; trouble: number }[] = [];
  try {
    const tab: Tab = await chrome.tab();
    for (const spec of CASES.filter((each) => each.view)) {
      for (const theme of ["light", "dark"] as const) {
        await tab.open(`http://127.0.0.1:${port}/page?case=${encodeURIComponent(spec.name)}&theme=${theme}`);
        await tab.media(theme);
        await tab.waitWithin("document.body !== null").catch(() => {});
        await tab.waitFor(`window.__mcpHost && window.__mcpHost.initialized`, 20_000).catch(() => {});
        await tab.waitWithin("(document.body.innerText || '').trim().length > 0").catch(() => {});
        await Bun.sleep(900);
        const inner = await tab.within<Omit<Drawn, "height" | "calls" | "unknown" | "initialized" | "ready">>(INSPECT);
        const host = await tab.evaluate<{ initialized: boolean; height: number | null; calls: string[]; callCount: number; unknown: string[] }>(HOST_STATE);
        const drawn: Drawn = { ...inner, ready: inner.textLength > 0, height: host.height, calls: host.calls, unknown: host.unknown, initialized: host.initialized };
        troubleOf(drawn, theme, tab.trouble, spec.name);
        const height = Math.max(drawn.scrollHeight + 48, 320);
        const file = await tab.screenshot(join(shots, `${spec.name}-${theme}.png`), height);
        renders.push({ name: spec.name, theme, file, drawn, trouble: tab.trouble.length });
        tab.trouble.length = 0;
        if (spec.name === "report" || spec.name === "browserMissing") {
          const other = theme === "light" ? "dark" : "light";
          await tab.evaluate(`window.__setTheme(${JSON.stringify(other)})`);
          await Bun.sleep(700);
          const after = await tab.within<Omit<Drawn, "height" | "calls" | "unknown" | "initialized" | "ready">>(INSPECT);
          if (after.lightness !== null && after.lightness < 0.5 !== (other === "dark")) note(`${spec.name}: stayed ${after.lightness < 0.5 ? "dark" : "light"} when the host switched to ${other}`);
          const switched = await tab.screenshot(join(shots, `${spec.name}-switched-${other}.png`), Math.max(after.scrollHeight + 48, 320));
          renders.push({ name: `${spec.name}-switched`, theme: other, file: switched, drawn: { ...after, ready: true, height: null, calls: [], unknown: [], initialized: true }, trouble: 0 });
          for (const entry of tab.trouble.slice(0, 3)) note(`${spec.name} (switched to ${other}): ${entry.text.slice(0, 240)}`);
          tab.trouble.length = 0;
        }
      }
    }
    for (const theme of ["light", "dark"] as const) {
      await tab.open(`http://127.0.0.1:${port}/hermes?theme=${theme}`);
      await tab.media(theme);
      await tab.waitFor(`window.__hermes && window.__hermes.rendered`, 20_000).catch(() => {});
      await tab.waitFor("(document.body.innerText || '').trim().length > 0", 20_000).catch(() => {});
      await Bun.sleep(800);
      const state = await tab.evaluate<{ registered: { id: string; name?: string }[]; errors: string[]; rendered: boolean }>(HERMES_STATE);
      const drawn = await tab.evaluate<Omit<Drawn, "height" | "calls" | "unknown" | "initialized" | "ready">>(INSPECT);
      for (const entry of state.errors) note(`hermes plugin (${theme}): ${entry.split("\n")[0]?.slice(0, 240)}`);
      for (const tag of ["blocks", "logViewTag", "logAppTag", "logBrowserTag"]) {
        const seenTag = state.registered.some((entry) => (tag === "blocks" ? entry.name === "blocks" : entry.id === tag));
        if (!seenTag) note(`hermes plugin (${theme}): registers no ${tag}`);
      }
      const labels = ((genuiBlock?.states ?? []) as { label?: string }[]).map((state) => state.label ?? "").filter(Boolean);
      const seen = labels.filter((label) => drawn.text.includes(label));
      if (seen.length < 2) note(`hermes plugin (${theme}): the state machine drew ${seen.length} of ${labels.length} state labels (${JSON.stringify(drawn.text.slice(0, 120))})`);
      troubleOf({ ...drawn, ready: drawn.textLength > 0, height: null, calls: [], unknown: [], initialized: true }, theme, tab.trouble, "hermes plugin");
      const height = Math.max(drawn.scrollHeight + 48, 320);
      const file = await tab.screenshot(join(shots, `hermesStateMachine-${theme}.png`), height);
      renders.push({ name: "hermesStateMachine", theme, file, drawn: { ...drawn, ready: true, height: null, calls: [], unknown: [], initialized: true }, trouble: tab.trouble.length });
      tab.trouble.length = 0;
    }
  } finally {
    chrome.stop();
    server.stop(true);
  }

  if (genuiBlock) {
    const python = process.env.LOG_PYTHON?.trim() || "python";
    const script = [
      "import importlib.util, json, sys",
      "spec = importlib.util.spec_from_file_location('genuiMachine', sys.argv[1])",
      "module = importlib.util.module_from_spec(spec)",
      "spec.loader.exec_module(module)",
      "block = json.loads(sys.stdin.read())",
      "print(json.dumps({'problems': module.check_machine(block, 'block'), 'text': module.text_machine(block)}))",
    ].join("\n");
    const run = Bun.spawn([python, "-c", script, join(root, "hermesPlugin", "genuiMachine.py")], { stdin: new Blob([JSON.stringify(genuiBlock)]), stdout: "pipe", stderr: "pipe", windowsHide: true });
    const [out, err] = await Promise.all([new Response(run.stdout).text(), new Response(run.stderr).text()]);
    if ((await run.exited) !== 0) note(`hermes genui validator: ${python} failed: ${err.trim().split("\n").slice(-3).join(" ")}`);
    else {
      const verdict = JSON.parse(out.trim()) as { problems: [string, string][]; text: string };
      for (const [where, problem] of verdict.problems) note(`hermes genui validator: ${where}: ${problem}`);
      const labels = ((genuiBlock.states ?? []) as { label?: string }[]).map((state) => String(state.label ?? "")).filter(Boolean);
      const seen = labels.filter((label) => verdict.text.includes(label));
      if (seen.length < 2) note(`hermes genui validator: the fallback text names ${seen.length} of ${labels.length} states`);
      const answer = answers.get("machineGenui");
      if (answer && !answer.text.includes(verdict.text.split("\n")[0] ?? "\u0000")) note("machineGenui: the tool text does not carry the block's fallback text");
    }
  }

  const textClient = await connect(TEXT_HOST, {}, db);
  for (const spec of CASES) {
    const answer = await answerOf(textClient, spec);
    if (answer.isError && !REFUSALS.test(answer.text)) note(`${spec.name}: a text-only host got an error: ${answer.text.slice(0, 200)}`);
    if (answer.text.trim().length < 40) note(`${spec.name}: a text-only host got ${answer.text.trim().length} characters of text`);
    if (/is shown to the person/i.test(answer.text)) note(`${spec.name}: a text-only host was told the view "is shown", so it has no fallback text`);
  }
  await textClient.close();

  const hermesClient = await connect("hermesAgent", UI, db);
  for (const spec of CASES.filter((each) => each.view && each.uri === "ui://log/report" && !each.refusal)) {
    const answer = await answerOf(hermesClient, spec);
    const directive = /::logapp\{tool="report" view="([0-9a-f]{8})"\}/.exec(answer.text);
    if (!directive) note(`hermes with MCP Apps (${spec.name}): the reply carries no ::logapp line, so Hermes Desktop draws nothing`);
    const view = (answer.result.structuredContent as { hermesView?: string } | undefined)?.hermesView;
    if (!view) note(`hermes with MCP Apps (${spec.name}): structuredContent carries no hermesView id`);
    else if (directive && directive[1] !== view) note(`hermes with MCP Apps (${spec.name}): the line names view ${directive[1]} but the answer stored ${view}`);
    if (answer.text.trim().length < 40) note(`hermes with MCP Apps (${spec.name}): ${answer.text.trim().length} characters of text for other chats`);
  }
  await hermesClient.close();
  await client.close();

  for (const render of renders) console.log(`${render.name} ${render.theme}: ${render.drawn.textLength} chars, ${render.drawn.frames} nodes, calls ${render.drawn.calls.join(",") || "none"} -> ${render.file}`);
  try {
    rmSync(scratch, { recursive: true, force: true });
  } catch {}
  if (problems.length) {
    console.error(`mcpApps: ${problems.length} problem(s):\n${problems.map((problem) => `  - ${problem}`).join("\n")}`);
    process.exit(1);
  }
  console.log(`mcpApps: ${CASES.length} app tools drawn in an MCP Apps host and answered as text, light and dark, screenshots in ${shots}`);
}

await main();
