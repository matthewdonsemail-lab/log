import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { toDeviceProfile } from "../../../camofox/device/helpers/deviceProfile.ts";
import { toOrigins } from "../../../camofox/run/client.ts";
import { saveDeviceProfile, saveSession, toFacebookCookies } from "../../../marketplace/socialAccount/index.ts";
import type { FacebookAccount } from "../../../marketplace/socialAccount/index.ts";
import type { TwentyClient } from "../../../twenty/graphql/index.ts";

/**
 * A run Twenty didn't fully take (`run.keep()`): its device and its session, saved
 * now. The folder is deleted once both are in Twenty; it never held login.json.
 * Returns the lines to print, never the device or a cookie.
 */
export async function resaveKeptRun(twenty: TwentyClient, account: FacebookAccount, dir: string): Promise<{ ok: boolean; lines: string[] }> {
  const lines: string[] = [];
  if (!existsSync(dir)) return { ok: false, lines: [`No kept run at ${dir}`] };
  if (existsSync(join(dir, "login.json"))) rmSync(join(dir, "login.json"), { force: true });
  let ok = true;
  const read = (name: string): unknown => {
    try {
      return JSON.parse(readFileSync(join(dir, name), "utf8"));
    } catch {
      return null;
    }
  };
  const device = read("device.json") as { created?: boolean; profile?: unknown; accountName?: string } | null;
  if (device?.accountName && device.accountName !== account.accountName) return { ok: false, lines: [`${dir} belongs to another account, not ${account.accountName}`] };
  const profile = device?.created ? toDeviceProfile(device.profile) : null;
  if (profile) {
    try {
      lines.push((await saveDeviceProfile(twenty, account, profile)) ? `Pinned ${account.accountName}'s device in Twenty.` : `${account.accountName} already has a device in Twenty: kept that one (rule 15).`);
    } catch (error) {
      ok = false;
      lines.push(`Could not save the device: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  const state = read("state.json") as { cookies?: unknown; origins?: unknown } | null;
  if (state) {
    const cookies = toFacebookCookies(state.cookies);
    try {
      lines.push((await saveSession(twenty, account.id, { cookies, origins: toOrigins(state.origins) })) ? `Saved ${account.accountName}'s session (${cookies.length} cookies) to Twenty.` : "The kept session holds no Facebook login: nothing saved.");
    } catch (error) {
      ok = false;
      lines.push(`Could not save the session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (ok) {
    rmSync(dir, { recursive: true, force: true });
    lines.push(`Removed ${dir}.`);
  } else lines.push(`Kept ${dir}: run the same command again.`);
  return { ok, lines };
}
