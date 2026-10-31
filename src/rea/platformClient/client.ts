import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PLATFORM_SITES } from "../../cli/runner/helpers/platforms";
import type { Platform } from "../../cli/runner/helpers/platforms";
import { exchangesOf } from "../../subq/stepReading/helpers/exchangesOf";
import { evidenceIdOf } from "../capture/client";
import { parseSteps, splitHarBySteps } from "../capture/helpers/index";
import type { ReaRunner } from "../capture/types";
import { clientFactsPath, findRunCaptures, scriptsFromHar, writeOperationDocs } from "../facebookClient/index";
import type { ClientOperation, RequestSeen, RunCapture } from "../facebookClient/index";
import { domainOfRequest, forgetParsed, needlesOf, operationOf, requestNameOf, slicesFor, stablePath } from "./helpers/index";
import { PLATFORM_CLIENT_RULES } from "./types";
import type { BundleScript, SourceSlice } from "./types";

export interface BuildPlatformMapOptions {
  platform: Platform;
  capturesRoot: string;
  outDir: string;
  docsDir: string;
  runner: ReaRunner | null;
  log: (line: string) => void;
  concurrency?: number;
  storePath?: string;
}

interface SeenOn extends RequestSeen {
  host: string;
  operation: string | null;
}

export function onHosts(host: string, hosts: readonly string[]): boolean {
  return hosts.some((h) => host === h || host.endsWith(`.${h}`));
}

function bodyOf(sent: unknown): unknown {
  return sent && typeof sent === "object" && !Array.isArray(sent) && "body" in (sent as Record<string, unknown>) ? (sent as Record<string, unknown>).body : sent;
}

function variablesOf(sent: unknown): string[] {
  const body = bodyOf(sent);
  if (!body || typeof body !== "object" || Array.isArray(body)) return [];
  const variables = (body as Record<string, unknown>).variables;
  if (variables && typeof variables === "object" && !Array.isArray(variables)) return Object.keys(variables);
  return Object.keys(body).filter((k) => k !== "operation" && k !== "operationName");
}

export function readsOf(answer: unknown, depth = 2, prefix = ""): string[] {
  if (!answer || typeof answer !== "object" || Array.isArray(answer) || depth === 0) return prefix ? [prefix] : [];
  const out: string[] = [];
  for (const [key, value] of Object.entries(answer as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const deeper = readsOf(value, depth - 1, path);
    out.push(...(deeper.length ? deeper : [path]));
  }
  return out;
}

export function platformRequestsInRun(capture: RunCapture, hosts: readonly string[]): SeenOn[] {
  const har = JSON.parse(readFileSync(join(capture.dir, "session.har"), "utf8")) as { log?: { entries?: { startedDateTime?: string }[] } };
  const stepsFile = join(capture.dir, "steps.jsonl");
  let steps = existsSync(stepsFile) ? parseSteps(readFileSync(stepsFile, "utf8")) : [];
  if (!steps.length) steps = [{ at: har.log?.entries?.[0]?.startedDateTime ?? new Date(0).toISOString(), step: "Whole run (no steps.jsonl)" }];
  const seen: SeenOn[] = [];
  for (const part of splitHarBySteps(har, steps)) {
    const entries = ((part.har as { log?: { entries?: { startedDateTime?: string }[] } }).log?.entries ?? []).map((e) => Date.parse(e.startedDateTime ?? "")).filter((t) => !Number.isNaN(t));
    const t0 = entries.length ? Math.min(...entries) : Number.NaN;
    const stepAt = Date.parse(steps[part.index - 1].at);
    for (const exchange of exchangesOf(part.har, new Set(), [])) {
      if (exchange.kind !== "api" || !onHosts(exchange.host, hosts)) continue;
      const operation = operationOf(exchange.sent, exchange.path);
      const label = exchange.host.split(".")[0];
      seen.push({
        name: requestNameOf(exchange.host, exchange.path, operation),
        docId: null,
        path: label === "www" ? stablePath(exchange.path) : `${exchange.host}${stablePath(exchange.path)}`,
        graphql: !!operation,
        variables: variablesOf(exchange.sent),
        run: capture.run,
        action: capture.action,
        step: part.step,
        status: exchange.status,
        ms: exchange.ms,
        afterStepMs: Number.isNaN(t0) || Number.isNaN(stepAt) ? exchange.offsetMs : t0 - stepAt + exchange.offsetMs,
        errors: exchange.errors,
        sent: exchange.sent,
        answer: exchange.answer,
        host: exchange.host,
        operation,
      });
    }
  }
  return seen;
}

export function bundleScripts(captures: RunCapture[], log: (line: string) => void): BundleScript[] {
  const scripts: BundleScript[] = [];
  const shas = new Set<string>();
  for (const capture of captures) {
    const dir = join(capture.dir, "scripts");
    if (!existsSync(dir)) scriptsFromHar(capture, log);
    if (!existsSync(dir)) continue;
    let fresh = 0;
    for (const file of readdirSync(dir)) {
      const text = readFileSync(join(dir, file), "utf8");
      const sha = createHash("sha256").update(text).digest("hex");
      if (shas.has(sha)) continue;
      shas.add(sha);
      scripts.push({ file: `${capture.run}/${file}`, text });
      fresh++;
    }
    log(`  ${capture.run}: ${fresh} new bundle(s), ${scripts.length} distinct so far`);
  }
  return scripts;
}

function stepEvidence(capture: RunCapture): Map<string, string> {
  const evidence = new Map<string, string>();
  try {
    const index = JSON.parse(readFileSync(join(capture.dir, "steps", "index.json"), "utf8")) as { steps: { step: string; har: string }[] };
    for (const step of index.steps) {
      const read = JSON.parse(readFileSync(join(capture.dir, "steps", step.har.replace(/\.har$/, ".rea.json")), "utf8")) as { stdout?: string };
      const id = evidenceIdOf(read.stdout ?? "");
      if (id) evidence.set(`${capture.run}\u0000${step.step}`, id);
    }
  } catch {
  }
  return evidence;
}

export function mergePlatformOperations(platform: Platform, seen: SeenOn[]): ClientOperation[] {
  const rules = PLATFORM_CLIENT_RULES[platform];
  const operations = new Map<string, ClientOperation>();
  for (const request of seen) {
    let operation = operations.get(request.name);
    if (!operation) {
      operation = {
        name: request.name,
        domain: domainOfRequest(request.name, rules?.domains ?? []),
        kind: request.graphql ? (rules?.mutation.test(request.name) ? "mutation" : "query") : "endpoint",
        docId: null,
        path: request.path,
        sends: [],
        reads: [],
        calledFrom: [],
        sightings: [],
        reaEvidenceId: null,
      };
      operations.set(request.name, operation);
    }
    for (const name of request.variables) if (!operation.sends.includes(name)) operation.sends.push(name);
    for (const name of readsOf(request.answer)) if (!operation.reads.includes(name) && operation.reads.length < 40) operation.reads.push(name);
    const { name: _n, docId: _d, path: _p, graphql: _g, variables: _v, host: _h, operation: _o, ...sighting } = request;
    operation.sightings.push(sighting);
  }
  return [...operations.values()].sort((a, b) => a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name));
}

async function eachLimited<T>(items: T[], limit: number, work: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) await work(items[next++]);
  }));
}

export async function readPlatformSlices(operations: ClientOperation[], slicesByName: Map<string, SourceSlice[]>, outDir: string, runner: ReaRunner, log: (line: string) => void, concurrency = 3): Promise<void> {
  const cachePath = join(outDir, "reaCache.json");
  let cache: Record<string, string> = {};
  try {
    cache = JSON.parse(readFileSync(cachePath, "utf8")) as Record<string, string>;
  } catch {
  }
  const todo: { operation: ClientOperation; dir: string; sha: string }[] = [];
  for (const operation of operations) {
    const slices = slicesByName.get(operation.name) ?? [];
    if (!slices.length) continue;
    const sha = createHash("sha256").update(slices.map((s) => s.text).join("\n")).digest("hex");
    if (cache[sha]) {
      operation.reaEvidenceId = cache[sha];
      continue;
    }
    const dir = join(outDir, "slices", operation.domain, operation.name);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    slices.forEach((slice, i) => writeFileSync(join(dir, `slice${i + 1}.js`), slice.text));
    todo.push({ operation, dir, sha });
  }
  log(`rea: ${todo.length} slice set(s) to read, ${operations.filter((o) => o.reaEvidenceId).length} already read in earlier builds`);
  let done = 0;
  await eachLimited(todo, concurrency, async ({ operation, dir, sha }) => {
    const started = Date.now();
    const read = await runner(["analyze-javascript-application", dir, "--format", "json", "--analysis-timeout-ms", "120000"], outDir);
    const id = read.code === 0 ? evidenceIdOf(read.stdout) : null;
    if (id) {
      operation.reaEvidenceId = id;
      cache[sha] = id;
      writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
      writeFileSync(join(dir, "rea.json"), read.stdout);
    }
    done++;
    log(`  rea ${done}/${todo.length} ${operation.domain}/${operation.name}: ${id ? `read (${id.slice(0, 15)}…)` : `exit ${read.code} ${read.stderr.slice(0, 160)}`} in ${Math.round((Date.now() - started) / 1000)} s`);
  });
}

export function platformFactsPath(platform: Platform): string {
  return clientFactsPath().replace(/clientFacts\.json$/, `clientFacts.${platform}.json`);
}

export async function buildPlatformClientMap(options: BuildPlatformMapOptions): Promise<string> {
  const { log, platform } = options;
  const site = PLATFORM_SITES[platform];
  const rules = PLATFORM_CLIENT_RULES[platform];
  const captures = findRunCaptures(options.capturesRoot);
  const seen: SeenOn[] = [];
  const evidence = new Map<string, string>();
  const used: RunCapture[] = [];
  for (const capture of captures) {
    try {
      const requests = platformRequestsInRun(capture, site.hosts);
      if (!requests.length) continue;
      used.push(capture);
      seen.push(...requests);
      for (const [key, id] of stepEvidence(capture)) evidence.set(key, id);
      log(`  ${capture.run}: ${requests.length} call(s) to ${site.hosts.join(", ")}`);
    } catch (error) {
      log(`  ${capture.run}: skipped (${error instanceof Error ? error.message : String(error)})`);
    }
  }
  log(`${platform}: ${used.length} run(s) with its calls`);
  if (!used.length) return `${platform} client map: no run has its calls yet.`;
  const operations = mergePlatformOperations(platform, seen);
  log(`${platform}'s bundles: finding each call's code in a syntax tree`);
  const scripts = bundleScripts(used, log);
  const slicesByName = new Map<string, SourceSlice[]>();
  for (const operation of operations) {
    const first = seen.find((s) => s.name === operation.name)!;
    const slices = slicesFor(needlesOf(first.host, first.path, first.operation), scripts, { exact: !!first.operation });
    slicesByName.set(operation.name, slices);
    operation.calledFrom = slices.map((s) => s.calledFrom);
    log(`  ${operation.domain}/${operation.name}: ${slices.length ? `${slices.length} call site(s)` : "no call site in the bundles"}`);
  }
  forgetParsed();
  mkdirSync(options.outDir, { recursive: true });
  if (options.runner) await readPlatformSlices(operations, slicesByName, options.outDir, options.runner, log, options.concurrency);
  else log("rea: not run (--noRea)");
  for (const operation of operations) {
    if (operation.reaEvidenceId) continue;
    const sighting = operation.sightings.find((s) => evidence.has(`${s.run}\u0000${s.step}`));
    if (sighting) operation.reaEvidenceId = evidence.get(`${sighting.run}\u0000${sighting.step}`) ?? null;
  }
  writeFileSync(join(options.outDir, "clientMap.json"), `${JSON.stringify({ builtAt: new Date().toISOString(), operations }, null, 2)}\n`, { mode: 0o600 });
  const docs = writeOperationDocs(operations, options.docsDir, used.length, options.storePath ?? platformFactsPath(platform), rules?.reasoning);
  const sliced = operations.filter((o) => (slicesByName.get(o.name) ?? []).length).length;
  const read = operations.filter((o) => o.reaEvidenceId).length;
  return `${platform} client map: ${operations.length} requests from ${used.length} runs; ${sliced} with their code found in its bundles, ${read} read by rea (their code, or the step's network where no code was found). Docs: ${options.docsDir} (${docs.toWrite} still need their reasoning written).`;
}
