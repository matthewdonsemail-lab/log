import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { manifestFor, stripHar } from "./helpers/index";
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

/** Write the stripped HAR and the script files. The script text is not left inside the HAR. */
export function writeFirefoxCapture(dir: string, capture: FirefoxCapture): void {
  mkdirSync(join(dir, "scripts"), { recursive: true });
  writeFileSync(join(dir, "session.har"), `${JSON.stringify(capture.har)}\n`, { mode: 0o600 });
  for (const script of capture.scripts) {
    writeFileSync(join(dir, "scripts", script.file), script.text, { mode: 0o600 });
  }
  writeFileSync(join(dir, "scripts", "manifest.json"), `${JSON.stringify(manifestFor(capture.scripts), null, 2)}\n`, { mode: 0o600 });
}

/**
 * Read a Playwright Firefox HAR, strip it, and ask the installed `rea`
 * to read the HAR offline. `analyze-javascript-application` runs only when
 * a script was saved. Neither call launches a browser.
 */
export async function inspectFirefoxCapture(dir: string, runner: ReaRunner = defaultReaRunner): Promise<string> {
  const network = await runner(["inspect-web-network-capture", join(dir, "session.har"), "har", "--json"], dir);
  writeFileSync(join(dir, "reaNetwork.json"), JSON.stringify({ code: network.code, stdout: network.stdout, stderr: network.stderr }), { mode: 0o600 });
  let scripts = "no scripts saved";
  const manifestPath = join(dir, "scripts", "manifest.json");
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { scripts?: unknown[] };
    if ((manifest.scripts ?? []).length > 0) {
      const analyzed = await runner(["analyze-javascript-application", join(dir, "scripts"), "--json"], dir);
      writeFileSync(join(dir, "reaScripts.json"), JSON.stringify({ code: analyzed.code, stdout: analyzed.stdout, stderr: analyzed.stderr }), { mode: 0o600 });
      scripts = `scripts exit ${analyzed.code}`;
    }
  } catch {
    scripts = "no script manifest";
  }
  return `REA network exit ${network.code}, ${scripts}`;
}

/**
 * The publish session writes `session.har` here and then closes the context,
 * which flushes the HAR. This replaces that file with the stripped one.
 * A missing file means the browser never opened. A file that is not JSON is
 * deleted, because it could not be stripped.
 */
export async function settleFirefoxCapture(dir: string, runner: ReaRunner = defaultReaRunner): Promise<string | null> {
  const harPath = join(dir, "session.har");
  let raw: string;
  try {
    raw = readFileSync(harPath, "utf8");
  } catch {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    rmSync(harPath, { force: true });
    return "Firefox capture: session.har was not JSON, so it was deleted.";
  }
  const capture = stripHar(parsed);
  writeFirefoxCapture(dir, capture);
  const rea = await inspectFirefoxCapture(dir, runner);
  const { cookies, headers, bodies, queryValues } = capture.counts;
  return `Firefox capture: ${capture.scripts.length} scripts, stripped ${cookies} cookies, ${headers} headers, ${queryValues} query values, ${bodies} bodies. ${rea}.`;
}

/** Offline entry: a HAR from anywhere, written to `outDir`, then read by `rea`. */
export async function captureFromHar(harPath: string, outDir: string, runner?: ReaRunner | null): Promise<string> {
  const capture = stripHar(JSON.parse(readFileSync(harPath, "utf8")) as unknown);
  writeFirefoxCapture(outDir, capture);
  if (runner === null) return `Firefox capture: ${capture.scripts.length} scripts. REA not run.`;
  const rea = await inspectFirefoxCapture(outDir, runner);
  return `Firefox capture: ${capture.scripts.length} scripts. ${rea}.`;
}
