import { spawn } from "node:child_process";
import { closeSync, copyFileSync, existsSync, mkdirSync, openSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { exportScripts, manifestFor, parseSteps, renderStepSummary, splitHarBySteps, summarizeStep } from "./helpers/index";
import type { BrowserCapture, CapturedScript, ReaRunResult, ReaRunner } from "./types";

export function evidenceIdOf(stdout: string): string | null {
  try {
    return (JSON.parse(stdout) as { evidence_id?: string }).evidence_id ?? null;
  } catch {
    return null;
  }
}

export const REA_MAX_CAPTURE_BYTES = 33_554_432;
const SCRIPTS_TIMEOUT_MS = 180_000;

export async function defaultReaRunner(args: string[], cwd: string): Promise<ReaRunResult> {
  try {
    const proc = Bun.spawn(["rea", ...args], { cwd, stdout: "pipe", stderr: "pipe", windowsHide: true });
    const timer = setTimeout(() => proc.kill(), args[0] === "analyze-javascript-application" ? SCRIPTS_TIMEOUT_MS : 60_000);
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const code = await proc.exited;
    clearTimeout(timer);
    return { code, stdout, stderr };
  } catch (error) {
    return { code: 127, stdout: "", stderr: error instanceof Error ? error.message : String(error) };
  }
}

export function writeCaptureScripts(dir: string, capture: BrowserCapture): void {
  mkdirSync(join(dir, "scripts"), { recursive: true });
  for (const script of capture.scripts) {
    writeFileSync(join(dir, "scripts", script.file), script.text, { mode: 0o600 });
  }
  writeFileSync(join(dir, "scriptsManifest.json"), `${JSON.stringify(manifestFor(capture.scripts), null, 2)}\n`, { mode: 0o600 });
}

export async function inspectCapture(dir: string, scripts: CapturedScript[], runner: ReaRunner = defaultReaRunner): Promise<string> {
  const size = statSync(join(dir, "session.har")).size;
  let network: string;
  if (size > REA_MAX_CAPTURE_BYTES) {
    network = `REA network skipped (${Math.round(size / 1_048_576)} MB, over rea's 32 MB: read per step)`;
  } else {
    const read = await runner(["inspect-web-network-capture", resolve(dir, "session.har"), "har", "--format", "json"], dir);
    writeFileSync(join(dir, "reaNetwork.json"), JSON.stringify({ code: read.code, stdout: read.stdout, stderr: read.stderr }), { mode: 0o600 });
    network = `REA network exit ${read.code}`;
  }
  return `${network}, ${scripts.length} scripts saved (read per request by \`log facebook capture --docs\`)`;
}

export async function settleCapture(dir: string, runner: ReaRunner = defaultReaRunner): Promise<string | null> {
  let raw: string;
  try {
    raw = readFileSync(join(dir, "session.har"), "utf8");
  } catch {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return `Capture: session.har is not JSON (kept as written, rea not run). ${dir}`;
  }
  const capture = exportScripts(parsed);
  writeCaptureScripts(dir, capture);
  const rea = await inspectCapture(dir, capture.scripts, runner);
  return `Capture: ${capture.entries} requests, ${capture.scripts.length} scripts, raw HAR kept. ${rea}. ${dir}`;
}

export async function captureFromHar(harPath: string, outDir: string, runner?: ReaRunner | null): Promise<string> {
  const capture = exportScripts(JSON.parse(readFileSync(harPath, "utf8")) as unknown);
  mkdirSync(outDir, { recursive: true });
  if (resolve(harPath) !== resolve(outDir, "session.har")) copyFileSync(harPath, join(outDir, "session.har"));
  writeCaptureScripts(outDir, capture);
  if (runner === null) return `Capture: ${capture.entries} requests, ${capture.scripts.length} scripts. REA not run.`;
  const rea = await inspectCapture(outDir, capture.scripts, runner);
  return `Capture: ${capture.entries} requests, ${capture.scripts.length} scripts. ${rea}.`;
}

export async function settleRunCapture(dir: string, runner: ReaRunner = defaultReaRunner): Promise<string | null> {
  const whole = await settleCapture(dir, runner);
  if (whole === null || !existsSync(join(dir, "steps.jsonl"))) return whole;
  let parts;
  try {
    parts = splitHarBySteps(JSON.parse(readFileSync(join(dir, "session.har"), "utf8")), parseSteps(readFileSync(join(dir, "steps.jsonl"), "utf8")));
  } catch {
    return `${whole} Steps not split (session.har or steps.jsonl unreadable).`;
  }
  const stepsDir = join(dir, "steps");
  mkdirSync(stepsDir, { recursive: true });
  const index: { index: number; step: string; har: string; entries: number; reaExit: number }[] = [];
  const findings: string[] = [];
  for (const part of parts) {
    const har = `${part.name}.har`;
    writeFileSync(join(stepsDir, har), JSON.stringify(part.har), { mode: 0o600 });
    const read = await runner(["inspect-web-network-capture", resolve(stepsDir, har), "har", "--format", "json"], stepsDir);
    writeFileSync(join(stepsDir, `${part.name}.rea.json`), JSON.stringify({ code: read.code, stdout: read.stdout, stderr: read.stderr }), { mode: 0o600 });
    index.push({ index: part.index, step: part.step, har, entries: part.entries, reaExit: read.code });
    findings.push(renderStepSummary(part.index, part.step, summarizeStep(part.har as never), evidenceIdOf(read.stdout)));
  }
  writeFileSync(join(stepsDir, "index.json"), `${JSON.stringify({ steps: index }, null, 2)}\n`, { mode: 0o600 });
  writeFileSync(join(dir, "findings.md"), `# Findings: ${dir}\n\nWhat each step of the run sent to Facebook, from its HAR. rea read each step; its Evidence ID is on the step.\n\n${findings.join("\n\n")}\n`);
  return `${whole} ${parts.length} step HARs read by rea in ${stepsDir}; findings.md written.`;
}

const LOG_BIN = fileURLToPath(new URL("../../../bin/log.ts", import.meta.url));

export function settleInBackground(dir: string): string | null {
  if (!existsSync(join(dir, "session.har"))) return null;
  const out = openSync(join(dir, "settle.log"), "a");
  try {
    const child = spawn(process.execPath, [LOG_BIN, "facebook", "capture", "--settle", dir], { detached: true, stdio: ["ignore", out, out], windowsHide: true });
    child.unref();
  } finally {
    closeSync(out);
  }
  return `rea reads the capture in the background: ${dir} (settle.json when done).`;
}
