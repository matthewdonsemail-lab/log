import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { MobileNetworkCapture } from "./types.ts";

export interface MobileStep {
  at: string;
  action: string;
  serial: string;
  accountName: string;
  taps: { x: number; y: number }[];
  foregroundApp: string | null;
  screen: string | null;
  uiTree: string | null;
  network: MobileNetworkCapture | null;
}

export interface MobileRun {
  id: string;
  dir: string;
  steps: MobileStep[];
  add(step: MobileStep, screen?: Uint8Array | null, uiTree?: string | null): void;
  save(): void;
}

export function mobileRunsDir(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_MOBILE_RUNS || join(homedir(), ".logCli", "mobile");
}

export function mobileRunId(now: Date): string {
  return now.toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
}

export function createMobileRun(options: { accountName: string; now?: Date; dir?: string }): MobileRun {
  const now = options.now ?? new Date();
  const id = mobileRunId(now);
  const dir = options.dir ?? join(mobileRunsDir(), `${id}_${options.accountName.replace(/[^\w.-]/g, "_")}`);
  mkdirSync(dir, { recursive: true });
  const steps: MobileStep[] = [];
  const run: MobileRun = {
    id,
    dir,
    steps,
    add(step, screen, uiTree) {
      const index = steps.length + 1;
      steps.push(step);
      if (screen && screen.length) writeFileSync(join(dir, `step${index}.png`), screen);
      if (uiTree) writeFileSync(join(dir, `step${index}.xml`), uiTree, "utf8");
    },
    save() {
      writeFileSync(join(dir, "steps.json"), JSON.stringify({ id, accountName: options.accountName, startedAt: now.toISOString(), steps }, null, 2), "utf8");
      writeFileSync(join(dir, "README.md"), `# Mobile run ${id}\n\nThe account ${options.accountName}. Each step is what the phone was told to do, what was on the screen, the UI tree and the network calls that could be read.\n`, "utf8");
    },
  };
  if (!existsSync(join(dir, "steps.json"))) run.save();
  return run;
}
