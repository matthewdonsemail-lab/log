import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Where an account's Facebook session lives: one Playwright storage_state
 * file per account, so the three accounts never share cookies.
 * `LOG_FB_STATE_DIR` overrides the folder.
 */
export function storageStatePath(accountId: string, env: Record<string, string | undefined> = process.env): string {
  const dir = env.LOG_FB_STATE_DIR || join(homedir(), ".logCli", "facebook");
  return join(dir, `${accountId}.json`);
}
