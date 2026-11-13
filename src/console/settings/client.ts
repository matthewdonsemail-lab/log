import { homedir } from "node:os";
import { join } from "node:path";
import { PLATFORMS } from "../../cli/runner/helpers/platforms.ts";
import { userEnvPath } from "../../config/userEnv/index.ts";
import { writesPerDayOf } from "../../directApi/engine/index.ts";
import { governorCounts } from "../../directApi/governor/index.ts";
import { localAccountsPath } from "../../twenty/graphql/index.ts";
import { DEFAULT_CONSOLE_PORT } from "../screens/index.ts";
import { consoleDbPath } from "../store/index.ts";
import type { ConsoleGovernor, ConsoleSettings } from "./types.ts";

export const REQUESTS_PER_DAY = 500;

export function runsPath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_RUNS_DIR || join(homedir(), ".logCli", "runs");
}

export function readConsoleGovernors(platforms: readonly string[] = PLATFORMS): ConsoleGovernor[] {
  return governorCounts(platforms).map((count) => ({
    platform: count.platform,
    account: count.account,
    day: count.day,
    requests: count.requests,
    writes: count.writes,
    writesPerDay: writesPerDayOf(count.platform),
    hourRequests: count.hourRequests,
    cooldownSeconds: count.cooldownSeconds,
  }));
}

export function loadConsoleSettings(port: number = DEFAULT_CONSOLE_PORT): ConsoleSettings {
  return {
    schemaVersion: 1,
    source: "local",
    generatedAt: new Date().toISOString(),
    paths: { database: consoleDbPath(), runs: runsPath(), accounts: localAccountsPath(), env: userEnvPath() },
    requestsPerDay: REQUESTS_PER_DAY,
    governors: readConsoleGovernors(),
    webConsole: { command: "log console --web", url: `http://127.0.0.1:${port}/console/start` },
  };
}
