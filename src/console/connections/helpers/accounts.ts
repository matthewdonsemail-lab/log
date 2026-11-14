import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { signInRouteOf } from "../../../cli/launch/helpers/start.ts";
import { PLATFORMS } from "../../../cli/runner/helpers/platforms.ts";
import type { Platform } from "../../../cli/runner/helpers/platforms.ts";
import { fromTwentyEnum } from "../../../platformKit/socialAccount/helpers/twentyEnum.ts";
import { vendorOfProxy } from "../../../proxyVendor/vendor/helpers/vendorOfProxy.ts";
import { localAccountsPath, readLocalAccounts } from "../../../twenty/graphql/index.ts";
import { ACCOUNT_STATUSES, SESSION_STATES } from "../types.ts";
import type { AccountStatus, ConnectionAccount, ProxyProvider, SessionState } from "../types.ts";

type Env = Record<string, string | undefined>;

export function connectionIdOf(platform: string, name: string): string {
  return createHash("sha256").update(`${platform}:${name.replace(/^@/, "").toLowerCase()}`).digest("hex").slice(0, 24);
}

function readJson(path: string): Record<string, unknown> | null {
  try {
    if (!existsSync(path)) return null;
    const value = JSON.parse(readFileSync(path, "utf8"));
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

function platformOf(value: unknown): Platform | null {
  const source = String(value ?? "").toLowerCase();
  const name = source === "x" ? "twitter" : source;
  return (PLATFORMS as readonly string[]).includes(name) ? (name as Platform) : null;
}

export function sessionRoots(env: Env = process.env, home = homedir()): Record<Platform, string> {
  const base = env.LOG_PLATFORM_STATE || join(home, ".logCli");
  return Object.fromEntries(PLATFORMS.map((platform) => [platform, platform === "facebook" ? env.LOG_FBK_STATE || join(home, ".logCli", "fbk") : platform === "twitter" ? env.LOG_TWITTER_STATE || join(home, ".logCli", "twitter") : join(base, platform)])) as Record<Platform, string>;
}

export function readConnectionAccounts(env: Env = process.env, home = homedir()): Omit<ConnectionAccount, "lastCheck">[] {
  const accounts = new Map<string, Omit<ConnectionAccount, "lastCheck">>();
  function add(platform: Platform, name: string, facts: { state?: unknown; checkedAt?: unknown; status?: unknown; homeCountry?: unknown; proxy?: unknown; statusReason?: unknown }) {
    const key = `${platform}:${name.replace(/^@/, "").toLowerCase()}`;
    const held = accounts.get(key);
    const checkedAt = typeof facts.checkedAt === "string" && Number.isFinite(Date.parse(facts.checkedAt)) ? facts.checkedAt : null;
    const proxyProvider: ProxyProvider | null = typeof facts.proxy === "string" && facts.proxy.trim() ? (vendorOfProxy(facts.proxy)?.vendor ?? "unknown") : (held?.proxyProvider ?? null);
    const homeCountry = typeof facts.homeCountry === "string" && /^[A-Za-z]{2}$/.test(facts.homeCountry.trim()) ? facts.homeCountry.trim().toUpperCase() : (held?.homeCountry ?? null);
    const status = (ACCOUNT_STATUSES as readonly unknown[]).includes(facts.status) ? (facts.status as AccountStatus) : (held?.status ?? "unknown");
    const statusReason = typeof facts.statusReason === "string" && /^[a-zA-Z]{1,100}$/.test(facts.statusReason) ? facts.statusReason : (held?.statusReason ?? null);
    const state = (SESSION_STATES as readonly unknown[]).includes(facts.state) ? (facts.state as SessionState) : (held?.state ?? "unknown");
    accounts.set(key, { id: connectionIdOf(platform, name), name: held?.name ?? name, platform, proxyProvider, homeCountry, status, statusReason, state, checkedAt: checkedAt ?? held?.checkedAt ?? null, signIn: signInRouteOf(platform).kind });
  }
  for (const row of readLocalAccounts(localAccountsPath(env))) {
    const platform = platformOf(row.platform);
    const name = typeof row.accountName === "string" && row.accountName ? row.accountName : typeof row.name === "string" ? row.name : "";
    const status = typeof row.accountStatus === "string" && row.accountStatus ? fromTwentyEnum(row.accountStatus) : row.status;
    if (name && platform) add(platform, name, { state: row.sessionState, checkedAt: row.sessionCheckedAt, status, homeCountry: row.homeCountry, proxy: row.proxy, statusReason: row.statusReason });
  }
  for (const [platform, root] of Object.entries(sessionRoots(env, home)) as [Platform, string][]) {
    if (!existsSync(root)) continue;
    for (const directory of readdirSync(root, { withFileTypes: true })) {
      if (!directory.isDirectory() || directory.isSymbolicLink()) continue;
      const session = readJson(join(root, directory.name, "session.json"));
      if (session) add(platform, directory.name, { state: session.sessionState, checkedAt: session.checkedAt });
    }
  }
  return [...accounts.values()].sort((left, right) => left.platform.localeCompare(right.platform) || left.name.localeCompare(right.name));
}
