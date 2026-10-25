import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { defaultReaRunner, evidenceIdOf, writeCaptureScripts } from "../capture/client";
import { exportScripts, parseSteps, splitHarBySteps } from "../capture/helpers/index";
import type { ReaRunner } from "../capture/types";
import { CAPTURE_FOLDERS } from "../../browser/driver/types";
import { domainOf, factsFromDoc, foldOperation, importersOf, indexModules, readGraphqlDefinition, renderOperationDoc, renderStoredSightings, requestsInStep, sliceFor } from "./helpers/index";
import type { ReasoningPrompts, StoredFacts } from "./helpers/index";
import type { RequestSeen } from "./helpers/index";
import type { ClientOperation, FacebookModule } from "./types";
import { exchangesOf } from "../../subq/stepReading/helpers/exchangesOf";
import type { StepExchange } from "../../subq/stepReading/types";

export interface RunCapture {
  dir: string;
  run: string;
  action: string;
}

export interface BuildClientMapOptions {
  capturesRoot: string;
  outDir: string;
  docsDir: string;
  runner: ReaRunner | null;
  log: (line: string) => void;
  concurrency?: number;
}

export const DOCS_INDEX = "operations.json";

export function capturesRoot(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_CAPTURES_ROOT || join(homedir(), ".logCli");
}

export function findRunCaptures(root: string): RunCapture[] {
  const found: RunCapture[] = [];
  const walk = (dir: string, depth: number): void => {
    let names: string[];
    try {
      names = readdirSync(dir);
    } catch {
      return;
    }
    if (CAPTURE_FOLDERS.includes(basename(dir)) && names.includes("session.har")) {
      const run = relative(root, resolve(dir, "..")).split(sep).join("/");
      const [top, action] = run.split("/");
      found.push({ dir, run, action: top === "runs" ? action : top });
      return;
    }
    if (depth === 0) return;
    for (const name of names) if (statSync(join(dir, name), { throwIfNoEntry: false })?.isDirectory()) walk(join(dir, name), depth - 1);
  };
  for (const top of ["runs", "publish"]) walk(join(root, top), 5);
  return found.sort((a, b) => statSync(join(b.dir, "session.har")).mtimeMs - statSync(join(a.dir, "session.har")).mtimeMs);
}

export function withExchanges(requests: RequestSeen[], exchanges: StepExchange[]): RequestSeen[] {
  const queues = new Map<string, StepExchange[]>();
  for (const e of exchanges) if (e.kind === "api") queues.set(e.name, [...(queues.get(e.name) ?? []), e]);
  return requests.map((r) => {
    const e = queues.get(r.name)?.shift();
    return e ? { ...r, sent: e.sent, answer: e.answer } : r;
  });
}

export function requestsInRun(capture: RunCapture): RequestSeen[] {
  const har = JSON.parse(readFileSync(join(capture.dir, "session.har"), "utf8")) as { log?: { entries?: { startedDateTime?: string }[] } };
  const stepsFile = join(capture.dir, "steps.jsonl");
  let steps = existsSync(stepsFile) ? parseSteps(readFileSync(stepsFile, "utf8")) : [];
  if (!steps.length) steps = [{ at: har.log?.entries?.[0]?.startedDateTime ?? new Date(0).toISOString(), step: "Whole run (no steps.jsonl)" }];
  return splitHarBySteps(har, steps).flatMap((part) =>
    withExchanges(requestsInStep(part.har as never, { run: capture.run, action: capture.action, step: part.step, stepAt: steps[part.index - 1].at }), exchangesOf(part.har, new Set(), [])),
  );
}

function stepEvidence(capture: RunCapture): Map<string, string> {
  const evidence = new Map<string, string>();
  try {
    const index = JSON.parse(readFileSync(join(capture.dir, "steps", "index.json"), "utf8")) as { steps: { step: string; har: string }[] };
    for (const step of index.steps) {
      const read = JSON.parse(readFileSync(join(capture.dir, "steps", step.har.replace(/\.har$/, ".rea.json")), "utf8")) as { stdout?: string };
      const id = evidenceIdOf(read.stdout ?? "");
      if (id) evidence.set(step.step, id);
    }
  } catch {
  }
  return evidence;
}

export function scriptsFromHar(capture: RunCapture, log: (line: string) => void): number {
  try {
    const har = JSON.parse(readFileSync(join(capture.dir, "session.har"), "utf8")) as { log?: { entries?: { response?: { content?: { _bodyError?: string } } }[] } };
    const lost = (har.log?.entries ?? []).filter((e) => e.response?.content?._bodyError).length;
    const exported = exportScripts(har as unknown);
    if (!exported.scripts.length) return 0;
    writeCaptureScripts(capture.dir, exported);
    log(`  ${capture.run}: not settled yet, ${exported.scripts.length} bundle(s) taken from its session.har${lost ? `; ${lost} response body(ies) lost in the recording (_bodyError)` : ""}`);
    return exported.scripts.length;
  } catch (error) {
    log(`  ${capture.run}: its session.har could not be read for bundles (${error instanceof Error ? error.message : String(error)})`);
    return 0;
  }
}

export function indexRunModules(captures: RunCapture[], log: (line: string) => void): Map<string, FacebookModule> {
  const modules = new Map<string, FacebookModule>();
  const parsed = new Set<string>();
  for (const capture of captures) {
    const scriptsDir = join(capture.dir, "scripts");
    if (!existsSync(scriptsDir)) scriptsFromHar(capture, log);
    if (!existsSync(scriptsDir)) continue;
    let fresh = 0;
    for (const file of readdirSync(scriptsDir)) {
      const text = readFileSync(join(scriptsDir, file), "utf8");
      const sha = createHash("sha256").update(text).digest("hex");
      if (parsed.has(sha)) continue;
      parsed.add(sha);
      fresh++;
      for (const module of indexModules(file, text)) if (!modules.has(module.name)) modules.set(module.name, module);
    }
    if (fresh) log(`  ${capture.run}: ${fresh} new bundle(s), ${modules.size} modules so far`);
  }
  return modules;
}

export function operationNamesByDocId(modules: Map<string, FacebookModule>): Map<string, string> {
  const names = new Map<string, string>();
  for (const [name, module] of modules) {
    if (!name.endsWith("_facebookRelayOperation")) continue;
    const id = module.text.match(/exports\s*=\s*"(\d+)"/)?.[1];
    if (id) names.set(id, name.slice(0, -"_facebookRelayOperation".length));
  }
  return names;
}

export function mergeOperations(seen: RequestSeen[], modules: Map<string, FacebookModule>): ClientOperation[] {
  const importers = importersOf(modules.values());
  const byDocId = operationNamesByDocId(modules);
  const operations = new Map<string, ClientOperation>();
  for (const unnamed of seen) {
    const named = !unnamed.graphql && unnamed.docId ? byDocId.get(unnamed.docId) : undefined;
    const request = named ? { ...unnamed, name: named, graphql: true } : unnamed;
    let operation = operations.get(request.name);
    if (!operation) {
      const definition = request.graphql ? modules.get(`${request.name}.graphql`) : undefined;
      const read = definition ? readGraphqlDefinition(definition.text) : null;
      operation = {
        name: request.name,
        domain: domainOf(request.name),
        kind: request.graphql ? (read?.kind ?? "query") : "endpoint",
        docId: request.docId,
        path: request.path,
        sends: read?.sends ?? [],
        reads: read?.reads ?? [],
        calledFrom: request.graphql ? (importers.get(`${request.name}.graphql`) ?? []) : [],
        sightings: [],
        reaEvidenceId: null,
      };
      operations.set(request.name, operation);
    }
    for (const name of request.variables) if (!operation.sends.includes(name)) operation.sends.push(name);
    const { name: _name, docId: _docId, path: _path, graphql: _graphql, variables: _variables, ...sighting } = request;
    operation.sightings.push(sighting);
  }
  return [...operations.values()].sort((a, b) => a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name));
}

async function eachLimited<T>(items: T[], limit: number, work: (item: T, index: number) => Promise<void>): Promise<void> {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      await work(items[index], index);
    }
  }));
}

export async function readSlices(operations: ClientOperation[], modules: Map<string, FacebookModule>, outDir: string, runner: ReaRunner, log: (line: string) => void, concurrency = 3): Promise<void> {
  const cachePath = join(outDir, "reaCache.json");
  let cache: Record<string, string> = {};
  try {
    cache = JSON.parse(readFileSync(cachePath, "utf8")) as Record<string, string>;
  } catch {
  }
  const importers = importersOf(modules.values());
  const todo: { operation: ClientOperation; dir: string; sha: string }[] = [];
  for (const operation of operations) {
    if (operation.kind === "endpoint") continue;
    const slice = sliceFor(operation.name, modules, importers);
    if (!slice.length) continue;
    const sha = createHash("sha256").update(slice.map((m) => m.text).join("\n")).digest("hex");
    if (cache[sha]) {
      operation.reaEvidenceId = cache[sha];
      continue;
    }
    const dir = join(outDir, "slices", operation.domain, operation.name);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    for (const module of slice) writeFileSync(join(dir, `${module.name.replace(/[^A-Za-z0-9_]/g, "_")}.js`), module.text);
    todo.push({ operation, dir, sha });
  }
  log(`rea: ${todo.length} slice(s) to read, ${operations.filter((o) => o.reaEvidenceId).length} already read in earlier builds`);
  let done = 0;
  await eachLimited(todo, concurrency, async ({ operation, dir, sha }) => {
    const started = Date.now();
    const read = await runner(["analyze-javascript-application", dir, "--format", "json", "--analysis-timeout-ms", "120000"], outDir);
    const id = read.code === 0 ? evidenceIdOf(read.stdout) : null;
    if (id) {
      operation.reaEvidenceId = id;
      cache[sha] = id;
      writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
    }
    done++;
    log(`  rea ${done}/${todo.length} ${operation.domain}/${operation.name}: ${id ? "read" : `exit ${read.code}`} in ${Math.round((Date.now() - started) / 1000)} s`);
  });
}

function existingDoc(docsDir: string, name: string): string | null {
  if (!existsSync(docsDir)) return null;
  for (const domain of readdirSync(docsDir)) {
    const path = join(docsDir, domain, `${name}.md`);
    if (existsSync(path)) return path;
  }
  return null;
}

export function clientFactsPath(): string {
  return join(process.env.LOG_CAPTURES_ROOT || join(homedir(), ".logCli"), "rea", "clientFacts.json");
}

export function writeOperationDocs(operations: ClientOperation[], docsDir: string, runs: number, storePath = clientFactsPath(), reasoning?: ReasoningPrompts): { written: number; toWrite: number } {
  let toWrite = 0;
  let store: Record<string, StoredFacts> = {};
  try {
    store = JSON.parse(readFileSync(storePath, "utf8")) as Record<string, StoredFacts>;
  } catch {
  }
  const seenBy = new Map<string, number>();
  const kindBy = new Map<string, ClientOperation["kind"]>();
  for (const operation of operations) {
    const path = join(docsDir, operation.domain, `${operation.name}.md`);
    const old = existingDoc(docsDir, operation.name);
    const oldText = old ? readFileSync(old, "utf8") : null;
    const facts = foldOperation(store[operation.name] ?? (oldText ? factsFromDoc(oldText) : null), operation);
    store[operation.name] = facts;
    seenBy.set(operation.name, facts.seen);
    kindBy.set(operation.name, facts.kind);
    const known = { ...operation, kind: facts.kind, sends: facts.sends, reads: facts.reads, calledFrom: facts.calledFrom, reaEvidenceId: facts.reaEvidenceId };
    const doc = renderOperationDoc(known, oldText, renderStoredSightings(facts), reasoning);
    mkdirSync(join(docsDir, operation.domain), { recursive: true });
    writeFileSync(path, doc);
    if (old && resolve(old) !== resolve(path)) rmSync(old);
    if (doc.includes("<!-- toWrite -->")) toWrite++;
  }
  type Entry = { name: string; domain: string; kind: string; docId: string | null; doc: string; reaEvidenceId: string | null; seen: number };
  let previous: Entry[] = [];
  try {
    previous = (JSON.parse(readFileSync(join(docsDir, DOCS_INDEX), "utf8")) as { operations?: Entry[] }).operations ?? [];
  } catch {
  }
  const before = new Map(previous.map((e) => [e.name, e]));
  const current: Entry[] = operations.map((o) => ({
    name: o.name,
    domain: o.domain,
    kind: kindBy.get(o.name) ?? o.kind,
    docId: o.docId,
    doc: `${o.domain}/${o.name}.md`,
    reaEvidenceId: o.reaEvidenceId ?? before.get(o.name)?.reaEvidenceId ?? null,
    seen: seenBy.get(o.name) ?? o.sightings.length,
  }));
  const seenNow = new Set(current.map((e) => e.name));
  const kept = previous.filter((e) => !seenNow.has(e.name) && existsSync(join(docsDir, e.doc)));
  const index = { builtAt: new Date().toISOString(), runs, operations: [...current, ...kept].sort((x, y) => x.name.localeCompare(y.name)) };
  writeFileSync(join(docsDir, DOCS_INDEX), `${JSON.stringify(index, null, 2)}\n`);
  mkdirSync(dirname(storePath), { recursive: true });
  writeFileSync(storePath, `${JSON.stringify(store)}\n`);
  return { written: operations.length, toWrite };
}

export async function buildClientMap(options: BuildClientMapOptions): Promise<string> {
  const { log } = options;
  const captures = findRunCaptures(options.capturesRoot);
  log(`Runs: ${captures.length} capture(s) under ${options.capturesRoot}`);
  const seen: RequestSeen[] = [];
  const evidenceByStep = new Map<string, string>();
  for (const capture of captures) {
    try {
      const requests = requestsInRun(capture);
      seen.push(...requests);
      for (const [step, id] of stepEvidence(capture)) evidenceByStep.set(`${capture.run}\u0000${step}`, id);
      log(`  ${capture.run}: ${requests.length} request(s) to Facebook`);
    } catch (error) {
      log(`  ${capture.run}: skipped (${error instanceof Error ? error.message : String(error)})`);
    }
  }
  log("Facebook's bundles: parsing into a syntax tree");
  const modules = indexRunModules(captures, log);
  const operations = mergeOperations(seen, modules);
  for (const operation of operations) {
    if (operation.kind !== "endpoint") continue;
    const sighting = operation.sightings.find((s) => evidenceByStep.has(`${s.run}\u0000${s.step}`));
    if (sighting) operation.reaEvidenceId = evidenceByStep.get(`${sighting.run}\u0000${sighting.step}`) ?? null;
  }
  const byDomain = new Map<string, number>();
  for (const o of operations) byDomain.set(o.domain, (byDomain.get(o.domain) ?? 0) + 1);
  log(`Requests: ${operations.length} (${[...byDomain].map(([d, n]) => `${d} ${n}`).join(", ")})`);
  mkdirSync(options.outDir, { recursive: true });
  if (options.runner) await readSlices(operations, modules, options.outDir, options.runner, log, options.concurrency);
  else log("rea: not run (--noRea)");
  writeFileSync(join(options.outDir, "clientMap.json"), `${JSON.stringify({ builtAt: new Date().toISOString(), operations }, null, 2)}\n`, { mode: 0o600 });
  const docs = writeOperationDocs(operations, options.docsDir, captures.length);
  const unread = operations.filter((o) => !o.reaEvidenceId).length;
  return `Facebook client map: ${operations.length} requests from ${captures.length} runs, ${operations.length - unread} read by rea. Docs: ${options.docsDir} (${docs.toWrite} still need their reasoning written).`;
}

export { defaultReaRunner };
