import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { exportScripts, manifestFor } from "./helpers/index";
import type { FirefoxCapture, ReaRunResult, ReaRunner } from "./types";

export async function defaultReaRunner(args: string[], cwd: string): Promise<ReaRunResult> {
  try {
    const proc = Bun.spawn(["rea", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
    const timer = setTimeout(() => proc.kill(), 60_000);
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const code = await proc.exited;
    clearTimeout(timer);
    return { code, stdout, stderr };
  } catch (error) {
    return { code: 127, stdout: "", stderr: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Write the script files and their manifest next to the HAR. The manifest
 * sits outside `scripts/` so rea analyzes only the scripts.
 */
export function writeFirefoxScripts(dir: string, capture: FirefoxCapture): void {
  mkdirSync(join(dir, "scripts"), { recursive: true });
  for (const script of capture.scripts) {
    writeFileSync(join(dir, "scripts", script.file), script.text, { mode: 0o600 });
  }
  writeFileSync(join(dir, "scriptsManifest.json"), `${JSON.stringify(manifestFor(capture.scripts), null, 2)}\n`, { mode: 0o600 });
}

/**
 * Ask the installed `rea` to read the raw HAR offline, and the scripts when
 * any were saved. Neither call launches a browser.
 */
export async function inspectFirefoxCapture(dir: string, scriptCount: number, runner: ReaRunner = defaultReaRunner): Promise<string> {
  const network = await runner(["inspect-web-network-capture", resolve(dir, "session.har"), "har", "--format", "json"], dir);
  writeFileSync(join(dir, "reaNetwork.json"), JSON.stringify({ code: network.code, stdout: network.stdout, stderr: network.stderr }), { mode: 0o600 });
  let scripts = "no scripts saved";
  if (scriptCount > 0) {
    const analyzed = await runner(["analyze-javascript-application", resolve(dir, "scripts"), "--format", "json"], dir);
    writeFileSync(join(dir, "reaScripts.json"), JSON.stringify({ code: analyzed.code, stdout: analyzed.stdout, stderr: analyzed.stderr }), { mode: 0o600 });
    scripts = `scripts exit ${analyzed.code}`;
  }
  return `REA network exit ${network.code}, ${scripts}`;
}

/**
 * The publish session writes `session.har` here and closes the context,
 * which flushes it. The HAR is left exactly as written (rule 19). A missing
 * file means the browser never opened. A file that is not JSON is kept for
 * a person to look at, and rea is not run on it.
 */
export async function settleFirefoxCapture(dir: string, runner: ReaRunner = defaultReaRunner): Promise<string | null> {
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
    return `Firefox capture: session.har is not JSON (kept as written, rea not run). ${dir}`;
  }
  const capture = exportScripts(parsed);
  writeFirefoxScripts(dir, capture);
  const rea = await inspectFirefoxCapture(dir, capture.scripts.length, runner);
  return `Firefox capture: ${capture.entries} requests, ${capture.scripts.length} scripts, raw HAR kept. ${rea}. ${dir}`;
}

/** Offline entry: a HAR from anywhere is copied unchanged to `outDir`, then read by `rea`. */
export async function captureFromHar(harPath: string, outDir: string, runner?: ReaRunner | null): Promise<string> {
  const capture = exportScripts(JSON.parse(readFileSync(harPath, "utf8")) as unknown);
  mkdirSync(outDir, { recursive: true });
  if (resolve(harPath) !== resolve(outDir, "session.har")) copyFileSync(harPath, join(outDir, "session.har"));
  writeFirefoxScripts(outDir, capture);
  if (runner === null) return `Firefox capture: ${capture.entries} requests, ${capture.scripts.length} scripts. REA not run.`;
  const rea = await inspectFirefoxCapture(outDir, capture.scripts.length, runner);
  return `Firefox capture: ${capture.entries} requests, ${capture.scripts.length} scripts. ${rea}.`;
}
